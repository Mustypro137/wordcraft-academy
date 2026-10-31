import { describe, expect, it } from 'vitest'
import { words } from '../data/words'
import { checkAnswer, markWord, splitBlank } from './exercise'

const word = (id: string) => words.find((w) => w.id === id)!

describe('checkAnswer', () => {
  it('accepts the answer with different capitals, spaces or end punctuation', () => {
    expect(checkAnswer('improve', 'improve')).toBe(true)
    expect(checkAnswer('  Improve. ', 'improve')).toBe(true)
    expect(checkAnswer('by  the way', 'by the way')).toBe(true)
  })

  it('refuses a different word or an empty answer', () => {
    expect(checkAnswer('improved', 'improve')).toBe(false)
    expect(checkAnswer('make better', 'improve')).toBe(false)
    expect(checkAnswer('   ', 'improve')).toBe(false)
  })
})

describe('splitBlank', () => {
  it('splits the sentence around the blank', () => {
    expect(splitBlank('I want to ___ it.')).toEqual(['I want to ', ' it.'])
    expect(splitBlank('___, are you free?')).toEqual(['', ', are you free?'])
  })
})

describe('markWord', () => {
  it('marks the word and its forms, keeping the rest of the text', () => {
    expect(markWord('Her English improved a lot.', word('improve'))).toEqual([
      { text: 'Her English ', isWord: false },
      { text: 'improved', isWord: true },
      { text: ' a lot.', isWord: false },
    ])
  })

  it('keeps the original capital letter', () => {
    expect(markWord('Actually, I have an idea.', word('actually'))[0]).toEqual({ text: 'Actually', isWord: true })
  })

  it('does not mark the word inside a longer word', () => {
    const parts = markWord('I spent an hour debugging the form.', word('bug'))
    expect(parts.some((p) => p.isWord)).toBe(false)
  })

  it('marks multi-word phrases', () => {
    const parts = markWord('Your explanation makes sense now.', word('make-sense'))
    expect(parts.filter((p) => p.isWord).map((p) => p.text)).toEqual(['makes sense'])
  })

  it('marks the word in every example of every word', () => {
    for (const w of words) {
      for (const example of w.examples) {
        expect(markWord(example, w).some((p) => p.isWord), `${w.id}: ${example}`).toBe(true)
      }
    }
  })
})
