import type { Currency } from '../store/types'
import { formatMoney } from './currency'

export type BalanceTone = 'normal' | 'low' | 'over'

/** How the balance "feels" — drives colour + caption. */
export function balanceTone(balance: number, dailyBudget: number): BalanceTone {
  if (balance < 0) return 'over'
  if (dailyBudget > 0 && balance <= dailyBudget * 0.15) return 'low'
  return 'normal'
}

export interface CaptionInput {
  balance: number
  dailyBudget: number
  monthlyLimit: number
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
    i.monthlyLimit,
    i.currency,
  )}`
}
