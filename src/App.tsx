import { createBrowserRouter, RouterProvider } from 'react-router'
import { AppShell } from './components/AppShell/AppShell'
import { sections } from './components/AppShell/sections'
import { MorePage } from './features/more/MorePage'
import { NotFoundPage } from './features/placeholder/NotFoundPage'
import { PlaceholderPage } from './features/placeholder/PlaceholderPage'

// Routes: each web address shows one page inside the app shell.
// Until a section is built, its address shows a placeholder page.
const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      ...sections.map((section) => ({
        path: section.path,
        element: <PlaceholderPage section={section} />,
      })),
      { path: '/more', element: <MorePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
