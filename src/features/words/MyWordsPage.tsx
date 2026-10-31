import { Link, useSearchParams } from 'react-router'
import { ChoiceGroup } from '../../components/ChoiceGroup/ChoiceGroup'
import { UndoStatus } from '../../components/UndoStatus/UndoStatus'
import { useUndoableKnowledge } from '../../components/UndoStatus/useUndoableKnowledge'
import { collectionLabel, collections } from '../../data/collections'
import { words } from '../../data/words'
import { actionFor, countByCollection, wordsIn } from '../../logic/wordStates'
import { useWordStates } from '../../store/learnerStore'
import type { Collection } from '../../types'
import type { BackLink } from '../explore/WordPage'
import styles from './MyWordsPage.module.css'

const wordsById = new Map(words.map((w) => [w.id, w]))

/** The collections you can move a word to by hand (Mastered is earned in Review) */
const movable = ['unfamiliar', 'learning', 'known'] as const

function isCollection(value: string | null): value is Collection {
  return collections.some((c) => c.id === value)
}

export function MyWordsPage() {
  const states = useWordStates()
  const knowledge = useUndoableKnowledge()
  // The open collection lives in the address (?c=learning), so Back returns to it
  const [params, setParams] = useSearchParams()
  const c = params.get('c')
  const open: Collection = isCollection(c) ? c : 'unfamiliar'

  const counts = countByCollection(states)
  // Skip saved ids that are no longer in the word list
  const list = wordsIn(states, open).flatMap((id) => wordsById.get(id) ?? [])
  const empty = collections.find((x) => x.id === open)?.empty
  const backLink: BackLink = { path: `/words?c=${open}`, label: 'My Words' }

  function move(wordId: string, to: (typeof movable)[number]) {
    knowledge.apply(wordId, actionFor[to], `"${wordsById.get(wordId)?.word}" moved to ${collectionLabel[to]}.`)
    // The word leaves this list, and its menu with it, so keyboard focus goes to the message
    knowledge.statusRef.current?.focus()
  }

  return (
    <article className={styles.page}>
      <title>My Words · WordCraft Academy</title>
      <h1 className={styles.title}>My Words</h1>
      <p className={styles.intro}>
        Every word you mark on a word page is kept here. Move a word whenever your feeling about it changes.
      </p>

      <ChoiceGroup
        legend="Collection"
        hideLegend
        layout="inline"
        options={collections.map((x) => ({ value: x.id, label: `${x.label} (${counts[x.id]})` }))}
        value={open}
        onChange={(value) => {
          knowledge.clear()
          setParams({ c: value }, { replace: true })
        }}
      />

      <UndoStatus
        message={knowledge.message}
        onUndo={knowledge.canUndo ? knowledge.undo : undefined}
        statusRef={knowledge.statusRef}
      />

      {list.length > 0 ? (
        <ul className={styles.list} aria-label={`${collectionLabel[open]} words`}>
          {list.map((word) => (
            <li key={word.id} className={styles.row}>
              <Link to={`/explore/${word.id}`} state={{ back: backLink }} className={styles.wordLink}>
                <span className={styles.word}>{word.word}</span>
                <span className={styles.definition}>{word.definition}</span>
              </Link>
              {open !== 'mastered' && (
                <label className={styles.move}>
                  <span className="visually-hidden">Move "{word.word}" to</span>
                  <select
                    className="input"
                    value=""
                    onChange={(e) => move(word.id, e.target.value as (typeof movable)[number])}
                  >
                    <option value="" disabled>
                      Move to…
                    </option>
                    {movable
                      .filter((to) => to !== open)
                      .map((to) => (
                        <option key={to} value={to}>
                          {collectionLabel[to]}
                        </option>
                      ))}
                  </select>
                </label>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No {collectionLabel[open].toLowerCase()} words yet.</p>
          <p>{empty}</p>
          {open !== 'mastered' && (
            <Link to="/explore" className="btn btn-secondary">
              Explore words
            </Link>
          )}
        </div>
      )}
    </article>
  )
}
