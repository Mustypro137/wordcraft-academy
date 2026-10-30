import type { CategoryId } from '../types'

// Display names for the vocabulary categories, in the order they are shown.
export const categories: Record<CategoryId, string> = {
  everyday: 'Everyday English',
  'common-verbs': 'Common verbs',
  'common-nouns': 'Common nouns',
  adjectives: 'Adjectives',
  adverbs: 'Adverbs',
  conversation: 'Natural conversation',
  communication: 'Communication',
  'professional-writing': 'Professional writing',
  business: 'Business English',
  'web-development': 'Web development',
  programming: 'Programming',
  'ui-ux': 'UI/UX design',
  ai: 'AI and artificial intelligence',
  'prompt-engineering': 'Prompt engineering',
  'claude-code': 'Claude Code',
  'vibe-coding': 'Vibe coding',
  freelancing: 'Freelancing and client communication',
  technology: 'Technology',
}
