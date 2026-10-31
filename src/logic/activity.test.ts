import { describe, expect, it } from 'vitest'
import { addActivity, streak, type Activity } from './activity'

const TODAY = '2026-10-31'

/** Activity on the given days, one word each */
function on(...days: string[]): Activity {
  return Object.fromEntries(days.map((d) => [d, 1]))
}

describe('addActivity', () => {
  it('adds to a day and leaves the old object alone', () => {
    const before = on(TODAY)
    expect(addActivity(before, TODAY, 2)).toEqual({ [TODAY]: 3 })
    expect(before).toEqual({ [TODAY]: 1 })
  })

  it('Undo takes away, never below 0, and an empty day disappears', () => {
    expect(addActivity(on(TODAY), TODAY, -1)).toEqual({})
    expect(addActivity({}, TODAY, -1)).toEqual({})
  })
})

describe('streak', () => {
  it('is 0 with no activity', () => {
    expect(streak({}, TODAY)).toBe(0)
  })

  it('counts days in a row, including today', () => {
    expect(streak(on('2026-10-29', '2026-10-30', TODAY), TODAY)).toBe(3)
  })

  it('today is not over yet: the streak still runs to yesterday', () => {
    expect(streak(on('2026-10-29', '2026-10-30'), TODAY)).toBe(2)
  })

  it('one missed day does not break it', () => {
    expect(streak(on('2026-10-28', '2026-10-29', TODAY), TODAY)).toBe(3)
    // Yesterday missed, today not practised yet
    expect(streak(on('2026-10-28', '2026-10-29'), TODAY)).toBe(2)
  })

  it('two missed days in a row break it', () => {
    expect(streak(on('2026-10-27', '2026-10-28', TODAY), TODAY)).toBe(1)
    expect(streak(on('2026-10-27', '2026-10-28'), TODAY)).toBe(0)
  })

  it('two missed days within a week break it, a week apart they do not', () => {
    // Missed 30th and 26th: 4 days apart
    expect(streak(on('2026-10-24', '2026-10-25', '2026-10-27', '2026-10-28', '2026-10-29', TODAY), TODAY)).toBe(4)
    // Missed 30th and 23rd: 7 days apart
    const days = ['2026-10-20', '2026-10-21', '2026-10-22', '2026-10-24', '2026-10-25', '2026-10-26']
    expect(streak(on(...days, '2026-10-27', '2026-10-28', '2026-10-29', TODAY), TODAY)).toBe(10)
  })
})
