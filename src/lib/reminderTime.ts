/**
 * Pure helpers for the daily reminder's time of day, kept apart from
 * `notifications.ts` so the store can use them without pulling in Capacitor.
 */

export const DEFAULT_REMINDER_TIME = '21:00'

/** 'HH:MM' → {hour, minute}; falls back to the default on anything malformed. */
export function parseTime(time: string): { hour: number; minute: number } {
  const m = /^(\d{1,2}):(\d{2})$/.exec((time ?? '').trim())
  if (m) {
    const hour = Number(m[1])
    const minute = Number(m[2])
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) return { hour, minute }
  }
  const [h, mm] = DEFAULT_REMINDER_TIME.split(':')
  return { hour: Number(h), minute: Number(mm) }
}

/** Normalises any input to a padded 'HH:MM'. */
export function formatTime(time: string): string {
  const { hour, minute } = parseTime(time)
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

/** The times offered in the picker — every half hour through the day. */
export function reminderChoices(): string[] {
  const out: string[] = []
  for (let h = 0; h < 24; h++) {
    out.push(`${String(h).padStart(2, '0')}:00`)
    out.push(`${String(h).padStart(2, '0')}:30`)
  }
  return out
}
