import { useCallback, useState } from 'react'

/**
 * Keypad-driven amount entry. Amounts are whole currency units — there is no
 * decimal key and no fractional money anywhere in the app, so the digits are
 * read literally (1, 2, 7, 5 -> 1275).
 */
export function useAmountInput(maxDigits = 9) {
  const [digits, setDigits] = useState('')

  const pushDigit = useCallback(
    (d: string) => {
      setDigits((prev) => {
        const next = (prev + d).replace(/^0+(?=\d)/, '')
        if (next.length > maxDigits) return prev
        return next
      })
    },
    [maxDigits],
  )

  const backspace = useCallback(() => setDigits((prev) => prev.slice(0, -1)), [])
  const clear = useCallback(() => setDigits(''), [])
  const set = useCallback((n: number) => setDigits(String(Math.round(n))), [])

  const value = parseInt(digits || '0', 10)
  const hasValue = digits.length > 0 && value > 0

  return { digits, value, hasValue, pushDigit, backspace, clear, set }
}
