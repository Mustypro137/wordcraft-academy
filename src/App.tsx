import { useEffect, type ReactElement } from 'react'
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router'
import { AppShell } from './components/AppShell/AppShell'
import { sections } from './components/AppShell/sections'
import { ExplorePage } from './features/explore/ExplorePage'
import { WordPage } from './features/explore/WordPage'
import { MorePage } from './features/more/MorePage'
import { CreateProfile } from './features/onboarding/CreateProfile'
import { NotFoundPage } from './features/placeholder/NotFoundPage'
import { PlaceholderPage } from './features/placeholder/PlaceholderPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { MyWordsPage } from './features/words/MyWordsPage'
import { protectStorage } from './store/backup'
import { useDisplaySettings } from './store/displaySettings'
import { useActiveProfile } from './store/learnerStore'

// Sections that are built. Every other section still shows its placeholder.
const builtPages: Record<string, ReactElement> = {
  '/explore': <ExplorePage />,
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
