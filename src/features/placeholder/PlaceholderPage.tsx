import type { Section } from '../../components/AppShell/sections'
import styles from './PlaceholderPage.module.css'

// Temporary page for a section that is not built yet.
// Each roadmap step replaces one of these with the real page.
export function PlaceholderPage({ section }: { section: Section }) {
  return (
    <article className={styles.page}>
      <title>{`${section.label} · WordCraft Academy`}</title>
      <h1 className={styles.title}>{section.label}</h1>
      <p className={styles.summary}>{section.summary}</p>
      <p className={styles.status}>
        {section.step
          ? `This page is not built yet. It arrives in Step ${section.step} of the plan.`
          : 'This page is not built yet. It arrives later in the plan.'}
      </p>
    </article>
  )
}
