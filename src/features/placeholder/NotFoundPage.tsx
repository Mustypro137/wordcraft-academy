import { Link } from 'react-router'
import styles from './PlaceholderPage.module.css'

export function NotFoundPage() {
  return (
    <article className={styles.page}>
      <title>Page not found · WordCraft Academy</title>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.summary}>
        This address doesn't match any page. Check the spelling, or go back to <Link to="/">Today</Link>.
      </p>
    </article>
  )
}
