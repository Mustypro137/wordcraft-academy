import { describe, expect, it } from 'vitest'
import type { Word } from '../types'
import { words } from './words'

// These tests check the vocabulary data, so mistakes are caught before
// a learner ever sees them. Run them with: npm test

/** True if the text contains the word, or one of its forms, as whole words */
function containsWord(text: string, word: Word) {
  return [word.word, ...word.forms].some((form) => {
    const escaped = form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`\\b${escaped}\\b`, 'i').test(text)
  })
}

describe('vocabulary list', () => {
  it('has no duplicate ids', () => {
    const ids = words.map((w) => w.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe.each(words)('$id', (word) => {
  it('has an id made from the word', () => {
    expect(word.id).toBe(word.word.toLowerCase().replaceAll(' ', '-'))
  })

  it('has no empty text', () => {
    const texts = [
      word.definition,
      word.pronunciation.respelling,
      word.pronunciation.ipa,
      word.situation,
      word.mistake.wrong,
      word.mistake.right,
      word.mistake.why,
      word.exercise.hint,
      ...word.examples,
      ...word.collocations,
    ]
    for (const text of texts) expect(text.trim()).not.toBe('')
    expect(word.categories.length).toBeGreaterThan(0)
  })

  it('has 2 or 3 examples, and each one uses the word', () => {
    expect(word.examples.length).toBeGreaterThanOrEqual(2)
    expect(word.examples.length).toBeLessThanOrEqual(3)
    for (const example of word.examples) expect(containsWord(example, word), example).toBe(true)
  })

  it('has at least 2 collocations', () => {
    expect(word.collocations.length).toBeGreaterThanOrEqual(2)
  })

  it('does not use the word in its own definition', () => {
    expect(containsWord(word.definition, word)).toBe(false)
  })

  it('has an IPA guide between slashes', () => {
    expect(word.pronunciation.ipa).toMatch(/^\/.+\/$/)
  })

  it('has an exercise with one blank, answered by the word', () => {
    const { sentence, answer, hint } = word.exercise
    expect(sentence.split('___').length - 1).toBe(1)
    const allowed = [word.word, ...word.forms].map((f) => f.toLowerCase())
    expect(allowed).toContain(answer.toLowerCase())
    expect(containsWord(hint, word), 'the hint gives away the answer').toBe(false)
  })
})
