import { cx } from '../lib/cx'

export function Radio({ checked }: { checked: boolean }) {
  return (
    <div
      className={cx(
        'size-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
        checked ? 'border-primary' : 'border-stroke',
      )}
    >
      {checked && <div className="size-3 rounded-full bg-primary" />}
    </div>
  )
}
