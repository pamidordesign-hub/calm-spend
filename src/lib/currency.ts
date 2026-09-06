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
  /** Always show two decimals, even for whole amounts. */
  alwaysCents?: boolean
  /** Render a leading + for positive values. */
  signed?: boolean
}

/**
 * Format a monetary amount, e.g. formatMoney(1234.5, 'ILS') -> "₪1,234.50",
 * formatMoney(-38, 'ILS') -> "−₪38". Whole numbers drop the decimals unless
 * `alwaysCents` is set.
 */
export function formatMoney(amount: number, currency: Currency, opts: FormatOpts = {}): string {
  const sym = symbolFor(currency)
  const neg = amount < 0
  const abs = Math.abs(amount)
  const hasCents = opts.alwaysCents || Math.round(abs * 100) % 100 !== 0
  const body = abs.toLocaleString('en-US', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })
  const sign = neg ? MINUS : opts.signed ? '+' : ''
  return `${sign}${sym}${body}`
}
