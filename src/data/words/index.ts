import type { Profile, Word } from '../../types'
import { advancedWords } from './advanced'
import { beginnerWords } from './beginner'
import { conversationWords } from './conversation'
import { developerWords } from './developer'
import { everydayWords } from './everyday'
import { techWords } from './tech'
import { workWords } from './work'

// All vocabulary in one list. Each file holds one group so it stays easy to review.
export const words: Word[] = [...beginnerWords, ...everydayWords, ...conversationWords, ...workWords, ...developerWords, ...techWords, ...advancedWords]

const kidsWords = words.filter((w) => w.forKids)

/** The words a profile can see: Kids profiles see only words marked forKids */
export function wordsFor(profile: Profile | null | undefined) {
  return profile?.ageGroup === 'kids' ? kidsWords : words
}
