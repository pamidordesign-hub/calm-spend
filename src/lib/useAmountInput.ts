import { useCallback, useState } from 'react'

export type AmountMode = 'whole' | 'cents'

/**
 * Keypad-driven amount entry. The keypad has no decimal key, so:
 *  - 'cents' mode reads digits ATM-style (1,2,7,5 -> 12.75) — used for expenses.
 *  - 'whole' mode reads digits as whole units (1,0,0 -> 100) — used for budgets.
 */
export function useAmountInput(mode: AmountMode = 'cents', maxDigits = 9) {
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
  const set = useCallback(
    (n: number) => setDigits(mode === 'cents' ? String(Math.round(n * 100)) : String(Math.round(n))),
    [mode],
  )

  const value = mode === 'cents' ? parseInt(digits || '0', 10) / 100 : parseInt(digits || '0', 10)
  const hasValue = digits.length > 0 && value > 0

  return { digits, value, hasValue, mode, pushDigit, backspace, clear, set }
}
