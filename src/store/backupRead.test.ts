import { describe, expect, it } from 'vitest'
import { createBackup, readBackup, SCHEMA_VERSION, summarizeBackup, type SavedData } from './backup'
import { needsBackupReminder } from './backupReminder'

const NOW = new Date(2026, 9, 31, 12, 0)

const data: SavedData = {
  profiles: [
    {
      id: 'p1',
      name: 'Musa',
      ageGroup: 'adults',
      level: 'intermediate',
      theme: 'dark',
      textSize: 'normal',
      dailyGoal: 10,
      createdAt: '2026-10-20T10:00:00.000Z',
    },
  ],
  activeProfileId: 'p1',
  wordStates: {
    p1: { improve: { collection: 'learning', box: 2, due: '2026-11-03', correctDays: ['2026-10-30'], changedAt: '2026-10-30T09:00:00.000Z' } },
  },
  activity: { p1: { '2026-10-31': 4 } },
  sentenceProgress: { p1: { 'i-think': 3 } },
  writing: {
    p1: {
      drafts: { 'message-friend': 'Hi Sam' },
      pieces: [{ id: 'w1', situationId: 'email-client', text: 'Dear client…', finishedAt: '2026-10-31T10:00:00.000Z' }],
    },
  },
}

const file = (changes: object = {}) => JSON.stringify({ ...createBackup(data, NOW), ...changes })

describe('readBackup', () => {
  it('reads back exactly what was downloaded', () => {
    const result = readBackup(file())
    expect(result).toEqual({ ok: true, data, exportedAt: NOW.toISOString() })
  })

  it('upgrades a backup from an older version', () => {
    const { activity: _a, sentenceProgress: _s, writing: _w, ...v2 } = data
    const old = { ...v2, profiles: data.profiles.map(({ dailyGoal: _g, ...p }) => p) }
    const result = readBackup(file({ schemaVersion: 2, data: old }))
    expect(result.ok && result.data).toEqual({ ...data, activity: {}, sentenceProgress: {}, writing: {} })
  })

  it('refuses files that are not WordCraft backups, with a clear message', () => {
    expect(readBackup('not json')).toMatchObject({ ok: false, error: expect.stringContaining('can’t be read') })
    expect(readBackup('{"hello": 1}')).toMatchObject({ ok: false, error: expect.stringContaining('not a WordCraft') })
  })

  it('refuses a backup from a newer version of the app', () => {
    expect(readBackup(file({ schemaVersion: SCHEMA_VERSION + 1 }))).toMatchObject({
      ok: false,
      error: expect.stringContaining('newer version'),
    })
  })

  it('refuses damaged data instead of loading part of it', () => {
    const damaged = [
      { ...data, profiles: [] },
      { ...data, profiles: [{ ...data.profiles[0], ageGroup: 'aliens' }] },
      { ...data, profiles: [{ ...data.profiles[0], name: '   ' }] },
      { ...data, profiles: [data.profiles[0], data.profiles[0]] },
      { ...data, wordStates: { p1: { improve: { ...data.wordStates.p1.improve, box: 9 } } } },
      { ...data, activity: { p1: { '2026-10-31': -3 } } },
      { ...data, writing: { p1: { drafts: {}, pieces: [{ id: 'w1' }] } } },
      { ...data, wordStates: 'lots' },
    ]
    for (const bad of damaged) {
      expect(readBackup(file({ data: bad })), JSON.stringify(bad).slice(0, 80)).toMatchObject({ ok: false })
    }
  })

  it('refuses the special "__proto__" key', () => {
    const text = file().replace('"wordStates":{', '"wordStates":{"__proto__":{},')
    expect(text).toContain('__proto__')
    expect(readBackup(text).ok).toBe(false)
  })

  it('drops unknown fields and data for profiles that are not in the file', () => {
    const extra = { ...data, secret: 'x', wordStates: { ...data.wordStates, ghost: {} } }
    const result = readBackup(file({ data: extra }))
    expect(result.ok && result.data).toEqual(data)
  })

  it('makes the first profile active if the saved one is missing', () => {
    const result = readBackup(file({ data: { ...data, activeProfileId: 'gone' } }))
    expect(result.ok && result.data.activeProfileId).toBe('p1')
  })
})

describe('summarizeBackup', () => {
  it('counts profiles, words and pieces of writing', () => {
    expect(summarizeBackup(data)).toEqual({ names: ['Musa'], words: 1, pieces: 1 })
  })
})

describe('needsBackupReminder', () => {
  it('reminds 14 days after the last backup', () => {
    expect(needsBackupReminder('2026-10-18T09:00:00.000Z', null, NOW)).toBe(false)
    expect(needsBackupReminder('2026-10-17T09:00:00.000Z', null, NOW)).toBe(true)
  })

  it('with no backup yet, counts from the first profile', () => {
    expect(needsBackupReminder(null, '2026-10-30T09:00:00.000Z', NOW)).toBe(false)
    expect(needsBackupReminder(null, '2026-10-01T09:00:00.000Z', NOW)).toBe(true)
    expect(needsBackupReminder(null, null, NOW)).toBe(false)
  })
})
