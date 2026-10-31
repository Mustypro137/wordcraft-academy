import { useState, type FormEvent } from 'react'
import { checkAnswer, splitBlank } from '../../logic/exercise'
import type { Word } from '../../types'
import styles from './WordPage.module.css'

type Result = 'none' | 'correct' | 'wrong'

// Fill in the blank. The learner tries first; a hint comes before the answer.
// (This practice does not count towards mastery. Review does, from Step 8.)
export function WordExercise({ word }: { word: Word }) {
  const { sentence, answer, hint } = word.exercise
  const [before, after] = splitBlank(sentence)
  // At the start of a sentence the answer needs a capital: "Thanks! By the way, …"
  const startsSentence = /(^|[.!?])\s*$/.test(before)
  const filled = startsSentence ? answer.charAt(0).toUpperCase() + answer.slice(1) : answer
  const [input, setInput] = useState('')
  const [result, setResult] = useState<Result>('none')
  const [showHint, setShowHint] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (input.trim() === '') return
    setResult(checkAnswer(input, answer) ? 'correct' : 'wrong')
  }

  const done = result === 'correct' || showAnswer

  return (
    <form className={styles.exercise} onSubmit={handleSubmit}>
      <p className={styles.task}>Complete the sentence.</p>
      <p className={styles.sentence}>
        {before}
        <label htmlFor="exercise-answer" className="visually-hidden">
          Missing word
        </label>
        <input
          id="exercise-answer"
          className={styles.blank}
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            if (result === 'wrong') setResult('none')
          }}
          readOnly={done}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          size={Math.max(answer.length, 6)}
          aria-invalid={result === 'wrong' || undefined}
          aria-describedby="exercise-feedback"
        />
        {after}
      </p>

      <div id="exercise-feedback" aria-live="polite" className={styles.feedback}>
        {result === 'correct' && (
          <p className={styles.correct}>
            <strong>Correct!</strong> “{before}
            {filled}
            {after}”
          </p>
        )}
        {result === 'wrong' && !showAnswer && <p>Not quite. Try again{showHint ? '.' : ', or ask for a hint.'}</p>}
        {showHint && !done && (
          <p>
            <strong>Hint:</strong> {hint}
          </p>
        )}
        {showAnswer && result !== 'correct' && (
          <p>
            The answer is <strong>{answer}</strong>: “{before}
            {filled}
            {after}”
          </p>
        )}
      </div>

      {!done && (
        <div className={styles.exerciseActions}>
          <button type="submit" className="btn">
            Check
          </button>
          {!showHint ? (
            <button type="button" className="btn btn-secondary" onClick={() => setShowHint(true)}>
              Give me a hint
            </button>
          ) : (
            <button type="button" className="btn btn-secondary" onClick={() => setShowAnswer(true)}>
              Show the answer
            </button>
          )}
        </div>
      )}
      {done && (
        <div className={styles.exerciseActions}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setInput('')
              setResult('none')
              setShowHint(false)
              setShowAnswer(false)
            }}
          >
            Try again
          </button>
        </div>
      )}
    </form>
  )
}
