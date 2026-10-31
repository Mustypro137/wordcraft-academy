import { describe, expect, it } from 'vitest'
import { backupFileName, createBackup, migrate, SCHEMA_VERSION } from './backup'

const v1 = {
  profiles: [
    {
      id: 'p1',
      name: 'Musa',
      ageGroup: 'adults' as const,
      level: 'beginner' as const,
      theme: 'dark' as const,
      textSize: 'normal' as const,
      createdAt: '2026-10-30T12:00:00.000Z',
    },
  ],
  activeProfileId: 'p1',
}

/** The same profiles in today's shape */
const profiles = v1.profiles.map((p) => ({ ...p, dailyGoal: 10 as const }))

describe('migrate', () => {
  it('upgrades version 1 all the way', () => {
    expect(migrate(v1, 1)).toEqual({ ...v1, profiles, wordStates: {}, activity: {}, sentenceProgress: {} })
  })

  it('keeps version 2 word states and adds a goal of 10 and empty activity', () => {
    const wordStates = {
      p1: {
        improve: { collection: 'learning', box: 1, due: '2026-11-01', correctDays: [], changedAt: '2026-10-31T09:00:00.000Z' },
      },
    }
    expect(migrate({ ...v1, wordStates }, 2)).toEqual({ ...v1, profiles, wordStates, activity: {}, sentenceProgress: {} })
  })

  it('keeps version 3 activity and adds empty Sentence Builder progress', () => {
    const v3 = { ...v1, profiles, wordStates: {}, activity: { p1: { '2026-10-31': 4 } } }
    expect(migrate(v3, 3)).toEqual({ ...v3, sentenceProgress: {} })
  })
})

describe('backup file', () => {
  const now = new Date(2026, 9, 31, 22, 15)
  const data = { ...v1, profiles, wordStates: {}, activity: {}, sentenceProgress: {} }

  it('holds the saved data, its version and the time', () => {
    expect(createBackup(data, now)).toEqual({
      app: 'wordcraft-academy',
      schemaVersion: SCHEMA_VERSION,
      exportedAt: now.toISOString(),
      data,
    })
  })

  it('leaves out anything that is not saved data, like store functions', () => {
    const store = { ...data, setKnowledge: () => {} }
    expect(Object.keys(createBackup(store, now).data)).toEqual([
      'profiles',
      'activeProfileId',
      'wordStates',
      'activity',
      'sentenceProgress',
    ])
  })

  it('names the file with the local date', () => {
    expect(backupFileName(now)).toBe('wordcraft-backup-2026-10-31.json')
  })
})
