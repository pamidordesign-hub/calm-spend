import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

interface ModalProps {
  open: boolean
  onClose?: () => void
  children: ReactNode
  className?: string
  /** Dismiss when tapping the backdrop (default true). */
  dismissable?: boolean
}

/** Centered card over a dimmed backdrop, scoped to the phone frame. */
export function Modal({ open, onClose, children, className, dismissable = true }: ModalProps) {
  if (!open) return null
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-5">
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={dismissable ? onClose : undefined}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cx('relative w-full max-w-[350px] bg-surface rounded-[24px] shadow-card animate-pop', className)}
      >
        {children}
      </div>
    </div>
  )
}
