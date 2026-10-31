import { describe, expect, it } from 'vitest'
import { developerTopics } from '../data/developerTopics'
import { words } from '../data/words'
import { splitTerms } from './developer'

const byId = new Map(words.map((w) => [w.id, w]))

describe('splitTerms', () => {
  const [implement, responsive, navigation, component] = ['implement', 'responsive', 'navigation', 'component'].map(
    (id) => byId.get(id)!,
  )

  it('splits the brief’s example into explained words and plain text', () => {
    expect(splitTerms('Implement a responsive navigation component.', [implement, responsive, navigation, component])).toEqual([
      { text: 'Implement', wordId: 'implement' },
      { text: ' a ' },
      { text: 'responsive', wordId: 'responsive' },
      { text: ' ' },
      { text: 'navigation', wordId: 'navigation' },
      { text: ' ' },
      { text: 'component', wordId: 'component' },
      { text: '.' },
    ])
  })

  it('finds other forms, and prefers the longest one', () => {
    const pr = byId.get('pull-request')!
    expect(splitTerms('Two pull requests are open.', [pr]).map((p) => p.wordId ?? p.text)).toEqual([
      'Two ',
      'pull-request',
      ' are open.',
    ])
  })

  it('matches whole words only', () => {
    expect(splitTerms('Debugging is fun.', [byId.get('bug')!])).toEqual([{ text: 'Debugging is fun.' }])
  })

  it('returns the whole sentence when there are no terms', () => {
    expect(splitTerms('Hello.', [])).toEqual([{ text: 'Hello.' }])
  })
})

describe('developer topics content', () => {
  it('has unique topic ids', () => {
    const ids = developerTopics.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  for (const topic of developerTopics) {
    describe(topic.id, () => {
      it('uses only dictionary words, with at least 4 per topic', () => {
        expect(topic.wordIds.length).toBeGreaterThanOrEqual(4)
        for (const id of topic.wordIds) expect(byId.has(id), id).toBe(true)
      })

      it('explains every term, and each term really appears in its sentence', () => {
        expect(topic.sentences.length).toBeGreaterThanOrEqual(3)
        for (const sentence of topic.sentences) {
          const ids = Object.keys(sentence.terms)
          for (const id of ids) expect(byId.has(id), id).toBe(true)
          const found = splitTerms(sentence.text, ids.map((id) => byId.get(id)!)).flatMap((p) => p.wordId ?? [])
          expect(new Set(found), sentence.text).toEqual(new Set(ids))
        }
      })
    })
  }
})
