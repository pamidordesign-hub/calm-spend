import { describe, it, expect } from 'vitest'
import { groupByDay, wholeDaysBetween, ymd } from './date'
import type { Expense } from '../store/types'

let seq = 0
const entry = (over: Partial<Expense>): Expense => ({
  id: `e${seq++}`,
  amount: 10,
  label: 'Item',
  category: 'Other',
  ts: Date.now(),
  kind: 'expense',
  ...over,
})

const at = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12).getTime()

describe('groupByDay', () => {
  it('nets money in against money out for the day', () => {
    const now = at(2026, 3, 10)
    const groups = groupByDay(
      [
        entry({ amount: 30, ts: now, kind: 'expense' }),
        entry({ amount: 50, ts: now, kind: 'income' }),
      ],
      now,
    )
    expect(groups).toHaveLength(1)
    expect(groups[0].total).toBe(20) // +50 − 30
  })

  it('reports a spending-only day as negative', () => {
    const now = at(2026, 3, 10)
    const groups = groupByDay([entry({ amount: 19, ts: now })], now)
    expect(groups[0].total).toBe(-19)
  })

  it('orders days newest first and labels them', () => {
    const now = at(2026, 3, 10)
    const groups = groupByDay(
      [entry({ ts: at(2026, 3, 9) }), entry({ ts: now }), entry({ ts: at(2026, 3, 1) })],
      now,
    )
    expect(groups.map((g) => g.label)).toEqual(['Today', 'Yesterday', 'Sun, Mar 1'])
  })
})

describe('wholeDaysBetween', () => {
  it('counts calendar days', () => {
    expect(wholeDaysBetween('2026-03-10', new Date(2026, 2, 13))).toBe(3)
  })

  it('never goes negative for a future start date', () => {
    expect(wholeDaysBetween('2026-03-20', new Date(2026, 2, 13))).toBe(0)
  })
})

describe('ymd', () => {
  it('pads month and day', () => {
    expect(ymd(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})
