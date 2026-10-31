import { Suspense, useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { useActiveProfile } from '../../store/learnerStore'
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
      // Explore stays highlighted on /explore/improve; Today only on "/"
      end={section.path === '/'}
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
  const profile = useActiveProfile()
  const mainRef = useRef<HTMLElement>(null)
  const lastPath = useRef(pathname)

  // After a page change, move keyboard and screen-reader focus to the new page,
  // so the learner does not have to tab through the whole menu again.
  // Comparing addresses (not "is this the first run?") also works when React runs effects twice in development.
  useEffect(() => {
    if (lastPath.current === pathname) return
    lastPath.current = pathname
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

        {profile && (
          <Link to="/settings" className={styles.profile}>
            <span className={styles.avatar} aria-hidden="true">
              {profile.name.charAt(0).toUpperCase()}
            </span>
            <span className={styles.longLabel}>
              <span className={styles.profileName}>{profile.name}</span>
              <span className={styles.profileAction}>Switch profile</span>
            </span>
          </Link>
        )}
      </nav>

      <main id="main" ref={mainRef} tabIndex={-1} className={styles.main}>
        {/* Pages load their code when first opened (see App.tsx); this shows meanwhile */}
        <Suspense
          fallback={
            <p className={styles.loading} role="status">
              Loading…
            </p>
          }
        >
          <Outlet />
        </Suspense>
      </main>

      {/* Phone tab bar */}
      <nav className={styles.tabs} aria-label="Main">
        <ul className={styles.tabList}>
          {phoneTabs.map((tab) => {
            const isCurrent = tab.covers.some((path) =>
              path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`),
            )
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
