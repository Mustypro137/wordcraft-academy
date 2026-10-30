import type { Profile } from '../types'

// The rules for profiles, as plain functions. Each one takes the current
// state and returns a new state; it never changes the old one.
// The store (learnerStore.ts) calls these, and the tests check them directly.

export interface ProfilesState {
  profiles: Profile[]
  activeProfileId: string | null
}

export type NewProfile = Pick<Profile, 'name' | 'ageGroup' | 'level'>

export type ProfileChanges = Partial<Omit<Profile, 'id' | 'createdAt'>>

export const MAX_NAME_LENGTH = 30

/** Removes extra spaces: '  Musa   A. ' becomes 'Musa A.' */
export function cleanName(name: string) {
  return name.trim().replace(/\s+/g, ' ')
}

export function isValidName(name: string) {
  const cleaned = cleanName(name)
  return cleaned.length > 0 && cleaned.length <= MAX_NAME_LENGTH
}

/** Adds a profile and makes it the active one. */
export function addProfile(state: ProfilesState, input: NewProfile, id: string, now: string): ProfilesState {
  if (!isValidName(input.name)) throw new Error('A profile needs a name of 1 to 30 characters.')
  const profile: Profile = {
    id,
    name: cleanName(input.name),
    ageGroup: input.ageGroup,
    level: input.level,
    theme: 'device',
    textSize: 'normal',
    createdAt: now,
  }
  return { profiles: [...state.profiles, profile], activeProfileId: id }
}

export function updateProfile(state: ProfilesState, id: string, changes: ProfileChanges): ProfilesState {
  if (changes.name !== undefined && !isValidName(changes.name)) {
    throw new Error('A profile needs a name of 1 to 30 characters.')
  }
  return {
    ...state,
    profiles: state.profiles.map((p) =>
      p.id === id ? { ...p, ...changes, ...(changes.name !== undefined && { name: cleanName(changes.name) }) } : p,
    ),
  }
}

/** Makes another profile active. An unknown id changes nothing. */
export function switchProfile(state: ProfilesState, id: string): ProfilesState {
  if (!state.profiles.some((p) => p.id === id)) return state
  return { ...state, activeProfileId: id }
}

/**
 * Deletes a profile. If it was the active one, the first remaining profile
 * becomes active; if none remain, the learner sees the welcome screen again.
 */
export function removeProfile(state: ProfilesState, id: string): ProfilesState {
  const profiles = state.profiles.filter((p) => p.id !== id)
  const activeProfileId = state.activeProfileId === id ? (profiles[0]?.id ?? null) : state.activeProfileId
  return { profiles, activeProfileId }
}

export function getActiveProfile(state: ProfilesState): Profile | undefined {
  return state.profiles.find((p) => p.id === state.activeProfileId)
}
