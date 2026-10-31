import { STAGE_NAMES, STAGES } from '../../logic/sentences'
import type { SentencePattern } from '../../types'
import styles from './Sentences.module.css'

/** The shape of a pattern: fixed words in bold, and dashed slots for your own words */
export function PatternShape({ pattern }: { pattern: SentencePattern }) {
  return (
    <p className={styles.shape}>
      <span className="visually-hidden">Pattern: </span>
      {pattern.shape.map((part, i) =>
        part.slot ? (
          <span key={i} className={styles.slot}>
            <span className="visually-hidden">(</span>
            {part.text}
            <span className="visually-hidden">)</span>
          </span>
        ) : (
          <span key={i} className={styles.fixed}>
            {part.text}
          </span>
        ),
      )}
    </p>
  )
}

/** Three dots for the three lesson stages, with the same meaning in words */
export function StageDots({ done }: { done: number }) {
  const label = done >= STAGES ? 'Done' : done === 0 ? 'Not started' : `${done} of ${STAGES} steps done`
  return (
    <span className={styles.stageDots}>
      <span aria-hidden="true" className={styles.dots}>
        {STAGE_NAMES.map((name, i) => (
          <span key={name} data-on={i < done || undefined} />
        ))}
      </span>
      <span>{label}</span>
    </span>
  )
}
