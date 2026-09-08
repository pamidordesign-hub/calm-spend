import { describe, it, expect } from 'vitest'
import {
  applyReconcile,
  balanceTone,
  monthTone,
  monthlyBudgetFor,
  statusCaption,
  type ReconcileInput,
} from './budget'

const base: ReconcileInput = {
  balance: 100,
  dailyBudget: 100,
  monthEnd: 'reset',
  lastAccrualDate: '2026-03-10',
  lastMonth: '2026-03',
  pendingNewMonth: false,
}

/** Midday avoids any DST edge at midnight. */
const at = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12).getTime()

describe('balanceTone', () => {
  it('is "over" once the balance goes negative', () => {
    expect(balanceTone(-1, 100)).toBe('over')
  })

  it('is "low" at or under 15% of the daily budget', () => {
    expect(balanceTone(15, 100)).toBe('low')
    expect(balanceTone(16, 100)).toBe('normal')
  })
})

describe('monthTone', () => {
  it('warns from 80% of the month spent', () => {
    expect(monthTone(2399, 3000)).toBe('normal')
    expect(monthTone(2400, 3000)).toBe('near')
  })

  it('flags going past the month budget', () => {
    expect(monthTone(3000, 3000)).toBe('near')
    expect(monthTone(3001, 3000)).toBe('over')
  })

  it('stays quiet when there is no budget to compare against', () => {
    expect(monthTone(500, 0)).toBe('normal')
  })
})

describe('statusCaption', () => {
  const common = {
    dailyBudget: 100,
    monthlyBudget: 3000,
    spentThisMonth: 0,
    currency: 'ILS' as const,
  }

  it('eases off when today is overspent', () => {
    const c = statusCaption({ ...common, balance: -38, hasExpensesToday: true })
    expect(c.key).toBe('caption.overDaily')
    expect(c.tone).toBe('danger')
  })

  it('warns while today is running low', () => {
    const c = statusCaption({ ...common, balance: 10, hasExpensesToday: true })
    expect(c.key).toBe('caption.runningLow')
    expect(c.tone).toBe('warn')
  })

  it('warns as the month approaches its budget', () => {
    const c = statusCaption({ ...common, balance: 90, spentThisMonth: 2500, hasExpensesToday: true })
    expect(c.key).toBe('caption.monthLeft')
    expect(c.tone).toBe('warn')
    expect(c.vars?.amount?.replace(/[\u2066\u2069]/g, '')).toBe('₪500')
  })

  it('flags a month that has gone over', () => {
    const c = statusCaption({ ...common, balance: 90, spentThisMonth: 3200, hasExpensesToday: true })
    expect(c.key).toBe('caption.monthOver')
    expect(c.tone).toBe('danger')
    expect(c.vars?.amount?.replace(/[\u2066\u2069]/g, '')).toBe('₪200')
  })

  it('puts today ahead of the month when today is already overspent', () => {
    const c = statusCaption({ ...common, balance: -5, spentThisMonth: 3200, hasExpensesToday: true })
    expect(c.key).toBe('caption.overDaily')
  })

  it('calls out a fresh day before any spending', () => {
    const c = statusCaption({ ...common, balance: 100, hasExpensesToday: false })
    expect(c.key).toBe('caption.freshDay')
    expect(c.tone).toBe('normal')
  })

  it('shows the budgets once the day has activity', () => {
    const c = statusCaption({ ...common, balance: 90, hasExpensesToday: true })
    expect(c.key).toBe('caption.limits')
    expect(c.tone).toBe('normal')
  })
})

describe('monthlyBudgetFor', () => {
  it('follows the length of the calendar month', () => {
    expect(monthlyBudgetFor(150, new Date(2026, 8, 15))).toBe(4500) // September, 30 days
    expect(monthlyBudgetFor(150, new Date(2026, 9, 15))).toBe(4650) // October, 31 days
  })

  it('handles February, including leap years', () => {
    expect(monthlyBudgetFor(150, new Date(2026, 1, 10))).toBe(4200) // 28 days
    expect(monthlyBudgetFor(150, new Date(2028, 1, 10))).toBe(4350) // 29 days
  })
})

describe('applyReconcile', () => {
  it('changes nothing when opened again the same day', () => {
    const r = applyReconcile(base, at(2026, 3, 10))
    expect(r.balance).toBe(100)
    expect(r.lastAccrualDate).toBe('2026-03-10')
    expect(r.pendingNewMonth).toBe(false)
  })

  it('banks one daily budget for every whole day elapsed', () => {
    const r = applyReconcile(base, at(2026, 3, 13))
    expect(r.balance).toBe(400) // 100 + 3 × 100
    expect(r.lastAccrualDate).toBe('2026-03-13')
  })

  it('resets at a new month, then credits that day', () => {
    const r = applyReconcile({ ...base, balance: 900 }, at(2026, 4, 2))
    expect(r.balance).toBe(100) // reset to 0, plus today's budget
    expect(r.lastMonth).toBe('2026-04')
    expect(r.pendingNewMonth).toBe(true)
  })

  it('keeps the balance when set to carry over', () => {
    const r = applyReconcile({ ...base, balance: 900, monthEnd: 'carryover' }, at(2026, 4, 2))
    expect(r.balance).toBe(1000) // 900 kept, plus today's budget
  })

  it('never back-credits a whole month after a long absence', () => {
    // Opened on 28 April having last used the app in March: the user should
    // get today's budget, not 28 days' worth.
    const r = applyReconcile({ ...base, balance: 0, monthEnd: 'carryover' }, at(2026, 4, 28))
    expect(r.balance).toBe(100)
  })
})
