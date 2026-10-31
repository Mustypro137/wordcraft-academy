import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { writingRules } from '../../data/writingRules'
import { TASK_MIN_WORDS } from '../../logic/developer'
import { wordsInSentence } from '../../logic/sentences'
import { applyFix, checkWriting, findStuck, type Issue } from '../../logic/writingChecker'
import { useLearnerStore, useWriting } from '../../store/learnerStore'
import type { DeveloperTopic, Word } from '../../types'
import { IssueCard } from '../writing/IssueCard'
import styles from './Developer.module.css'

interface Props {
  topic: DeveloperTopic
  topicWords: Word[]
  /** Every word the profile can see, for the stuck-word helper */
  pool: Word[]
}

// "Your turn": write your own developer sentence with the topic's words.
// It uses the Writing Studio's checker and drafts, and finished answers go to "My writing".
export function TaskBox({ topic, topicWords, pool }: Props) {
  const draftId = `developer:${topic.id}`
  const writing = useWriting()
  const saveDraft = useLearnerStore((s) => s.saveDraft)
  const finishWriting = useLearnerStore((s) => s.finishWriting)
  const [text, setText] = useState(() => writing.drafts[draftId] ?? '')
  const [checked, setChecked] = useState(false)
  const [levels, setLevels] = useState<Record<string, number>>({})
  const [saved, setSaved] = useState(false)

  const issues = useMemo(() => (checked ? checkWriting(text, writingRules, pool) : []), [checked, text, pool])
  const used = checked ? wordsInSentence(text, topicWords) : []
  const enough = used.length >= TASK_MIN_WORDS
  const stuckLeft = findStuck(text).length

  function change(next: string) {
    setText(next)
    saveDraft(draftId, next)
  }

  function use(issue: Issue, fix?: string) {
    change(applyFix(text, issue, fix ?? issue.fix))
  }

  if (saved) {
    return (
      <div className={styles.task} aria-live="polite">
        <p className={styles.correct}>
          <strong>Saved!</strong> You wrote it in your own words, like a developer.
        </p>
        <p className={styles.yourText}>{text.trim()}</p>
        <div className={styles.actions}>
          <Link to="/write#my-writing" className="btn btn-secondary">
            See it in My writing
          </Link>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setText('')
              setChecked(false)
              setLevels({})
              setSaved(false)
            }}
          >
            Write another one
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.task}>
      <p className={styles.taskText}>{topic.task}</p>
      <p className={styles.small}>
        Use at least {TASK_MIN_WORDS} words from this topic. Start instructions with a verb, like “Add”, “Fix” or
        “Check”. Stuck? Write ??your guess?? and keep going.
      </p>
      <label htmlFor="task-box" className="visually-hidden">
        Your answer
      </label>
      <textarea
        id="task-box"
        className={`input ${styles.taskBox}`}
        rows={4}
        value={text}
        onChange={(e) => change(e.target.value)}
        aria-describedby="task-feedback"
      />

      <div id="task-feedback" aria-live="polite" className={styles.taskFeedback}>
        {checked && (
          <p>
            {used.length === 0
              ? 'You haven’t used a word from this topic yet.'
              : `Topic words you used: ${used.map((w) => w.word).join(', ')}.`}{' '}
            {!enough && `Try to use ${TASK_MIN_WORDS - used.length} more.`}
          </p>
        )}
      </div>

      {checked && issues.length > 0 && (
        <ul className={styles.issues}>
          {issues.map((issue) => (
            <IssueCard
              key={issue.key}
              issue={issue}
              level={levels[issue.key] ?? 0}
              onReveal={() => setLevels({ ...levels, [issue.key]: (levels[issue.key] ?? 0) + 1 })}
              onUse={use}
              onSaved={() => {}}
            />
          ))}
        </ul>
      )}

      <div className={styles.actions}>
        <button type="button" className="btn btn-secondary" onClick={() => setChecked(true)} disabled={text.trim() === ''}>
          {checked ? 'Checking as you type' : 'Check'}
        </button>
        <button
          type="button"
          className="btn"
          disabled={!checked || !enough || stuckLeft > 0}
          onClick={() => {
            finishWriting(draftId, text)
            setSaved(true)
          }}
        >
          Save my answer
        </button>
      </div>
    </div>
  )
}
