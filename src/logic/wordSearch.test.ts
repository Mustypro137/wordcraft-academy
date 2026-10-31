import { describe, expect, it } from 'vitest'
import { words } from '../data/words'
import { searchWords } from './wordSearch'

/** The ids of the results, best first */
const search = (query: string) => searchWords(words, query).map((w) => w.id)

describe('searchWords', () => {
  it('returns every word for an empty search', () => {
    expect(search('   ')).toHaveLength(words.length)
  })

  it('finds a word by its name, ignoring capitals and spaces', () => {
    expect(search('  Deadline ')[0]).toBe('deadline')
  })

  it('finds a word by one of its forms', () => {
    expect(search('improved')[0]).toBe('improve')
  })

  it('finds a word from the first letters', () => {
    expect(search('impro')[0]).toBe('improve')
  })

  it('finds a word from a synonym', () => {
    expect(search('make better')[0]).toBe('improve')
  })

  it('finds a word from its opposite', () => {
    expect(search('lend')).toContain('borrow')
  })

  it('finds a word from a description of its meaning', () => {
    expect(search('say sorry')[0]).toBe('apologize')
    expect(search('fix mistakes in code')[0]).toBe('debug')
  })

  it('puts the exact word before words that only mention it', () => {
    // "implement" only uses "feature" in an example sentence
    const results = search('feature')
    expect(results[0]).toBe('feature')
    expect(results).toContain('implement')
  })

  it('returns nothing for a search that matches no word', () => {
    expect(search('xyzzy')).toEqual([])
  })

  it('ignores punctuation', () => {
    expect(search('make better?!')[0]).toBe('improve')
  })
})
