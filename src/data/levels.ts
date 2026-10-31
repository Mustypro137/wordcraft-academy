import type { LearningLevel, Level } from '../types'

// Which word levels belong to each learning level.
export const wordLevelsFor: Record<LearningLevel, Level[]> = {
  beginner: ['A1', 'A2'],
  intermediate: ['B1', 'B2'],
  advanced: ['C1'],
  professional: ['Pro'],
}

/** How a word's level is shown: "B1", or "Professional" for Pro words */
export function levelLabel(level: Level) {
  return level === 'Pro' ? 'Professional' : level
}
