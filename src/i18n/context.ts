import { createContext } from 'react'
import type { Lang, L10n } from '../types'

export interface I18nContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string) => string
  localized: (value: L10n) => { text: string; englishOnly: boolean }
}

export const I18nContext = createContext<I18nContextValue | null>(null)
