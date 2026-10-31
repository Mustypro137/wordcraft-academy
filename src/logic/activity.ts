import { addDays, daysBetween } from './dates'

// What a learner did on each day: how many words they practised.
// A word counts once for every Review answer, and once when it is saved for the first time.
// The daily goal and the streak are both worked out from this.

/** Local date ('2026-10-31') → words practised that day */
export type Activity = Record<string, number>

/** Adds (or, for Undo, takes away) practised words on one day. Never goes below 0. */
export function addActivity(activity: Activity, day: string, amount: number): Activity {
  const count = Math.max(0, (activity[day] ?? 0) + amount)
  const next = { ...activity }
  if (count === 0) delete next[day]
  else next[day] = count
  return next
}

/** A missed day keeps the streak alive, but only one in any 7 days */
export const STREAK_GRACE_DAYS = 7

/**
 * The number of days in a row the learner practised, counting back from today.
 * - Today counts once something is practised; until then the streak runs to yesterday.
 * - One missed day per week does not break the streak (it just doesn't add to it).
 *   Two missed days within a week do.
 */
export function streak(activity: Activity, today: string) {
  const days = Object.keys(activity)
  if (days.length === 0) return 0
  const first = days.reduce((a, b) => (a < b ? a : b))

  let day = activity[today] ? today : addDays(today, -1)
  let count = 0
  let lastMissed: string | null = null
  while (day >= first) {
    if (activity[day]) {
      count++
    } else if (lastMissed === null || daysBetween(day, lastMissed) >= STREAK_GRACE_DAYS) {
      lastMissed = day
    } else {
      break
    }
    day = addDays(day, -1)
  }
  return count
}
