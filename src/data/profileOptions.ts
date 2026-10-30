import type { AgeGroup, LearningLevel, TextSize, Theme } from '../types'

// The choices a learner can make for their profile, with plain descriptions.
// Used by the welcome screens and by Settings.

export interface Option<T extends string> {
  value: T
  label: string
  description?: string
}

export const ageGroupOptions: Option<AgeGroup>[] = [
  { value: 'kids', label: 'Kids', description: 'Simple words, bigger text and fun practice.' },
  { value: 'teens', label: 'Teen', description: 'School, hobbies, technology and friends.' },
  { value: 'adults', label: 'Adult', description: 'Everyday life, work, programming and careers.' },
]

export const levelOptions: Option<LearningLevel>[] = [
  { value: 'beginner', label: 'Beginner (A1–A2)', description: 'I know simple words and short sentences.' },
  {
    value: 'intermediate',
    label: 'Intermediate (B1–B2)',
    description: 'I can talk about everyday things, but I often look for words.',
  },
  { value: 'advanced', label: 'Advanced (C1)', description: 'I speak well and want more natural, precise English.' },
  { value: 'professional', label: 'Professional', description: 'I want English for work: clients, writing and tech.' },
]

export const themeOptions: Option<Theme>[] = [
  { value: 'device', label: 'Same as device' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

export const textSizeOptions: Option<TextSize>[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Large' },
]

export function labelOf<T extends string>(options: Option<T>[], value: T) {
  return options.find((o) => o.value === value)?.label ?? value
}
