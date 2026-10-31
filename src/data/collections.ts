import type { Collection } from '../types'

// How each personal collection is named and explained, in My Words order.
export const collections: { id: Collection; label: string; empty: string }[] = [
  {
    id: 'unfamiliar',
    label: 'Unfamiliar',
    empty: 'Press "I don\'t know this word" on a word page and the word is saved here automatically.',
  },
  {
    id: 'learning',
    label: 'Learning',
    empty: 'Words you have seen before, or want to practise, are kept here.',
  },
  {
    id: 'known',
    label: 'Known',
    empty: 'Words you already know are kept here.',
  },
  {
    id: 'mastered',
    label: 'Mastered',
    empty:
      'You earn Mastered in Review: remember a word correctly without hints on 3 different days, at least a week apart.',
  },
]

export const collectionLabel = Object.fromEntries(collections.map((c) => [c.id, c.label])) as Record<
  Collection,
  string
>
