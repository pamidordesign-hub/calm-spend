/**
 * Feeds the iOS home-screen widget.
 *
 * The widget is a separate process and cannot read localStorage, so the app
 * pushes a small snapshot into a shared App Group whenever the numbers change.
 * The widget accrues forward from `lastAccrualDate` on its own, so it stays
 * right for a few days even if the app is not opened.
 */
import { Capacitor, registerPlugin } from '@capacitor/core'
import type { Currency, MonthEnd } from '../store/types'
import type { BalanceTone } from './budget'
import type { Lang } from './i18n'

export interface WidgetSnapshot {
  balance: number
  dailyBudget: number
  currency: Currency
  tone: BalanceTone
  lang: Lang
  /** 'YYYY-MM-DD' of the last day already credited. */
  lastAccrualDate: string
  monthEnd: MonthEnd
  /** Epoch ms, so the widget can tell how stale the snapshot is. */
  updatedAt: number
}

interface CalmSpendWidgetPlugin {
  update(snapshot: WidgetSnapshot): Promise<void>
}

const plugin = registerPlugin<CalmSpendWidgetPlugin>('CalmSpendWidget')

export function isSupported(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios'
}

let lastSent = ''

/**
 * Pushes the snapshot to the widget. Skips the call when nothing changed, so
 * this is cheap to call from a store subscription.
 */
export async function pushSnapshot(snapshot: WidgetSnapshot): Promise<void> {
  if (!isSupported()) return
  // `updatedAt` is excluded from the comparison or every call would differ.
  const { updatedAt: _ignored, ...stable } = snapshot
  const fingerprint = JSON.stringify(stable)
  if (fingerprint === lastSent) return
  try {
    await plugin.update(snapshot)
    lastSent = fingerprint
  } catch {
    /* widget not installed, or running on a build without the extension */
  }
}

/** Test seam — lets a test force the next push through. */
export function resetCache(): void {
  lastSent = ''
}
