import { useRef, useState } from 'react'
import { applyKnowledge, type KnowledgeAction } from '../../logic/wordStates'
import { useLearnerStore, useWordStates } from '../../store/learnerStore'
import type { WordState } from '../../types'

/**
 * Knowledge buttons with Undo. Remembers how the last word was before the change,
 * so one press of Undo puts it back. Used by the word page and by My Words.
 */
export function useUndoableKnowledge() {
  const states = useWordStates()
  const setKnowledge = useLearnerStore((s) => s.setKnowledge)
  const restoreWord = useLearnerStore((s) => s.restoreWord)
  const [message, setMessage] = useState('')
  const [last, setLast] = useState<{ wordId: string; previous: WordState | undefined } | null>(null)
  /** The status line. It gets keyboard focus when the button that was pressed disappears. */
  const statusRef = useRef<HTMLParagraphElement>(null)

  function apply(wordId: string, action: KnowledgeAction, done: string) {
    // The rules leave some presses unchanged ("I know" on a mastered word): nothing to undo
    if (applyKnowledge(states, wordId, action, new Date()) === states) {
      setMessage('Already mastered. Nothing changed.')
      setLast(null)
      return
    }
    setLast({ wordId, previous: states[wordId] })
    setKnowledge(wordId, action)
    setMessage(done)
  }

  function undo() {
    if (!last) return
    restoreWord(last.wordId, last.previous)
    setLast(null)
    setMessage('Undone.')
    statusRef.current?.focus()
  }

  function clear() {
    setMessage('')
    setLast(null)
  }

  return { message, canUndo: last !== null, apply, undo, clear, statusRef }
}
