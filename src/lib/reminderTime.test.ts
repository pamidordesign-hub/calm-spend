import { describe, expect, it } from 'vitest'
import {
  DEFAULT_REMINDER_TIME,
  formatTime,
  parseTime,
  reminderChoices,
} from './reminderTime'

describe('parseTime', () => {
  it('reads a padded time', () => {
    expect(parseTime('07:05')).toEqual({ hour: 7, minute: 5 })
  })

  it('reads a single-digit hour', () => {
    expect(parseTime('9:30')).toEqual({ hour: 9, minute: 30 })
  })

  it('keeps midnight and the last minute of the day', () => {
    expect(parseTime('00:00')).toEqual({ hour: 0, minute: 0 })
    expect(parseTime('23:59')).toEqual({ hour: 23, minute: 59 })
  })

  it('falls back to the default on an out-of-range or malformed value', () => {
    const fallback = parseTime(DEFAULT_REMINDER_TIME)
    for (const bad of ['24:00', '12:60', '-1:00', 'nonsense', '', '1200']) {
      expect(parseTime(bad)).toEqual(fallback)
    }
  })

  it('tolerates surrounding whitespace', () => {
    expect(parseTime('  08:15 ')).toEqual({ hour: 8, minute: 15 })
  })
})

describe('formatTime', () => {
  it('pads to HH:MM', () => {
    expect(formatTime('9:5')).toBe(DEFAULT_REMINDER_TIME) // '9:5' is malformed
    expect(formatTime('9:05')).toBe('09:05')
  })

  it('is idempotent', () => {
    expect(formatTime(formatTime('7:00'))).toBe('07:00')
  })
})

describe('reminderChoices', () => {
  it('offers every half hour of the day', () => {
    const choices = reminderChoices()
    expect(choices).toHaveLength(48)
    expect(choices[0]).toBe('00:00')
    expect(choices.at(-1)).toBe('23:30')
  })

  it('only produces values that survive a round trip', () => {
    for (const c of reminderChoices()) expect(formatTime(c)).toBe(c)
  })

  it('includes the default', () => {
    expect(reminderChoices()).toContain(DEFAULT_REMINDER_TIME)
  })
})
