import { useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { Icon } from '../Icon'
import { phoneTabs, sections, type Section } from './sections'
import styles from './AppShell.module.css'

// Sections grouped under their headings, in order. "Track" sits at the bottom.
const mainGroups = groupSections(sections.filter((s) => s.group !== 'Track'))
const footerSections = sections.filter((s) => s.group === 'Track')

function groupSections(list: Section[]) {
  const groups: { heading: Section['group']; items: Section[] }[] = []
  for (const section of list) {
    const last = groups.at(-1)
    if (last && last.heading === section.group) last.items.push(section)
    else groups.push({ heading: section.group, items: [section] })
  }
  return groups
}

function SideLink({ section }: { section: Section }) {
  return (
    <NavLink
      to={section.path}
      end
      className={({ isActive }) => (isActive ? `${styles.sideLink} ${styles.current}` : styles.sideLink)}
    >
      <Icon name={section.icon} className={styles.sideIcon} />
      <span className={styles.longLabel}>{section.label}</span>
      <span className={styles.shortLabel} aria-hidden="true">
        {section.shortLabel}
      </span>
    </NavLink>
  )
}

export function AppShell() {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const isFirstRender = useRef(true)

  // After a page change, move keyboard and screen-reader focus to the new page,
  // so the learner does not have to tab through the whole menu again.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    mainRef.current?.focus()
  }, [pathname])

  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skipLink}>
        Skip to content
      </a>

      {/* Desktop sidebar; becomes the icon rail on tablets */}
      <nav className={styles.side} aria-label="Main">
        <NavLink to="/" className={styles.brand} aria-label="WordCraft Academy, Today">
          <img src="/favicon.svg" alt="" width="28" height="28" />
          <span className={styles.longLabel}>WordCraft</span>
        </NavLink>

        {mainGroups.map((group) => (
          <div key={group.heading ?? 'top'} className={styles.group}>
            {group.heading && (
              <h2 className={styles.groupHeading}>
                <span className={styles.longLabel}>{group.heading}</span>
              </h2>
            )}
            <ul className={styles.list}>
              {group.items.map((section) => (
                <li key={section.path}>
                  <SideLink section={section} />
                </li>
              ))}
            </ul>
          </div>
        ))}

        <ul className={`${styles.list} ${styles.footer}`}>
          {footerSections.map((section) => (
            <li key={section.path}>
              <SideLink section={section} />
            </li>
          ))}
        </ul>
      </nav>

      <main id="main" ref={mainRef} tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>

      {/* Phone tab bar */}
      <nav className={styles.tabs} aria-label="Main">
        <ul className={styles.tabList}>
          {phoneTabs.map((tab) => {
            const isCurrent = tab.covers.includes(pathname)
            return (
              <li key={tab.path}>
                <Link
                  to={tab.path}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={isCurrent ? `${styles.tab} ${styles.current}` : styles.tab}
                >
                  <span className={styles.tabIcon}>
                    <Icon name={tab.icon} />
                  </span>
                  {tab.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
