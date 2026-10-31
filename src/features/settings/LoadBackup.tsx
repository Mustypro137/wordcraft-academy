import { useRef, useState, type ChangeEvent } from 'react'
import { MAX_BACKUP_BYTES, readBackup, summarizeBackup, type SavedData } from '../../store/backup'
import { downloadBackup } from '../../store/downloadBackup'
import { useLearnerStore } from '../../store/learnerStore'
import styles from './SettingsPage.module.css'

type State =
  | { step: 'idle' }
  | { step: 'error'; message: string }
  | { step: 'preview'; data: SavedData; exportedAt: string }
  | { step: 'done'; name: string }

function formatWhen(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

// Load a backup file: check it, show what is inside, and only replace the data after the learner confirms.
// If this device already has data, a safety copy of it is downloaded first, so nothing is ever lost.
export function LoadBackup() {
  const hasData = useLearnerStore((s) => s.profiles.length > 0)
  const replaceAll = useLearnerStore((s) => s.replaceAll)
  const [state, setState] = useState<State>({ step: 'idle' })
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Clear the input, so choosing the same file again still works
    event.target.value = ''
    if (!file) return
    if (file.size > MAX_BACKUP_BYTES) {
      setState({ step: 'error', message: 'This file is too big to be a WordCraft backup. Nothing was changed.' })
      return
    }
    const result = readBackup(await file.text())
    setState(result.ok ? { step: 'preview', data: result.data, exportedAt: result.exportedAt } : { step: 'error', message: result.error })
  }

  function confirm() {
    if (state.step !== 'preview') return
    if (hasData) downloadBackup()
    replaceAll(state.data)
    const active = state.data.profiles.find((p) => p.id === state.data.activeProfileId)
    setState({ step: 'done', name: active?.name ?? '' })
  }

  const summary = state.step === 'preview' ? summarizeBackup(state.data) : null

  return (
    <div className={styles.loadBackup}>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        className="visually-hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleFile}
      />

      {state.step !== 'preview' && (
        <div>
          <button type="button" className="btn btn-secondary" onClick={() => inputRef.current?.click()}>
            Load a backup
          </button>
        </div>
      )}

      <div aria-live="polite">
        {state.step === 'error' && <p className={styles.error}>{state.message}</p>}

        {state.step === 'done' && (
          <p className={styles.success}>
            Backup loaded{state.name ? `. Welcome back, ${state.name}!` : '.'}
          </p>
        )}

        {state.step === 'preview' && summary && (
          <div className={styles.preview}>
            <p className={styles.previewTitle}>Backup from {formatWhen(state.exportedAt)}</p>
            <ul>
              <li>
                {plural(summary.names.length, 'profile')}: {summary.names.join(', ')}
              </li>
              <li>{plural(summary.words, 'saved word')}</li>
              <li>{plural(summary.pieces, 'piece')} of writing</li>
            </ul>
            {hasData && (
              <p>
                This <strong>replaces everything</strong> on this device. First, a copy of your current data is
                downloaded, just in case.
              </p>
            )}
            <div className={styles.previewActions}>
              <button type="button" className="btn" onClick={confirm}>
                {hasData ? 'Replace my data with this backup' : 'Load this backup'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setState({ step: 'idle' })}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
