import type { AgeGroup, SentencePattern, Word } from '../types'
import { markWord } from './exercise'
import { shuffle } from './reviewSession'

// The rules for the Sentence Builder: word tiles, hints, and checking a sentence you write yourself.

/** How many tile exercises a lesson has: the first half "Build it" (with help), the rest "Finish it" */
export const LESSON_EXERCISES = 4

/**
 * Lesson stages, saved for each pattern as the highest one completed.
 * 0 = not started · 1 = Build it done · 2 = Finish it done · 3 = Write your own done (the pattern is done)
 */
export const STAGES = 3

export const STAGE_NAMES = ['Build it', 'Finish it', 'Write your own']

/** The exercises one age group sees, in lesson order */
export function exercisesFor(pattern: SentencePattern, age: AgeGroup) {
  return pattern.exercises.filter((e) => e.ages.includes(age)).slice(0, LESSON_EXERCISES)
}

export interface Tile {
  /** Position in the answer. Two tiles can have the same text ("the" twice), never the same id. */
  id: number
  text: string
}

/** "I think it is fun." → tiles "I" · "think" · "it" · "is" · "fun." */
export function toTiles(sentence: string): Tile[] {
  return sentence
    .split(/\s+/)
    .filter(Boolean)
    .map((text, id) => ({ id, text }))
}

/** Mixes the tiles, never leaving them in the right order (that would be no exercise) */
export function mixTiles(tiles: Tile[], random: () => number): Tile[] {
  if (tiles.length < 2) return tiles
  let mixed = shuffle(tiles, random)
  for (let tries = 0; tries < 10 && mixed.every((t, i) => t.id === i); tries++) mixed = shuffle(tiles, random)
  // Still in order after 10 tries (it can happen with 2 tiles): swap the first two
  if (mixed.every((t, i) => t.id === i)) mixed = [mixed[1], mixed[0], ...mixed.slice(2)]
  return mixed
}

/** How many tiles at the start are right. Texts are compared, so either "the" fits. */
export function correctStart(placed: Tile[], answer: Tile[]) {
  let n = 0
  while (n < placed.length && n < answer.length && placed[n].text === answer[n].text) n++
  return n
}

export function isCorrect(placed: Tile[], answer: Tile[]) {
  return placed.length === answer.length && correctStart(placed, answer) === answer.length
}

/**
 * A hint: keeps the tiles that are right, sends the others back, and says which tile comes next.
 * Returns the tiles to keep and the id of a free tile that fits next (or null when the sentence is complete).
 */
export function hint(placed: Tile[], free: Tile[], answer: Tile[]) {
  const keep = placed.slice(0, correctStart(placed, answer))
  const next = answer[keep.length]
  if (!next) return { keep, nextId: null }
  const back = [...free, ...placed.slice(keep.length)]
  return { keep, nextId: back.find((t) => t.text === next.text)?.id ?? null }
}

/** Dictionary words that appear in a sentence, in any form ("improved" finds improve), in sentence order */
export function wordsInSentence(sentence: string, pool: Word[]): Word[] {
  return pool
    .map((word) => {
      const parts = markWord(sentence, word)
      const index = parts.findIndex((part) => part.isWord)
      // The character position where the word starts, so words can be sorted by where they appear
      const at = index < 0 ? -1 : parts.slice(0, index).reduce((sum, part) => sum + part.text.length, 0)
      return { word, at }
    })
    .filter((found) => found.at >= 0)
    .sort((a, b) => a.at - b.at)
    .map((found) => found.word)
}

// Checking "Write your own"

/** Curly apostrophes become straight ones, so "I’m" and "I'm" match */
function plain(text: string) {
  return text.trim().replace(/[‘’]/g, "'")
}

function words(text: string) {
  return plain(text)
    .toLowerCase()
    .split(/[^a-z']+/)
    .filter(Boolean)
}

const NEGATIVE = /n't\b|\b(not|never|no|nothing|nobody)\b/

/**
 * What to fix in a sentence the learner wrote. An empty list means it is ready.
 * It checks the pattern and the basics only: rule-based checks can't judge meaning or every grammar point.
 */
export function checkOwnSentence(text: string, pattern: SentencePattern): string[] {
  const sentence = plain(text)
  const lower = sentence.toLowerCase()
  const { starts, contains, negative, question } = pattern.check
  const tips: string[] = []

  const missingStart = starts !== undefined && !starts.some((s) => lower.startsWith(s.toLowerCase()))
  if (missingStart) tips.push(`Start with “${starts[0]}”.`)
  if (contains && !contains.some((w) => words(sentence).includes(w))) {
    tips.push(`Join two ideas with ${contains.map((w) => `“${w}”`).join(', ')}.`)
  }
  if (negative && !NEGATIVE.test(lower)) {
    tips.push('Use a short negative like don’t, can’t, isn’t or didn’t.')
  }
  if (words(sentence).length < 4) {
    tips.push('Write a little more: at least 4 words.')
  }
  // "Start with “I think”" already covers the first word
  if (!missingStart && /^[a-z]/.test(sentence)) {
    tips.push('Start with a capital letter.')
  }
  if (question && !sentence.endsWith('?')) {
    tips.push('End your question with a question mark (?).')
  } else if (!/[.!?]$/.test(sentence)) {
    tips.push('End with a full stop (.), a question mark (?) or an exclamation mark (!).')
  }
  return tips
}
