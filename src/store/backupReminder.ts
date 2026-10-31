import { daysBetween, localDate } from '../logic/dates'

// Remembers when this device last downloaded a backup, to remind the learner now and then.
// It belongs to this browser, not to a profile, so it is kept outside the saved data
// (and outside backups). If the browser blocks storage, the reminder simply shows more often.

const KEY = 'wordcraft-last-backup'

/** Days without a backup before the Today page shows a reminder */
export const BACKUP_REMINDER_DAYS = 14

export function rememberBackup(now: Date) {
  try {
    localStorage.setItem(KEY, now.toISOString())
  } catch {
    // Storage blocked: nothing to do
  }
}

export function lastBackup(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

/**
 * True when it is time to remind: 14 days after the last backup or,
 * with no backup yet, 14 days after the oldest profile was made.
 */
export function needsBackupReminder(last: string | null, firstUse: string | null, now: Date) {
  const since = last ?? firstUse
  if (!since || Number.isNaN(Date.parse(since))) return false
  return daysBetween(localDate(new Date(since)), localDate(now)) >= BACKUP_REMINDER_DAYS
}
