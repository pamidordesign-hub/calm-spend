import type { Currency, MonthEnd } from '../store/types'
import type { TKey } from './i18n'
import { formatMoney } from './currency'
import { addDays, daysInMonth, wholeDaysBetween, ym, ymd } from './date'

export type BalanceTone = 'normal' | 'low' | 'over'

/** How the balance "feels" — drives colour + caption. */
export function balanceTone(balance: number, dailyBudget: number): BalanceTone {
  if (balance < 0) return 'over'
  if (dailyBudget > 0 && balance <= dailyBudget * 0.15) return 'low'
  return 'normal'
}

/**
 * The month's budget is not a separate setting — it is the daily budget across
 * every day of that calendar month, so a 31-day month allows more than a
 * 28-day one.
 */
export function monthlyBudgetFor(dailyBudget: number, when: Date = new Date()): number {
  return Math.round(dailyBudget * daysInMonth(when))
}

export type MonthTone = 'normal' | 'near' | 'over'

/** How the month is tracking: fine, close to the edge, or past it. */
export function monthTone(spent: number, monthlyBudget: number): MonthTone {
  if (monthlyBudget <= 0) return 'normal'
  if (spent > monthlyBudget) return 'over'
  if (spent >= monthlyBudget * 0.8) return 'near'
  return 'normal'
}

export type CaptionTone = 'normal' | 'warn' | 'danger'

export interface Caption {
  key: TKey
  tone: CaptionTone
  vars?: Record<string, string>
}

export interface CaptionInput {
  balance: number
  dailyBudget: number
  monthlyBudget: number
  spentThisMonth: number
  currency: Currency
  hasExpensesToday: boolean
}

/**
 * The line under the balance number. Today's balance comes first, then the
 * month's standing, so a looming monthly overrun is surfaced before the
 * routine "here are your budgets" line.
 */
export function statusCaption(i: CaptionInput): Caption {
  const tone = balanceTone(i.balance, i.dailyBudget)
  if (tone === 'over') return { key: 'caption.overDaily', tone: 'danger' }
  if (tone === 'low') {
    return {
      key: 'caption.runningLow',
      tone: 'warn',
      vars: { amount: formatMoney(i.balance, i.currency) },
    }
  }

  const month = monthTone(i.spentThisMonth, i.monthlyBudget)
  if (month === 'over') {
    return {
      key: 'caption.monthOver',
      tone: 'danger',
      vars: { amount: formatMoney(i.spentThisMonth - i.monthlyBudget, i.currency) },
    }
  }
  if (month === 'near') {
    return {
      key: 'caption.monthLeft',
      tone: 'warn',
      vars: { amount: formatMoney(i.monthlyBudget - i.spentThisMonth, i.currency) },
    }
  }

  if (!i.hasExpensesToday) return { key: 'caption.freshDay', tone: 'normal' }
  return {
    key: 'caption.limits',
    tone: 'normal',
    vars: {
      daily: formatMoney(i.dailyBudget, i.currency),
      monthly: formatMoney(i.monthlyBudget, i.currency),
    },
  }
}

export interface ReconcileInput {
  balance: number
  dailyBudget: number
  monthEnd: MonthEnd
  /** 'YYYY-MM-DD' of the last day whose budget was credited. */
  lastAccrualDate: string
  /** 'YYYY-MM' the balance currently belongs to. */
  lastMonth: string
  pendingNewMonth: boolean
}

export type ReconcileResult = Pick<
  ReconcileInput,
  'balance' | 'lastAccrualDate' | 'lastMonth' | 'pendingNewMonth'
>

/**
 * Daily budget accrual + month rollover. Kept pure (no store, no Date.now)
 * so the money math can be tested directly.
 */
export function applyReconcile(s: ReconcileInput, nowMs: number): ReconcileResult {
  const now = new Date(nowMs)
  const curMonth = ym(now)

  let { balance, lastAccrualDate, lastMonth, pendingNewMonth } = s

  // 1) Month rollover.
  if (lastMonth && curMonth !== lastMonth) {
    if (s.monthEnd === 'reset') balance = 0
    lastMonth = curMonth
    pendingNewMonth = true
    // Restart accrual from yesterday so exactly today's budget is credited
    // below, rather than back-crediting every day across the boundary.
    lastAccrualDate = ymd(addDays(now, -1))
  }

  // 2) Daily accrual — bank one daily budget per whole elapsed day.
  const days = wholeDaysBetween(lastAccrualDate, now)
  if (days > 0) {
    balance += s.dailyBudget * days
    lastAccrualDate = ymd(now)
  }

  return { balance, lastAccrualDate, lastMonth, pendingNewMonth }
}
