import type { Word } from '../../types'
import { conversationWords } from './conversation'
import { developerWords } from './developer'
import { everydayWords } from './everyday'
import { workWords } from './work'

// All vocabulary in one list. Each file holds one group so it stays easy to review.
export const words: Word[] = [...everydayWords, ...conversationWords, ...workWords, ...developerWords]
