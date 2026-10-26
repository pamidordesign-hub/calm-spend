import { useCountUp } from '../lib/useCountUp'

/**
 * The balance figure, counting to each new value.
 *
 * It owns the count itself so a running animation re-renders this span alone,
 * leaving the keypad above it untouched.
 */
export function AnimatedAmount({
  value,
  format,
  className,
}: {
  value: number
  format: (n: number) => string
  className?: string
}) {
  const shown = useCountUp(value)
  return (
    <span className={className} aria-live="polite">
      {format(shown)}
    </span>
  )
}
