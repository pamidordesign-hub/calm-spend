/**
 * The real daily reminder.
 *
 * A browser cannot schedule a local notification, so this only does anything
 * on the native builds. On the web every call is a no-op and `isSupported()`
 * is false, which is what Settings uses to explain the difference instead of
 * showing a switch that quietly does nothing.
 */
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { translate, type Lang } from './i18n'
import { parseTime } from './reminderTime'

export { DEFAULT_REMINDER_TIME, parseTime, formatTime } from './reminderTime'

/** One fixed id, so re-scheduling always replaces the previous reminder. */
const REMINDER_ID = 1

/** False in a browser: only the native builds can schedule a notification. */
export function isSupported(): boolean {
  return Capacitor.isNativePlatform()
}

/**
 * Asks for permission. Returns false if the user said no — the caller is
 * expected to leave the toggle off rather than pretend it worked.
 */
export async function requestPermission(): Promise<boolean> {
  if (!isSupported()) return false
  try {
    const current = await LocalNotifications.checkPermissions()
    if (current.display === 'granted') return true
    if (current.display === 'denied') return false
    const asked = await LocalNotifications.requestPermissions()
    return asked.display === 'granted'
  } catch {
    return false
  }
}

async function clear(): Promise<void> {
  try {
    const pending = await LocalNotifications.getPending()
    const mine = pending.notifications.filter((n) => n.id === REMINDER_ID)
    if (mine.length) await LocalNotifications.cancel({ notifications: mine })
  } catch {
    /* nothing scheduled yet */
  }
}

/**
 * Schedules the repeating daily reminder.
 *
 * The text is deliberately free of any amount: a scheduled notification keeps
 * the text it was created with, so a balance baked in today would be wrong by
 * the time it fires tomorrow.
 */
export async function scheduleDailyReminder(lang: Lang, time: string): Promise<boolean> {
  if (!isSupported()) return false
  const granted = await requestPermission()
  if (!granted) return false

  await clear()
  const { hour, minute } = parseTime(time)
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: REMINDER_ID,
          title: translate(lang, 'notif.title'),
          body: translate(lang, 'notif.body'),
          schedule: { on: { hour, minute }, allowWhileIdle: true },
        },
      ],
    })
    return true
  } catch {
    return false
  }
}

export async function cancelDailyReminder(): Promise<void> {
  if (!isSupported()) return
  await clear()
}

/**
 * Brings the OS schedule in line with the stored settings. Safe to call on
 * every launch and whenever the toggle, time or language changes.
 */
export async function syncReminder(opts: {
  enabled: boolean
  lang: Lang
  time: string
}): Promise<boolean> {
  // Nothing to schedule in a browser — report the stored preference back
  // unchanged so the caller does not treat it as a failure.
  if (!isSupported()) return opts.enabled
  if (!opts.enabled) {
    await cancelDailyReminder()
    return false
  }
  return scheduleDailyReminder(opts.lang, opts.time)
}
