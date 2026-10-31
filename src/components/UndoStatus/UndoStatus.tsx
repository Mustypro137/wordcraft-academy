import type { RefObject } from 'react'
import styles from './UndoStatus.module.css'

interface UndoStatusProps {
  message: string
  /** Shown as an "Undo" button when there is something to undo */
  onUndo?: () => void
  statusRef: RefObject<HTMLParagraphElement | null>
}

// "Saved to Known. Undo" under the knowledge buttons and on My Words.
export function UndoStatus({ message, onUndo, statusRef }: UndoStatusProps) {
  return (
    <div className={styles.row}>
      {/* role="status": screen readers read the new text aloud */}
      <p ref={statusRef} role="status" tabIndex={-1} className={styles.message}>
        {message}
      </p>
      {onUndo && (
        <button type="button" className={styles.undo} onClick={onUndo}>
          Undo
        </button>
      )}
    </div>
  )
}
