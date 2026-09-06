import { useEffect, useState } from 'react'
import { LogoMark } from './Logo'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'cs-install-dismissed'

function isStandalone(): boolean {
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true
    )
  } catch {
    return false
  }
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

/** A dismissible banner offering to install the app to the home screen. */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [iosHint, setIosHint] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') return
    } catch {
      /* ignore */
    }

    const onBIP = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', onBIP)

    // iOS Safari never fires beforeinstallprompt — show manual instructions.
    if (isIos()) {
      setIosHint(true)
      setShow(true)
    }

    return () => window.removeEventListener('beforeinstallprompt', onBIP)
  }, [])

  if (!show) return null

  const dismiss = () => {
    setShow(false)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  const install = async () => {
    if (deferred) {
      await deferred.prompt()
      await deferred.userChoice
      setDeferred(null)
    }
    dismiss()
  }

  return (
    <div className="absolute inset-x-3 bottom-3 z-30 animate-slide-up [padding-bottom:env(safe-area-inset-bottom)]">
      <div className="bg-heading text-white rounded-[18px] px-3 py-3 flex items-center gap-3 shadow-card">
        <LogoMark size={38} />
        <div className="flex-1 text-[13px] leading-snug">
          {iosHint ? (
            <>
              Install: tap <b>Share</b>, then <b>Add to Home Screen</b>
            </>
          ) : (
            <>Add Calm Spend to your home screen</>
          )}
        </div>
        {!iosHint && (
          <button
            type="button"
            onClick={install}
            className="bg-white text-heading rounded-full px-3.5 py-1.5 text-[13px] font-semibold shrink-0 active:scale-95 transition"
          >
            Install
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="text-white/60 px-1 text-[16px] shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
