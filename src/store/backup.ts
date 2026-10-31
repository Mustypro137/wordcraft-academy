import type { Activity } from '../logic/activity'
import { localDate } from '../logic/dates'
import type { WordStates } from '../logic/wordStates'
import type { WritingData } from '../types'
import { DEFAULT_DAILY_GOAL, type ProfilesState } from './profiles'

// The shape of the saved data, how to update data saved by older versions,
// and the backup file. Step 13 adds importing a backup; it will use the same migrations.

/** Everything the app saves in localStorage */
export interface SavedData extends ProfilesState {
  /** Profile id → that profile's word states */
  wordStates: Record<string, WordStates>
  /** Profile id → words practised on each day */
  activity: Record<string, Activity>
  /** Profile id → pattern id → highest Sentence Builder stage completed (1–3) */
  sentenceProgress: Record<string, Record<string, number>>
  /** Profile id → Writing Studio drafts and finished pieces */
  writing: Record<string, WritingData>
}

/**
 * Version of the saved data shape (the "schemaVersion").
 * When a step changes the shape, raise this number and teach `migrate` the change.
 *
 * 1: profiles (Step 5)
 * 2: + word states for each profile (Step 7)
 * 3: + daily goal for each profile, + activity per day (Step 9)
 * 4: + Sentence Builder progress (Step 10)
 * 5: + Writing Studio drafts and finished pieces (Step 11)
 */
export const SCHEMA_VERSION = 5

/**
 * Converts data saved by an older version to the current shape, one version at a time,
 * so nothing the learner saved is lost.
 */
export function migrate(saved: unknown, version: number): SavedData {
  let data = saved as SavedData
  // Version 1 had no word states yet
  if (version < 2) data = { ...data, wordStates: {} }
  // Version 2 had no daily goal and no activity. Earlier days can't be known, so they start empty.
  if (version < 3) {
    data = {
      ...data,
      profiles: data.profiles.map((p) => ({ ...p, dailyGoal: DEFAULT_DAILY_GOAL })),
      activity: {},
    }
  }
  if (version < 4) data = { ...data, sentenceProgress: {} }
  if (version < 5) data = { ...data, writing: {} }
  return data
}

/** What a downloaded backup file contains */
export interface BackupFile {
  app: 'wordcraft-academy'
  schemaVersion: number
  exportedAt: string
  data: SavedData
}

export function createBackup(data: SavedData, now: Date): BackupFile {
  const { profiles, activeProfileId, wordStates, activity, sentenceProgress, writing } = data
  return {
    app: 'wordcraft-academy',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    data: { profiles, activeProfileId, wordStates, activity, sentenceProgress, writing },
  }
}

export function backupFileName(now: Date) {
  return `wordcraft-backup-${localDate(now)}.json`
}

/**
 * Asks the browser to keep our data even when space runs low or the site
 * isn't visited for a while (Safari can otherwise clear it after about 7 days).
 * Returns true when the data is protected. Some browsers say no, or ask the learner.
 */
export async function protectStorage() {
  if (!navigator.storage?.persist) return false
  return (await navigator.storage.persisted()) || navigator.storage.persist()
}
