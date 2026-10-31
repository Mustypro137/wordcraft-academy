import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { markWord } from '../../logic/exercise'
import { checkOwnSentence } from '../../logic/sentences'
import type { SentencePattern, Word } from '../../types'
import styles from './Sentences.module.css'

interface Props {
  pattern: SentencePattern
  /** A few words the learner is learning, to try in the sentence */
  suggestions: Word[]
  back: { path: string; label: string }
  onDone: () => void
}

function uses(text: string, word: Word) {
  return markWord(text, word).some((part) => part.isWord)
}

// Write your own sentence with the pattern. The app checks the basics,
// then shows examples to compare with. It never rewrites the learner's sentence.
export function WriteExercise({ pattern, suggestions, back, onDone }: Props) {
  const [text, setText] = useState('')
  const [tips, setTips] = useState<string[] | null>(null)
  const [accepted, setAccepted] = useState<string | null>(null)
  const doneRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (accepted) doneRef.current?.focus()
  }, [accepted])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (text.trim() === '') return
    const found = checkOwnSentence(text, pattern)
    setTips(found)
    if (found.length === 0) setAccepted(text.trim())
  }

  const used = accepted ? suggestions.filter((w) => uses(accepted, w)) : []

  return (
    <form className={styles.practiceCard} onSubmit={handleSubmit}>
      <p className={styles.situation}>{pattern.writePrompt}</p>

      {suggestions.length > 0 && !accepted && (
        <div className={styles.suggestions}>
          <p className={styles.small}>Want a challenge? Try to use one of your words:</p>
          <ul>
            {suggestions.map((word) => (
              <li key={word.id}>
                <span className={styles.suggestionWord}>{word.word}</span>{' '}
                <span className={styles.small}>{word.definition}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <label htmlFor="own-sentence" className="visually-hidden">
        Your sentence
      </label>
      <textarea
        id="own-sentence"
        className={`input ${styles.writeBox}`}
        rows={3}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          if (tips) setTips(null)
        }}
        readOnly={accepted !== null}
        aria-describedby="own-feedback"
        aria-invalid={(tips && tips.length > 0) || undefined}
        placeholder={pattern.shape.map((p) => (p.slot ? '…' : p.text)).join(' ')}
      />

      <div id="own-feedback" aria-live="polite" className={styles.feedback}>
        {tips && tips.length > 0 && (
          <>
            <p>Almost there. Small things to fix:</p>
            <ul className={styles.tips}>
              {tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </>
        )}
        {accepted && (
          <>
            <p className={styles.correct}>
              <strong>Well done!</strong> You used the pattern in your own sentence.
            </p>
            {used.length > 0 && (
              <p>
                You used {used.length === 1 ? 'one of your words' : 'your words'}:{' '}
                {used.map((w, i) => (
                  <span key={w.id}>
                    {i > 0 && ', '}
                    <Link to={`/explore/${w.id}`} state={{ back }} className={styles.wordLink}>
                      {w.word}
                    </Link>
                  </span>
                ))}
                . That is how new words stick.
              </p>
            )}
          </>
        )}
      </div>

      {accepted && (
        <div className={styles.compare}>
          <p className={styles.small}>Compare with these examples. Is yours natural too?</p>
          <ul>
            {pattern.examples.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
          <p className={styles.small}>
            This check looks at the pattern, capitals and punctuation only. It can’t judge every grammar point.
          </p>
        </div>
      )}

      <div className={styles.actions}>
        {accepted ? (
          <button ref={doneRef} type="button" className="btn" onClick={onDone}>
            Finish the lesson
          </button>
        ) : (
          <button type="submit" className="btn">
            Check my sentence
          </button>
        )}
      </div>
    </form>
  )
}
