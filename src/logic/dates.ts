/**
 * The learner's own calendar date as 'YYYY-MM-DD'.
 * It uses the device's time zone, not UTC, so 11 pm still counts as today.
 */
export function localDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** '2026-11-03' as "Tuesday 3 November" */
export function formatDay(day: string) {
  const [year, month, date] = day.split('-').map(Number)
  return new Date(year, month - 1, date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

/** '2026-10-31' plus 3 days is '2026-11-03' */
export function addDays(day: string, days: number) {
  const [year, month, date] = day.split('-').map(Number)
  return localDate(new Date(year, month - 1, date + days))
}

/** Whole days from one date to a later one: '2026-10-31' to '2026-11-03' is 3 */
export function daysBetween(from: string, to: string) {
  // UTC has no summer time, so every day is exactly 24 hours long
  const toUtc = (day: string) => {
    const [year, month, date] = day.split('-').map(Number)
    return Date.UTC(year, month - 1, date)
  }
  return Math.round((toUtc(to) - toUtc(from)) / 86_400_000)
}
