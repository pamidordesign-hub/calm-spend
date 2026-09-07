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
    // Type scale and padding shrink with the available height so the card never
    // pushes the keypad or the action buttons off a short screen.
    <div className="w-full bg-card rounded-[24px] px-5 py-[clamp(12px,2.6cqh,22px)] flex flex-col items-center gap-[clamp(8px,1.65cqh,14px)] shadow-card shrink-0">
      <p className="text-[clamp(16px,2.6cqh,22px)] font-semibold text-heading">{heading}</p>

      <PlateTag
        type={onAmountClick ? 'button' : undefined}
        onClick={onAmountClick}
        className={cx(
          'w-full bg-plate rounded-[18px] pt-[clamp(10px,2.1cqh,18px)] pb-[clamp(8px,1.65cqh,14px)] flex flex-col items-center',
          onAmountClick && 'transition active:scale-[0.99]',
        )}
      >
        <p className={cx('font-bold text-[clamp(30px,5.45cqh,46px)] leading-none tracking-[-1px]', numColor)}>
          {amountText}
        </p>
        {subLabel && (
          <p className="text-[clamp(11px,1.55cqh,13px)] font-medium text-muted mt-[clamp(4px,0.95cqh,8px)]">
            {subLabel}
          </p>
        )}
      </PlateTag>

      <div className="w-full bg-surface border-[1.5px] border-stroke rounded-[14px] px-4 py-[clamp(7px,1.4cqh,12px)] flex items-center min-h-[clamp(38px,5.6cqh,47px)]">
        <span
          className={cx(
            'text-[clamp(14px,1.9cqh,16px)] font-medium',
            input ? 'text-heading' : 'text-muted',
          )}
        >
          {input || placeholder}
        </span>
      </div>

      <p className={cx('text-[clamp(11px,1.55cqh,13px)] font-medium text-center leading-snug', capColor)}>
        {caption}
      </p>
    </div>
  )
}
