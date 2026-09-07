import type { Currency } from '../store/types'

export interface CurrencyInfo {
  code: Currency
  symbol: string
  name: string
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
]

export function symbolFor(code: Currency): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? '₪'
}

export function currencyName(code: Currency): string {
  return CURRENCIES.find((c) => c.code === code)?.name ?? code
}

// U+2212 minus sign — reads cleaner than a hyphen next to the glyphs.
const MINUS = '−'

interface FormatOpts {
  /** Render a leading + for positive values. */
  signed?: boolean
}

/**
 * Format a monetary amount in whole units — the app deliberately has no
 * fractional currency, so e.g. formatMoney(1234.6, 'ILS') -> "₪1,235".
 */
export function formatMoney(amount: number, currency: Currency, opts: FormatOpts = {}): string {
  const sym = symbolFor(currency)
  const rounded = Math.round(amount)
  const neg = rounded < 0
  const abs = Math.abs(rounded)
  const body = abs.toLocaleString('en-US', { maximumFractionDigits: 0 })
  const sign = neg ? MINUS : opts.signed ? '+' : ''
  return `${sign}${sym}${body}`
}
