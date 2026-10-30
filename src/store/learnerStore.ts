import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  addProfile,
  getActiveProfile,
  removeProfile,
  switchProfile,
  updateProfile,
  type NewProfile,
  type ProfileChanges,
  type ProfilesState,
} from './profiles'

// The learner store: one place that holds everything the app remembers.
// The "persist" middleware saves it to localStorage after every change
// and loads it again when the page opens.

interface LearnerStore extends ProfilesState {
  addProfile: (input: NewProfile) => void
  updateProfile: (id: string, changes: ProfileChanges) => void
  switchProfile: (id: string) => void
  removeProfile: (id: string) => void
}

/** The localStorage key. index.html reads it too, to apply the theme early. */
export const STORAGE_KEY = 'wordcraft'

/**
 * Version of the saved data shape (the "schemaVersion").
 * When a later step changes the shape, raise this number and add a
 * "migrate" function below that converts the old shape to the new one.
 */
const SCHEMA_VERSION = 1

export const useLearnerStore = create<LearnerStore>()(
  persist(
    (set) => ({
      profiles: [],
      activeProfileId: null,
      addProfile: (input) => set((s) => addProfile(s, input, crypto.randomUUID(), new Date().toISOString())),
      updateProfile: (id, changes) => set((s) => updateProfile(s, id, changes)),
      switchProfile: (id) => set((s) => switchProfile(s, id)),
      // Later steps also delete the profile's words and progress here
      removeProfile: (id) => set((s) => removeProfile(s, id)),
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      // Save only the data, not the functions
      partialize: (s) => ({ profiles: s.profiles, activeProfileId: s.activeProfileId }),
    },
  ),
)

export function useActiveProfile() {
  return useLearnerStore(getActiveProfile)
}
