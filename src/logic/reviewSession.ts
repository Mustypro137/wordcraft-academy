import type { Collection, Word } from '../types'
import type { WordStates } from './wordStates'

// Which words a review session asks, in which order, and with which kind of exercise.

export const SESSION_SIZE = 10
/** Known words are only spot checks, so at most this many come up in one session */
export const MAX_KNOWN_CHECKS = 2

/**
 * The exercise gets harder as the word moves up the boxes: recognize first, then use.
 * - choice: pick the word for a meaning from four
 * - fill: type the missing word in a sentence (a hint is allowed)
 * - recall: type the word for a meaning, with no hint
 */
export type ExerciseKind = 'choice' | 'fill' | 'recall'

export function exerciseFor(box: number): ExerciseKind {
  return box <= 1 ? 'choice' : box <= 3 ? 'fill' : 'recall'
}

export interface ReviewItem {
  wordId: string
  kind: ExerciseKind
  /** The collection before the session, to show what changed at the end */
  before: Collection
}

const order: Record<Collection, number> = { unfamiliar: 0, learning: 1, mastered: 2, known: 3 }

/**
 * The words to review today: those whose review date has arrived, Unfamiliar first,
 * then the most overdue. `wordIds` lists the words that exist (and suit this profile).
 */
export function pickReviewItems(states: WordStates, today: string, wordIds: Set<string>): ReviewItem[] {
  const due = Object.entries(states)
    .filter(([id, state]) => wordIds.has(id) && state.due <= today)
    .sort(
      ([idA, a], [idB, b]) =>
        order[a.collection] - order[b.collection] || a.due.localeCompare(b.due) || idA.localeCompare(idB),
    )
  const knownChecks = new Set(
    due
      .filter(([, state]) => state.collection === 'known')
      .slice(0, MAX_KNOWN_CHECKS)
      .map(([id]) => id),
  )
  return due
    .filter(([id, state]) => state.collection !== 'known' || knownChecks.has(id))
    .slice(0, SESSION_SIZE)
    .map(([wordId, state]) => ({ wordId, kind: exerciseFor(state.box), before: state.collection }))
}

/** The next day with words to review after today, or null if nothing is saved */
export function nextReviewDay(states: WordStates, today: string) {
  const later = Object.values(states)
    .map((s) => s.due)
    .filter((due) => due > today)
    .sort()
  return later[0] ?? null
}

/** Mixes a list. `random` is Math.random in the app, and a fixed one in tests. */
export function shuffle<T>(items: T[], random: () => number): T[] {
  const mixed = [...items]
  for (let i = mixed.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[mixed[i], mixed[j]] = [mixed[j], mixed[i]]
  }
  return mixed
}

/**
 * Four options for a "choice" exercise: the word and three others,
 * the same part of speech when possible so the answer isn't obvious.
 */
export function choicesFor(word: Word, pool: Word[], random: () => number): Word[] {
  const others = shuffle(
    pool.filter((w) => w.id !== word.id),
    random,
  )
  // A stable sort keeps the shuffled order inside each group
  others.sort((a, b) => Number(b.partOfSpeech === word.partOfSpeech) - Number(a.partOfSpeech === word.partOfSpeech))
  return shuffle([word, ...others.slice(0, 3)], random)
}
