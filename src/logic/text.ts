// Small text helpers shared by search, exercises and highlighting.

/** Lowercase, trimmed, single spaces, no punctuation except ' and - */
export function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^\p{L}\p{N}'\- ]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** True if `phrase` appears in `text` as whole words (both already normalized) */
export function containsPhrase(text: string, phrase: string) {
  return new RegExp(`(^|[^\\p{L}])${escapeRegExp(phrase)}($|[^\\p{L}])`, 'u').test(text)
}
