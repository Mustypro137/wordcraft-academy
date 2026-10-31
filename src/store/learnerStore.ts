import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addActivity, type Activity } from '../logic/activity'
import { localDate } from '../logic/dates'
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
  /** One correct sentence in the Sentence Builder. `stage` = a lesson stage just completed (1–3). */
  practiseSentence: (patternId: string, stage?: number) => void
}

/** The store change that adds `amount` practised words to today, for one profile */
function countPractice(s: SavedData, profileId: string, now: Date, amount: number) {
  return { activity: { ...s.activity, [profileId]: addActivity(s.activity[profileId] ?? {}, localDate(now), amount) } }
}

/** The localStorage key. index.html reads it too, to apply the theme early. */
export const STORAGE_KEY = 'wordcraft'

export const useLearnerStore = create<LearnerStore>()(
  persist(
    (set) => ({
      profiles: [],
      activeProfileId: null,
      wordStates: {},
      activity: {},
      sentenceProgress: {},
      addProfile: (input) => set((s) => addProfile(s, input, crypto.randomUUID(), new Date().toISOString())),
      updateProfile: (id, changes) => set((s) => updateProfile(s, id, changes)),
      switchProfile: (id) => set((s) => switchProfile(s, id)),
      // Deleting a profile also deletes its words
      removeProfile: (id) =>
        set((s) => {
          const wordStates = { ...s.wordStates }
          const activity = { ...s.activity }
          const sentenceProgress = { ...s.sentenceProgress }
          delete wordStates[id]
          delete activity[id]
          delete sentenceProgress[id]
          return { ...removeProfile(s, id), wordStates, activity, sentenceProgress }
        }),
      // Every correct sentence counts as one practised today
      practiseSentence: (patternId, stage) =>
        set((s) => {
          const id = s.activeProfileId
          if (!id) return s
          const progress = s.sentenceProgress[id] ?? {}
          const best = Math.max(progress[patternId] ?? 0, stage ?? 0)
          return {
            ...countPractice(s, id, new Date(), 1),
            sentenceProgress: { ...s.sentenceProgress, [id]: { ...progress, [patternId]: best } },
          }
        }),
      // Saving a word for the first time counts as one word practised today
      setKnowledge: (wordId, action) =>
        set((s) => {
          const id = s.activeProfileId
          if (!id) return s
          const now = new Date()
          const words = s.wordStates[id] ?? {}
          return {
            wordStates: { ...s.wordStates, [id]: applyKnowledge(words, wordId, action, now) },
            ...(words[wordId] ? {} : countPractice(s, id, now, 1)),
          }
        }),
      // Every Review answer counts as one word practised today
      answerReview: (wordId, result, typed) =>
        set((s) => {
          const id = s.activeProfileId
          if (!id) return s
          const now = new Date()
          return {
            wordStates: { ...s.wordStates, [id]: applyAnswer(s.wordStates[id] ?? {}, wordId, result, typed, now) },
            ...countPractice(s, id, now, 1),
          }
        }),
      // Undoing a first save takes back the word it counted
      restoreWord: (wordId, previous) =>
        set((s) => {
          const id = s.activeProfileId
          if (!id) return s
          return {
            wordStates: { ...s.wordStates, [id]: restoreWord(s.wordStates[id] ?? {}, wordId, previous) },
            ...(previous ? {} : countPractice(s, id, new Date(), -1)),
          }
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
        activity: s.activity,
        sentenceProgress: s.sentenceProgress,
      }),
    },
  ),
)

export function useActiveProfile() {
  return useLearnerStore(getActiveProfile)
}

// One shared empty object, so a profile with no words doesn't cause a new render every time
const NO_WORDS: WordStates = {}

const NO_PROGRESS: Record<string, number> = {}

/** The active profile's Sentence Builder progress: pattern id → highest stage completed */
export function useSentenceProgress() {
  return useLearnerStore((s) => (s.activeProfileId && s.sentenceProgress[s.activeProfileId]) || NO_PROGRESS)
}

const NO_ACTIVITY: Activity = {}

/** The active profile's words practised per day */
export function useActivity() {
  return useLearnerStore((s) => (s.activeProfileId && s.activity[s.activeProfileId]) || NO_ACTIVITY)
}

/** The active profile's word states */
export function useWordStates() {
  return useLearnerStore((s) => (s.activeProfileId && s.wordStates[s.activeProfileId]) || NO_WORDS)
}
