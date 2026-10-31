import type { Word } from '../types'
import { containsPhrase, escapeRegExp, normalize } from './text'

// "Find the word I mean": the learner can type the word itself, or
// describe it in simple words ("make better" finds "improve").
// Each word gets a score; higher scores come first.

/** Small words that don't help a search on their own */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'to', 'of', 'for', 'in', 'on', 'at', 'and', 'or', 'is', 'it', 'be',
  'my', 'your', 'you', 'i', 'me', 'something', 'someone', 'word', 'that', 'this', 'with',
])

function scoreWord(word: Word, query: string, tokens: string[]): number {
  const name = normalize(word.word)
  const forms = word.forms.map(normalize)
  const synonyms = [...(word.synonyms ?? [])].map(normalize)
  const definition = normalize(word.definition)
  const collocations = word.collocations.map(normalize)

  if (name === query) return 100
  if (forms.includes(query)) return 90
  if (name.startsWith(query) || forms.some((f) => f.startsWith(query))) return 80
  if (synonyms.includes(query)) return 70
  if (synonyms.some((s) => containsPhrase(s, query))) return 60
  if (containsPhrase(definition, query)) return 50
  if (collocations.some((c) => containsPhrase(c, query))) return 40
  // "I know 'lend', what's the other one?" finds "borrow"
  if ((word.opposites ?? []).some((o) => normalize(o) === query)) return 35

  // Describing words: how many of the learner's words appear in the meaning?
  if (tokens.length > 0) {
    const meaning = [definition, ...synonyms].join(' ')
    // "explain" also matches "explaining"; very short words must match exactly
    const found = tokens.filter((t) =>
      new RegExp(`(^|[^\\p{L}])${escapeRegExp(t)}${t.length >= 4 ? '' : '($|[^\\p{L}])'}`, 'u').test(meaning),
    )
    if (found.length * 2 >= tokens.length) return Math.round(30 * (found.length / tokens.length))
  }

  if (word.examples.some((e) => containsPhrase(normalize(e), query))) return 10
  return 0
}

/**
 * The matching words with their scores, best first. 30 or more is a strong match:
 * the word itself, a synonym, a phrase in its meaning, or every describing word found.
 */
export function rankWords(words: Word[], rawQuery: string): { word: Word; score: number }[] {
  const query = normalize(rawQuery)
  if (query === '') return words.map((word) => ({ word, score: 0 }))
  const tokens = query.split(' ').filter((t) => !STOP_WORDS.has(t))
  return words
    .map((word, index) => ({ word, index, score: scoreWord(word, query, tokens) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ word, score }) => ({ word, score }))
}

/** Returns the matching words, best match first. An empty query returns every word. */
export function searchWords(words: Word[], rawQuery: string): Word[] {
  return rankWords(words, rawQuery).map((r) => r.word)
}
