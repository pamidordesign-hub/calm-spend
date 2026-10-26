import { describe, expect, it } from 'vitest'
import { countUpValue, easeOutCubic } from './useCountUp'

describe('easeOutCubic', () => {
  it('spans 0 to 1', () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
  })

  it('front-loads the movement, which is what makes it feel responsive', () => {
    // A quarter of the time should already cover more than half the distance.
    expect(easeOutCubic(0.25)).toBeGreaterThan(0.5)
  })

  it('never goes backwards', () => {
    let previous = -1
    for (let t = 0; t <= 1.0001; t += 0.05) {
      const v = easeOutCubic(t)
      expect(v).toBeGreaterThanOrEqual(previous)
      previous = v
    }
  })
})

describe('countUpValue', () => {
  it('starts at the old figure and lands on the new one', () => {
    expect(countUpValue(100, 240, 0)).toBe(100)
    expect(countUpValue(100, 240, 1)).toBe(240)
  })

  it('clamps progress outside 0..1', () => {
    expect(countUpValue(100, 240, -5)).toBe(100)
    expect(countUpValue(100, 240, 9)).toBe(240)
  })

  it('counts downwards too, which is the common case after an expense', () => {
    const mid = countUpValue(240, 100, 0.5)
    expect(mid).toBeLessThan(240)
    expect(mid).toBeGreaterThan(100)
  })

  it('crosses zero into a negative balance without stalling', () => {
    expect(countUpValue(20, -38, 1)).toBe(-38)
    expect(countUpValue(20, -38, 0.5)).toBeLessThan(20)
  })

  it('stays put when nothing changed', () => {
    for (const t of [0, 0.3, 0.7, 1]) expect(countUpValue(75, 75, t)).toBe(75)
  })
})
