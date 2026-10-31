import { Link } from 'react-router'
import { topicsById } from '../../data/developerTopics'
import { situationsById, writingSituations } from '../../data/writingSituations'
import { useActiveProfile, useLearnerStore, useWriting } from '../../store/learnerStore'
import styles from './Writing.module.css'

/** Writing Studio pieces use a situation id; Developer English answers use "developer:<topic id>" */
function pieceTitle(situationId: string) {
  const topic = topicsById.get(situationId.replace(/^developer:/, ''))
  if (situationId.startsWith('developer:') && topic) return `Developer English: ${topic.title}`
  return situationsById.get(situationId)?.title ?? 'Writing'
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Choose what to write, and read what you wrote before.
export function WritingPage() {
  const profile = useActiveProfile()
  const writing = useWriting()
  const deletePiece = useLearnerStore((s) => s.deletePiece)
  if (!profile) return null

  const situations = writingSituations.filter((s) => s.ages.includes(profile.ageGroup))

  return (
    <article className={styles.page}>
      <title>Writing Studio · WordCraft Academy</title>
      <h1 className={styles.title}>Writing Studio</h1>
      <p className={styles.intro}>
        Write real messages in your own words. Can’t find a word? Write your guess like <code>??make better??</code> and
        keep going. The helper gives you a hint first.
      </p>

      <ul className={styles.situationList}>
        {situations.map((situation) => (
          <li key={situation.id}>
            <Link to={`/write/${situation.id}`} className={styles.situationCard}>
              <span className={styles.situationTitle}>{situation.title}</span>
              <span className={styles.task}>{situation.task}</span>
              {writing.drafts[situation.id] && <span className={styles.draftTag}>Draft saved</span>}
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="my-writing" className={styles.myWriting}>
        <h2 id="my-writing" className={styles.heading}>
          My writing
        </h2>
        {writing.pieces.length === 0 ? (
          <p className={styles.soft}>Finished pieces appear here, so you can read them again later.</p>
        ) : (
          <ul className={styles.pieces}>
            {writing.pieces.map((piece) => (
              <li key={piece.id}>
                <details className={styles.piece}>
                  <summary>
                    <span className={styles.pieceTitle}>{pieceTitle(piece.situationId)}</span>
                    <span className={styles.soft}>{formatWhen(piece.finishedAt)}</span>
                  </summary>
                  <p className={styles.pieceText}>{piece.text}</p>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      if (window.confirm('Delete this piece of writing? This can’t be undone.')) deletePiece(piece.id)
                    }}
                  >
                    Delete
                  </button>
                </details>
              </li>
            ))}
          </ul>
        )}
        <p className={styles.soft}>Your writing stays in this browser. Nothing is sent anywhere.</p>
      </section>
    </article>
  )
}
