import { describe, expect, it } from 'vitest'
import { writingRules } from '../data/writingRules'
import { writingSituations } from '../data/writingSituations'
import { words } from '../data/words'
import type { AgeGroup } from '../types'
import { applyAll, applyFix, checkWriting, findStuck, starterText } from './writingChecker'

const check = (text: string) => checkWriting(text, writingRules, words)
const summary = (text: string) => check(text).map((i) => `${i.kind}:${i.found}→${i.fix}`)

describe('findStuck', () => {
  it('finds guesses in ??double question marks??', () => {
    expect(findStuck('I want to ??make better?? my ??site??.')).toEqual([
      { start: 10, end: 25, guess: 'make better' },
      { start: 29, end: 37, guess: 'site' },
    ])
  })

  it('ignores a single question mark and empty marks', () => {
    expect(findStuck('Is it ready? Yes?')).toEqual([])
  })
})

describe('checkWriting', () => {
  it('accepts good writing', () => {
    expect(check('I want to improve my website. Could you help me?')).toEqual([])
  })

  it('finds the brief’s example: “more good”', () => {
    expect(summary('I want to make my website more good.')).toEqual(['mistake:more good→better'])
  })

  it('suggests a dictionary word for a stuck word, with a hint that does not give it away', () => {
    const [issue] = check('I want to ??make better?? my website.')
    expect(issue.kind).toBe('stuck')
    expect(issue.fix).toBe('improve')
    expect(issue.hint).toBe('There is a verb for this. It starts with “i” and has 7 letters.')
    expect(issue.hint).not.toContain('improve')
    // Words that match only half of "make better" are not offered as other ideas
    expect(issue.alternatives).toEqual([])
  })

  it('a stuck word with no match gives advice, not a fix', () => {
    const [issue] = check('I like ??zzqx??.')
    expect(issue).toMatchObject({ kind: 'stuck', fix: null })
  })

  it('does not treat the ?? of a stuck word as the end of a sentence', () => {
    expect(check('I want to ??make better?? my site.').map((i) => i.kind)).toEqual(['stuck'])
  })

  it('keeps capitals: “More good” at the start becomes “Better”', () => {
    expect(summary('More good than before.')).toEqual(['mistake:More good→Better'])
  })

  it('matches whole words only, and either apostrophe', () => {
    expect(check('I listen musically.')).toEqual([])
    expect(summary('It don’t work.')).toEqual(['mistake:It don’t→It doesn\'t'])
  })

  it('prefers the longer phrase when two rules overlap', () => {
    expect(summary('It is the most best app.')).toEqual(['mistake:the most best→the best'])
  })

  it('finds the basics: i, sentence starts, extra spaces, end punctuation', () => {
    expect(summary('yesterday i went home.  it was late')).toEqual([
      'capital:y→Y',
      'capital:i→I',
      'spaces:  → ',
      'capital:i→I',
      'punctuation:→.',
    ])
  })

  it('ends a final question with a question mark, and capitalises days and months', () => {
    expect(summary('It is late. Could you wait for me until friday')).toEqual(['capital:friday→Friday', 'punctuation:→?'])
    expect(summary('I may come in march.')).toEqual([])
  })

  it('advises splitting a very long sentence, with nothing to replace', () => {
    const long = `I ${'really '.repeat(40)}like it.`
    const [issue] = check(long)
    expect(issue).toMatchObject({ kind: 'long', fix: null })
  })

  it('shows a few words around each issue, on the same line', () => {
    const [issue] = check('Hello.\nYesterday I wanted to make it more good for my best friend.')
    // The spaces stay, so the card reads "…to make it more good for my best…"
    expect(issue).toMatchObject({ before: '…to make it ', found: 'more good', after: ' for my best…' })
    expect(check('it is ok')[0]).toMatchObject({ before: '', found: 'i', after: 't is ok' })
  })

  it('gives stable keys that count repeats', () => {
    expect(check('i think i can.').map((i) => i.key)).toEqual(['capital:i:0', 'capital:i:1'])
  })
})

describe('applyFix and applyAll', () => {
  it('uses one fix', () => {
    const text = 'I want to make my website more good.'
    expect(applyFix(text, check(text)[0])).toBe('I want to make my website better.')
  })

  it('can use another word instead of the suggested one', () => {
    const text = 'Please ??make better?? it.'
    expect(applyFix(text, check(text)[0], 'fix')).toBe('Please fix it.')
  })

  it('builds the natural version from every fix', () => {
    const text = 'i want to ??make better?? my website,  it is more good now'
    expect(applyAll(text, check(text))).toBe('I want to improve my website, it is better now.')
  })
})

describe('content', () => {
  it('every rule finds its own phrases, and its fix is not flagged again', () => {
    for (const rule of writingRules) {
      for (const phrase of rule.find) {
        const text = `Well, ${phrase} here.`
        const issues = check(text).filter((i) => i.kind === 'mistake')
        expect(issues, phrase).toHaveLength(1)
        expect(check(applyAll(text, issues)).filter((i) => i.kind === 'mistake'), phrase).toEqual([])
      }
    }
  })

  it('every age group has situations, and ids are unique', () => {
    for (const age of ['kids', 'teens', 'adults'] as AgeGroup[]) {
      expect(writingSituations.filter((s) => s.ages.includes(age)).length).toBeGreaterThanOrEqual(5)
    }
    const ids = writingSituations.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('turns a starter into text to insert', () => {
    expect(starterText('On Saturday I…')).toBe('On Saturday I ')
    expect(starterText('When I…, it…')).toBe('When I ')
    expect(starterText('Could you help me…?')).toBe('Could you help me ')
  })
})
