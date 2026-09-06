import type { Expense } from '../store/types'

/** Local calendar date as 'YYYY-MM-DD'. */
export function ymd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Local month key as 'YYYY-MM'. */
export function ym(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function parseYmd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(d: Date, n: number): Date {
  const c = new Date(d)
  c.setDate(c.getDate() + n)
  return c
}

/** Whole calendar days from a 'YYYY-MM-DD' string up to `toDate` (never negative). */
export function wholeDaysBetween(fromYmd: string, toDate: Date): number {
  if (!fromYmd) return 0
  const from = parseYmd(fromYmd)
  const to = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate())
  const ms = to.getTime() - from.getTime()
  return Math.max(0, Math.round(ms / 86_400_000))
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** "Today" / "Yesterday" / "Mon, Jun 6". */
export function dayLabel(ts: number, now: number = Date.now()): string {
  const d = new Date(ts)
  const today = new Date(now)
  if (sameDay(d, today)) return 'Today'
  if (sameDay(d, addDays(today, -1))) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

/** "Today, Jun 6" style used on the expense detail card. */
export function fullDayLabel(ts: number, now: number = Date.now()): string {
  const d = new Date(ts)
  const today = new Date(now)
  const md = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (sameDay(d, today)) return `Today, ${md}`
  if (sameDay(d, addDays(today, -1))) return `Yesterday, ${md}`
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

/** 24-hour clock, e.g. "08:24". */
export function timeLabel(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function monthLabel(now: number = Date.now()): string {
  return new Date(now).toLocaleDateString('en-US', { month: 'long' })
}

export interface DayGroup {
  key: string
  label: string
  total: number
  items: Expense[]
}

/** Group expenses into day buckets, newest first. */
export function groupByDay(expenses: Expense[], now: number = Date.now()): DayGroup[] {
  const sorted = [...expenses].sort((a, b) => b.ts - a.ts)
  const map = new Map<string, Expense[]>()
  for (const e of sorted) {
    const k = ymd(new Date(e.ts))
    const arr = map.get(k)
    if (arr) arr.push(e)
    else map.set(k, [e])
  }
  return [...map.entries()].map(([key, items]) => ({
    key,
    label: dayLabel(items[0].ts, now),
    total: items.reduce((s, e) => s + e.amount, 0),
    items,
  }))
}
