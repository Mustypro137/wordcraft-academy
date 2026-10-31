import { useEffect, useMemo, useRef, useState } from 'react'
import { correctStart, hint, isCorrect, mixTiles, toTiles, type Tile } from '../../logic/sentences'
import type { SentenceExercise } from '../../types'
import { SentenceWords } from './SentenceWords'
import styles from './Sentences.module.css'

interface Props {
  exercise: SentenceExercise
  /** The first tile starts in place, for learners new to this pattern */
  placeFirst: boolean
  /** Where links to word pages lead back to */
  back: { path: string; label: string }
  onNext: () => void
}

/** Where keyboard focus goes after a tile moves, because the button that was pressed disappears */
type FocusTarget = { area: 'free' | 'placed'; index: number } | 'check' | null

// Put the word tiles in order. Tap, click or use the keyboard: dragging is never needed.
export function TileExercise({ exercise, placeFirst, back, onNext }: Props) {
  const answer = useMemo(() => toTiles(exercise.sentence), [exercise])
  const [placed, setPlaced] = useState<Tile[]>(() => (placeFirst ? [answer[0]] : []))
  const [free, setFree] = useState<Tile[]>(() =>
    mixTiles(placeFirst ? answer.slice(1) : answer, Math.random),
  )
  const [result, setResult] = useState<'none' | 'wrong' | 'correct'>('none')
  const [hintId, setHintId] = useState<number | null>(null)
  const [focus, setFocus] = useState<FocusTarget>(null)
  const listRefs = useRef<Record<'free' | 'placed', HTMLUListElement | null>>({ free: null, placed: null })
  const checkRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (focus === 'check') checkRef.current?.focus()
    else if (focus) {
      const buttons = listRefs.current[focus.area]?.querySelectorAll('button')
      if (buttons && buttons.length > 0) buttons[Math.min(focus.index, buttons.length - 1)].focus()
      else checkRef.current?.focus()
    }
  }, [focus, placed, free])

  useEffect(() => {
    if (result === 'correct') nextRef.current?.focus()
  }, [result])

  const done = result === 'correct'

  function add(tile: Tile, index: number) {
    setPlaced([...placed, tile])
    const rest = free.filter((t) => t.id !== tile.id)
    setFree(rest)
    setResult('none')
    setHintId(null)
    setFocus(rest.length > 0 ? { area: 'free', index } : 'check')
  }

  function remove(tile: Tile, index: number) {
    const rest = placed.filter((t) => t.id !== tile.id)
    setPlaced(rest)
    setFree([...free, tile])
    setResult('none')
    setFocus(rest.length > 0 ? { area: 'placed', index } : { area: 'free', index: free.length })
  }

  function check() {
    if (isCorrect(placed, answer)) setResult('correct')
    else setResult('wrong')
  }

  function showHint() {
    const { keep, nextId } = hint(placed, free, answer)
    const back = placed.slice(keep.length)
    setPlaced(keep)
    setFree([...free, ...back])
    setHintId(nextId)
    setResult('none')
    const nextIndex = [...free, ...back].findIndex((t) => t.id === nextId)
    setFocus({ area: 'free', index: Math.max(0, nextIndex) })
  }

  const right = correctStart(placed, answer)

  return (
    <div className={styles.practiceCard}>
      <p className={styles.situation}>
        <span className="visually-hidden">Situation: </span>
        {exercise.situation}
      </p>

      <div className={styles.built} data-done={done || undefined}>
        <p className="visually-hidden" id="built-label">
          Your sentence
        </p>
        {placed.length === 0 && (
          <p className={styles.builtEmpty} aria-hidden="true">
            Tap the words below in the right order.
          </p>
        )}
        <ul className={styles.tiles} aria-labelledby="built-label" ref={(el) => void (listRefs.current.placed = el)}>
          {placed.map((tile, i) => (
            <li key={tile.id}>
              <button
                type="button"
                className={styles.tile}
                data-placed
                disabled={done}
                onClick={() => remove(tile, i)}
                aria-label={done ? tile.text : `${tile.text}, remove`}
              >
                {tile.text}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {!done && (
        <>
          <p className="visually-hidden" id="free-label">
            Word tiles
          </p>
          <ul className={styles.tiles} aria-labelledby="free-label" ref={(el) => void (listRefs.current.free = el)}>
            {free.map((tile, i) => (
              <li key={tile.id}>
                <button
                  type="button"
                  className={styles.tile}
                  data-hint={tile.id === hintId || undefined}
                  onClick={() => add(tile, i)}
                  aria-label={tile.id === hintId ? `${tile.text} (this one comes next)` : `${tile.text}, add`}
                >
                  {tile.text}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <div aria-live="polite" className={styles.feedback}>
        {result === 'wrong' && (
          <p>
            Not quite.{' '}
            {right > 0 ? `The first ${right === 1 ? 'word is' : `${right} words are`} right.` : 'Check the first word.'}{' '}
            Tap a word in your sentence to move it back.
          </p>
        )}
        {done && (
          <p className={styles.correct}>
            <strong>Correct!</strong> “{exercise.sentence}”
          </p>
        )}
      </div>

      {done ? (
        <>
          <SentenceWords sentence={exercise.sentence} back={back} />
          <div className={styles.actions}>
            <button ref={nextRef} type="button" className="btn" onClick={onNext}>
              Next
            </button>
          </div>
        </>
      ) : (
        <div className={styles.actions}>
          <button ref={checkRef} type="button" className="btn" onClick={check} disabled={free.length > 0}>
            Check
          </button>
          <button type="button" className="btn btn-secondary" onClick={showHint}>
            Show me the next word
          </button>
        </div>
      )}
    </div>
  )
}
