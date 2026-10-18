/**
 * Keeps the two native surfaces in step with the store: the scheduled daily
 * reminder and the home-screen widget. Both are no-ops in a browser.
 */
import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { syncReminder } from './notifications'
import { pushSnapshot } from './widget'
import { balanceTone } from './budget'

export function useNativeSync(): void {
  const notifications = useAppStore((s) => s.notifications)
  const reminderTime = useAppStore((s) => s.reminderTime)
  const lang = useAppStore((s) => s.lang)

  const balance = useAppStore((s) => s.balance)
  const dailyBudget = useAppStore((s) => s.dailyBudget)
  const currency = useAppStore((s) => s.currency)
  const monthEnd = useAppStore((s) => s.monthEnd)
  const lastAccrualDate = useAppStore((s) => s.lastAccrualDate)
  const onboarded = useAppStore((s) => s.onboarded)

  // Re-scheduling is idempotent: it cancels the previous reminder first, so
  // this settles on exactly one notification per day whatever changed.
  useEffect(() => {
    if (!onboarded) return
    void syncReminder({ enabled: notifications, lang, time: reminderTime }).then((scheduled) => {
      // If iOS refused permission, correct the stored preference instead of
      // leaving Settings showing "On" for a reminder that will never fire.
      if (notifications && !scheduled) useAppStore.getState().setNotifications(false)
    })
  }, [onboarded, notifications, lang, reminderTime])

  useEffect(() => {
    if (!onboarded) return
    void pushSnapshot({
      balance,
      dailyBudget,
      currency,
      tone: balanceTone(balance, dailyBudget),
      lang,
      lastAccrualDate,
      monthEnd,
      updatedAt: Date.now(),
    })
  }, [onboarded, balance, dailyBudget, currency, lang, lastAccrualDate, monthEnd])
}
