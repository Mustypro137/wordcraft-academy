import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fonts are stored inside the app, so no request goes to an outside server
import '@fontsource-variable/atkinson-hyperlegible-next'
import '@fontsource-variable/literata/opsz.css'
import '@fontsource-variable/jetbrains-mono'
import './styles/tokens.css'
import './styles/global.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
