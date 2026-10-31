import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { sentencePatterns } from '../../data/sentences'
import { wordsFor } from '../../data/words'
import { exercisesFor, LESSON_EXERCISES, STAGE_NAMES, STAGES } from '../../logic/sentences'
import { useActiveProfile, useLearnerStore, useSentenceProgress, useWordStates } from '../../store/learnerStore'
import { NotFoundPage } from '../placeholder/NotFoundPage'
import { PatternShape, StageDots } from './PatternParts'
import { TileExercise } from './TileExercise'
import { WriteExercise } from './WriteExercise'
import styles from './Sentences.module.css'

const patternsById = new Map(sentencePatterns.map((p) => [p.id, p]))

/** Exercises 0–1 are "Build it", 2–3 "Finish it", then "Write your own" */
function stageOf(step: number) {
  return step < LESSON_EXERCISES / 2 ? 0 : step < LESSON_EXERCISES ? 1 : 2
}

// "key" gives every pattern a fresh lesson, so moving to the next pattern starts at the beginning
export function SentenceLessonPage() {
  const { patternId = '' } = useParams()
  return <Lesson key={patternId} patternId={patternId} />
}

// One pattern: learn it (shape, when to use it, examples), then practise it in three stages.
function Lesson({ patternId }: { patternId: string }) {
  const profile = useActiveProfile()
  const states = useWordStates()
  const progress = useSentenceProgress()
  const practiseSentence = useLearnerStore((s) => s.practiseSentence)
  // null = not practising yet; 0–3 = tile exercises; 4 = write your own; 5 = finished
  const [step, setStep] = useState<number | null>(null)
  const practiceRef = useRef<HTMLHeadingElement>(null)

  const pattern = patternsById.get(patternId)
  if (!pattern || !profile) return <NotFoundPage />

  const exercises = exercisesFor(pattern, profile.ageGroup)
  const best = progress[pattern.id] ?? 0
  const back = { path: `/sentences/${pattern.id}`, label: pattern.title }
  const index = sentencePatterns.indexOf(pattern)
  const nextPattern = sentencePatterns[index + 1]

  // Up to 3 words the learner is learning, most recently saved first, to try in "Write your own"
  const pool = new Map(wordsFor(profile).map((w) => [w.id, w]))
  const suggestions = Object.entries(states)
    .filter(([id, s]) => (s.collection === 'learning' || s.collection === 'unfamiliar') && pool.has(id))
    .sort(([, a], [, b]) => b.changedAt.localeCompare(a.changedAt))
    .slice(0, 3)
    .map(([id]) => pool.get(id)!)

  function go(next: number) {
    setStep(next)
    // The new exercise replaces the old one, so focus moves to the practice heading
    requestAnimationFrame(() => practiceRef.current?.focus())
  }

  function finishExercise() {
    const current = step!
    // The last exercise of a stage completes that stage
    const completes = current === LESSON_EXERCISES / 2 - 1 ? 1 : current === LESSON_EXERCISES - 1 ? 2 : undefined
    practiseSentence(pattern!.id, completes)
    go(current + 1)
  }

  function finishWriting() {
    practiseSentence(pattern!.id, STAGES)
    go(LESSON_EXERCISES + 1)
  }

  return (
    <article className={styles.page}>
      <title>{`${pattern.title} · Sentence Builder · WordCraft Academy`}</title>
      <Link to="/sentences" className={styles.back}>
        ← Back to Sentence Builder
      </Link>

      <header className={styles.lessonHeader}>
        <h1 className={styles.title}>{pattern.title}</h1>
        <PatternShape pattern={pattern} />
        <p className={styles.intro}>{pattern.whenToUse}</p>
      </header>

      <section aria-labelledby="examples" className={styles.examples}>
        <h2 id="examples" className={styles.heading}>
          Examples
        </h2>
        <ul>
          {pattern.examples.map((example) => (
            <li key={example}>{example}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="practice" className={styles.practice}>
        <div className={styles.practiceTop}>
          <h2 id="practice" ref={practiceRef} tabIndex={-1} className={styles.heading}>
            {step === null
              ? 'Practice'
              : step > LESSON_EXERCISES
                ? 'Lesson done'
                : `${STAGE_NAMES[stageOf(step)]}${step < LESSON_EXERCISES ? ` · ${(step % 2) + 1} of 2` : ''}`}
          </h2>
          <StageDots done={best} />
        </div>

        {step === null && (
          <div className={styles.startPractice}>
            <ol className={styles.stageList}>
              <li>
                <strong>Build it:</strong> put word tiles in order.
                {best < 1 && ' The first word is placed for you.'}
              </li>
              <li>
                <strong>Finish it:</strong> build the sentence on your own. Hints only if you ask.
              </li>
              <li>
                <strong>Write your own:</strong> use the pattern in a sentence of your own.
              </li>
            </ol>
            <div>
              <button type="button" className="btn" onClick={() => go(0)}>
                {best === 0 ? 'Start practice' : 'Practise again'}
              </button>
            </div>
          </div>
        )}

        {step !== null && step < LESSON_EXERCISES && (
          <TileExercise
            key={step}
            exercise={exercises[step]}
            // Hints fade: the first tile is placed only the first time, in "Build it"
            placeFirst={stageOf(step) === 0 && best < 1}
            back={back}
            onNext={finishExercise}
          />
        )}

        {step === LESSON_EXERCISES && (
          <WriteExercise pattern={pattern} suggestions={suggestions} back={back} onDone={finishWriting} />
        )}

        {step !== null && step > LESSON_EXERCISES && (
          <div className={styles.startPractice}>
            <p>
              You built {LESSON_EXERCISES} sentences with <strong>{pattern.title}</strong> and wrote one of your own.
              Try it in a real message today.
            </p>
            <div className={styles.actions}>
              {nextPattern && (
                <Link to={`/sentences/${nextPattern.id}`} className="btn">
                  Next pattern: {nextPattern.title}
                </Link>
              )}
              <Link to="/sentences" className="btn btn-secondary">
                All patterns
              </Link>
            </div>
          </div>
        )}
      </section>
    </article>
  )
}
