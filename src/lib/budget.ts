import type { Currency, MonthEnd } from '../store/types'
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

export interface CaptionInput {
  balance: number
  dailyBudget: number
  monthlyBudget: number
  currency: Currency
  hasExpensesToday: boolean
}

/** The muted line under the balance number — mirrors the S1–S3 states. */
export function statusCaption(i: CaptionInput): string {
  const tone = balanceTone(i.balance, i.dailyBudget)
  if (tone === 'over') return 'Over today’s budget · ease back tomorrow'
  if (tone === 'low') return `Running low · ${formatMoney(i.balance, i.currency)} left for today`
  if (!i.hasExpensesToday) return 'Today’s budget added · no expenses yet'
  return `Daily budget ${formatMoney(i.dailyBudget, i.currency)} · Monthly limit ${formatMoney(
    i.monthlyBudget,
    i.currency,
  )}`
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
