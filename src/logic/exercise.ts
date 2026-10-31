import type { Word } from '../types'
import { escapeRegExp, normalize } from './text'

/** True if the learner's answer matches, ignoring capitals, extra spaces and end punctuation */
export function checkAnswer(input: string, answer: string) {
  const given = normalize(input)
  return given !== '' && given === normalize(answer)
}

/** Splits "I want to ___ it." into ["I want to ", " it."] */
export function splitBlank(sentence: string): [string, string] {
  const [before, after = ''] = sentence.split('___')
  return [before, after]
}

/**
 * The parts of a fill-in-the-blank sentence, and the answer as it looks inside it.
 * At the start of a sentence the answer needs a capital: "Thanks! By the way, …"
 */
export function fillBlank(sentence: string, answer: string) {
  const [before, after] = splitBlank(sentence)
  const startsSentence = /(^|[.!?])\s*$/.test(before)
  const filled = startsSentence ? answer.charAt(0).toUpperCase() + answer.slice(1) : answer
  return { before, after, filled }
}

export interface TextPart {
  text: string
  isWord: boolean
}

/**
 * Splits a sentence into parts, marking where the word (or one of its forms)
 * appears, so the page can show it in bold.
 * "I improved it." with improve gives: "I " · "improved" (word) · " it."
 */
export function markWord(sentence: string, word: Word): TextPart[] {
  // Longest forms first, so "makes sense" wins over "make sense"
  const forms = [word.word, ...word.forms].sort((a, b) => b.length - a.length).map(escapeRegExp)
  const pattern = new RegExp(`(?<![\\p{L}])(${forms.join('|')})(?![\\p{L}])`, 'giu')
  const parts: TextPart[] = []
  let last = 0
  for (const match of sentence.matchAll(pattern)) {
    if (match.index > last) parts.push({ text: sentence.slice(last, match.index), isWord: false })
    parts.push({ text: match[0], isWord: true })
    last = match.index + match[0].length
  }
  if (last < sentence.length) parts.push({ text: sentence.slice(last), isWord: false })
  return parts
}
