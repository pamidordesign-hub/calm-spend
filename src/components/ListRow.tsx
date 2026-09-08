import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

interface ListRowProps {
  leading?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  right?: ReactNode
  onClick?: () => void
  selected?: boolean
  className?: string
}

export function ListRow({ leading, title, subtitle, right, onClick, selected, className }: ListRowProps) {
  const Comp: any = onClick ? 'button' : 'div'
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cx(
        'w-full text-start bg-surface rounded-[16px] px-[14px] py-[13px] flex items-center gap-3 shadow-soft',
        onClick && 'transition active:scale-[0.99]',
        selected && 'ring-2 ring-primary',
        className,
      )}
    >
      {leading}
      <div className="min-w-0 flex-1">
        <div className="text-[16px] font-semibold text-heading truncate">{title}</div>
        {subtitle != null && <div className="text-[13px] text-muted mt-[2px] truncate">{subtitle}</div>}
      </div>
      {right != null && <div className="shrink-0 flex items-center gap-2 text-muted">{right}</div>}
    </Comp>
  )
}
