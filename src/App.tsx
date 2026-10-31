import { lazy, useEffect, type ComponentType, type ReactElement } from 'react'
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router'
import { AppShell } from './components/AppShell/AppShell'
import { sections } from './components/AppShell/sections'
import { MorePage } from './features/more/MorePage'
import { CreateProfile } from './features/onboarding/CreateProfile'
import { NotFoundPage } from './features/placeholder/NotFoundPage'
import { PlaceholderPage } from './features/placeholder/PlaceholderPage'
import { TodayPage } from './features/today/TodayPage'
import { protectStorage } from './store/backup'
import { useDisplaySettings } from './store/displaySettings'
import { useActiveProfile } from './store/learnerStore'

const RELOADED_KEY = 'wordcraft-reloaded-for-update'

/**
 * Code splitting: a page's code is downloaded only when the page is first opened,
 * so the app starts faster. Today, the home page, is part of the main file.
 *
 * After a new version is deployed, an open tab may ask for a file that no longer exists.
 * Then the page reloads once to get the new version (the flag stops it reloading again and again).
 */
function page<K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) {
  return lazy(() =>
    load().then(
      (module) => {
        sessionStorageSafe(() => sessionStorage.removeItem(RELOADED_KEY))
        return { default: module[name] }
      },
      (error) => {
        if (sessionStorageSafe(() => sessionStorage.getItem(RELOADED_KEY))) throw error
        sessionStorageSafe(() => sessionStorage.setItem(RELOADED_KEY, '1'))
        window.location.reload()
        // Never settles: the page is reloading
        return new Promise<never>(() => {})
      },
    ),
  )
}

/** Browser storage can be blocked; then the reload guard simply doesn't apply */
function sessionStorageSafe<T>(run: () => T): T | null {
  try {
    return run()
  } catch {
    return null
  }
}

const ExplorePage = page(() => import('./features/explore/ExplorePage'), 'ExplorePage')
const WordPage = page(() => import('./features/explore/WordPage'), 'WordPage')
const MyWordsPage = page(() => import('./features/words/MyWordsPage'), 'MyWordsPage')
const ReviewPage = page(() => import('./features/review/ReviewPage'), 'ReviewPage')
const SentencesPage = page(() => import('./features/sentences/SentencesPage'), 'SentencesPage')
const SentenceLessonPage = page(() => import('./features/sentences/SentenceLessonPage'), 'SentenceLessonPage')
const WritingPage = page(() => import('./features/writing/WritingPage'), 'WritingPage')
const WritingEditorPage = page(() => import('./features/writing/WritingEditorPage'), 'WritingEditorPage')
const DeveloperPage = page(() => import('./features/developer/DeveloperPage'), 'DeveloperPage')
const DeveloperTopicPage = page(() => import('./features/developer/DeveloperTopicPage'), 'DeveloperTopicPage')
const SettingsPage = page(() => import('./features/settings/SettingsPage'), 'SettingsPage')

// Sections that are built. Every other section still shows its placeholder.
const builtPages: Record<string, ReactElement> = {
  '/': <TodayPage />,
  '/explore': <ExplorePage />,
  '/review': <ReviewPage />,
  '/sentences': <SentencesPage />,
  '/write': <WritingPage />,
  '/developer': <DeveloperPage />,
  '/settings': <SettingsPage />,
  '/words': <MyWordsPage />,
}

function NewProfilePage() {
  const navigate = useNavigate()
  return <CreateProfile onFinished={() => navigate('/')} onCancel={() => navigate(-1)} />
}

// Routes: each web address shows one page inside the app shell.
const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      ...sections.map((section) => ({
        path: section.path,
        element: builtPages[section.path] ?? <PlaceholderPage section={section} />,
      })),
      { path: '/explore/:wordId', element: <WordPage /> },
      { path: '/sentences/:patternId', element: <SentenceLessonPage /> },
      { path: '/write/:situationId', element: <WritingEditorPage /> },
      { path: '/developer/:topicId', element: <DeveloperTopicPage /> },
      { path: '/more', element: <MorePage /> },
      { path: '/profiles/new', element: <NewProfilePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

function App() {
  const profile = useActiveProfile()
  useDisplaySettings(profile)

  // Once there is something worth keeping, ask the browser not to delete it
  const hasProfile = Boolean(profile)
  useEffect(() => {
    if (hasProfile) protectStorage().catch(() => {})
  }, [hasProfile])

  // No profile yet (first visit, or the last one was deleted): welcome screens
  if (!profile) {
    return (
      <main id="main" className="welcome-page">
        <CreateProfile firstVisit onFinished={() => router.navigate('/')} />
      </main>
    )
  }
  return <RouterProvider router={router} />
}

export default App
