import { cx } from '../lib/cx'

interface KeypadProps {
  onKey: (digit: string) => void
  onBackspace: () => void
  className?: string
}

function Key({
  label,
  onClick,
  fontClass = 'text-[24px]',
  ariaLabel,
}: {
  label: string
  onClick: () => void
  fontClass?: string
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      className={cx(
        'flex-1 h-[58px] rounded-[16px] bg-card text-key font-medium',
        'flex items-center justify-center select-none',
        'transition-[transform,background-color] duration-100 active:scale-[0.96] active:bg-stroke/70',
        fontClass,
      )}
    >
      {label}
    </button>
  )
}

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
]

export function Keypad({ onKey, onBackspace, className }: KeypadProps) {
  return (
    <div className={cx('flex flex-col gap-[10px] w-full', className)}>
      {ROWS.map((row) => (
        <div key={row.join('')} className="flex gap-[10px] w-full">
          {row.map((d) => (
            <Key key={d} label={d} onClick={() => onKey(d)} />
          ))}
        </div>
      ))}
      <div className="flex gap-[10px] w-full">
        <Key label="0" onClick={() => onKey('0')} />
        <Key label="⌫" ariaLabel="Delete" onClick={onBackspace} fontClass="text-[20px]" />
      </div>
    </div>
  )
}
