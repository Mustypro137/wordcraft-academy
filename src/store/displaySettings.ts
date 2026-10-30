import { useEffect } from 'react'
import type { Profile } from '../types'

/**
 * Puts the profile's display choices on the <html> element as data attributes.
 * tokens.css reacts to them: data-theme (light/dark), data-age (kids),
 * data-text (large). index.html runs the same steps before the page appears.
 */
export function applyDisplaySettings(profile: Profile | undefined) {
  const root = document.documentElement
  if (profile && profile.theme !== 'device') root.dataset.theme = profile.theme
  else delete root.dataset.theme
  if (profile?.ageGroup === 'kids') root.dataset.age = 'kids'
  else delete root.dataset.age
  if (profile?.textSize === 'large') root.dataset.text = 'large'
  else delete root.dataset.text
}

export function useDisplaySettings(profile: Profile | undefined) {
  useEffect(() => applyDisplaySettings(profile), [profile])
}

/**
 * Asks the browser to protect this site's data from automatic clearing.
 * Called after the learner creates a profile, because some browsers ask the
 * learner first and should only ask once there is something worth keeping.
 */
export function requestPersistentStorage() {
  navigator.storage?.persist?.().catch(() => {})
}
