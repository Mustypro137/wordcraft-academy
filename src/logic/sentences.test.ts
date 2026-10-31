import { describe, expect, it } from 'vitest'
import { sentencePatterns } from '../data/sentences'
import { words } from '../data/words'
import type { AgeGroup } from '../types'
import {
  checkOwnSentence,
  correctStart,
  exercisesFor,
  hint,
  isCorrect,
  LESSON_EXERCISES,
  mixTiles,
  toTiles,
  wordsInSentence,
} from './sentences'

const byId = (id: string) => sentencePatterns.find((p) => p.id === id)!

/** A repeatable "random", so tests give the same result every time */
function fixedRandom() {
  let n = 0
  return () => (n++ * 0.37) % 1
}

describe('sentence content', () => {
  const ages: AgeGroup[] = ['kids', 'teens', 'adults']

  it('has unique pattern ids', () => {
    const ids = sentencePatterns.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  for (const pattern of sentencePatterns) {
    describe(pattern.id, () => {
      it('gives every age group a full lesson', () => {
        for (const age of ages) expect(exercisesFor(pattern, age)).toHaveLength(LESSON_EXERCISES)
      })

      it('has answers and examples that pass its own "Write your own" check', () => {
        for (const e of pattern.exercises) expect(checkOwnSentence(e.sentence, pattern), e.sentence).toEqual([])
        for (const ex of pattern.examples) expect(checkOwnSentence(ex, pattern), ex).toEqual([])
      })

      it('has answers with no double spaces and no blank', () => {
        for (const e of pattern.exercises) expect(e.sentence).toMatch(/^\S+( \S+)+$/)
      })
    })
  }
})

describe('tiles', () => {
  const answer = toTiles('I think the game is fun.')

  it('makes one tile per word, keeping punctuation', () => {
    expect(answer.map((t) => t.text)).toEqual(['I', 'think', 'the', 'game', 'is', 'fun.'])
    expect(answer.map((t) => t.id)).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('mixes them, never in the right order, keeping every tile', () => {
    for (let i = 0; i < 20; i++) {
      const mixed = mixTiles(answer, fixedRandom())
      expect(mixed.map((t) => t.id)).not.toEqual([0, 1, 2, 3, 4, 5])
      expect([...mixed].sort((a, b) => a.id - b.id)).toEqual(answer)
    }
    const two = toTiles('Hello there.')
    expect(mixTiles(two, () => 0.99).map((t) => t.text)).toEqual(['there.', 'Hello'])
  })

  it('counts the right tiles at the start, and accepts either of two same words', () => {
    const the = toTiles('the cat and the dog.')
    // The two "the" tiles swapped: still right
    expect(isCorrect([the[3], the[1], the[2], the[0], the[4]], the)).toBe(true)
    expect(correctStart([answer[0], answer[1], answer[4]], answer)).toBe(2)
    expect(isCorrect(answer.slice(0, 5), answer)).toBe(false)
  })
})

describe('hint', () => {
  const answer = toTiles('I think it is fun.')
  const [I, think, it_, is, fun] = answer

  it('keeps the right start, sends wrong tiles back, and points to the next tile', () => {
    const { keep, nextId } = hint([I, is], [think, it_, fun], answer)
    expect(keep).toEqual([I])
    expect(nextId).toBe(think.id)
  })

  it('finds the next tile among the ones sent back', () => {
    const { keep, nextId } = hint([I, think, is, it_], [fun], answer)
    expect(keep).toEqual([I, think])
    expect(nextId).toBe(it_.id)
  })

  it('gives null when the sentence is complete', () => {
    expect(hint(answer, [], answer).nextId).toBeNull()
  })
})

describe('wordsInSentence', () => {
  it('finds dictionary words in any form, in sentence order', () => {
    const found = wordsInSentence('Could you clarify how I improved it?', words).map((w) => w.id)
    expect(found).toEqual(['clarify', 'improve'])
    expect(wordsInSentence('Nothing here.', [])).toEqual([])
  })
})

describe('checkOwnSentence', () => {
  const think = byId('i-think')

  it('accepts a good sentence', () => {
    expect(checkOwnSentence('I think pizza is the best food.', think)).toEqual([])
  })

  it('asks for the pattern, a capital, enough words and end punctuation', () => {
    expect(checkOwnSentence('pizza good', think)).toEqual([
      'Start with “I think”.',
      'Write a little more: at least 4 words.',
      'End with a full stop (.), a question mark (?) or an exclamation mark (!).',
    ])
    expect(checkOwnSentence('i think pizza is great.', think)).toEqual(['Start with a capital letter.'])
    // Patterns without a fixed start still need the capital
    expect(checkOwnSentence('it was late, so I left.', byId('because-but-so'))).toEqual(['Start with a capital letter.'])
  })

  it('accepts curly apostrophes and other allowed starts', () => {
    expect(checkOwnSentence('I’m trying to learn the guitar.', byId('i-am-trying-to'))).toEqual([])
    expect(checkOwnSentence("I'd like to visit London.", byId('i-would-like-to'))).toEqual([])
  })

  it('needs a question mark for questions', () => {
    expect(checkOwnSentence('Could you help me with this.', byId('could-you-help-me'))).toEqual([
      'End your question with a question mark (?).',
    ])
  })

  it('finds joining words as whole words only', () => {
    const join = byId('because-but-so')
    expect(checkOwnSentence('I also like the new colours.', join)).toHaveLength(1)
    expect(checkOwnSentence('It was late, so I went home.', join)).toEqual([])
  })

  it('needs a negative word for negatives', () => {
    const neg = byId('negatives')
    expect(checkOwnSentence('I like this song a lot.', neg)).toHaveLength(1)
    expect(checkOwnSentence('I can’t find my keys.', neg)).toEqual([])
  })
})
