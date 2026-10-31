// Shared data shapes for the whole app.

/** CEFR levels A1–C1, plus 'Pro' for professional and technical words */
export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'Pro'

export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrasal verb' | 'phrase'

export type CategoryId =
  | 'everyday'
  | 'common-verbs'
  | 'common-nouns'
  | 'adjectives'
  | 'adverbs'
  | 'conversation'
  | 'communication'
  | 'professional-writing'
  | 'business'
  | 'web-development'
  | 'programming'
  | 'ui-ux'
  | 'ai'
  | 'prompt-engineering'
  | 'claude-code'
  | 'vibe-coding'
  | 'freelancing'
  | 'technology'

export type AgeGroup = 'kids' | 'teens' | 'adults'

/** The learner's chosen level. Separate from age group on purpose. */
export type LearningLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional'

export type Theme = 'device' | 'light' | 'dark'

export type TextSize = 'normal' | 'large'

export type DailyGoal = 5 | 10 | 20

/** One person who learns on this device. There are no passwords. */
export interface Profile {
  id: string
  name: string
  ageGroup: AgeGroup
  level: LearningLevel
  theme: Theme
  textSize: TextSize
  /** Words to practise each day */
  dailyGoal: DailyGoal
  /** When the profile was created, as an ISO date string */
  createdAt: string
}

/** The four personal collections a word can be in */
export type Collection = 'unfamiliar' | 'learning' | 'known' | 'mastered'

/** What one learner remembers about one word. Saved separately for each profile. */
export interface WordState {
  collection: Collection
  /** Leitner box 0–5: the higher the box, the longer until the next review */
  box: number
  /** Next review day, as a local date: '2026-10-31' */
  due: string
  /** Local dates of correct answers without hints. Review uses them to award Mastered. */
  correctDays: string[]
  /** When the learner last changed it, as an ISO date string */
  changedAt: string
}

/** One sentence to build from word tiles, with the situation it fits */
export interface SentenceExercise {
  /** Which age groups see it: kids get kids' topics, adults get work topics */
  ages: AgeGroup[]
  /** When you would say it: 'Your friend shows you a new game.' */
  situation: string
  /** The answer. Each word, with its punctuation, becomes one tile. */
  sentence: string
}

/** One sentence pattern in the Sentence Builder, like "I think…" */
export interface SentencePattern {
  /** Unique, lowercase, words joined by hyphens: 'i-think' */
  id: string
  /** Short name: 'I think…' */
  title: string
  /** The shape of the sentence: fixed words, and slots (slot: true) for your own words */
  shape: { text: string; slot?: boolean }[]
  /** When to use it, in one or two sentences */
  whenToUse: string
  examples: string[]
  /** What "Write your own" checks. Every rule given here must pass. */
  check: {
    /** The sentence starts with one of these */
    starts?: string[]
    /** The sentence contains one of these words */
    contains?: string[]
    /** The sentence has don't, can't, isn't, not… */
    negative?: boolean
    /** The sentence ends with a question mark */
    question?: boolean
  }
  /** The task for "Write your own" */
  writePrompt: string
  /** In lesson order. Each age group should see at least 4. */
  exercises: SentenceExercise[]
}

/** One vocabulary entry. Every word in src/data/words follows this shape. */
export interface Word {
  /** Unique, lowercase, words joined by hyphens: 'follow-up' */
  id: string
  /** The word or phrase as the learner sees it: 'follow up' */
  word: string
  /** Other forms of the word, used to find it inside sentences: 'improves', 'improved' */
  forms: string[]
  partOfSpeech: PartOfSpeech
  level: Level
  categories: CategoryId[]
  /** Suitable for Kids mode */
  forKids: boolean
  /** Simple meaning that does not use the word itself */
  definition: string
  pronunciation: {
    /** Easy spelling, stressed part in capitals: 'im-PROOV' */
    respelling: string
    /** International Phonetic Alphabet, British English: '/ɪmˈpruːv/' */
    ipa: string
  }
  /** Two or three real sentences that use the word */
  examples: string[]
  /** Words that are often used together with it */
  collocations: string[]
  synonyms?: string[]
  opposites?: string[]
  mistake: {
    wrong: string
    right: string
    why: string
  }
  /** When you would use this word in real life */
  situation: string
  /** Fill-in-the-blank: the sentence has exactly one ___ */
  exercise: {
    sentence: string
    answer: string
    hint: string
  }
}
