import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AnswerResult } from '../logic/spacedRepetition'
import { applyAnswer, applyKnowledge, restoreWord, type KnowledgeAction, type WordStates } from '../logic/wordStates'
import type { WordState } from '../types'
import { migrate, SCHEMA_VERSION, type SavedData } from './backup'
import {
  addProfile,
  getActiveProfile,
  removeProfile,
  switchProfile,
  updateProfile,
  type NewProfile,
  type ProfileChanges,
} from './profiles'

// The learner store: one place that holds everything the app remembers.
// The "persist" middleware saves it to localStorage after every change
// and loads it again when the page opens.

interface LearnerStore extends SavedData {
  addProfile: (input: NewProfile) => void
  updateProfile: (id: string, changes: ProfileChanges) => void
  switchProfile: (id: string) => void
  removeProfile: (id: string) => void
  /** A knowledge button, for the active profile */
  setKnowledge: (wordId: string, action: KnowledgeAction) => void
  /** One Review answer, for the active profile. `typed` = typed without help (counts towards Mastered). */
  answerReview: (wordId: string, result: AnswerResult, typed: boolean) => void
  /** Undo: puts a word back the way it was, for the active profile */
  restoreWord: (wordId: string, previous: WordState | undefined) => void
}

/** The localStorage key. index.html reads it too, to apply the theme early. */
export const STORAGE_KEY = 'wordcraft'

export const useLearnerStore = create<LearnerStore>()(
  persist(
    (set) => ({
      profiles: [],
      activeProfileId: null,
      wordStates: {},
      addProfile: (input) => set((s) => addProfile(s, input, crypto.randomUUID(), new Date().toISOString())),
      updateProfile: (id, changes) => set((s) => updateProfile(s, id, changes)),
      switchProfile: (id) => set((s) => switchProfile(s, id)),
      // Deleting a profile also deletes its words
      removeProfile: (id) =>
        set((s) => {
          const wordStates = { ...s.wordStates }
          delete wordStates[id]
          return { ...removeProfile(s, id), wordStates }
        }),
      setKnowledge: (wordId, action) =>
        set((s) => {
          const id = s.activeProfileId
          if (!id) return s
          return {
            wordStates: { ...s.wordStates, [id]: applyKnowledge(s.wordStates[id] ?? {}, wordId, action, new Date()) },
          }
        }),
      answerReview: (wordId, result, typed) =>
        set((s) => {
          const id = s.activeProfileId
          if (!id) return s
          return {
            wordStates: { ...s.wordStates, [id]: applyAnswer(s.wordStates[id] ?? {}, wordId, result, typed, new Date()) },
          }
        }),
      restoreWord: (wordId, previous) =>
        set((s) => {
          const id = s.activeProfileId
          if (!id) return s
          return { wordStates: { ...s.wordStates, [id]: restoreWord(s.wordStates[id] ?? {}, wordId, previous) } }
        }),
    }),
    {
      name: STORAGE_KEY,
      // Without "version" and "migrate", data saved by an older version would be thrown away
      version: SCHEMA_VERSION,
      migrate,
      // Save only the data, not the functions
      partialize: (s): SavedData => ({
        profiles: s.profiles,
        activeProfileId: s.activeProfileId,
        wordStates: s.wordStates,
      }),
    },
  ),
)

export function useActiveProfile() {
  return useLearnerStore(getActiveProfile)
}

// One shared empty object, so a profile with no words doesn't cause a new render every time
const NO_WORDS: WordStates = {}

/** The active profile's word states */
export function useWordStates() {
  return useLearnerStore((s) => (s.activeProfileId && s.wordStates[s.activeProfileId]) || NO_WORDS)
}
