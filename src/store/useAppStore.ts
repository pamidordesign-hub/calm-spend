import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Appearance, Currency, Expense, MonthEnd } from './types'
import { addDays, wholeDaysBetween, ym, ymd } from '../lib/date'

interface Persisted {
  onboarded: boolean
  currency: Currency
  dailyBudget: number
  monthlyLimit: number
  balance: number
  expenses: Expense[]
  monthEnd: MonthEnd
  notifications: boolean
  appearance: Appearance
  lastAccrualDate: string // 'YYYY-MM-DD'
  lastMonth: string // 'YYYY-MM'
  /** Set when a month just rolled over, so the app can show the New month screen. */
  pendingNewMonth: boolean
}

interface Actions {
  completeOnboarding: (data: { currency: Currency; dailyBudget: number; notifications: boolean }) => void
  setCurrency: (c: Currency) => void
  setDailyBudget: (n: number) => void
  setMonthlyLimit: (n: number) => void
  setMonthEnd: (m: MonthEnd) => void
  setNotifications: (b: boolean) => void
  setAppearance: (a: Appearance) => void
  addExpense: (input: { amount: number; label: string; category: string }) => Expense
  updateExpense: (id: string, patch: Partial<Pick<Expense, 'amount' | 'label' | 'category'>>) => void
  addFunds: (amount: number) => void
  deleteExpense: (id: string) => void
  resetBalance: () => void
  /** Daily budget accrual + month rollover. Call on app open. */
  reconcile: (now?: number) => void
  acknowledgeNewMonth: () => void
  spentThisMonth: (now?: number) => number
  hardReset: () => void
}

export type AppStore = Persisted & Actions

const DEFAULT_DAILY = 100
const DEFAULT_MONTHLY = 2800

const initialState: Persisted = {
  onboarded: false,
  currency: 'ILS',
  dailyBudget: DEFAULT_DAILY,
  monthlyLimit: DEFAULT_MONTHLY,
  balance: 0,
  expenses: [],
  monthEnd: 'reset',
  notifications: true,
  appearance: 'light',
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
      setDailyBudget: (n) => set({ dailyBudget: Math.max(0, n) }),
      setMonthlyLimit: (n) => set({ monthlyLimit: Math.max(0, n) }),
      setMonthEnd: (monthEnd) => set({ monthEnd }),
      setNotifications: (notifications) => set({ notifications }),
      setAppearance: (appearance) => set({ appearance }),

      addExpense: ({ amount, label, category }) => {
        const expense: Expense = {
          id: newId(),
          amount: Math.abs(amount),
          label: label.trim() || 'Expense',
          category: category || 'Other',
          ts: Date.now(),
        }
        set((s) => ({ expenses: [expense, ...s.expenses], balance: s.balance - expense.amount }))
        return expense
      },

      updateExpense: (id, patch) =>
        set((s) => {
          const idx = s.expenses.findIndex((e) => e.id === id)
          if (idx === -1) return s
          const prev = s.expenses[idx]
          const nextAmount = patch.amount != null ? Math.abs(patch.amount) : prev.amount
          const next: Expense = {
            ...prev,
            ...patch,
            amount: nextAmount,
            label: (patch.label ?? prev.label).trim() || 'Expense',
          }
          const expenses = [...s.expenses]
          expenses[idx] = next
          // Keep the balance consistent with the edited amount.
          return { expenses, balance: s.balance + prev.amount - next.amount }
        }),

      addFunds: (amount) => set((s) => ({ balance: s.balance + Math.abs(amount) })),

      deleteExpense: (id) =>
        set((s) => {
          const target = s.expenses.find((e) => e.id === id)
          if (!target) return s
          return {
            expenses: s.expenses.filter((e) => e.id !== id),
            balance: s.balance + target.amount, // refund
          }
        }),

      resetBalance: () => set({ balance: 0 }),

      reconcile: (nowMs = Date.now()) => {
        const s = get()
        if (!s.onboarded) return
        const now = new Date(nowMs)
        const curMonth = ym(now)

        let { balance, lastAccrualDate, lastMonth, pendingNewMonth } = s

        // 1) Month rollover.
        if (lastMonth && curMonth !== lastMonth) {
          if (s.monthEnd === 'reset') balance = 0
          lastMonth = curMonth
          pendingNewMonth = true
          // Restart accrual from yesterday so exactly today's budget is credited below,
          // rather than back-crediting every day since last open across the boundary.
          lastAccrualDate = ymd(addDays(now, -1))
        }

        // 2) Daily accrual — bank one daily budget per whole elapsed day.
        const days = wholeDaysBetween(lastAccrualDate, now)
        if (days > 0) {
          balance += s.dailyBudget * days
          lastAccrualDate = ymd(now)
        }

        if (
          balance !== s.balance ||
          lastAccrualDate !== s.lastAccrualDate ||
          lastMonth !== s.lastMonth ||
          pendingNewMonth !== s.pendingNewMonth
        ) {
          set({ balance, lastAccrualDate, lastMonth, pendingNewMonth })
        }
      },

      acknowledgeNewMonth: () => set({ pendingNewMonth: false }),

      spentThisMonth: (nowMs = Date.now()) => {
        const key = ym(new Date(nowMs))
        return get()
          .expenses.filter((e) => ym(new Date(e.ts)) === key)
          .reduce((sum, e) => sum + e.amount, 0)
      },

      hardReset: () => set({ ...initialState }),
    }),
    {
      name: 'calmspend',
      version: 1,
      partialize: (s): Persisted => ({
        onboarded: s.onboarded,
        currency: s.currency,
        dailyBudget: s.dailyBudget,
        monthlyLimit: s.monthlyLimit,
        balance: s.balance,
        expenses: s.expenses,
        monthEnd: s.monthEnd,
        notifications: s.notifications,
        appearance: s.appearance,
        lastAccrualDate: s.lastAccrualDate,
        lastMonth: s.lastMonth,
        pendingNewMonth: s.pendingNewMonth,
      }),
    },
  ),
)
