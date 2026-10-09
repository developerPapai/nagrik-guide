import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/noto-sans-devanagari/400.css'
import '@fontsource/noto-sans-devanagari/700.css'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { I18nProvider } from './i18n/I18nProvider'
import { VaultProvider } from './lib/VaultProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <VaultProvider>
        <I18nProvider>
          <App />
        </I18nProvider>
      </VaultProvider>
    </HashRouter>
  </StrictMode>,
)
