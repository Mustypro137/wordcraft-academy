import type { Activity } from '../logic/activity'
import { localDate } from '../logic/dates'
import type { WordStates } from '../logic/wordStates'
import type { Collection, Profile, WordState, WritingData, WritingPiece } from '../types'
import { DEFAULT_DAILY_GOAL, isValidName, type ProfilesState } from './profiles'

// The shape of the saved data, how to update data saved by older versions,
// and the backup file: making one, and reading one back in.

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

// Reading a backup file back in (Step 13).
// A file comes from outside the app, so nothing in it is trusted: every part is checked,
// and only the parts the app knows are kept. If anything is wrong, nothing is loaded.

/** Bigger than any real backup: a much larger file is not ours */
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024

export type BackupResult =
  | { ok: true; data: SavedData; exportedAt: string }
  | { ok: false; error: string }

const DAMAGED = 'This backup file is damaged or incomplete, so it was not loaded. Nothing was changed.'

type Json = Record<string, unknown>

const isObject = (value: unknown): value is Json => typeof value === 'object' && value !== null && !Array.isArray(value)
const isString = (value: unknown): value is string => typeof value === 'string'
const isDay = (value: unknown): value is string => isString(value) && /^\d{4}-\d{2}-\d{2}$/.test(value)
const isWhen = (value: unknown): value is string => isString(value) && !Number.isNaN(Date.parse(value))
const oneOf = <T extends string | number>(value: unknown, allowed: readonly T[]): value is T =>
  allowed.includes(value as T)

/** Keeps the entries of an object whose values pass the check, or null if it isn't an object */
function entriesOf<T>(value: unknown, check: (v: unknown) => T | null): Record<string, T> | null {
  if (!isObject(value)) return null
  const result: Record<string, T> = {}
  for (const [key, item] of Object.entries(value)) {
    // "__proto__" is special in JavaScript objects; our data never uses it, so a file that does is not ours
    if (key === '__proto__') return null
    const clean = check(item)
    if (clean === null) return null
    result[key] = clean
  }
  return result
}

function cleanProfile(p: unknown): Profile | null {
  if (!isObject(p)) return null
  const { id, name, ageGroup, level, theme, textSize, dailyGoal, createdAt } = p
  if (!isString(id) || !isString(name) || !isValidName(name)) return null
  if (!oneOf(ageGroup, ['kids', 'teens', 'adults'] as const)) return null
  if (!oneOf(level, ['beginner', 'intermediate', 'advanced', 'professional'] as const)) return null
  if (!oneOf(theme, ['device', 'light', 'dark'] as const) || !oneOf(textSize, ['normal', 'large'] as const)) return null
  if (!oneOf(dailyGoal, [5, 10, 20] as const) || !isWhen(createdAt)) return null
  return { id, name, ageGroup, level, theme, textSize, dailyGoal, createdAt }
}

const COLLECTIONS: readonly Collection[] = ['unfamiliar', 'learning', 'known', 'mastered']

function cleanWordState(s: unknown): WordState | null {
  if (!isObject(s)) return null
  const { collection, box, due, correctDays, changedAt } = s
  if (!oneOf(collection, COLLECTIONS) || !oneOf(box, [0, 1, 2, 3, 4, 5] as const)) return null
  if (!isDay(due) || !Array.isArray(correctDays) || !correctDays.every(isDay) || !isWhen(changedAt)) return null
  return { collection, box, due, correctDays: [...correctDays], changedAt }
}

const count = (n: unknown) => (typeof n === 'number' && Number.isInteger(n) && n >= 0 ? n : null)
const stage = (n: unknown) => (oneOf(n, [0, 1, 2, 3] as const) ? n : null)

function cleanPiece(p: unknown): WritingPiece | null {
  if (!isObject(p)) return null
  const { id, situationId, text, finishedAt } = p
  if (!isString(id) || !isString(situationId) || !isString(text) || !isWhen(finishedAt)) return null
  return { id, situationId, text, finishedAt }
}

function cleanWriting(w: unknown): WritingData | null {
  if (!isObject(w) || !Array.isArray(w.pieces)) return null
  const drafts = entriesOf(w.drafts, (d) => (isString(d) ? d : null))
  const pieces = w.pieces.map(cleanPiece)
  if (!drafts || pieces.some((p) => p === null)) return null
  return { drafts, pieces: pieces as WritingPiece[] }
}

/** Checks data in today's shape and returns a clean copy, or null if any part is wrong */
export function cleanSavedData(raw: unknown): SavedData | null {
  if (!isObject(raw) || !Array.isArray(raw.profiles)) return null
  const profiles = raw.profiles.map(cleanProfile)
  if (profiles.length === 0 || profiles.some((p) => p === null)) return null
  const ids = new Set(profiles.map((p) => p!.id))
  if (ids.size !== profiles.length) return null

  const wordStates = entriesOf(raw.wordStates, (states) => entriesOf(states, cleanWordState))
  const activity = entriesOf(raw.activity, (days) => entriesOf(days, count))
  const sentenceProgress = entriesOf(raw.sentenceProgress, (patterns) => entriesOf(patterns, stage))
  const writing = entriesOf(raw.writing, cleanWriting)
  if (!wordStates || !activity || !sentenceProgress || !writing) return null

  // Only keep data that belongs to a profile in the file
  const forProfiles = <T>(byProfile: Record<string, T>) =>
    Object.fromEntries(Object.entries(byProfile).filter(([id]) => ids.has(id)))
  const active = raw.activeProfileId
  return {
    profiles: profiles as Profile[],
    activeProfileId: isString(active) && ids.has(active) ? active : profiles[0]!.id,
    wordStates: forProfiles(wordStates),
    activity: forProfiles(activity),
    sentenceProgress: forProfiles(sentenceProgress),
    writing: forProfiles(writing),
  }
}

/** Reads the text of a backup file: checks it, upgrades an older one, and returns clean data or a clear error */
export function readBackup(text: string): BackupResult {
  let file: unknown
  try {
    file = JSON.parse(text)
  } catch {
    return { ok: false, error: 'This file can’t be read. Choose the .json file you downloaded from WordCraft.' }
  }
  if (!isObject(file) || file.app !== 'wordcraft-academy') {
    return { ok: false, error: 'This is not a WordCraft Academy backup file. Nothing was changed.' }
  }
  const version = file.schemaVersion
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) return { ok: false, error: DAMAGED }
  if (version > SCHEMA_VERSION) {
    return {
      ok: false,
      error: 'This backup was made by a newer version of WordCraft. Reload this page to get the newest version, then try again.',
    }
  }
  if (!isObject(file.data) || !isWhen(file.exportedAt)) return { ok: false, error: DAMAGED }

  let data: SavedData | null
  try {
    // Older backups are upgraded exactly like older saved data
    data = cleanSavedData(migrate(file.data, version))
  } catch {
    data = null
  }
  return data ? { ok: true, data, exportedAt: file.exportedAt } : { ok: false, error: DAMAGED }
}

/** What a backup holds, in numbers, for the preview before loading it */
export function summarizeBackup(data: SavedData) {
  return {
    names: data.profiles.map((p) => p.name),
    words: Object.values(data.wordStates).reduce((sum, states) => sum + Object.keys(states).length, 0),
    pieces: Object.values(data.writing).reduce((sum, w) => sum + w.pieces.length, 0),
  }
}
