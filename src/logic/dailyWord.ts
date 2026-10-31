import type { Word } from '../types'
import { localDate } from './dates'
import type { WordStates } from './wordStates'

/** Turns text into a number that is always the same for the same text */
function hash(text: string) {
  let h = 0
  for (const char of text) h = (Math.imul(h, 31) + char.charCodeAt(0)) | 0
  return Math.abs(h)
}

/**
 * The word of the day: the same all day, a different one tomorrow, and different for each profile.
 * It prefers words the learner had not saved before today. A word saved today stays a candidate,
 * so saving the word of the day doesn't swap it for another one.
 */
export function wordOfTheDay(pool: Word[], states: WordStates, today: string, profileId: string): Word | null {
  if (pool.length === 0) return null
  const newToday = (w: Word) => {
    const state = states[w.id]
    return !state || localDate(new Date(state.changedAt)) === today
  }
  const candidates = pool.filter(newToday)
  const list = candidates.length > 0 ? candidates : pool
  return list[hash(`${profileId}:${today}`) % list.length]
}
