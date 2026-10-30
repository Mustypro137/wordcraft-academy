import type { IconName } from '../Icon'

// Every section of the app, in sidebar order. The sidebar, the phone tabs,
// the More page and the routes in App.tsx all read this one list.
export interface Section {
  path: string
  label: string
  /** Shorter name for the narrow icon rail and phone tabs */
  shortLabel: string
  icon: IconName
  group: 'Learn' | 'Practice' | 'Write' | 'Academies' | 'Track' | null
  /** The roadmap step that builds this page (docs/PLAN.md); null = not scheduled yet */
  step: number | null
  summary: string
}

export const sections: Section[] = [
  {
    path: '/',
    label: 'Today',
    shortLabel: 'Today',
    icon: 'today',
    group: null,
    step: 9,
    summary: 'Your plan for today: words to review, your daily goal and the word of the day.',
  },
  {
    path: '/explore',
    label: 'Explore',
    shortLabel: 'Explore',
    icon: 'explore',
    group: 'Learn',
    step: 6,
    summary: "Browse useful words by topic and level, or describe a word you can't remember and find it.",
  },
  {
    path: '/words',
    label: 'My Words',
    shortLabel: 'Words',
    icon: 'words',
    group: 'Learn',
    step: 7,
    summary: 'Your four collections: Unfamiliar, Learning, Known and Mastered words.',
  },
  {
    path: '/review',
    label: 'Review',
    shortLabel: 'Review',
    icon: 'review',
    group: 'Practice',
    step: 8,
    summary: 'Short review sessions. Words you find difficult come back more often.',
  },
  {
    path: '/sentences',
    label: 'Sentence Builder',
    shortLabel: 'Sentences',
    icon: 'sentences',
    group: 'Practice',
    step: 10,
    summary: 'Build natural sentences with word tiles and common sentence starters.',
  },
  {
    path: '/write',
    label: 'Writing Studio',
    shortLabel: 'Write',
    icon: 'write',
    group: 'Write',
    step: 11,
    summary: "Write real messages. Can't find a word? Mark it like ??this?? and get a hint first.",
  },
  {
    path: '/developer',
    label: 'Developer English',
    shortLabel: 'Developer',
    icon: 'developer',
    group: 'Academies',
    step: 12,
    summary: 'The words developers use in code, project requirements and prompts for Claude Code.',
  },
  {
    path: '/progress',
    label: 'Progress',
    shortLabel: 'Progress',
    icon: 'progress',
    group: 'Track',
    step: null,
    summary: 'See how your words move from Unfamiliar to Mastered, and where to practise next.',
  },
  {
    path: '/settings',
    label: 'Settings',
    shortLabel: 'Settings',
    icon: 'settings',
    group: 'Track',
    step: 5,
    summary: 'Profiles, theme, text size and a backup of your data.',
  },
]

// Phone tabs: five slots. Each tab stays highlighted for all the pages it covers.
export const phoneTabs: { label: string; path: string; icon: IconName; covers: string[] }[] = [
  { label: 'Today', path: '/', icon: 'today', covers: ['/'] },
  { label: 'Words', path: '/words', icon: 'words', covers: ['/words', '/explore'] },
  { label: 'Practice', path: '/review', icon: 'review', covers: ['/review', '/sentences'] },
  { label: 'Write', path: '/write', icon: 'write', covers: ['/write'] },
  { label: 'More', path: '/more', icon: 'more', covers: ['/more', '/developer', '/progress', '/settings'] },
]
