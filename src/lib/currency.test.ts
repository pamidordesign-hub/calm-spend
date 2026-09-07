import { describe, it, expect } from 'vitest'
import { formatMoney, symbolFor } from './currency'

describe('formatMoney', () => {
  it('drops the decimals for whole amounts', () => {
    expect(formatMoney(150, 'ILS')).toBe('₪150')
  })

  it('keeps cents when the amount has them', () => {
    expect(formatMoney(12.75, 'ILS')).toBe('₪12.75')
  })

  it('groups thousands', () => {
    expect(formatMoney(9990, 'ILS')).toBe('₪9,990')
  })

  it('puts a true minus sign before the symbol', () => {
    expect(formatMoney(-38, 'ILS')).toBe('−₪38')
  })

  it('can force a leading + for money coming in', () => {
    expect(formatMoney(200, 'ILS', { signed: true })).toBe('+₪200')
  })

  it('can force cents while typing', () => {
    expect(formatMoney(5, 'ILS', { alwaysCents: true })).toBe('₪5.00')
  })

  it('uses the right symbol per currency', () => {
    expect(symbolFor('USD')).toBe('$')
    expect(formatMoney(5, 'EUR')).toBe('€5')
    expect(formatMoney(5, 'GBP')).toBe('£5')
  })
})
