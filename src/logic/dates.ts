/**
 * The learner's own calendar date as 'YYYY-MM-DD'.
 * It uses the device's time zone, not UTC, so 11 pm still counts as today.
 */
export function localDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}
