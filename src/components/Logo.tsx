import { cx } from '../lib/cx'

// Relative asset paths (no leading slash) so they resolve under any deploy
// sub-path. HashRouter keeps the document path at the deploy root.
const LOCKUP_LIGHT = 'logo-lockup.svg'
const LOCKUP_DARK = 'logo-lockup-dark.svg'
const MARK = 'logo-mark.svg'

interface LogoProps {
  /** Badge height in px; the lockup scales to match. */
  size?: number
  markOnly?: boolean
  className?: string
}

/** Square badge + mark only (no wordmark). */
export function LogoMark({ size = 28 }: { size?: number }) {
  return <img src={MARK} alt="" width={size} height={size} style={{ display: 'block' }} />
}

export function Logo({ size = 28, markOnly, className }: LogoProps) {
  if (markOnly) return <LogoMark size={size} />
  const height = Math.round(size * 1.05)
  return (
    <span className={cx('inline-flex items-center', className)}>
      <img className="logo-light" src={LOCKUP_LIGHT} alt="Calm Spend" style={{ height }} />
      <img className="logo-dark" src={LOCKUP_DARK} alt="Calm Spend" style={{ height }} />
    </span>
  )
}
