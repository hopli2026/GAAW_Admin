import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/funnel-display/300.css'
import '@fontsource/funnel-display/400.css'
import '@fontsource/funnel-display/500.css'
import '@fontsource/funnel-display/600.css'
import '@fontsource/funnel-display/700.css'
import '@fontsource/funnel-display/800.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
