export type Currency = 'ILS' | 'USD' | 'EUR' | 'GBP'
export type MonthEnd = 'reset' | 'carryover'
export type Appearance = 'light' | 'dark'

export interface Expense {
  id: string
  /** Positive magnitude in currency units (may be fractional). */
  amount: number
  label: string
  category: string
  /** Epoch milliseconds. */
  ts: number
}

export const CATEGORIES = [
  'Food & drink',
  'Groceries',
  'Transport',
  'Shopping',
  'Bills',
  'Other',
] as const
export type Category = (typeof CATEGORIES)[number]
