import { describe, expect, it } from 'vitest'
import type { WordState } from '../types'
import { localDate } from './dates'
import { actionFor, applyKnowledge, countByCollection, restoreWord, wordsIn, type WordStates } from './wordStates'

// Local times (no "Z"), so the dates are the same in every time zone
const DAY_1 = new Date(2026, 9, 31, 9, 0)
const DAY_5 = new Date(2026, 10, 4, 9, 0)

function mastered(): WordStates {
  const state: WordState = {
    collection: 'mastered',
    box: 4,
    due: '2026-11-20',
    correctDays: ['2026-10-01', '2026-10-04', '2026-10-09'],
    changedAt: DAY_1.toISOString(),
  }
  return { improve: state }
}

describe('localDate', () => {
  it('uses the local calendar date with two-digit month and day', () => {
    expect(localDate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
  })
})

describe('applyKnowledge', () => {
  it('puts each button in the right collection', () => {
    expect(applyKnowledge({}, 'improve', 'know', DAY_1).improve.collection).toBe('known')
    expect(applyKnowledge({}, 'improve', 'seen', DAY_1).improve.collection).toBe('learning')
    expect(applyKnowledge({}, 'improve', 'dontKnow', DAY_1).improve.collection).toBe('unfamiliar')
    expect(applyKnowledge({}, 'improve', 'practise', DAY_1).improve.collection).toBe('learning')
  })

  it('starts a new word in box 0, ready for review today', () => {
    expect(applyKnowledge({}, 'improve', 'dontKnow', DAY_1).improve).toEqual({
      collection: 'unfamiliar',
      box: 0,
      due: '2026-10-31',
      correctDays: [],
      changedAt: DAY_1.toISOString(),
    })
  })

  it('keeps the review schedule when a saved word moves', () => {
    const saved = { improve: { ...applyKnowledge({}, 'improve', 'seen', DAY_1).improve, box: 2, due: '2026-11-03' } }
    const moved = applyKnowledge(saved, 'improve', 'know', DAY_5).improve
    expect(moved).toMatchObject({ collection: 'known', box: 2, due: '2026-11-03', changedAt: DAY_5.toISOString() })
  })

  it('"I want to practise" brings the review forward to today', () => {
    const saved = { improve: { ...applyKnowledge({}, 'improve', 'seen', DAY_1).improve, box: 3, due: '2026-11-20' } }
    expect(applyKnowledge(saved, 'improve', 'practise', DAY_5).improve).toMatchObject({ box: 3, due: '2026-11-04' })
  })

  it('never gives Mastered: "I know" leaves a mastered word as it is', () => {
    const states = mastered()
    expect(applyKnowledge(states, 'improve', 'know', DAY_5)).toBe(states)
  })

  it('moving a word out of Mastered means mastery must be earned again', () => {
    const moved = applyKnowledge(mastered(), 'improve', 'dontKnow', DAY_5).improve
    expect(moved).toMatchObject({ collection: 'unfamiliar', correctDays: [] })
  })

  it('does not change the old states or other words', () => {
    const states: WordStates = applyKnowledge({}, 'goal', 'know', DAY_1)
    const before = structuredClone(states)
    const next = applyKnowledge(states, 'improve', 'dontKnow', DAY_5)
    expect(states).toEqual(before)
    expect(next.goal).toBe(states.goal)
  })
})

describe('restoreWord (Undo)', () => {
  it('puts back the state the word had before', () => {
    const before = applyKnowledge({}, 'improve', 'seen', DAY_1)
    const after = applyKnowledge(before, 'improve', 'know', DAY_5)
    expect(restoreWord(after, 'improve', before.improve)).toEqual(before)
  })

  it('takes a word out of My Words if it was not saved before', () => {
    const after = applyKnowledge({ goal: mastered().improve }, 'improve', 'dontKnow', DAY_1)
    expect(restoreWord(after, 'improve', undefined)).toEqual({ goal: mastered().improve })
  })
})

describe('actionFor', () => {
  it('moves a word into the collection that was chosen', () => {
    for (const [collection, action] of Object.entries(actionFor)) {
      expect(applyKnowledge({}, 'improve', action, DAY_1).improve.collection).toBe(collection)
    }
  })
})

describe('wordsIn and countByCollection', () => {
  const states = applyKnowledge(
    applyKnowledge(applyKnowledge({}, 'goal', 'dontKnow', DAY_1), 'improve', 'dontKnow', DAY_5),
    'fix',
    'know',
    DAY_5,
  )

  it('lists one collection, most recently changed first', () => {
    expect(wordsIn(states, 'unfamiliar')).toEqual(['improve', 'goal'])
    expect(wordsIn(states, 'mastered')).toEqual([])
  })

  it('counts every collection, including empty ones', () => {
    expect(countByCollection(states)).toEqual({ unfamiliar: 2, learning: 0, known: 1, mastered: 0 })
  })
})
