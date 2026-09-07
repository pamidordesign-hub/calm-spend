import { cx } from '../lib/cx'

interface KeypadProps {
  onKey: (digit: string) => void
  onBackspace: () => void
  className?: string
}

// Rows and keys flex to fill whatever height the keypad is given, so the
// layout stays intact on short phones instead of pushing content off-screen.
const GAP = 'gap-[clamp(5px,1.2cqh,10px)]'

function Key({
  label,
  onClick,
  fontClass = 'text-[clamp(17px,2.9cqh,24px)]',
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
        'flex-1 min-w-0 h-full rounded-[16px] bg-card text-key font-medium',
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
    <div className={cx('flex flex-col w-full min-h-0', GAP, className)}>
      {ROWS.map((row) => (
        <div key={row.join('')} className={cx('flex w-full flex-1 min-h-0', GAP)}>
          {row.map((d) => (
            <Key key={d} label={d} onClick={() => onKey(d)} />
          ))}
        </div>
      ))}
      <div className={cx('flex w-full flex-1 min-h-0', GAP)}>
        <Key label="0" onClick={() => onKey('0')} />
        <Key
          label="⌫"
          ariaLabel="Delete"
          onClick={onBackspace}
          fontClass="text-[clamp(15px,2.4cqh,20px)]"
        />
      </div>
    </div>
  )
}
