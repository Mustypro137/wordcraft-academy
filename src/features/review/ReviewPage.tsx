import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { Highlight } from '../../components/Highlight/Highlight'
import { wordsFor } from '../../data/words'
import { formatDay, localDate } from '../../logic/dates'
import { nextReviewDay, pickReviewItems, type ReviewItem } from '../../logic/reviewSession'
import type { AnswerResult } from '../../logic/spacedRepetition'
import { useActiveProfile, useLearnerStore, useWordStates } from '../../store/learnerStore'
import { ReviewExercise } from './ReviewExercise'
import styles from './ReviewPage.module.css'

interface Session {
  items: ReviewItem[]
  /** How each answered question went, in order */
  results: AnswerResult[]
}

// Review has three screens: start → one question at a time → summary.
export function ReviewPage() {
  const profile = useActiveProfile()
  const states = useWordStates()
  const answerReview = useLearnerStore((s) => s.answerReview)
  const pool = wordsFor(profile)
  const wordsById = new Map(pool.map((w) => [w.id, w]))
  // The questions are chosen once, when the session starts, so answering doesn't change the list
  const [session, setSession] = useState<Session | null>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  const today = localDate(new Date())
  const due = pickReviewItems(states, today, new Set(wordsById.keys()))

  function start() {
    setSession({ items: due, results: [] })
  }

  function answer(result: AnswerResult, typed: boolean) {
    if (!session) return
    answerReview(session.items[session.results.length].wordId, result, typed)
    setSession({ ...session, results: [...session.results, result] })
    // The summary replaces the question, so focus moves to its heading
    if (session.results.length + 1 === session.items.length) requestAnimationFrame(() => titleRef.current?.focus())
  }

  function finishEarly() {
    if (!session) return
    setSession({ ...session, items: session.items.slice(0, session.results.length) })
    requestAnimationFrame(() => titleRef.current?.focus())
  }

  // Question screen
  if (session && session.results.length < session.items.length) {
    const index = session.results.length
    const item = session.items[index]
    const word = wordsById.get(item.wordId)!
    return (
      <article className={styles.page}>
        <title>Review · WordCraft Academy</title>
        <div className={styles.sessionTop}>
          <h1 className={styles.progressLabel}>
            Review · Question {index + 1} of {session.items.length}
          </h1>
          <button type="button" className={`btn btn-secondary ${styles.endButton}`} onClick={finishEarly}>
            End session
          </button>
        </div>
        <progress className={styles.progress} value={index} max={session.items.length} aria-hidden="true" />
        {/* "key" makes React start a fresh question for every word */}
        <ReviewExercise key={index} word={word} kind={item.kind} pool={pool} onAnswer={answer} />
      </article>
    )
  }

  // Summary screen
  if (session) {
    const right = session.results.filter((r) => r !== 'wrong').length
    const next = nextReviewDay(states, today)
    const moreDue = due.length > 0
    const newlyMastered = session.items
      .filter((item) => item.before !== 'mastered' && states[item.wordId]?.collection === 'mastered')
      .map((item) => wordsById.get(item.wordId)?.word)
    return (
      <article className={styles.page}>
        <title>Review done · WordCraft Academy</title>
        <h1 ref={titleRef} tabIndex={-1} className={styles.title}>
          {session.items.length === 0 ? 'Session ended' : 'Well done!'}
        </h1>
        {session.items.length > 0 && (
          <p className={styles.intro}>
            You remembered {right} of {session.items.length} {session.items.length === 1 ? 'word' : 'words'}.
            {right < session.items.length && ' The words you missed come back tomorrow. That is how they stick.'}
          </p>
        )}
        {newlyMastered.length > 0 && (
          <p className={styles.mastered}>
            New Mastered {newlyMastered.length === 1 ? 'word' : 'words'}: <strong>{newlyMastered.join(', ')}</strong>.
            You remembered {newlyMastered.length === 1 ? 'it' : 'them'} on 3 different days, at least a week apart.
          </p>
        )}

        {session.items.length > 0 && (
          <ul className={styles.summary} aria-label="Your answers">
            {session.items.map((item, i) => {
              const now = states[item.wordId]?.collection ?? item.before
              return (
                <li key={item.wordId} className={styles.summaryRow}>
                  <Link to={`/explore/${item.wordId}`} className={styles.summaryWord}>
                    {wordsById.get(item.wordId)?.word}
                  </Link>
                  <span className={styles.outcome} data-result={session.results[i]}>
                    {session.results[i] === 'correct' ? 'Correct' : session.results[i] === 'guessed' ? 'Guessed' : 'Missed'}
                  </span>
                  <span className={styles.change}>
                    {now === item.before ? (
                      <Highlight collection={now} />
                    ) : (
                      <>
                        <Highlight collection={item.before} />
                        <span aria-hidden="true">→</span>
                        <span className="visually-hidden">moved to</span>
                        <Highlight collection={now} />
                      </>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        )}

        <div className={styles.actions}>
          {moreDue ? (
            <button type="button" className="btn" onClick={start}>
              Review {due.length} more {due.length === 1 ? 'word' : 'words'}
            </button>
          ) : (
            next && <p className={styles.intro}>Next review: {formatDay(next)}.</p>
          )}
          <Link to="/words" className="btn btn-secondary">
            My Words
          </Link>
        </div>
      </article>
    )
  }

  // Start screen
  const saved = Object.keys(states).some((id) => wordsById.has(id))
  const next = nextReviewDay(states, today)
  return (
    <article className={styles.page}>
      <title>Review · WordCraft Academy</title>
      <h1 className={styles.title}>Review</h1>
      <p className={styles.intro}>
        Short sessions with the words you saved. Words you find difficult come back sooner; words you remember wait
        longer.
      </p>

      {due.length > 0 ? (
        <div className={styles.startCard}>
          <p className={styles.startCount}>
            {due.length} {due.length === 1 ? 'word' : 'words'} to review today
          </p>
          <p className={styles.small}>About {Math.max(1, Math.round(due.length / 2))} min. Your answers are saved as you go.</p>
          <button type="button" className="btn" onClick={start}>
            Start review
          </button>
        </div>
      ) : (
        <div className={styles.empty}>
          {saved ? (
            <>
              <p className={styles.emptyTitle}>Nothing to review today.</p>
              {next && <p>Your next review is on {formatDay(next)}.</p>}
            </>
          ) : (
            <>
              <p className={styles.emptyTitle}>No words to review yet.</p>
              <p>Mark words on a word page ("I don't know this word" or "I want to practise") and they come here.</p>
            </>
          )}
          <Link to="/explore" className="btn btn-secondary">
            Explore words
          </Link>
        </div>
      )}

      <details className={styles.howItWorks}>
        <summary>How Mastered works</summary>
        <p>
          A word becomes Mastered when you type it correctly without a hint on 3 different days, with at least a week
          between the first and the last. Picking from a list helps you learn, but only typing counts. A wrong answer
          moves a word back to Learning.
        </p>
      </details>
    </article>
  )
}
