import { describe, expect, it } from 'vitest'
import { words } from '../data/words'
import type { Collection, WordState } from '../types'
import { choicesFor, exerciseFor, nextReviewDay, pickReviewItems, shuffle } from './reviewSession'
import type { WordStates } from './wordStates'

const TODAY = '2026-10-31'

function state(collection: Collection, due: string, box = 0): WordState {
  return { collection, box, due, correctDays: [], changedAt: '2026-10-30T12:00:00.000Z' }
}

/** A repeatable "random": always the same numbers, so tests give the same result every time */
function fixedRandom() {
  let n = 0
  return () => (n++ * 0.37) % 1
}

describe('exerciseFor', () => {
  it('recognize first, then fill in, then recall', () => {
    expect([0, 1, 2, 3, 4, 5].map(exerciseFor)).toEqual(['choice', 'choice', 'fill', 'fill', 'recall', 'recall'])
  })
})

describe('pickReviewItems', () => {
  const all = (states: WordStates) => new Set(Object.keys(states))

  it('takes only words that are due, Unfamiliar first, then the most overdue', () => {
    const states: WordStates = {
      a: state('learning', '2026-10-30'),
      b: state('unfamiliar', '2026-10-31'),
      c: state('learning', '2026-10-20', 4),
      d: state('learning', '2026-11-01'),
    }
    expect(pickReviewItems(states, TODAY, all(states))).toEqual([
      { wordId: 'b', kind: 'choice', before: 'unfamiliar' },
      { wordId: 'c', kind: 'recall', before: 'learning' },
      { wordId: 'a', kind: 'choice', before: 'learning' },
    ])
  })

  it('asks at most 2 Known words and 10 words in all', () => {
    const states: WordStates = {}
    for (let i = 0; i < 5; i++) states[`known${i}`] = state('known', TODAY)
    for (let i = 0; i < 12; i++) states[`learn${i}`] = state('learning', TODAY)
    const items = pickReviewItems(states, TODAY, all(states))
    expect(items).toHaveLength(10)
    expect(items.filter((i) => i.before === 'known')).toHaveLength(0)

    const fewer: WordStates = { ...states }
    for (let i = 3; i < 12; i++) delete fewer[`learn${i}`]
    const mixed = pickReviewItems(fewer, TODAY, all(fewer))
    expect(mixed.filter((i) => i.before === 'known')).toHaveLength(2)
    expect(mixed).toHaveLength(5)
  })

  it('skips words that no longer exist or do not suit the profile', () => {
    const states: WordStates = { a: state('learning', TODAY), gone: state('learning', TODAY) }
    expect(pickReviewItems(states, TODAY, new Set(['a'])).map((i) => i.wordId)).toEqual(['a'])
  })
})

describe('nextReviewDay', () => {
  it('finds the first day after today', () => {
    const states: WordStates = { a: state('learning', TODAY), b: state('known', '2026-11-07'), c: state('learning', '2026-11-02') }
    expect(nextReviewDay(states, TODAY)).toBe('2026-11-02')
    expect(nextReviewDay({}, TODAY)).toBeNull()
  })
})

describe('shuffle and choicesFor', () => {
  it('shuffle keeps every item and leaves the original list alone', () => {
    const list = [1, 2, 3, 4, 5]
    expect(shuffle(list, fixedRandom()).sort()).toEqual([1, 2, 3, 4, 5])
    expect(list).toEqual([1, 2, 3, 4, 5])
  })

  it('gives four different words, including the right one, of the same part of speech when possible', () => {
    const word = words.find((w) => w.id === 'improve')!
    const choices = choicesFor(word, words, fixedRandom())
    expect(choices).toHaveLength(4)
    expect(new Set(choices.map((w) => w.id)).size).toBe(4)
    expect(choices).toContain(word)
    expect(choices.every((w) => w.partOfSpeech === 'verb')).toBe(true)
  })
})
