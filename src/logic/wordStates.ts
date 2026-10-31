import type { Collection, WordState } from '../types'
import { localDate } from './dates'
import { addCorrectDay, hasMastered } from './mastery'
import { nextSchedule, type AnswerResult } from './spacedRepetition'

// The rules for the knowledge buttons, as plain functions (like store/profiles.ts).
// Each one takes the current word states and returns new ones; it never changes the old ones.

/** Word id → what the learner remembers about it. One of these per profile. */
export type WordStates = Record<string, WordState>

/** The four knowledge buttons on a word page */
export type KnowledgeAction = 'know' | 'seen' | 'dontKnow' | 'practise'

const collectionFor: Record<KnowledgeAction, Collection> = {
  know: 'known',
  seen: 'learning',
  dontKnow: 'unfamiliar',
  practise: 'learning',
}

/** The action that moves a word into a collection (used by "Move to" on My Words) */
export const actionFor: Record<Exclude<Collection, 'mastered'>, KnowledgeAction> = {
  unfamiliar: 'dontKnow',
  learning: 'seen',
  known: 'know',
}

/**
 * Applies a knowledge button to one word.
 * - A new word starts in box 0, ready for review today.
 * - "I want to practise" always puts the word in today's review.
 * - No button gives Mastered: only Review can. "I know" keeps a mastered word mastered;
 *   any other button moves it out, and mastery has to be earned again.
 */
export function applyKnowledge(states: WordStates, wordId: string, action: KnowledgeAction, now: Date): WordStates {
  const old = states[wordId]
  if (old?.collection === 'mastered' && action === 'know') return states

  const today = localDate(now)
  const leavesMastered = old?.collection === 'mastered'
  const state: WordState = {
    collection: collectionFor[action],
    box: old?.box ?? 0,
    due: action === 'practise' || !old ? today : old.due,
    correctDays: old && !leavesMastered ? old.correctDays : [],
    changedAt: now.toISOString(),
  }
  return { ...states, [wordId]: state }
}

/**
 * Applies one Review answer to a saved word.
 * - The box and review date follow spacedRepetition.ts.
 * - Correct: an Unfamiliar word moves to Learning. A typed answer counts towards Mastered.
 * - Wrong: the word goes to Learning (even from Known or Mastered) and mastery starts again.
 * - Guessed: only the review date changes.
 * `typed` is true for answers typed without help; picking from a list never counts towards Mastered.
 */
export function applyAnswer(
  states: WordStates,
  wordId: string,
  result: AnswerResult,
  typed: boolean,
  now: Date,
): WordStates {
  const old = states[wordId]
  if (!old) return states

  const today = localDate(now)
  let { collection, correctDays } = old
  if (result === 'correct') {
    if (typed) correctDays = addCorrectDay(correctDays, today)
    if (hasMastered(correctDays)) collection = 'mastered'
    else if (collection === 'unfamiliar') collection = 'learning'
  } else if (result === 'wrong') {
    collection = 'learning'
    correctDays = []
  }

  const state: WordState = {
    ...nextSchedule(old.box, result, today),
    collection,
    correctDays,
    // My Words lists recent moves first, so only a move counts as a change
    changedAt: collection === old.collection ? old.changedAt : now.toISOString(),
  }
  return { ...states, [wordId]: state }
}

/** Puts one word back the way it was, for Undo. `undefined` takes it out of My Words. */
export function restoreWord(states: WordStates, wordId: string, previous: WordState | undefined): WordStates {
  const next = { ...states }
  if (previous) next[wordId] = previous
  else delete next[wordId]
  return next
}

/** The word ids in one collection, most recently changed first */
export function wordsIn(states: WordStates, collection: Collection) {
  return Object.entries(states)
    .filter(([, state]) => state.collection === collection)
    .sort(([, a], [, b]) => b.changedAt.localeCompare(a.changedAt))
    .map(([id]) => id)
}

/** How many words are in each collection */
export function countByCollection(states: WordStates): Record<Collection, number> {
  const counts = { unfamiliar: 0, learning: 0, known: 0, mastered: 0 }
  for (const state of Object.values(states)) counts[state.collection]++
  return counts
}
