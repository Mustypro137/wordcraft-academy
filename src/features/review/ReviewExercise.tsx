import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { checkAnswer, fillBlank } from '../../logic/exercise'
import { choicesFor, type ExerciseKind } from '../../logic/reviewSession'
import type { AnswerResult } from '../../logic/spacedRepetition'
import type { Word } from '../../types'
import exercise from '../explore/WordPage.module.css'
import styles from './ReviewPage.module.css'

interface Props {
  word: Word
  kind: ExerciseKind
  /** Words to pick wrong options from, for "choice" */
  pool: Word[]
  /** Called when the learner presses Next. `typed` = typed without help. */
  onAnswer: (result: AnswerResult, typed: boolean) => void
}

// One review question. The learner answers, sees how it went, then presses Next.
// Nothing is saved until Next, so "I guessed it" can still change the result.
export function ReviewExercise({ word, kind, pool, onAnswer }: Props) {
  const [result, setResult] = useState<AnswerResult | null>(null)
  const headingRef = useRef<HTMLParagraphElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  // A new question starts with keyboard focus on the question itself
  useEffect(() => {
    headingRef.current?.focus()
  }, [])
  // Once answered, focus goes to Next, so Enter moves on
  useEffect(() => {
    if (result) nextRef.current?.focus()
  }, [result])

  const typed = kind !== 'choice'

  return (
    <div className={exercise.exercise}>
      <p ref={headingRef} tabIndex={-1} className={styles.question}>
        {kind === 'choice' && 'Which word means this?'}
        {kind === 'fill' && 'Complete the sentence.'}
        {kind === 'recall' && 'Type the word that means this. No hints this time.'}
      </p>

      {kind === 'choice' && <ChoiceQuestion word={word} pool={pool} result={result} onResult={setResult} />}
      {kind !== 'choice' && <TypedQuestion word={word} kind={kind} result={result} onResult={setResult} />}

      {result && (
        <div className={styles.after}>
          <p className={styles.meaning}>
            <span className={styles.meaningWord}>{word.word}</span> means {lowerFirst(word.definition)}
          </p>
          <div className={exercise.exerciseActions}>
            <button ref={nextRef} type="button" className="btn" onClick={() => onAnswer(result, typed && result === 'correct')}>
              Next
            </button>
            {result === 'correct' && (
              <button type="button" className="btn btn-secondary" onClick={() => setResult('guessed')}>
                I guessed it
              </button>
            )}
          </div>
          {result === 'guessed' && (
            <p className={styles.small}>Thanks for being honest. This word will come back at the same pace.</p>
          )}
        </div>
      )}
    </div>
  )
}

function lowerFirst(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1)
}

interface QuestionProps {
  word: Word
  result: AnswerResult | null
  onResult: (result: AnswerResult) => void
}

/** Pick the word for a meaning from four. One try: recognizing is the easy step. */
function ChoiceQuestion({ word, pool, result, onResult }: QuestionProps & { pool: Word[] }) {
  // Mixed once per question, so the buttons don't jump around on every render
  const choices = useMemo(() => choicesFor(word, pool, Math.random), [word, pool])
  const [picked, setPicked] = useState<string | null>(null)

  return (
    <>
      <p className={styles.definition}>{word.definition}</p>
      <div className={styles.choices} role="group" aria-label="Choose a word">
        {choices.map((choice) => {
          const isAnswer = choice.id === word.id
          const mark = result && isAnswer ? 'right' : picked === choice.id && !isAnswer ? 'wrong' : undefined
          return (
            <button
              key={choice.id}
              type="button"
              className={styles.choice}
              data-mark={mark}
              disabled={result !== null}
              onClick={() => {
                setPicked(choice.id)
                onResult(isAnswer ? 'correct' : 'wrong')
              }}
            >
              {choice.word}
              {mark === 'right' && <span className="visually-hidden"> (the right answer)</span>}
              {mark === 'wrong' && <span className="visually-hidden"> (your answer)</span>}
            </button>
          )
        })}
      </div>
      <div aria-live="polite" className={exercise.feedback}>
        {result === 'correct' && (
          <p className={exercise.correct}>
            <strong>Correct!</strong>
          </p>
        )}
        {result === 'wrong' && (
          <p>
            Not this time. The answer is <strong>{word.word}</strong>.
          </p>
        )}
      </div>
    </>
  )
}

/**
 * Type the answer: in a sentence ("fill", a hint is allowed) or from the meaning ("recall", no hint).
 * Right on the first try with no hint = correct. Right after a hint or a second try = guessed.
 * Showing the answer = wrong, so the word comes back tomorrow.
 */
function TypedQuestion({ word, kind, result, onResult }: QuestionProps & { kind: 'fill' | 'recall' }) {
  const { sentence, answer: fillAnswer, hint } = word.exercise
  const { before, after, filled } = fillBlank(sentence, fillAnswer)
  // In recall, any form of the word is fine: "improve" or "improved"
  const answers = kind === 'fill' ? [fillAnswer] : [word.word, ...word.forms]
  const [input, setInput] = useState('')
  const [tries, setTries] = useState(0)
  const [lastWrong, setLastWrong] = useState(false)
  const [showHint, setShowHint] = useState(false)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (result || input.trim() === '') return
    if (answers.some((a) => checkAnswer(input, a))) {
      onResult(tries === 0 && !showHint ? 'correct' : 'guessed')
    } else {
      setTries((n) => n + 1)
      setLastWrong(true)
    }
  }

  const field = (
    <input
      id="review-answer"
      className={kind === 'fill' ? exercise.blank : `input ${styles.recallInput}`}
      value={input}
      onChange={(e) => {
        setInput(e.target.value)
        setLastWrong(false)
      }}
      readOnly={result !== null}
      autoComplete="off"
      autoCapitalize="none"
      spellCheck={false}
      size={kind === 'fill' ? Math.max(fillAnswer.length, 6) : undefined}
      aria-invalid={lastWrong || undefined}
      aria-describedby="review-feedback"
    />
  )

  const fullSentence = `${before}${filled}${after}`

  return (
    <form onSubmit={handleSubmit} className={styles.typed}>
      {kind === 'fill' ? (
        <p className={exercise.sentence}>
          {before}
          <label htmlFor="review-answer" className="visually-hidden">
            Missing word
          </label>
          {field}
          {after}
        </p>
      ) : (
        <>
          <p className={styles.definition}>
            {word.definition} <span className={styles.small}>({word.partOfSpeech})</span>
          </p>
          <label htmlFor="review-answer" className="visually-hidden">
            The word
          </label>
          {field}
        </>
      )}

      <div id="review-feedback" aria-live="polite" className={exercise.feedback}>
        {result === 'correct' && (
          <p className={exercise.correct}>
            <strong>Correct!</strong> {kind === 'fill' && `“${fullSentence}”`}
          </p>
        )}
        {result === 'guessed' && (
          <p className={exercise.correct}>
            <strong>Right!</strong> {kind === 'fill' && `“${fullSentence}”`}
          </p>
        )}
        {result === 'wrong' && (
          <p>
            The answer is <strong>{kind === 'fill' ? fillAnswer : word.word}</strong>
            {kind === 'fill' && `: “${fullSentence}”`}. It will come back tomorrow.
          </p>
        )}
        {!result && lastWrong && <p>Not quite. Try again{kind === 'fill' && !showHint ? ', or ask for a hint' : ''}.</p>}
        {!result && showHint && (
          <p>
            <strong>Hint:</strong> {hint}
          </p>
        )}
      </div>

      {!result && (
        <div className={exercise.exerciseActions}>
          <button type="submit" className="btn">
            Check
          </button>
          {kind === 'fill' && !showHint ? (
            <button type="button" className="btn btn-secondary" onClick={() => setShowHint(true)}>
              Give me a hint
            </button>
          ) : (
            <button type="button" className="btn btn-secondary" onClick={() => onResult('wrong')}>
              Show the answer
            </button>
          )}
        </div>
      )}
    </form>
  )
}
