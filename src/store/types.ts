export type Currency = 'ILS' | 'USD' | 'EUR' | 'GBP'
export type MonthEnd = 'reset' | 'carryover'
export type Appearance = 'light' | 'dark'

/** An entry either spends from the balance or adds back to it. */
export type EntryKind = 'expense' | 'income'

/**
 * A single ledger entry. `amount` is always a positive magnitude — `kind`
 * decides whether it is subtracted from or added to the balance, so the
 * history can explain every balance change.
 */
export interface Expense {
  id: string
  amount: number
  label: string
  category: string
  ts: number
  kind: EntryKind
}

/** +1 for money in, -1 for money out. */
export function signOf(kind: EntryKind): 1 | -1 {
  return kind === 'income' ? 1 : -1
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

export const INCOME_CATEGORY = 'Top-up'
