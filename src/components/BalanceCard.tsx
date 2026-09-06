import { cx } from '../lib/cx'
import type { BalanceTone } from '../lib/budget'

interface BalanceCardProps {
  heading: string
  amountText: string
  subLabel?: string
  /** The value being typed on the keypad (already formatted), or empty. */
  input: string
  placeholder?: string
  caption: string
  tone?: BalanceTone
  /** If provided, the amount plate becomes tappable (used to open History). */
  onAmountClick?: () => void
}

export function BalanceCard({
  heading,
  amountText,
  subLabel = 'Per Day',
  input,
  placeholder = '0',
  caption,
  tone = 'normal',
  onAmountClick,
}: BalanceCardProps) {
  const numColor = tone === 'over' ? 'text-expense' : tone === 'low' ? 'text-amber' : 'text-primary'
  const capColor = tone === 'over' ? 'text-expense' : tone === 'low' ? 'text-amber' : 'text-muted'
  const PlateTag: any = onAmountClick ? 'button' : 'div'
  return (
    <div className="w-full bg-card rounded-[24px] px-5 py-[22px] flex flex-col items-center gap-[14px] shadow-card shrink-0">
      <p className="text-[22px] font-semibold text-heading">{heading}</p>

      <PlateTag
        type={onAmountClick ? 'button' : undefined}
        onClick={onAmountClick}
        className={cx(
          'w-full bg-plate rounded-[18px] pt-[18px] pb-[14px] flex flex-col items-center',
          onAmountClick && 'transition active:scale-[0.99]',
        )}
      >
        <p className={cx('font-bold text-[46px] leading-none tracking-[-1px]', numColor)}>{amountText}</p>
        {subLabel && <p className="text-[13px] font-medium text-muted mt-2">{subLabel}</p>}
      </PlateTag>

      <div className="w-full bg-surface border-[1.5px] border-stroke rounded-[14px] px-4 py-3 flex items-center min-h-[47px]">
        <span className={cx('text-[16px] font-medium', input ? 'text-heading' : 'text-muted')}>
          {input || placeholder}
        </span>
      </div>

      <p className={cx('text-[13px] font-medium text-center leading-snug', capColor)}>{caption}</p>
    </div>
  )
}
