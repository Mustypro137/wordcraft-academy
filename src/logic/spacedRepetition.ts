import { addDays } from './dates'

// Spaced repetition with Leitner boxes (docs/PLAN.md, "Learning rules").
// Every correct answer moves a word up a box; higher boxes wait longer.

/** How many days each box waits before the next review: box 0 waits 0 days, box 5 waits 30 */
export const WAIT_DAYS = [0, 1, 3, 7, 14, 30]

const TOP_BOX = WAIT_DAYS.length - 1

/**
 * How one review answer went.
 * - correct: right, with no help
 * - guessed: right, but with a hint, a second try, or the learner says they guessed
 * - wrong: wrong, or the learner gave up
 */
export type AnswerResult = 'correct' | 'guessed' | 'wrong'

/** The new box and review date after an answer. Wrong goes back to box 1, so the word returns tomorrow. */
export function nextSchedule(box: number, result: AnswerResult, today: string) {
  const nextBox = result === 'correct' ? Math.min(box + 1, TOP_BOX) : result === 'wrong' ? 1 : box
  return { box: nextBox, due: addDays(today, WAIT_DAYS[nextBox]) }
}
