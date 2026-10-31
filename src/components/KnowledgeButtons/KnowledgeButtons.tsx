import { Link } from 'react-router'
import type { KnowledgeAction } from '../../logic/wordStates'
import { useWordStates } from '../../store/learnerStore'
import { Highlight } from '../Highlight/Highlight'
import { UndoStatus } from '../UndoStatus/UndoStatus'
import { useUndoableKnowledge } from '../UndoStatus/useUndoableKnowledge'
import styles from './KnowledgeButtons.module.css'

const buttons: { action: KnowledgeAction; label: string; done: string }[] = [
  { action: 'know', label: 'I know this word', done: 'Saved to Known.' },
  { action: 'seen', label: 'I have seen this word', done: 'Saved to Learning.' },
  { action: 'dontKnow', label: "I don't know this word", done: 'Saved to Unfamiliar. It will come back in Review.' },
  { action: 'practise', label: 'I want to practise this word', done: "Saved to Learning and added to today's review." },
]

// The four knowledge buttons on a word page. Each press is saved straight away.
export function KnowledgeButtons({ wordId }: { wordId: string }) {
  const state = useWordStates()[wordId]
  const knowledge = useUndoableKnowledge()

  return (
    <section className={styles.box} aria-labelledby="knowledge">
      <div className={styles.top}>
        <h2 id="knowledge" className={styles.heading}>
          Do you know this word?
        </h2>
        <p className={styles.where}>
          {state ? (
            <>
              <span>
                In <Link to={`/words?c=${state.collection}`}>My Words</Link>:
              </span>
              <Highlight collection={state.collection} />
            </>
          ) : (
            'Not in My Words yet'
          )}
        </p>
      </div>
      <div className={styles.buttons}>
        {buttons.map((b) => (
          <button
            key={b.action}
            type="button"
            className="btn btn-secondary"
            onClick={() => knowledge.apply(wordId, b.action, b.done)}
          >
            {b.label}
          </button>
        ))}
      </div>
      <UndoStatus
        message={knowledge.message}
        onUndo={knowledge.canUndo ? knowledge.undo : undefined}
        statusRef={knowledge.statusRef}
      />
    </section>
  )
}
