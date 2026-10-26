import { useEffect, useRef, useState } from 'react'

/**
 * Long enough to read as movement, short enough that the real figure is never
 * in doubt. Money is the one number in this app people act on.
 */
const DURATION = 420

/** Cubic ease-out, the numeric twin of --ease-out-quart. */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/** The value part-way through a count, clamped at both ends. */
export function countUpValue(from: number, to: number, progress: number): number {
  const t = Math.min(1, Math.max(0, progress))
  return from + (to - from) * easeOutCubic(t)
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Counts from the previously shown figure to `target`.
 *
 * The first value is shown outright: arriving on a screen should not make the
 * balance appear to climb from nowhere. An interrupted count carries on from
 * wherever it had reached rather than snapping back.
 */
export function useCountUp(target: number): number {
  const [value, setValue] = useState(target)
  const displayed = useRef(target)
  const mounted = useRef(false)

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      displayed.current = target
      setValue(target)
      return
    }
    if (prefersReducedMotion() || displayed.current === target) {
      displayed.current = target
      setValue(target)
      return
    }

    const from = displayed.current
    const start = performance.now()
    let frame = requestAnimationFrame(function tick(now) {
      const progress = (now - start) / DURATION
      if (progress >= 1) {
        displayed.current = target
        setValue(target)
        return
      }
      const next = countUpValue(from, target, progress)
      displayed.current = next
      setValue(next)
      frame = requestAnimationFrame(tick)
    })

    return () => cancelAnimationFrame(frame)
  }, [target])

  return value
}
