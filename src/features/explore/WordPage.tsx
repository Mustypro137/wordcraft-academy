import { Fragment } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { KnowledgeButtons } from '../../components/KnowledgeButtons/KnowledgeButtons'
import { levelLabel } from '../../data/levels'
import { words } from '../../data/words'
import { markWord } from '../../logic/exercise'
import type { Word } from '../../types'
import { NotFoundPage } from '../placeholder/NotFoundPage'
import { ListenButton } from './ListenButton'
import { WordExercise } from './WordExercise'
import styles from './WordPage.module.css'

const wordsById = new Map(words.map((w) => [w.id, w]))

/** Where "Back" goes. Lists pass it in the link's state: <Link state={{ back }}> */
export interface BackLink {
  path: string
  label: string
}

/** The sentence with the word (or its form) in bold */
function Marked({ sentence, word }: { sentence: string; word: Word }) {
  return markWord(sentence, word).map((part, i) =>
    part.isWord ? <strong key={i}>{part.text}</strong> : <Fragment key={i}>{part.text}</Fragment>,
  )
}

/** A list of related words; the ones we have a page for become links */
function RelatedWords({ items }: { items: string[] }) {
  return (
    <ul className={styles.chips}>
      {items.map((item) => {
        const target = wordsById.get(item.toLowerCase().replaceAll(' ', '-'))
        return (
          <li key={item} className={styles.chip}>
            {target ? <Link to={`/explore/${target.id}`}>{item}</Link> : item}
          </li>
        )
      })}
    </ul>
  )
}

export function WordPage() {
  const { wordId = '' } = useParams()
  const location = useLocation()
  const word = wordsById.get(wordId)
  if (!word) return <NotFoundPage />

  // Return to the list we came from (with its search, filters or tab), or to Explore
  const back = (location.state as { back?: BackLink } | null)?.back ?? { path: '/explore', label: 'Explore' }

  return (
    <article className={styles.page}>
      <title>{`${word.word} · WordCraft Academy`}</title>
      <Link to={back.path} className={styles.back}>
        ← Back to {back.label}
      </Link>

      <header className={styles.header}>
        <h1 className={styles.headword}>{word.word}</h1>
        <p className={styles.meta}>
          <span>{word.partOfSpeech}</span>
          <span aria-hidden="true">·</span>
          <span>{levelLabel(word.level)}</span>
        </p>
        <div className={styles.say}>
          <p className={styles.pronunciation}>
            <span className={styles.respelling}>{word.pronunciation.respelling}</span>
            <span className={styles.ipa}>{word.pronunciation.ipa}</span>
          </p>
          <ListenButton text={word.word} />
        </div>
      </header>

      <p className={styles.definition}>{word.definition}</p>

      {/* "key" clears the last message when you open another word */}
      <KnowledgeButtons key={word.id} wordId={word.id} />

      <section className={styles.section} aria-labelledby="examples">
        <h2 id="examples" className={styles.heading}>
          Examples
        </h2>
        <ul className={styles.examples}>
          {word.examples.map((example) => (
            <li key={example}>
              <Marked sentence={example} word={word} />
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="phrases">
        <h2 id="phrases" className={styles.heading}>
          Common phrases
        </h2>
        <ul className={styles.chips}>
          {word.collocations.map((c) => (
            <li key={c} className={styles.chip}>
              {c}
            </li>
          ))}
        </ul>
      </section>

      {(word.synonyms || word.opposites) && (
        <section className={styles.section} aria-labelledby="related">
          <h2 id="related" className={styles.heading}>
            Similar and opposite words
          </h2>
          <dl className={styles.related}>
            {word.synonyms && (
              <div>
                <dt>Similar</dt>
                <dd>
                  <RelatedWords items={word.synonyms} />
                </dd>
              </div>
            )}
            {word.opposites && (
              <div>
                <dt>Opposite</dt>
                <dd>
                  <RelatedWords items={word.opposites} />
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}

      <section className={styles.section} aria-labelledby="mistake">
        <h2 id="mistake" className={styles.heading}>
          Common mistake
        </h2>
        <dl className={styles.mistake}>
          <div className={styles.wrong}>
            <dt>Not natural</dt>
            <dd>
              <s>{word.mistake.wrong}</s>
            </dd>
          </div>
          <div className={styles.right}>
            <dt>Natural</dt>
            <dd>{word.mistake.right}</dd>
          </div>
        </dl>
        <p className={styles.why}>{word.mistake.why}</p>
      </section>

      <section className={styles.section} aria-labelledby="situation">
        <h2 id="situation" className={styles.heading}>
          When you'll use it
        </h2>
        <p>{word.situation}</p>
      </section>

      <section className={styles.section} aria-labelledby="practise">
        <h2 id="practise" className={styles.heading}>
          Practise
        </h2>
        {/* "key" starts a fresh exercise when you open another word */}
        <WordExercise key={word.id} word={word} />
      </section>
    </article>
  )
}
