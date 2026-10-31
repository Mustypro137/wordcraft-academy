import { Link } from 'react-router'
import { sentencePatterns } from '../../data/sentences'
import { useSentenceProgress } from '../../store/learnerStore'
import { PatternShape, StageDots } from './PatternParts'
import styles from './Sentences.module.css'

// The list of sentence patterns, with your progress in each.
export function SentencesPage() {
  const progress = useSentenceProgress()
  const doneCount = sentencePatterns.filter((p) => (progress[p.id] ?? 0) >= 3).length

  return (
    <article className={styles.page}>
      <title>Sentence Builder · WordCraft Academy</title>
      <h1 className={styles.title}>Sentence Builder</h1>
      <p className={styles.intro}>
        Learn the sentence patterns fluent speakers use every day. Build sentences with word tiles, then write your own.
        {doneCount > 0 && ` You have finished ${doneCount} of ${sentencePatterns.length} patterns.`}
      </p>

      <ul className={styles.patternList}>
        {sentencePatterns.map((pattern) => (
          <li key={pattern.id}>
            <Link to={`/sentences/${pattern.id}`} className={styles.patternCard}>
              <span className={styles.patternTitle}>{pattern.title}</span>
              <PatternShape pattern={pattern} />
              <StageDots done={progress[pattern.id] ?? 0} />
            </Link>
          </li>
        ))}
      </ul>
    </article>
  )
}
