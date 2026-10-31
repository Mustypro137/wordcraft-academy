import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { Highlight } from '../../components/Highlight/Highlight'
import { topicsById } from '../../data/developerTopics'
import { words, wordsFor } from '../../data/words'
import { useActiveProfile, useWordStates } from '../../store/learnerStore'
import { NotFoundPage } from '../placeholder/NotFoundPage'
import { BreakDown } from './BreakDown'
import { KidsNote } from './KidsNote'
import { TaskBox } from './TaskBox'
import styles from './Developer.module.css'

const wordsById = new Map(words.map((w) => [w.id, w]))

// "key" gives every topic a fresh page (and a fresh answer box)
export function DeveloperTopicPage() {
  const { topicId = '' } = useParams()
  return <Topic key={topicId} topicId={topicId} />
}

// One topic: its key words, real sentences broken down, and a sentence to write yourself.
function Topic({ topicId }: { topicId: string }) {
  const profile = useActiveProfile()
  const states = useWordStates()
  const pool = useMemo(() => wordsFor(profile), [profile])
  const topic = topicsById.get(topicId)
  if (!topic || !profile) return <NotFoundPage />

  const back = { path: `/developer/${topic.id}`, label: topic.title }
  const topicWords = topic.wordIds.map((id) => wordsById.get(id)!)

  return (
    <article className={styles.page}>
      <title>{`${topic.title} · Developer English · WordCraft Academy`}</title>
      <Link to="/developer" className={styles.back}>
        ← Back to Developer English
      </Link>
      <header className={styles.header}>
        <h1 className={styles.title}>{topic.title}</h1>
        <p className={styles.intro}>{topic.summary}</p>
      </header>

      {profile.ageGroup === 'kids' ? (
        <KidsNote />
      ) : (
        <>
          <section aria-labelledby="key-words" className={styles.section}>
            <h2 id="key-words" className={styles.heading}>
              Key words
            </h2>
            <ul className={styles.keyWords}>
              {topicWords.map((word) => (
                <li key={word.id}>
                  <Link to={`/explore/${word.id}`} state={{ back }} className={styles.keyWord}>
                    <span className={styles.keyWordName}>{word.word}</span>
                    <span className={styles.small}>{word.definition}</span>
                  </Link>
                  {states[word.id] ? (
                    <Highlight collection={states[word.id].collection} />
                  ) : (
                    <span className={styles.newTag}>New</span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="sentences" className={styles.section}>
            <h2 id="sentences" className={styles.heading}>
              Real sentences
            </h2>
            <p className={styles.soft}>Tap an underlined word to see what it means here.</p>
            <ul className={styles.breakdowns}>
              {topic.sentences.map((sentence) => (
                <BreakDown key={sentence.text} sentence={sentence} wordsById={wordsById} back={back} />
              ))}
            </ul>
          </section>

          <section aria-labelledby="your-turn" className={styles.section}>
            <h2 id="your-turn" className={styles.heading}>
              Your turn
            </h2>
            <TaskBox topic={topic} topicWords={topicWords} pool={pool} />
          </section>
        </>
      )}
    </article>
  )
}
