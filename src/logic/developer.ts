import type { Word } from '../types'
import { escapeRegExp } from './text'

// Developer English: finding the technical words in a sentence, so the page can explain each one.

export interface SentencePart {
  text: string
  /** Set when this part is one of the explained words */
  wordId?: string
}

/**
 * Splits a sentence into plain parts and explained words, in any of their forms.
 * "Implement a responsive navigation component." → "Implement" (implement) · " a " · "responsive" (responsive) · …
 */
export function splitTerms(sentence: string, terms: Word[]): SentencePart[] {
  // Every form of every word, longest first, so "pull requests" wins over "pull request"
  const forms = terms
    .flatMap((word) => [word.word, ...word.forms].map((form) => ({ form, id: word.id })))
    .sort((a, b) => b.form.length - a.form.length)
  if (forms.length === 0) return [{ text: sentence }]

  const idFor = new Map(forms.map(({ form, id }) => [form.toLowerCase(), id]))
  const pattern = new RegExp(`(?<![\\p{L}])(${forms.map(({ form }) => escapeRegExp(form)).join('|')})(?![\\p{L}])`, 'giu')

  const parts: SentencePart[] = []
  let last = 0
  for (const m of sentence.matchAll(pattern)) {
    if (m.index > last) parts.push({ text: sentence.slice(last, m.index) })
    parts.push({ text: m[0], wordId: idFor.get(m[0].toLowerCase()) })
    last = m.index + m[0].length
  }
  if (last < sentence.length) parts.push({ text: sentence.slice(last) })
  return parts
}

/** How many topic words "Your turn" asks for */
export const TASK_MIN_WORDS = 2
