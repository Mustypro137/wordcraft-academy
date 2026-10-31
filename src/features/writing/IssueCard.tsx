import type { Issue } from '../../logic/writingChecker'
import { SaveWordButton } from './SaveWordButton'
import styles from './Writing.module.css'

interface Props {
  issue: Issue
  /** 0 = only what was found · 1 = the hint · 2 = the answer */
  level: number
  onReveal: () => void
  /** Uses a fix; `fix` is another word chosen instead of the suggested one */
  onUse: (issue: Issue, fix?: string) => void
  onSaved: (wordId: string) => void
}

const labels: Record<Issue['kind'], string> = {
  stuck: 'Stuck word',
  mistake: 'More natural',
  capital: 'Capital letter',
  spaces: 'Spacing',
  punctuation: 'Punctuation',
  long: 'Long sentence',
}

// One thing to improve. Words come hint first: the learner gets a chance to find the answer alone.
export function IssueCard({ issue, level, onReveal, onUse, onSaved }: Props) {
  const isWord = issue.kind === 'stuck' || issue.kind === 'mistake'

  return (
    <li className={styles.issue}>
      <p className={styles.issueLabel}>{labels[issue.kind]}</p>

      {/* Where it is: a few words around it, with the part itself underlined */}
      {issue.kind !== 'long' && (
        <p className={styles.context}>
          {issue.before}
          {issue.found.trim() === '' ? (
            <span className={styles.gap}>
              {issue.kind === 'punctuation' ? <span className="visually-hidden">(end of text)</span> : '␣␣'}
            </span>
          ) : (
            <span className={styles.found}>{issue.found}</span>
          )}
          {issue.after}
        </p>
      )}
      {issue.kind === 'long' && (
        <p className={styles.context}>
          <span className={styles.found}>{issue.found}</span>
        </p>
      )}

      {/* Basics need no guessing: say what and why at once */}
      {!isWord && (
        <>
          <p>{issue.hint}</p>
          <p className={styles.soft}>{issue.why}</p>
          {issue.fix !== null && (
            <div>
              <button type="button" className="btn btn-secondary" onClick={() => onUse(issue)}>
                Fix it
              </button>
            </div>
          )}
        </>
      )}

      {isWord && level >= 1 && (
        <p>
          <strong>Hint:</strong> {issue.hint}
        </p>
      )}

      {isWord && level >= 2 && issue.fix !== null && (
        <>
          <p>
            {issue.kind === 'stuck' ? 'Try: ' : 'Natural: '}
            <strong className={styles.answer}>{issue.fix}</strong>
            {issue.kind === 'stuck' ? `: ${issue.why.charAt(0).toLowerCase()}${issue.why.slice(1)}` : ''}
          </p>
          {issue.kind === 'mistake' && <p className={styles.soft}>{issue.why}</p>}
          <div className={styles.issueActions}>
            <button type="button" className="btn" onClick={() => onUse(issue)}>
              Use “{issue.fix}”
            </button>
            {issue.word && <SaveWordButton word={issue.word} onSaved={onSaved} />}
          </div>
          {issue.alternatives && issue.alternatives.length > 0 && (
            <p className={styles.soft}>
              Or maybe:{' '}
              {issue.alternatives.map((word, i) => (
                <span key={word.id}>
                  {i > 0 && ', '}
                  <button type="button" className={styles.linkButton} onClick={() => onUse(issue, word.word)}>
                    {word.word}
                  </button>
                </span>
              ))}
            </p>
          )}
        </>
      )}

      {isWord && level >= 2 && issue.fix === null && <p className={styles.soft}>{issue.why}</p>}

      {isWord && level < 2 && (
        <div>
          <button type="button" className="btn btn-secondary" onClick={onReveal}>
            {level === 0 ? 'Give me a hint' : issue.kind === 'stuck' ? 'Show the word' : 'Show the natural version'}
          </button>
        </div>
      )}
    </li>
  )
}
