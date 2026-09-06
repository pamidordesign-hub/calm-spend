import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

interface SheetProps {
  children: ReactNode
  className?: string
  /** Scroll the body region (default true). */
  scroll?: boolean
}

/** The rounded card with a drag handle used for History / Settings screens. */
export function Sheet({ children, className, scroll = true }: SheetProps) {
  return (
    <section
      className={cx(
        'w-full flex-1 min-h-0 flex flex-col bg-card rounded-[28px] shadow-card animate-slide-up',
        className,
      )}
    >
      <div className="pt-[14px] pb-1 flex justify-center shrink-0">
        <div className="h-[5px] w-11 rounded-full bg-stroke" />
      </div>
      <div className={cx('flex-1 min-h-0 px-[18px] pb-[18px]', scroll && 'overflow-y-auto no-scrollbar')}>
        {children}
      </div>
    </section>
  )
}
