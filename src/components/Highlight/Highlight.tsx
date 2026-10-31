import { collectionLabel } from '../../data/collections'
import type { Collection } from '../../types'
import styles from './Highlight.module.css'

// A word state in its highlighter color. The color is never shown alone:
// the label says the same thing for people who can't tell the colors apart.
export function Highlight({ collection }: { collection: Collection }) {
  return <span className={`${styles.tag} ${styles[collection]}`}>{collectionLabel[collection]}</span>
}
