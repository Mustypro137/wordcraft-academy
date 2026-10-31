import type { Word, WritingRule } from '../types'
import { escapeRegExp } from './text'
import { rankWords } from './wordSearch'

/** A search score from 30 means a strong match (see wordSearch.ts) */
const STRONG_MATCH = 30

// The Writing Studio checker. It finds things to improve in the learner's text, but never changes it:
// the page shows each issue with a hint first, and the learner decides whether to use the fix.
// It is rule-based, so it only finds stuck words, known mistakes and simple basics.

export type IssueKind = 'stuck' | 'mistake' | 'capital' | 'spaces' | 'punctuation' | 'long'

export interface Issue {
  /** Stays the same while the learner edits other parts of the text, so the page can remember what was revealed */
  key: string
  kind: IssueKind
  /** Where the issue is: text.slice(start, end) */
  start: number
  end: number
  found: string
  /** What replaces text.slice(start, end). null = advice only, nothing to replace. */
  fix: string | null
  /** A small hint, shown first */
  hint: string
  /** Why the fix is better, shown with it */
  why: string
  /** A few words before and after, so the learner can see where it is: "…and " [i] " need to…" */
  before: string
  after: string
  /** Stuck words: the best dictionary match, and a couple of others */
  word?: Word
  alternatives?: Word[]
}

/** Up to 3 words next to a position, on the same line */
function nearby(text: string, start: number, end: number) {
  const line = (s: string) => s.split('\n')
  const beforeWords = line(text.slice(0, start)).at(-1)!.split(' ')
  const afterWords = line(text.slice(end))[0].split(' ')
  const before = beforeWords.slice(-4).join(' ')
  const after = afterWords.slice(0, 4).join(' ')
  return {
    before: (beforeWords.length > 4 ? '…' : '') + before,
    after: after + (afterWords.length > 4 ? '…' : ''),
  }
}

/** Stuck words in ??double question marks??, like "I want to ??make better?? my site." */
export function findStuck(text: string) {
  return [...text.matchAll(/\?\?([^?\n]+?)\?\?/g)].map((m) => ({
    start: m.index,
    end: m.index + m[0].length,
    guess: m[1].trim(),
  }))
}

const LONG_SENTENCE_WORDS = 35

/** A sentence that starts like this is a question */
const QUESTION_START = /^(could|can|would|will|do|does|did|is|are|was|were|have|has|should|what|when|where|why|how|who|which)\b/i

/** Small-letter days and months. "may" and "march" are left out: they are also everyday words. */
const DAYS_AND_MONTHS =
  /(?<![\p{L}])(monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|april|june|july|august|september|october|november|december)(?![\p{L}])/gu

function stuckHint(word: Word) {
  const kind = word.partOfSpeech
  const article = /^[aeiou]/.test(kind) ? 'an' : 'a'
  const parts = word.word.split(/\s+/)
  const size = parts.length > 1 ? `${parts.length} words` : `${word.word.length} letters`
  return `There is ${article} ${kind} for this. It starts with “${word.word.charAt(0)}” and has ${size}.`
}

/** "More good" at the start of a sentence becomes "Better", not "better" */
function matchCase(found: string, fix: string) {
  return /^\p{Lu}/u.test(found) ? fix.charAt(0).toUpperCase() + fix.slice(1) : fix
}

/** A rule phrase as a pattern: whole words, any spaces between them, either kind of apostrophe */
function phrasePattern(phrase: string) {
  const body = phrase
    .split(/\s+/)
    .map((part) => escapeRegExp(part).replace(/'/g, "['’]"))
    .join('\\s+')
  return new RegExp(`(?<![\\p{L}'’])${body}(?![\\p{L}'’])`, 'giu')
}

// Built once: one pattern per phrase, longest phrases first so "the most best" wins over "most best"
let compiled: { pattern: RegExp; rule: WritingRule }[] | null = null
let compiledFrom: WritingRule[] | null = null
function compile(rules: WritingRule[]) {
  if (compiledFrom !== rules) {
    compiled = rules
      .flatMap((rule) => rule.find.map((phrase) => ({ phrase, rule })))
      .sort((a, b) => b.phrase.length - a.phrase.length)
      .map(({ phrase, rule }) => ({ pattern: phrasePattern(phrase), rule }))
    compiledFrom = rules
  }
  return compiled!
}

type Draft = Omit<Issue, 'key' | 'before' | 'after'>

/** Everything to improve in a text, in the order it appears */
export function checkWriting(text: string, rules: WritingRule[], pool: Word[]): Issue[] {
  const drafts: Draft[] = []
  const taken: [number, number][] = []
  const free = (start: number, end: number) => taken.every(([s, e]) => end <= s || start >= e)
  const add = (issue: Draft) => {
    if (!free(issue.start, issue.end)) return
    drafts.push(issue)
    taken.push([issue.start, issue.end])
  }

  // 1. Stuck words first: nothing else is checked inside ??…??
  const stuck = findStuck(text)
  // The basic checks read a copy where every ??…?? is hidden behind x's (same length, so positions match).
  // Otherwise the "?" at the end of "??make better??" would look like the end of a sentence.
  let masked = text
  for (const { start, end } of stuck) masked = masked.slice(0, start) + 'x'.repeat(end - start) + masked.slice(end)

  for (const { start, end, guess } of stuck) {
    if (!guess) continue
    const [best, ...others] = rankWords(pool, guess)
    const word = best?.word
    // Other ideas only when they are strong matches of the same kind (verb for verb):
    // weak or different ones would confuse more than help
    const alternatives = others
      .filter((r) => r.score >= STRONG_MATCH && r.word.partOfSpeech === best.word.partOfSpeech)
      .slice(0, 2)
      .map((r) => r.word)
    add(
      word
        ? { kind: 'stuck', start, end, found: text.slice(start, end), fix: word.word, hint: stuckHint(word), why: word.definition, word, alternatives }
        : {
            kind: 'stuck',
            start,
            end,
            found: text.slice(start, end),
            fix: null,
            hint: `No word in the dictionary matches “${guess}” yet.`,
            why: 'Try describing it with other simple words, or keep your guess for now. Writing your idea is what matters.',
          },
    )
  }

  // 2. Known mistakes
  for (const { pattern, rule } of compile(rules)) {
    for (const m of text.matchAll(pattern)) {
      add({ kind: 'mistake', start: m.index, end: m.index + m[0].length, found: m[0], fix: matchCase(m[0], rule.use), hint: rule.hint, why: rule.why })
    }
  }

  // 3. Basics: "i" on its own, a small letter at the start of a sentence, extra spaces
  for (const m of masked.matchAll(/(?<![\p{L}'’])i(?![\p{L}])/gu)) {
    add({ kind: 'capital', start: m.index, end: m.index + 1, found: 'i', fix: 'I', hint: '“I” is written in a special way.', why: 'The word “I” is always a capital letter, even in the middle of a sentence.' })
  }
  // A sentence starts at the beginning of the text or a line, or after . ! ?
  for (const m of masked.matchAll(/(?:^|[.!?]\s+)(\p{Ll})/gmu)) {
    const at = m.index + m[0].length - 1
    add({ kind: 'capital', start: at, end: at + 1, found: m[1], fix: m[1].toUpperCase(), hint: 'A new sentence starts here.', why: 'Start every sentence with a capital letter.' })
  }
  for (const m of masked.matchAll(DAYS_AND_MONTHS)) {
    add({ kind: 'capital', start: m.index, end: m.index + m[0].length, found: m[0], fix: m[0].charAt(0).toUpperCase() + m[0].slice(1), hint: 'Days and months are names.', why: 'Days of the week and months start with a capital letter: Friday, June.' })
  }
  for (const m of masked.matchAll(/ {2,}/g)) {
    add({ kind: 'spaces', start: m.index, end: m.index + m[0].length, found: m[0], fix: ' ', hint: 'There is an extra space here.', why: 'Use one space between words.' })
  }

  // 4. Punctuation at the very end
  const trimmedEnd = masked.trimEnd().length
  const wordCount = masked.trim().split(/\s+/).filter(Boolean).length
  if (wordCount >= 3 && !/[.!?…)"'”’]$/.test(masked.slice(0, trimmedEnd))) {
    const lastSentence = masked.slice(0, trimmedEnd).split(/[.!?]\s+|\n/).at(-1)!.trim()
    add(
      QUESTION_START.test(lastSentence)
        ? { kind: 'punctuation', start: trimmedEnd, end: trimmedEnd, found: '', fix: '?', hint: 'Your text ends with a question.', why: 'A question ends with a question mark (?).' }
        : { kind: 'punctuation', start: trimmedEnd, end: trimmedEnd, found: '', fix: '.', hint: 'Your text ends without punctuation.', why: 'Finish with a full stop (.), a question mark (?) or an exclamation mark (!).' },
    )
  }

  // 5. Very long sentences (advice only)
  for (const m of masked.matchAll(/[^.!?\n]+[.!?]*/g)) {
    const count = m[0].trim().split(/\s+/).filter(Boolean).length
    if (count > LONG_SENTENCE_WORDS) {
      drafts.push({
        kind: 'long',
        start: m.index,
        end: m.index + m[0].length,
        found: text.slice(m.index, m.index + m[0].length).trim().split(/\s+/).slice(0, 4).join(' ') + '…',
        fix: null,
        hint: `This sentence has ${count} words.`,
        why: 'Long sentences are hard to read. Try splitting it into two: finish one idea with a full stop, then start the next.',
      })
    }
  }

  // Keys: kind + text + how many times the same issue came before, so they survive edits elsewhere
  const seen = new Map<string, number>()
  return drafts
    .sort((a, b) => a.start - b.start || a.end - b.end)
    .map((issue) => {
      const base = `${issue.kind}:${issue.found.toLowerCase()}`
      const n = seen.get(base) ?? 0
      seen.set(base, n + 1)
      return { ...issue, ...nearby(text, issue.start, issue.end), key: `${base}:${n}` }
    })
}

/** The text with one fix used */
export function applyFix(text: string, issue: Issue, fix = issue.fix) {
  if (fix === null) return text
  return text.slice(0, issue.start) + fix + text.slice(issue.end)
}

/** The text with every fix used: the "natural version". Works from the end so positions stay right. */
export function applyAll(text: string, issues: Issue[]) {
  return [...issues].sort((a, b) => b.start - a.start).reduce((result, issue) => applyFix(result, issue), text)
}

/** "On Saturday I…" → "On Saturday I ", the part of a starter to put in the text */
export function starterText(starter: string) {
  return starter.split('…')[0].trimEnd() + ' '
}
