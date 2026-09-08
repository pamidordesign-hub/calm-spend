import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  INCOME_CATEGORY,
  signOf,
  type Appearance,
  type Currency,
  type Expense,
  type MonthEnd,
} from './types'
import { ym, ymd } from '../lib/date'
import { detectLang, type Lang } from '../lib/i18n'
import { applyReconcile } from '../lib/budget'

interface Persisted {
  onboarded: boolean
  currency: Currency
  dailyBudget: number
  balance: number
  expenses: Expense[]
  monthEnd: MonthEnd
  notifications: boolean
  appearance: Appearance
  lang: Lang
  lastAccrualDate: string // 'YYYY-MM-DD'
  lastMonth: string // 'YYYY-MM'
  /** Set when a month just rolled over, so the app can show the New month screen. */
  pendingNewMonth: boolean
}

interface Actions {
  completeOnboarding: (data: { currency: Currency; dailyBudget: number; notifications: boolean }) => void
  setCurrency: (c: Currency) => void
  setDailyBudget: (n: number) => void
  setMonthEnd: (m: MonthEnd) => void
  setNotifications: (b: boolean) => void
  setAppearance: (a: Appearance) => void
  setLang: (l: Lang) => void
  addExpense: (input: { amount: number; label: string; category: string }) => Expense
  updateExpense: (id: string, patch: Partial<Pick<Expense, 'amount' | 'label' | 'category'>>) => void
  /** Adds money back to the balance and records it in the history. */
  addFunds: (input: { amount: number; label?: string }) => Expense
  deleteExpense: (id: string) => void
  resetBalance: () => void
  /** Replace all stored data — used when restoring a backup. */
  replaceAll: (data: Partial<Persisted>) => void
  /** Daily budget accrual + month rollover. Call on app open. */
  reconcile: (now?: number) => void
  acknowledgeNewMonth: () => void
  spentThisMonth: (now?: number) => number
  hardReset: () => void
}

export type AppStore = Persisted & Actions

const DEFAULT_DAILY = 100

const initialState: Persisted = {
  onboarded: false,
  currency: 'ILS',
  dailyBudget: DEFAULT_DAILY,
  balance: 0,
  expenses: [],
  monthEnd: 'reset',
  notifications: true,
  appearance: 'light',
  lang: detectLang(),
  lastAccrualDate: '',
  lastMonth: '',
  pendingNewMonth: false,
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      completeOnboarding: ({ currency, dailyBudget, notifications }) => {
        const now = new Date()
        set({
          onboarded: true,
          currency,
          dailyBudget: dailyBudget > 0 ? dailyBudget : DEFAULT_DAILY,
          notifications,
          // Start today with exactly one day's budget available.
          balance: dailyBudget > 0 ? dailyBudget : DEFAULT_DAILY,
          expenses: [],
          lastAccrualDate: ymd(now),
          lastMonth: ym(now),
          pendingNewMonth: false,
        })
      },

      setCurrency: (currency) => set({ currency }),
      setDailyBudget: (n) => set({ dailyBudget: Math.round(Math.max(0, n)) }),
      setMonthEnd: (monthEnd) => set({ monthEnd }),
      setNotifications: (notifications) => set({ notifications }),
      setAppearance: (appearance) => set({ appearance }),
      setLang: (lang) => set({ lang }),

      addExpense: ({ amount, label, category }) => {
        const expense: Expense = {
          id: newId(),
          amount: Math.round(Math.abs(amount)),
          label: label.trim() || 'Expense',
          category: category || 'Other',
          ts: Date.now(),
          kind: 'expense',
        }
        set((s) => ({ expenses: [expense, ...s.expenses], balance: s.balance - expense.amount }))
        return expense
      },

      updateExpense: (id, patch) =>
        set((s) => {
          const idx = s.expenses.findIndex((e) => e.id === id)
          if (idx === -1) return s
          const prev = s.expenses[idx]
          const nextAmount =
            patch.amount != null ? Math.round(Math.abs(patch.amount)) : prev.amount
          const next: Expense = {
            ...prev,
            ...patch,
            amount: nextAmount,
            label: (patch.label ?? prev.label).trim() || 'Expense',
          }
          const expenses = [...s.expenses]
          expenses[idx] = next
          // Apply only the delta, in the direction of this entry's kind.
          return { expenses, balance: s.balance + signOf(prev.kind) * (next.amount - prev.amount) }
        }),

      addFunds: ({ amount, label }) => {
        const entry: Expense = {
          id: newId(),
          amount: Math.round(Math.abs(amount)),
          label: (label ?? '').trim() || 'Added funds',
          category: INCOME_CATEGORY,
          ts: Date.now(),
          kind: 'income',
        }
        set((s) => ({ expenses: [entry, ...s.expenses], balance: s.balance + entry.amount }))
        return entry
      },

      deleteExpense: (id) =>
        set((s) => {
          const target = s.expenses.find((e) => e.id === id)
          if (!target) return s
          return {
            expenses: s.expenses.filter((e) => e.id !== id),
            // Undo the entry's effect on the balance.
            balance: s.balance - signOf(target.kind) * target.amount,
          }
        }),

      resetBalance: () => set({ balance: 0 }),

      replaceAll: (data) => set((s) => ({ ...s, ...data })),

      reconcile: (nowMs = Date.now()) => {
        const s = get()
        if (!s.onboarded) return
        const next = applyReconcile(
          {
            balance: s.balance,
            dailyBudget: s.dailyBudget,
            monthEnd: s.monthEnd,
            lastAccrualDate: s.lastAccrualDate,
            lastMonth: s.lastMonth,
            pendingNewMonth: s.pendingNewMonth,
          },
          nowMs,
        )
        if (
          next.balance !== s.balance ||
          next.lastAccrualDate !== s.lastAccrualDate ||
          next.lastMonth !== s.lastMonth ||
          next.pendingNewMonth !== s.pendingNewMonth
        ) {
          set(next)
        }
      },

      acknowledgeNewMonth: () => set({ pendingNewMonth: false }),

      spentThisMonth: (nowMs = Date.now()) => {
        const key = ym(new Date(nowMs))
        return get()
          .expenses.filter((e) => e.kind === 'expense' && ym(new Date(e.ts)) === key)
          .reduce((sum, e) => sum + e.amount, 0)
      },

      hardReset: () => set({ ...initialState }),
    }),
    {
      name: 'calmspend',
      version: 4,
      migrate: (persisted: any, from: number) => {
        if (!persisted) return persisted
        let s = persisted
        // v2: entries gained a `kind` — everything before that was an expense.
        if (from < 2) {
          s = {
            ...s,
            expenses: (s.expenses ?? []).map((e: any) => ({ ...e, kind: e?.kind ?? 'expense' })),
          }
        }
        // v3: money is whole units now — clear out any leftover fractions.
        if (from < 3) {
          s = {
            ...s,
            balance: Math.round(s.balance ?? 0),
            dailyBudget: Math.round(s.dailyBudget ?? 100),
            expenses: (s.expenses ?? []).map((e: any) => ({
              ...e,
              amount: Math.round(e?.amount ?? 0),
            })),
          }
        }
        // v4: the monthly budget is derived from the daily budget and the
        // calendar, so the stored `monthlyLimit` is no longer meaningful.
        if (from < 4) {
          const { monthlyLimit: _dropped, ...rest } = s
          s = rest
        }
        return s
      },
      partialize: (s): Persisted => ({
        onboarded: s.onboarded,
        currency: s.currency,
        dailyBudget: s.dailyBudget,
        balance: s.balance,
        expenses: s.expenses,
        monthEnd: s.monthEnd,
        notifications: s.notifications,
        appearance: s.appearance,
        lang: s.lang,
        lastAccrualDate: s.lastAccrualDate,
        lastMonth: s.lastMonth,
        pendingNewMonth: s.pendingNewMonth,
      }),
    },
  ),
)
