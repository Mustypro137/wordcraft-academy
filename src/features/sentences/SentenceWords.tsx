import { Link } from 'react-router'
import { wordsFor } from '../../data/words'
import { wordsInSentence } from '../../logic/sentences'
import { useActiveProfile } from '../../store/learnerStore'
import styles from './Sentences.module.css'

// After a sentence: the dictionary words inside it, with their meanings, so new words can be looked up.
export function SentenceWords({ sentence, back }: { sentence: string; back: { path: string; label: string } }) {
  const profile = useActiveProfile()
  const found = wordsInSentence(sentence, wordsFor(profile))
  if (found.length === 0) return null
  return (
    <div className={styles.sentenceWords}>
      <p className={styles.small}>Words from the dictionary in this sentence:</p>
      <ul>
        {found.map((word) => (
          <li key={word.id}>
            <Link to={`/explore/${word.id}`} state={{ back }} className={styles.wordLink}>
              {word.word}
            </Link>{' '}
            <span className={styles.small}>{word.definition}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
