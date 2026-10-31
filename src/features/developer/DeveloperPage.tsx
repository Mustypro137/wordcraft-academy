import { Link } from 'react-router'
import { developerTopics } from '../../data/developerTopics'
import { useActiveProfile, useWordStates } from '../../store/learnerStore'
import { KidsNote } from './KidsNote'
import styles from './Developer.module.css'

// The list of Developer English topics, with how many of each topic's words are saved.
export function DeveloperPage() {
  const profile = useActiveProfile()
  const states = useWordStates()
  if (!profile) return null

  return (
    <article className={styles.page}>
      <title>Developer English · WordCraft Academy</title>
      <h1 className={styles.title}>Developer English</h1>
      {profile.ageGroup === 'kids' ? (
        <KidsNote />
      ) : (
        <>
          <p className={styles.intro}>
            Learn the words developers use in code, project requirements, team messages and prompts for Claude Code.
            Each topic breaks real sentences down into plain English.
          </p>
          <ul className={styles.topicList}>
            {developerTopics.map((topic) => {
              const saved = topic.wordIds.filter((id) => states[id]).length
              return (
                <li key={topic.id}>
                  <Link to={`/developer/${topic.id}`} className={styles.topicCard}>
                    <span className={styles.topicTitle}>{topic.title}</span>
                    <span className={styles.soft}>{topic.summary}</span>
                    <span className={styles.small}>
                      {saved === 0 ? `${topic.wordIds.length} words` : `${saved} of ${topic.wordIds.length} words in My Words`}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </article>
  )
}
