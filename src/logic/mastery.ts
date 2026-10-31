import { daysBetween } from './dates'

// When a word becomes Mastered (docs/PLAN.md, "Learning rules"):
// typed correctly without hints on 3 different days, the first and last at least 7 days apart.
// Remembering a word over a week shows it is really learned, not just remembered for a day.

export const MASTERY_DAYS = 3
export const MASTERY_SPAN_DAYS = 7

/** Adds today to the days of correct answers. The same day counts once. */
export function addCorrectDay(days: string[], today: string) {
  return days.includes(today) ? days : [...days, today].sort()
}

export function hasMastered(days: string[]) {
  return days.length >= MASTERY_DAYS && daysBetween(days[0], days[days.length - 1]) >= MASTERY_SPAN_DAYS
}
