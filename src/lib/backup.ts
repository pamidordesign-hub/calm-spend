import { useAppStore } from '../store/useAppStore'
import type { Appearance, Currency, Expense, MonthEnd } from '../store/types'

/**
 * Everything lives in localStorage, which the browser or OS can clear at any
 * time. These helpers let the whole ledger be exported to a file and restored
 * later — the only real protection against losing your history.
 */
const FORMAT = 'calmspend-backup'
const FORMAT_VERSION = 1

export interface BackupPayload {
  onboarded: boolean
  currency: Currency
  dailyBudget: number
  balance: number
  expenses: Expense[]
  monthEnd: MonthEnd
  notifications: boolean
  appearance: Appearance
  lastAccrualDate: string
  lastMonth: string
  pendingNewMonth: boolean
}

export interface BackupFile {
  format: string
  version: number
  exportedAt: string
  data: BackupPayload
}

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function buildBackup(): BackupFile {
  const s = useAppStore.getState()
  return {
    format: FORMAT,
    version: FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      onboarded: s.onboarded,
      currency: s.currency,
      dailyBudget: s.dailyBudget,
      balance: s.balance,
      expenses: s.expenses,
      monthEnd: s.monthEnd,
      notifications: s.notifications,
      appearance: s.appearance,
      lastAccrualDate: s.lastAccrualDate,
      lastMonth: s.lastMonth,
      pendingNewMonth: s.pendingNewMonth,
    },
  }
}

export function backupFilename(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `calmspend-backup-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`
}

/** Saves the ledger to a JSON file on the device. */
export function downloadBackup(): void {
  const blob = new Blob([JSON.stringify(buildBackup(), null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = backupFilename()
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Validates and normalises a backup file. Throws a readable error if invalid. */
export function parseBackup(text: string): BackupPayload {
  let json: any
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error('That file isn’t valid JSON.')
  }
  if (!json || json.format !== FORMAT) {
    throw new Error('That doesn’t look like a Calm Spend backup.')
  }
  const d = json.data
  if (!d || typeof d !== 'object' || !Array.isArray(d.expenses)) {
    throw new Error('The backup file is missing its data.')
  }

  const expenses: Expense[] = d.expenses
    .filter((e: any) => e && isNum(e.amount) && isNum(e.ts))
    .map((e: any) => ({
      id: typeof e.id === 'string' && e.id ? e.id : randomId(),
      amount: Math.round(Math.abs(e.amount)),
      label: String(e.label ?? 'Expense'),
      category: String(e.category ?? 'Other'),
      ts: e.ts,
      kind: e.kind === 'income' ? 'income' : 'expense',
    }))

  const currencies: Currency[] = ['ILS', 'USD', 'EUR', 'GBP']

  return {
    onboarded: true,
    currency: currencies.includes(d.currency) ? d.currency : 'ILS',
    dailyBudget: Math.round(isNum(d.dailyBudget) ? d.dailyBudget : 100),
    balance: Math.round(isNum(d.balance) ? d.balance : 0),
    expenses,
    monthEnd: d.monthEnd === 'carryover' ? 'carryover' : 'reset',
    notifications: !!d.notifications,
    appearance: d.appearance === 'dark' ? 'dark' : 'light',
    lastAccrualDate: typeof d.lastAccrualDate === 'string' ? d.lastAccrualDate : '',
    lastMonth: typeof d.lastMonth === 'string' ? d.lastMonth : '',
    pendingNewMonth: !!d.pendingNewMonth,
  }
}

/** Replaces all current data with the backup's. Returns the entry count. */
export async function restoreBackup(file: File): Promise<number> {
  const payload = parseBackup(await file.text())
  useAppStore.getState().replaceAll(payload)
  return payload.expenses.length
}

/** Asks the browser not to evict our data under storage pressure. */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false
    if (await navigator.storage.persisted?.()) return true
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

export async function isStoragePersisted(): Promise<boolean> {
  try {
    return (await navigator.storage?.persisted?.()) ?? false
  } catch {
    return false
  }
}
