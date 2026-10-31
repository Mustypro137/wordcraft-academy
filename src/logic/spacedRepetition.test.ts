import { describe, expect, it } from 'vitest'
import { addDays, daysBetween } from './dates'
import { addCorrectDay, hasMastered } from './mastery'
import { nextSchedule, WAIT_DAYS } from './spacedRepetition'

const TODAY = '2026-10-31'

describe('addDays and daysBetween', () => {
  it('moves across months and years', () => {
    expect(addDays(TODAY, 1)).toBe('2026-11-01')
    expect(addDays('2026-12-25', 30)).toBe('2027-01-24')
    expect(addDays(TODAY, 0)).toBe(TODAY)
  })

  it('counts whole days, also across a summer-time change', () => {
    expect(daysBetween(TODAY, '2026-11-03')).toBe(3)
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2)
  })
})

describe('nextSchedule', () => {
  it('correct: up one box, waiting that box’s days', () => {
    expect(nextSchedule(0, 'correct', TODAY)).toEqual({ box: 1, due: '2026-11-01' })
    expect(nextSchedule(3, 'correct', TODAY)).toEqual({ box: 4, due: '2026-11-14' })
  })

  it('correct in the top box stays there and waits 30 days', () => {
    expect(nextSchedule(5, 'correct', TODAY)).toEqual({ box: 5, due: addDays(TODAY, WAIT_DAYS[5]) })
  })

  it('wrong: back to box 1, so the word returns tomorrow', () => {
    expect(nextSchedule(4, 'wrong', TODAY)).toEqual({ box: 1, due: '2026-11-01' })
    expect(nextSchedule(0, 'wrong', TODAY)).toEqual({ box: 1, due: '2026-11-01' })
  })

  it('guessed: same box', () => {
    expect(nextSchedule(2, 'guessed', TODAY)).toEqual({ box: 2, due: '2026-11-03' })
  })
})

describe('mastery', () => {
  it('counts each day once and keeps the days in order', () => {
    expect(addCorrectDay(['2026-11-05'], '2026-11-01')).toEqual(['2026-11-01', '2026-11-05'])
    expect(addCorrectDay(['2026-11-01'], '2026-11-01')).toEqual(['2026-11-01'])
  })

  it('needs 3 different days, the first and last at least 7 days apart', () => {
    expect(hasMastered(['2026-11-01', '2026-11-04', '2026-11-08'])).toBe(true)
    expect(hasMastered(['2026-11-01', '2026-11-04', '2026-11-07'])).toBe(false)
    expect(hasMastered(['2026-11-01', '2026-11-20'])).toBe(false)
    expect(hasMastered([])).toBe(false)
  })
})
