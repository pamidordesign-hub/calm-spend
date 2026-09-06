import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

interface IconBadgeProps {
  children: ReactNode
  size?: number
  shape?: 'circle' | 'square'
  tone?: 'solid' | 'soft'
  className?: string
  fontSize?: number
}

export function IconBadge({
  children,
  size = 38,
  shape = 'circle',
  tone = 'solid',
  className,
  fontSize,
}: IconBadgeProps) {
  return (
    <div
      className={cx(
        'flex items-center justify-center font-semibold shrink-0 leading-none',
        shape === 'circle' ? 'rounded-full' : 'rounded-[11px]',
        tone === 'solid' ? 'bg-primary text-white' : 'bg-primary/12 text-primary',
        className,
      )}
      style={{ width: size, height: size, fontSize: fontSize ?? size * 0.42 }}
    >
      {children}
    </div>
  )
}
