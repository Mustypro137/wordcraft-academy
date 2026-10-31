import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Highlight } from '../../components/Highlight/Highlight'
import { categories } from '../../data/categories'
import { collections } from '../../data/collections'
import { levelLabel, wordLevelsFor } from '../../data/levels'
import { levelOptions } from '../../data/profileOptions'
import { words } from '../../data/words'
import { searchWords } from '../../logic/wordSearch'
import { useActiveProfile, useWordStates } from '../../store/learnerStore'
import type { CategoryId, Collection, LearningLevel } from '../../types'
import styles from './ExplorePage.module.css'
import type { BackLink } from './WordPage'

// Only categories that have at least one word, in the usual order
const usedCategories = (Object.keys(categories) as CategoryId[]).filter((id) =>
  words.some((w) => w.categories.includes(id)),
)

export function ExplorePage() {
  const profile = useActiveProfile()
  // Search and filters live in the address (?q=…&level=…&category=…),
  // so the Back button and bookmarks keep them.
  const [params, setParams] = useSearchParams()
  // The typed text lives in the page first, so fast typing never loses letters;
  // the address is updated after each change.
  const [query, setQuery] = useState(params.get('q') ?? '')
  const level = (params.get('level') ?? '') as LearningLevel | ''
  const category = (params.get('category') ?? '') as CategoryId | ''
  // '' = all words, 'new' = not in My Words yet, or one collection
  const mine = (params.get('mine') ?? '') as Collection | 'new' | ''
  const states = useWordStates()

  function setParam(key: string, value: string) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      // Typing replaces the address instead of adding a Back step per letter
      { replace: key === 'q' },
    )
  }

  const isKids = profile?.ageGroup === 'kids'
  const available = isKids ? words.filter((w) => w.forKids) : words
  const results = searchWords(available, query).filter(
    (w) =>
      (!level || wordLevelsFor[level].includes(w.level)) &&
      (!category || w.categories.includes(category)) &&
      (!mine || (mine === 'new' ? !states[w.id] : states[w.id]?.collection === mine)),
  )
  const hasFilters = Boolean(query || level || category || mine)
  // A word page's "Back" returns here with the same search and filters
  const backLink: BackLink = { path: params.size ? `/explore?${params}` : '/explore', label: 'Explore' }

  function clearAll() {
    setQuery('')
    setParams({})
  }

  return (
    <article className={styles.page}>
      <title>Explore · WordCraft Academy</title>
      <h1 className={styles.title}>Explore</h1>
      <p className={styles.intro}>
        Look up a word, or describe what you mean in simple words. For example, try <em>make better</em> or{' '}
        <em>say sorry</em>.
      </p>

      <search className={styles.filters}>
        <div className={`field ${styles.searchField}`}>
          <label htmlFor="explore-q" className="field-label">
            Find a word
          </label>
          <input
            id="explore-q"
            type="search"
            className="input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setParam('q', e.target.value)
            }}
            placeholder="A word, or what you mean"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className="field">
          <label htmlFor="explore-level" className="field-label">
            Level
          </label>
          <select
            id="explore-level"
            className="input"
            value={level}
            onChange={(e) => setParam('level', e.target.value)}
          >
            <option value="">All levels</option>
            {levelOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="explore-category" className="field-label">
            Topic
          </label>
          <select
            id="explore-category"
            className="input"
            value={category}
            onChange={(e) => setParam('category', e.target.value)}
          >
            <option value="">All topics</option>
            {usedCategories.map((id) => (
              <option key={id} value={id}>
                {categories[id]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="explore-mine" className="field-label">
            My Words
          </label>
          <select id="explore-mine" className="input" value={mine} onChange={(e) => setParam('mine', e.target.value)}>
            <option value="">All words</option>
            <option value="new">Not in My Words yet</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </search>

      <div className={styles.status}>
        <p aria-live="polite">
          {results.length === 1 ? '1 word' : `${results.length} words`}
          {isKids && ' for kids'}
        </p>
        {hasFilters && (
          <button type="button" className={styles.clear} onClick={clearAll}>
            Clear search and filters
          </button>
        )}
      </div>

      {results.length > 0 ? (
        <ul className={styles.list}>
          {results.map((word) => (
            <li key={word.id}>
              <Link to={`/explore/${word.id}`} state={{ back: backLink }} className={styles.row}>
                <span className={styles.rowTop}>
                  <span className={styles.word}>{word.word}</span>
                  <span className={styles.meta}>
                    {word.partOfSpeech} · {levelLabel(word.level)}
                  </span>
                  {states[word.id] && <Highlight collection={states[word.id].collection} />}
                </span>
                <span className={styles.definition}>{word.definition}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No words match {query ? `"${query}"` : 'these filters'}.</p>
          <p>
            Try fewer words, a simpler way to say it, or{' '}
            <button type="button" className={styles.inlineButton} onClick={clearAll}>
              clear the search and filters
            </button>
            .
          </p>
        </div>
      )}

      {isKids && <p className={styles.note}>This is a Kids profile, so only words chosen for kids are shown.</p>}
    </article>
  )
}
