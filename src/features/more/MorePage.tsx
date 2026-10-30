import { Link } from 'react-router'
import { Icon } from '../../components/Icon'
import { sections } from '../../components/AppShell/sections'
import styles from './MorePage.module.css'

// The phone's "More" tab: every section in one list, so the sections
// without their own tab are still easy to reach.
export function MorePage() {
  return (
    <article className={styles.page}>
      <title>More · WordCraft Academy</title>
      <h1 className={styles.title}>All sections</h1>
      <ul className={styles.list}>
        {sections.map((section) => (
          <li key={section.path}>
            <Link to={section.path} className={styles.row}>
              <Icon name={section.icon} className={styles.icon} />
              <span className={styles.text}>
                <span className={styles.label}>{section.label}</span>
                <span className={styles.summary}>{section.summary}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  )
}
