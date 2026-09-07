import type { ReactNode } from 'react'

/**
 * Centres the 390-wide app in a phone-like device on desktop, and goes
 * full-bleed on small screens. Children fill the device height.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center sm:p-6">
      <div className="phone-shell relative w-full h-[100dvh] overflow-hidden bg-page [padding-top:env(safe-area-inset-top)] [padding-bottom:env(safe-area-inset-bottom)] sm:w-[390px] sm:h-[844px] sm:max-h-[calc(100dvh-3rem)] sm:p-0 sm:rounded-[44px] sm:shadow-[0_30px_90px_-24px_rgba(43,48,64,0.55)] sm:ring-1 sm:ring-black/5">
        {children}
      </div>
    </div>
  )
}
