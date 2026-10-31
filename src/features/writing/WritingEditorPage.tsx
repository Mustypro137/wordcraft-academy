import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { writingRules } from '../../data/writingRules'
import { situationsById } from '../../data/writingSituations'
import { wordsFor } from '../../data/words'
import { wordsInSentence } from '../../logic/sentences'
import { applyAll, applyFix, checkWriting, findStuck, starterText, type Issue } from '../../logic/writingChecker'
import { useActiveProfile, useLearnerStore, useWriting } from '../../store/learnerStore'
import { NotFoundPage } from '../placeholder/NotFoundPage'
import { IssueCard } from './IssueCard'
import { SaveWordButton } from './SaveWordButton'
import styles from './Writing.module.css'

// "key" gives every situation a fresh editor
export function WritingEditorPage() {
  const { situationId = '' } = useParams()
  return <Editor key={situationId} situationId={situationId} />
}

function Editor({ situationId }: { situationId: string }) {
  const profile = useActiveProfile()
  const writing = useWriting()
  const saveDraft = useLearnerStore((s) => s.saveDraft)
  const finishWriting = useLearnerStore((s) => s.finishWriting)
  const situation = situationsById.get(situationId)

  // The draft starts from what was saved; after that this page owns the text and saves every change
  const [text, setText] = useState(() => writing.drafts[situationId] ?? '')
  const [checked, setChecked] = useState(false)
  /** Issue key → how much is revealed (see IssueCard) */
  const [levels, setLevels] = useState<Record<string, number>>({})
  const [previous, setPrevious] = useState<string | null>(null)
  const [improved, setImproved] = useState(0)
  const [savedWords, setSavedWords] = useState<string[]>([])
  const [showNatural, setShowNatural] = useState(false)
  const [finished, setFinished] = useState<string | null>(null)
  const boxRef = useRef<HTMLTextAreaElement>(null)
  const helperRef = useRef<HTMLHeadingElement>(null)
  const doneRef = useRef<HTMLHeadingElement>(null)

  const pool = useMemo(() => wordsFor(profile), [profile])
  // Worked out from the text every time it changes, so the list is always up to date
  const issues = useMemo(() => (checked ? checkWriting(text, writingRules, pool) : []), [checked, text, pool])
  const used = useMemo(() => (checked ? wordsInSentence(text, pool) : []), [checked, text, pool])

  if (!situation || !profile) return <NotFoundPage />

  function change(next: string) {
    setText(next)
    saveDraft(situationId, next)
  }

  /** A change made by a button, which "Undo" can take back */
  function replaceText(next: string) {
    setPrevious(text)
    change(next)
  }

  function insertStarter(starter: string) {
    const box = boxRef.current
    const insert = starterText(starter)
    const at = box ? box.selectionStart : text.length
    const before = text.slice(0, at)
    // A starter after other text needs a space before it
    const gap = before && !/\s$/.test(before) ? ' ' : ''
    replaceText(before + gap + insert + text.slice(at))
    requestAnimationFrame(() => {
      const cursor = at + gap.length + insert.length
      box?.focus()
      box?.setSelectionRange(cursor, cursor)
    })
  }

  function use(issue: Issue, fix?: string) {
    replaceText(applyFix(text, issue, fix ?? issue.fix))
    setImproved((n) => n + 1)
  }

  function startCheck() {
    setChecked(true)
    // On phones the helper is below the editor, so bring it into view (smoothly, unless motion is reduced)
    requestAnimationFrame(() => {
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      helperRef.current?.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' })
      helperRef.current?.focus({ preventScroll: true })
    })
  }

  const stuckLeft = findStuck(text).length
  const canFinish = text.trim() !== '' && stuckLeft === 0
  const fixable = issues.filter((i) => i.fix !== null)

  function finish() {
    finishWriting(situationId, text)
    setFinished(text.trim())
    requestAnimationFrame(() => doneRef.current?.focus())
  }

  if (finished !== null) {
    return (
      <article className={styles.page}>
        <title>Finished · Writing Studio · WordCraft Academy</title>
        <h1 ref={doneRef} tabIndex={-1} className={styles.title}>
          Well done!
        </h1>
        <p className={styles.intro}>
          You finished “{situation.title}”
          {improved > 0 && `, and made ${improved} ${improved === 1 ? 'improvement' : 'improvements'}`}
          {savedWords.length > 0 && `, and saved ${savedWords.length} new ${savedWords.length === 1 ? 'word' : 'words'}`}.
        </p>
        <p className={styles.finalText}>{finished}</p>
        <div className={styles.actions}>
          <Link to="/write" className="btn">
            Write something else
          </Link>
          {savedWords.length > 0 && (
            <Link to="/review" className="btn btn-secondary">
              Review your new words
            </Link>
          )}
        </div>
      </article>
    )
  }

  return (
    <article className={styles.editorPage}>
      <title>{`${situation.title} · Writing Studio · WordCraft Academy`}</title>
      <Link to="/write" className={styles.back}>
        ← Back to Writing Studio
      </Link>
      <header className={styles.editorHeader}>
        <h1 className={styles.title}>{situation.title}</h1>
        <p className={styles.taskLarge}>{situation.task}</p>
      </header>

      <div className={styles.workspace}>
        <div className={styles.editorColumn}>
          <div className={styles.starters} role="group" aria-label="Sentence starters">
            <span className={styles.soft}>Starters:</span>
            {situation.starters.map((starter) => (
              <button key={starter} type="button" className={styles.starter} onClick={() => insertStarter(starter)}>
                {starter}
              </button>
            ))}
          </div>

          <label htmlFor="writing-box" className="visually-hidden">
            Your text
          </label>
          <textarea
            id="writing-box"
            ref={boxRef}
            className={`input ${styles.box}`}
            value={text}
            onChange={(e) => change(e.target.value)}
            rows={9}
            spellCheck
            aria-describedby="writing-tip"
          />
          <p id="writing-tip" className={styles.soft}>
            Can’t find a word? Write your guess between question marks, like <code>??make better??</code>, and keep
            writing. {text.trim() !== '' && <span className={styles.saved}>Draft saved in this browser.</span>}
          </p>

          <div className={styles.actions}>
            <button type="button" className="btn" onClick={startCheck} disabled={text.trim() === ''}>
              {checked ? 'Checking as you type' : 'Check my writing'}
            </button>
            {previous !== null && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  change(previous)
                  setPrevious(null)
                }}
              >
                Undo last change
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={finish} disabled={!canFinish}>
              Finish
            </button>
          </div>
          {stuckLeft > 0 && (
            <p className={styles.soft}>
              To finish, replace the {stuckLeft === 1 ? 'word' : `${stuckLeft} words`} in ??question marks?? first.
            </p>
          )}
        </div>

        <aside className={styles.helper} aria-labelledby="helper-title">
          <h2 id="helper-title" ref={helperRef} tabIndex={-1} className={styles.heading}>
            Helper
          </h2>

          {!checked ? (
            <p className={styles.soft}>
              Write first, then press <strong>Check my writing</strong>. The helper never changes your text by itself:
              you decide what to use.
            </p>
          ) : (
            <>
              <p className={styles.soft} aria-live="polite">
                {issues.length === 0
                  ? 'Nothing to fix that the helper can find. Well done!'
                  : `${issues.length} ${issues.length === 1 ? 'thing' : 'things'} to look at.`}
              </p>
              {issues.length > 0 && (
                <ul className={styles.issues}>
                  {issues.map((issue) => (
                    <IssueCard
                      key={issue.key}
                      issue={issue}
                      level={levels[issue.key] ?? 0}
                      onReveal={() => setLevels({ ...levels, [issue.key]: (levels[issue.key] ?? 0) + 1 })}
                      onUse={use}
                      onSaved={(id) => setSavedWords((list) => [...list, id])}
                    />
                  ))}
                </ul>
              )}

              {fixable.length > 1 && (
                <div className={styles.natural}>
                  {!showNatural ? (
                    <button type="button" className="btn btn-secondary" onClick={() => setShowNatural(true)}>
                      Show a natural version
                    </button>
                  ) : (
                    <>
                      <p className={styles.soft}>Your text with every suggestion used. Read it, then decide.</p>
                      <p className={styles.finalText}>{applyAll(text, issues)}</p>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className="btn"
                          onClick={() => {
                            replaceText(applyAll(text, issues))
                            setImproved((n) => n + fixable.length)
                            setShowNatural(false)
                          }}
                        >
                          Use this version
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowNatural(false)}>
                          Keep mine
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {used.length > 0 && (
                <div className={styles.usedWords}>
                  <h3 className={styles.subheading}>Dictionary words you used</h3>
                  <ul>
                    {used.map((word) => (
                      <li key={word.id}>
                        <span className={styles.answer}>{word.word}</span>
                        <SaveWordButton word={word} onSaved={(id) => setSavedWords((list) => [...list, id])} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className={styles.small}>
                The helper uses a list of common mistakes. It can’t understand meaning like a teacher can, so a clean
                result doesn’t mean every sentence is perfect.
              </p>
            </>
          )}
        </aside>
      </div>
    </article>
  )
}
