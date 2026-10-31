import { Link } from 'react-router'
import styles from './Developer.module.css'

// Developer English is for teens and adults. Kids see this friendly note instead.
export function KidsNote() {
  return (
    <div className={styles.kidsNote}>
      <p className={styles.kidsTitle}>This section is for teens and adults.</p>
      <p>It teaches the words people use when they build websites and apps at work.</p>
      <p>
        You can learn lots of fun words in <Link to="/explore">Explore</Link>, or build sentences in the{' '}
        <Link to="/sentences">Sentence Builder</Link>.
      </p>
    </div>
  )
}
