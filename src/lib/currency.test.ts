import { describe, it, expect } from 'vitest'
import { formatMoney, symbolFor } from './currency'

describe('formatMoney', () => {
  it('shows whole amounts with no decimals', () => {
    expect(formatMoney(150, 'ILS')).toBe('₪150')
  })

  it('rounds away any fractional leftovers', () => {
    expect(formatMoney(12.75, 'ILS')).toBe('₪13')
    expect(formatMoney(12.2, 'ILS')).toBe('₪12')
  })

  it('groups thousands', () => {
    expect(formatMoney(9990, 'ILS')).toBe('₪9,990')
  })

  it('puts a true minus sign before the symbol', () => {
    expect(formatMoney(-38, 'ILS')).toBe('−₪38')
  })

  it('never renders a negative zero', () => {
    expect(formatMoney(-0.25, 'ILS')).toBe('₪0')
  })

  it('can force a leading + for money coming in', () => {
    expect(formatMoney(200, 'ILS', { signed: true })).toBe('+₪200')
  })

  it('uses the right symbol per currency', () => {
    expect(symbolFor('USD')).toBe('$')
    expect(formatMoney(5, 'EUR')).toBe('€5')
    expect(formatMoney(5, 'GBP')).toBe('£5')
  })
})
