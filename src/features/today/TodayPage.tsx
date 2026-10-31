import { Link } from 'react-router'
import { collections } from '../../data/collections'
import { wordsFor } from '../../data/words'
import { streak } from '../../logic/activity'
import { wordOfTheDay } from '../../logic/dailyWord'
import { formatDay, localDate } from '../../logic/dates'
import { nextReviewDay, pickReviewItems } from '../../logic/reviewSession'
import { countByCollection } from '../../logic/wordStates'
import { useActiveProfile, useActivity, useWordStates } from '../../store/learnerStore'
import type { BackLink } from '../explore/WordPage'
import styles from './TodayPage.module.css'

function greeting(hour: number) {
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
}

const backLink: BackLink = { path: '/', label: 'Today' }

// The home page: what to do today, at a glance.
export function TodayPage() {
  const profile = useActiveProfile()
  const states = useWordStates()
  const activity = useActivity()
  if (!profile) return null

  const now = new Date()
  const today = localDate(now)
  const pool = wordsFor(profile)
  const due = pickReviewItems(states, today, new Set(pool.map((w) => w.id))).length
  const next = nextReviewDay(states, today)
  const done = activity[today] ?? 0
  const goal = profile.dailyGoal
  const days = streak(activity, today)
  const word = wordOfTheDay(pool, states, today, profile.id)
  const counts = countByCollection(states)
  const total = collections.reduce((sum, c) => sum + counts[c.id], 0)

  return (
    <article className={styles.page}>
      <title>Today · WordCraft Academy</title>
      <header className={styles.top}>
        <h1 className={styles.title}>
          {greeting(now.getHours())}, {profile.name}
        </h1>
        {days > 0 && (
          <p className={styles.streak}>
            {days}-day streak{!activity[today] && ' · practise today to keep it'}
          </p>
        )}
      </header>

      <div className={styles.tiles}>
        <section className={styles.card} aria-labelledby="today-review">
          <h2 id="today-review" className={styles.label}>
            Review
          </h2>
          {due > 0 ? (
            <>
              <p className={styles.big}>
                {due} {due === 1 ? 'word' : 'words'}
              </p>
              <p className={styles.soft}>ready to review · about {Math.max(1, Math.round(due / 2))} min</p>
              <div>
                <Link to="/review" className="btn">
                  Start review
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className={styles.big}>All done</p>
              <p className={styles.soft}>
                {next ? `Next review: ${formatDay(next)}.` : 'Save words you want to learn and they will come back here.'}
              </p>
            </>
          )}
        </section>

        <section className={styles.card} aria-labelledby="today-goal">
          <h2 id="today-goal" className={styles.label}>
            Daily goal
          </h2>
          <p className={styles.big}>
            {Math.min(done, goal)} / {goal}
            <span className="visually-hidden"> words practised today</span>
          </p>
          <progress className={styles.bar} value={Math.min(done, goal)} max={goal} aria-hidden="true" />
          <p className={styles.soft}>
            {done >= goal
              ? 'Goal reached. Well done! Anything more is a bonus.'
              : due > 0
                ? 'Review answers and new words both count.'
                : 'Save a few new words in Explore to reach your goal.'}
          </p>
        </section>
      </div>

      {word && (
        <section className={styles.card} aria-labelledby="today-word">
          <h2 id="today-word" className={styles.label}>
            Word of the day
          </h2>
          <p>
            <Link to={`/explore/${word.id}`} state={{ back: backLink }} className={styles.word}>
              {word.word}
            </Link>{' '}
            <span className={styles.soft}>{word.partOfSpeech}</span>
          </p>
          <p>{word.definition}</p>
          <p className={styles.example}>“{word.examples[0]}”</p>
        </section>
      )}

      <section className={styles.card} aria-labelledby="today-words">
        <h2 id="today-words" className={styles.label}>
          Your words · {total} saved
        </h2>
        {total > 0 ? (
          <>
            <div className={styles.mix} aria-hidden="true">
              {collections.map(
                (c) => counts[c.id] > 0 && <span key={c.id} className={styles[c.id]} style={{ flexGrow: counts[c.id] }} />,
              )}
            </div>
            <ul className={styles.legend}>
              {collections.map((c) => (
                <li key={c.id}>
                  <Link to={`/words?c=${c.id}`} className={styles.legendLink}>
                    <span className={`${styles.swatch} ${styles[c.id]}`} aria-hidden="true" />
                    {c.label} {counts[c.id]}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className={styles.soft}>
            No words saved yet. <Link to="/explore">Explore words</Link> and mark the ones you don't know.
          </p>
        )}
      </section>
    </article>
  )
}
