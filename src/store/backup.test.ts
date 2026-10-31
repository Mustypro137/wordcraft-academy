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

describe('migrate', () => {
  it('keeps version 1 profiles and adds empty word states', () => {
    expect(migrate(v1, 1)).toEqual({ ...v1, wordStates: {} })
  })
})

describe('backup file', () => {
  const now = new Date(2026, 9, 31, 22, 15)

  it('holds the saved data, its version and the time', () => {
    const data = { ...v1, wordStates: {} }
    expect(createBackup(data, now)).toEqual({
      app: 'wordcraft-academy',
      schemaVersion: SCHEMA_VERSION,
      exportedAt: now.toISOString(),
      data,
    })
  })

  it('leaves out anything that is not saved data, like store functions', () => {
    const store = { ...v1, wordStates: {}, setKnowledge: () => {} }
    expect(Object.keys(createBackup(store, now).data)).toEqual(['profiles', 'activeProfileId', 'wordStates'])
  })

  it('names the file with the local date', () => {
    expect(backupFileName(now)).toBe('wordcraft-backup-2026-10-31.json')
  })
})
