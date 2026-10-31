import { useState } from 'react'
import { Link } from 'react-router'
import { splitTerms } from '../../logic/developer'
import type { TechSentence, Word } from '../../types'
import styles from './Developer.module.css'

interface Props {
  sentence: TechSentence
  wordsById: Map<string, Word>
  back: { path: string; label: string }
}

// A real developer sentence. Tap a technical word to see what it means here,
// or open every meaning at once, and read the same idea in plain English.
export function BreakDown({ sentence, wordsById, back }: Props) {
  const ids = Object.keys(sentence.terms)
  const [open, setOpen] = useState<string[]>([])
  const [showPlain, setShowPlain] = useState(false)
  const parts = splitTerms(
    sentence.text,
    ids.map((id) => wordsById.get(id)!),
  )

  const toggle = (id: string) => setOpen(open.includes(id) ? open.filter((x) => x !== id) : [...open, id])
  const allOpen = open.length === ids.length

  return (
    <li className={styles.breakdown}>
      <p className={styles.kind}>{sentence.kind}</p>
      <p className={styles.techSentence}>
        {parts.map((part, i) =>
          part.wordId ? (
            <button
              key={i}
              type="button"
              className={styles.term}
              aria-expanded={open.includes(part.wordId)}
              onClick={() => toggle(part.wordId!)}
            >
              {part.text}
            </button>
          ) : (
            <span key={i}>{part.text}</span>
          ),
        )}
      </p>

      {open.length > 0 && (
        <ul className={styles.meanings} aria-live="polite">
          {/* In sentence order, so the meanings read like the sentence */}
          {ids
            .filter((id) => open.includes(id))
            .map((id) => (
              <li key={id}>
                <Link to={`/explore/${id}`} state={{ back }} className={styles.meaningWord}>
                  {wordsById.get(id)!.word}
                </Link>{' '}
                = {sentence.terms[id]}
              </li>
            ))}
        </ul>
      )}

      {showPlain && (
        <p className={styles.plain}>
          <span className={styles.small}>In plain English: </span>
          {sentence.plain}
        </p>
      )}

      <div className={styles.actions}>
        <button type="button" className="btn btn-secondary" onClick={() => setOpen(allOpen ? [] : ids)}>
          {allOpen ? 'Hide the meanings' : 'Break it down'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => setShowPlain(!showPlain)} aria-expanded={showPlain}>
          {showPlain ? 'Hide plain English' : 'Say it simply'}
        </button>
      </div>
    </li>
  )
}
