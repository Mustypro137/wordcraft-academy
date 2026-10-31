import { Highlight } from '../../components/Highlight/Highlight'
import { useLearnerStore, useWordStates } from '../../store/learnerStore'
import type { Word } from '../../types'

// Saves a word to My Words as "I want to practise": Learning, and in today's review.
// A word that is already saved shows its collection instead.
export function SaveWordButton({ word, onSaved }: { word: Word; onSaved?: (wordId: string) => void }) {
  const state = useWordStates()[word.id]
  const setKnowledge = useLearnerStore((s) => s.setKnowledge)
  if (state) return <Highlight collection={state.collection} />
  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={() => {
        setKnowledge(word.id, 'practise')
        onSaved?.(word.id)
      }}
    >
      Save “{word.word}” to my words
    </button>
  )
}
