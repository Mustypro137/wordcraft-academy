import { describe, expect, it } from 'vitest'
import { words } from '../data/words'
import type { WordState } from '../types'
import { wordOfTheDay } from './dailyWord'
import type { WordStates } from './wordStates'

const TODAY = '2026-10-31'

function saved(changedAt: Date): WordState {
  return { collection: 'known', box: 0, due: TODAY, correctDays: [], changedAt: changedAt.toISOString() }
}

describe('wordOfTheDay', () => {
  it('is the same all day and changes on other days', () => {
    const today = wordOfTheDay(words, {}, TODAY, 'p1')
    expect(wordOfTheDay(words, {}, TODAY, 'p1')).toBe(today)
    const week = ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04'].map((d) => wordOfTheDay(words, {}, d, 'p1'))
    expect(week.some((w) => w !== today)).toBe(true)
  })

  it('skips words saved before today', () => {
    const states: WordStates = {}
    for (const w of words.slice(1)) states[w.id] = saved(new Date(2026, 9, 20))
    expect(wordOfTheDay(words, states, TODAY, 'p1')).toBe(words[0])
  })

  it('stays the same after the learner saves it today', () => {
    const word = wordOfTheDay(words, {}, TODAY, 'p1')!
    const states: WordStates = { [word.id]: saved(new Date(2026, 9, 31, 10)) }
    expect(wordOfTheDay(words, states, TODAY, 'p1')).toBe(word)
  })

  it('uses any word when every word is saved, and null with no words', () => {
    const states: WordStates = Object.fromEntries(words.map((w) => [w.id, saved(new Date(2026, 9, 20))]))
    expect(words).toContain(wordOfTheDay(words, states, TODAY, 'p1'))
    expect(wordOfTheDay([], {}, TODAY, 'p1')).toBeNull()
  })
})
