import { useEffect, useMemo, useState, type ReactNode } from 'react'
import en from './en.json'
import hi from './hi.json'
import { I18nContext, type I18nContextValue } from './context'
import type { Lang, L10n } from '../types'

const translations: Record<Lang, Record<string, string>> = { en, hi }

function getInitialLanguage(): Lang {
  return localStorage.getItem('nagrik-language') === 'hi' ? 'hi' : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, updateLang] = useState<Lang>(getInitialLanguage)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo<I18nContextValue>(() => {
    function setLang(nextLang: Lang) {
      localStorage.setItem('nagrik-language', nextLang)
      updateLang(nextLang)
    }

    function t(key: string): string {
      return translations[lang][key] ?? translations.en[key] ?? key
    }

    function localized(value: L10n): { text: string; englishOnly: boolean } {
      const text = lang === 'hi' ? value.hi : value.en
      return {
        text: text ?? value.en,
        englishOnly: lang === 'hi' && !value.hi,
      }
    }

    return { lang, setLang, t, localized }
  }, [lang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
