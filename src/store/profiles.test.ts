import { describe, expect, it } from 'vitest'
import {
  addProfile,
  cleanName,
  getActiveProfile,
  isValidName,
  removeProfile,
  switchProfile,
  updateProfile,
  type ProfilesState,
} from './profiles'

const empty: ProfilesState = { profiles: [], activeProfileId: null }
const NOW = '2026-10-30T12:00:00.000Z'

/** Two profiles: Musa (active) and Amina */
function twoProfiles() {
  const one = addProfile(empty, { name: 'Musa', ageGroup: 'adults', level: 'intermediate' }, 'p1', NOW)
  const two = addProfile(one, { name: 'Amina', ageGroup: 'kids', level: 'beginner' }, 'p2', NOW)
  return switchProfile(two, 'p1')
}

describe('names', () => {
  it('removes extra spaces', () => {
    expect(cleanName('  Musa   A. ')).toBe('Musa A.')
  })

  it('accepts 1 to 30 characters, not counting extra spaces', () => {
    expect(isValidName('A')).toBe(true)
    expect(isValidName('   ')).toBe(false)
    expect(isValidName('x'.repeat(30))).toBe(true)
    expect(isValidName('x'.repeat(31))).toBe(false)
  })
})

describe('addProfile', () => {
  it('adds the profile with default display settings and makes it active', () => {
    const state = addProfile(empty, { name: ' Musa ', ageGroup: 'adults', level: 'professional' }, 'p1', NOW)
    expect(state.activeProfileId).toBe('p1')
    expect(state.profiles).toEqual([
      {
        id: 'p1',
        name: 'Musa',
        ageGroup: 'adults',
        level: 'professional',
        theme: 'device',
        textSize: 'normal',
        createdAt: NOW,
      },
    ])
  })

  it('refuses an empty name', () => {
    expect(() => addProfile(empty, { name: '  ', ageGroup: 'kids', level: 'beginner' }, 'p1', NOW)).toThrow()
  })

  it('does not change the old state', () => {
    addProfile(empty, { name: 'Musa', ageGroup: 'adults', level: 'beginner' }, 'p1', NOW)
    expect(empty.profiles).toEqual([])
  })
})

describe('updateProfile', () => {
  it('changes only the chosen profile', () => {
    const state = updateProfile(twoProfiles(), 'p2', { theme: 'dark', name: ' Amina  B ' })
    expect(state.profiles[1]).toMatchObject({ name: 'Amina B', theme: 'dark' })
    expect(state.profiles[0]).toMatchObject({ name: 'Musa', theme: 'device' })
  })

  it('refuses an empty name', () => {
    expect(() => updateProfile(twoProfiles(), 'p1', { name: '' })).toThrow()
  })
})

describe('switchProfile', () => {
  it('makes another profile active', () => {
    expect(switchProfile(twoProfiles(), 'p2').activeProfileId).toBe('p2')
  })

  it('ignores an unknown id', () => {
    expect(switchProfile(twoProfiles(), 'nobody').activeProfileId).toBe('p1')
  })
})

describe('removeProfile', () => {
  it('keeps the active profile when another one is deleted', () => {
    const state = removeProfile(twoProfiles(), 'p2')
    expect(state.profiles.map((p) => p.id)).toEqual(['p1'])
    expect(state.activeProfileId).toBe('p1')
  })

  it('switches to the first remaining profile when the active one is deleted', () => {
    const state = removeProfile(twoProfiles(), 'p1')
    expect(state.activeProfileId).toBe('p2')
    expect(getActiveProfile(state)?.name).toBe('Amina')
  })

  it('leaves no active profile when the last one is deleted', () => {
    const one = addProfile(empty, { name: 'Musa', ageGroup: 'adults', level: 'beginner' }, 'p1', NOW)
    expect(removeProfile(one, 'p1')).toEqual(empty)
  })
})
