import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import Fuse from 'fuse.js'
import {
  getAboutContent,
  getArticleFinder,
  getCases,
  getChecklist,
  getContacts,
  getDisclaimer,
  getFundamentalRights,
  getGlossary,
  getLawRefs,
  getScripts,
  modules,
} from './lib/content'
import { clearAllAppData, readVault, writeVault } from './lib/storage'
import { clearFailedPinAttempts, registerFailedPinAttempt, remainingPinDelay } from './lib/lock'
import { useVault } from './lib/useVault'
import { useI18n } from './i18n/useI18n'
import type { FRArticle, IncidentNote, Module, UserContact } from './types'
import './App.css'

const situations = ['stopped', 'detained', 'arrested', 'custody', 'court'] as const
const hindiArticleAliases: Record<string, string> = {
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  'क': 'a', 'ख': 'b', 'ग': 'c', 'घ': 'd', 'ङ': 'e',
}

function normalizeArticleSearch(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[०-९कखगघङ]/g, (character) => hindiArticleAliases[character] ?? character)
    .replace(/\b(?:article|art|anuchhed)\b|अनुच्छेद/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

function articleMatchesQuery(article: FRArticle, normalizedQuery: string): boolean {
  if (/^[0-9\s]+$/.test(normalizedQuery)) {
    return normalizeArticleSearch(article.article).split(' ')[0] === normalizedQuery
  }
  return normalizeArticleSearch([
    article.article,
    article.name.en,
    article.name.hi,
    article.plain.en,
    article.plain.hi,
    article.limits?.en ?? '',
    article.limits?.hi ?? '',
    article.atProtest?.en ?? '',
    article.atProtest?.hi ?? '',
    ...article.tags,
  ].join(' ')).includes(normalizedQuery)
}

function getKeyNumberGroups() {
  const grouped = new Map<string, FRArticle[]>()
  for (const article of getFundamentalRights()) {
    if (article.priority !== 1 || !article.keyGroup || !article.memory) continue
    grouped.set(article.keyGroup, [...(grouped.get(article.keyGroup) ?? []), article])
  }
  return [...grouped.entries()].map(([keyGroup, groupedArticles]) => ({
    keyGroup,
    article: groupedArticles[0],
    articles: groupedArticles,
    memory: groupedArticles[0].memory!,
  }))
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1))
    const item = result[index]
    result[index] = result[target]
    result[target] = item
  }
  return result
}

function QuickExit() {
  const { t } = useI18n()
  const [error, setError] = useState('')

  async function quickExit() {
    if (Capacitor.isNativePlatform()) {
      try {
        await CapacitorApp.minimizeApp()
      } catch {
        setError(t('quick.exitError'))
      }
    } else {
      window.location.replace('about:blank')
    }
  }

  return (
    <>
      <button className="quick-exit" type="button" onClick={() => void quickExit()}>
        {t('quick.exit')}
      </button>
      {error && <span className="quick-exit-error" role="alert">{error}</span>}
    </>
  )
}

function AppChrome() {
  const { lang, setLang, t } = useI18n()
  const vault = useVault()
  const [largeText, setLargeText] = useState(false)
  const [darkTheme, setDarkTheme] = useState(
    () => localStorage.getItem('nagrik-theme') === 'dark',
  )
  const hasDrafts = modules.some((module) => module.status !== 'lawyer_reviewed')

  useEffect(() => {
    document.documentElement.dataset.theme = darkTheme ? 'dark' : 'light'
    localStorage.setItem('nagrik-theme', darkTheme ? 'dark' : 'light')
  }, [darkTheme])

  useEffect(() => {
    document.documentElement.dataset.textSize = largeText ? 'large' : 'normal'
  }, [largeText])

  return (
    <>
      <header className="topbar">
        <Link className="wordmark" to="/" aria-label={t('app.name')}>{t('app.name')}</Link>
        <nav className="top-controls" aria-label={t('nav.accessibility')}>
          <button className="control-button" type="button" onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}>
            {lang === 'en' ? 'EN | हि' : 'हि | EN'}
          </button>
          <button className="control-button" type="button" aria-label={t('settings.textsize')} onClick={() => setLargeText((value) => !value)}>
            {largeText ? 'A−' : 'A+'}
          </button>
          <button className="control-button theme-toggle" type="button" aria-label={t('settings.theme')} onClick={() => setDarkTheme((value) => !value)}>
            {darkTheme ? '☀' : '◐'}
          </button>
          {vault.pinEnabled && <button className="control-button" type="button" onClick={vault.lock}>{t('nav.lock')}</button>}
          <QuickExit />
        </nav>
      </header>
      {hasDrafts && (
        <div className="draft-banner" role="status">
          {t('banner.draft')}
        </div>
      )}
      {vault.locked ? <LockScreen /> : <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/s/:situationId" element={<Situation />} />
        <Route path="/m/:id" element={<ModuleScreen />} />
        <Route path="/rights" element={<RightsScreen />} />
        <Route path="/rights/finder" element={<ArticleFinderScreen />} />
        <Route path="/rights/practice" element={<RightsPracticeScreen />} />
        <Route path="/rights/:id" element={<RightsArticleScreen />} />
        <Route path="/wallet-card" element={<WalletCardScreen />} />
        <Route path="/scripts" element={<ScriptsScreen />} />
        <Route path="/scripts/:id" element={<ScriptDetail />} />
        <Route path="/contacts" element={<ContactsScreen />} />
        <Route path="/notes" element={<NotesScreen />} />
        <Route path="/notes/new" element={<NoteEditor />} />
        <Route path="/notes/:id" element={<NoteDetail />} />
        <Route path="/library" element={<LibraryScreen />} />
        <Route path="/shutdown" element={<DirectModule id="M08" />} />
        <Route path="/checklist" element={<ChecklistScreen />} />
        <Route path="/cases" element={<CasesScreen />} />
        <Route path="/glossary" element={<GlossaryScreen />} />
        <Route path="/about" element={<AboutScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>}
      <footer className="site-footer">
        <DisclaimerText />
        <Link to="/about">{t('nav.about')}</Link>
      </footer>
    </>
  )
}

function Home() {
  const { t } = useI18n()
  const actions = [
    { id: 'stopped', icon: '○' },
    { id: 'detained', icon: '!' },
    { id: 'custody', icon: '⌂' },
    { id: 'court', icon: '§' },
    { id: 'protest', icon: '✳' },
    { id: 'articles', icon: '§' },
  ]
  const actionTitles: Record<string, string> = {
    stopped: 'home.stopped',
    detained: 'home.arrested',
    custody: 'home.custody',
    court: 'home.court',
    protest: 'home.protest',
    articles: 'home.articles',
  }

  return (
    <main className="page home-page">
      <section className="home-intro">
        <p className="eyebrow">{t('app.eyebrow')}</p>
        <h1>{t('app.title')}</h1>
        <DisclaimerText />
      </section>
      <section className="urgent-links" aria-label={t('home.situations')}>
        {actions.map(({ id, icon }) => (
          <Link className="situation-button" key={id} to={id === 'protest' ? '/m/M07' : id === 'articles' ? '/rights' : `/s/${id}`}>
            <span className="situation-icon" aria-hidden="true">{icon}</span>
            <span>{t(actionTitles[id])}</span>
            <span className="arrow" aria-hidden="true">›</span>
          </Link>
        ))}
      </section>
      <section className="shortcut-grid" aria-label={t('home.shortcuts')}>
        <Link className="shortcut-button" to="/scripts">{t('home.say')}</Link>
        <Link className="shortcut-button" to="/contacts">{t('home.help')}</Link>
        <Link className="shortcut-button" to="/notes">{t('home.notes')}</Link>
        <Link className="shortcut-button" to="/library">{t('home.search')}</Link>
        <Link className="shortcut-button" to="/rights">{t('nav.rights')}</Link>
      </section>
      <nav className="footer-links" aria-label={t('home.more')}>
        <Link to="/shutdown">{t('home.shutdown')}</Link>
        <Link to="/checklist">{t('nav.checklist')}</Link>
        <Link to="/cases">{t('nav.cases')}</Link>
        <Link to="/glossary">{t('nav.glossary')}</Link>
        <Link to="/about">{t('nav.about')}</Link>
        <Link to="/rights/finder">{t('rights.finder')}</Link>
        <Link to="/wallet-card">{t('rights.wallet')}</Link>
        <Link to="/settings">{t('nav.settings')}</Link>
      </nav>
    </main>
  )
}

function Situation() {
  const { situationId = '' } = useParams()
  const { t, localized } = useI18n()
  const [tab, setTab] = useState<'do' | 'say' | 'know'>('do')
  if (!situations.some((id) => id === situationId)) return <Navigate to="/" replace />
  const module = modules.find((item) => item.situationId === situationId)
  if (!module) return <p className="empty-state">{t('content.notfound')}</p>
  const tabTypes: Record<typeof tab, Module['steps'][number]['type'][]> = {
    do: ['do', 'dont', 'next'],
    say: ['say'],
    know: ['know'],
  }
  const groupedSteps = module.steps.filter((step) => tabTypes[tab].includes(step.type))
  const title = localized(module.title)
  const summary = localized(module.summary)

  return (
    <main className="page">
      <Link className="back-link" to="/">{t('nav.home')}</Link>
      <section className="screen-heading">
        <p className="eyebrow">{t('situation.label')}</p>
        <h1>{title.text}</h1>
        {title.englishOnly && <span className="language-badge">{t('english.only')}</span>}
        <p>{summary.text}</p>
      </section>
      <div className="tab-list" role="tablist" aria-label={t('situation.tabs')}>
        {(['do', 'say', 'know'] as const).map((name) => (
          <button
            className={`tab-button${tab === name ? ' active' : ''}`}
            id={`tab-${name}`}
            key={name}
            type="button"
            role="tab"
            aria-selected={tab === name}
            aria-controls="situation-panel"
            onClick={() => setTab(name)}
          >
            {t(`tab.${name}`)}
          </button>
        ))}
      </div>
      <section className="step-list" id="situation-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {groupedSteps.length ? groupedSteps.map((step, index) => (
          <Step key={`${step.type}-${index}`} step={step} />
        )) : <p className="empty-state">{t('situation.noContent')}</p>}
      </section>
      <RelatedModules module={module} />
      <ModuleFooter module={module} />
    </main>
  )
}

function ModuleScreen() {
  const { id = '' } = useParams()
  const module = modules.find((item) => item.id.toLowerCase() === id.toLowerCase())
  if (!module) return <Navigate to="/" replace />
  return <ModuleDetail module={module} />
}

function ModuleDetail({ module }: { module: Module }) {
  const { localized, t } = useI18n()
  const title = localized(module.title)
  const summary = localized(module.summary)

  return (
    <main className="page">
      <Link className="back-link" to="/">{t('nav.home')}</Link>
      {module.status !== 'lawyer_reviewed' && (
        <div className="draft-banner module-draft" role="status">{t('banner.draft')}</div>
      )}
      <section className="screen-heading">
        <span className={`review-badge status-${module.status}`}>{t(`review.${module.status}`)}</span>
        <h1>{title.text}</h1>
        {title.englishOnly && <span className="language-badge">{t('english.only')}</span>}
        <p>{summary.text}</p>
      </section>
      {module.steps.map((step, index) => <Step key={`${step.type}-${index}`} step={step} />)}
      {module.grayAreas?.map((item, index) => {
        const grayArea = localized(item)
        return (
          <aside className="gray-area" key={index}>
            <h2>{t('gray.title')}</h2>
            <p>{grayArea.text}</p>
            {grayArea.englishOnly && <span className="language-badge">{t('english.only')}</span>}
          </aside>
        )
      })}
      <LegalBasis module={module} />
      <RelatedModules module={module} />
      <ModuleFooter module={module} />
    </main>
  )
}

function Step({ step }: { step: Module['steps'][number] }) {
  const { localized, t } = useI18n()
  const text = localized(step.text)
  const scriptButton = step.scriptId
  return (
    <article className={`step-card step-${step.type}`}>
      <h2>{t(`step.${step.type}`)}</h2>
      <p>{text.text}</p>
      {text.englishOnly && <span className="language-badge">{t('english.only')}</span>}
      {scriptButton && <Link className="secondary-action script-step-link" to={`/scripts/${scriptButton}?show=1`}>{t('rights.say')} · {scriptButton}</Link>}
    </article>
  )
}

function LegalBasis({ module }: { module: Module }) {
  const { t, localized } = useI18n()
  const refs = getLawRefs()
  const usedIds = new Set(module.steps.flatMap((step) => step.refs ?? []))
  const usedRefs = refs.filter((ref) => usedIds.has(ref.id))
  const usedCases = getCases().filter((card) => usedIds.has(card.id) && !usedRefs.some((ref) => ref.id === card.id))
  if (usedRefs.length === 0 && usedCases.length === 0) return null

  return (
    <details className="legal-basis">
      <summary>{t('law.basis')}</summary>
      {usedRefs.map((ref) => {
        const label = localized(ref.label)
        const relatedArticles = getFundamentalRights().filter((article) => article.refs?.includes(ref.id))
        return (
          <div className="law-ref" key={ref.id}>
            <strong>{label.text}</strong>
            {label.englishOnly && <span className="language-badge">{t('english.only')}</span>}
            <dl>
              {ref.current && <><dt>{t('law.current')}</dt><dd>{ref.current}</dd></>}
              {ref.old && <><dt>{t('law.old')}</dt><dd>{ref.old}</dd></>}
            </dl>
            {relatedArticles.length > 0 && (
              <div className="article-chip-list">
                {relatedArticles.map((article) => (
                  <Link className="article-chip" key={article.id} to={`/rights/${article.id}`}>
                    {t('rights.article')} {article.article}
                  </Link>
                ))}
              </div>
            )}
            {ref.verify && <small>{t('law.verify')}</small>}
          </div>
        )
      })}
      {usedCases.map((card) => {
        const name = localized(card.name)
        return (
          <div className="law-ref" key={card.id}>
            <Link to="/cases">{name.text} · {card.citation}</Link>
            {card.verifyCitation && <small>{t('case.verify')}</small>}
          </div>
        )
      })}
    </details>
  )
}

function RelatedModules({ module }: { module: Module }) {
  const { t, lang, localized } = useI18n()
  if (!module.related?.length) return null
  const related = modules.filter((item) => module.related?.includes(item.id))
  return (
    <section className="related-list">
      <h2>{t('module.related')}</h2>
      {related.map((item) => {
        const title = localized(item.title)
        return (
          <Link className="related-link" key={item.id} to={`/m/${item.id}`}>
            <span>{title.text}{lang === 'hi' && title.englishOnly && <span className="language-badge">{t('english.only')}</span>}</span>
            <span>›</span>
          </Link>
        )
      })}
    </section>
  )
}

function ModuleFooter({ module }: { module: Module }) {
  const { t } = useI18n()
  return (
    <footer className="module-footer">
      <span>{t('badge.drafted')}: {module.draftedOn}</span>
      <span>{t('badge.verified')}: {module.lastVerified ?? t('badge.notyet')}</span>
      <span className={`review-badge status-${module.status}`}>{t(`review.${module.status}`)}</span>
      <DisclaimerText />
    </footer>
  )
}

function DisclaimerText() {
  const { localized } = useI18n()
  return <p>{localized(getDisclaimer()).text}</p>
}

function DirectModule({ id }: { id: string }) {
  const module = modules.find((item) => item.id === id)
  return module ? <ModuleDetail module={module} /> : <Navigate to="/" replace />
}

function ScriptsScreen() {
  const { t, localized } = useI18n()
  const scripts = getScripts()
  const situationNames: Record<string, string> = {
    stopped: t('situation.stopped'),
    detained: t('situation.detained'),
    arrested: t('situation.arrested'),
    custody: t('situation.custody'),
    court: t('situation.court'),
  }
  const grouped = [...new Set(scripts.flatMap((script) => script.situations))]

  return (
    <main className="page">
      <Link className="back-link" to="/">{t('nav.home')}</Link>
      <section className="screen-heading">
        <h1>{t('nav.scripts')}</h1>
        <p>{t('scripts.safety')}</p>
      </section>
      {grouped.map((situation) => (
        <section className="related-list" key={situation}>
          <h2>{situationNames[situation] ?? situation}</h2>
          {scripts.filter((script) => script.situations.includes(situation)).map((script) => {
            const when = localized(script.when)
            return (
              <Link className="related-link" key={`${situation}-${script.id}`} to={`/scripts/${script.id}`}>
                <span>{script.id} · {when.text}</span><span>›</span>
              </Link>
            )
          })}
        </section>
      ))}
    </main>
  )
}

function ScriptDetail() {
  const { id = '' } = useParams()
  const [searchParams] = useSearchParams()
  const { lang, setLang, t, localized } = useI18n()
  const script = getScripts().find((item) => item.id.toLowerCase() === id.toLowerCase())
  const [showMode, setShowMode] = useState(() => searchParams.get('show') === '1')
  if (!script) return <Navigate to="/scripts" replace />
  const when = localized(script.when)

  return (
    <main className="page">
      <Link className="back-link" to="/scripts">{t('nav.scripts')}</Link>
      <section className="screen-heading">
        <p className="eyebrow">{script.id}</p>
        <h1>{t('script.card')}</h1>
        <p>{when.text}</p>
      </section>
      <article className="script-translation">
        <h2>{t('script.english')}</h2>
        <p>{script.en}</p>
      </article>
      <article className="script-translation">
        <h2>{t('script.hindi')}</h2>
        <p lang="hi">{script.hi}</p>
      </article>
      <article className="script-translation">
        <h2>{t('script.roman')}</h2>
        <p>{script.hiRoman}</p>
      </article>
      {script.warning && <aside className="gray-area"><h2>{t('script.warning')}</h2><p>{localized(script.warning).text}</p></aside>}
      {script.tips?.map((tip, index) => (
        <section className="step-card script-tips" key={index}>
          <h2>{t('script.tips')}</h2>
          <p><strong>{t('script.do')}:</strong> {localized(tip.do).text}</p>
          <p><strong>{t('script.dont')}:</strong> {localized(tip.dont).text}</p>
        </section>
      ))}
      {script.safetyLine ? <p className="safety-line">{localized(script.safetyLine).text}</p> : <SafetyLine />}
      {!!script.articleIds?.length && (
        <div className="article-chip-list">
          {getFundamentalRights().filter((article) => script.articleIds?.includes(article.id)).map((article) => (
            <Link className="article-chip" key={article.id} to={`/rights/${article.id}`}>
              {t('rights.article')} {article.article}
            </Link>
          ))}
        </div>
      )}
      <button className="primary-action" type="button" onClick={() => setShowMode(true)}>{t('show.officer')}</button>
      {showMode && (
        <ShowToOfficer
          language={lang}
          scriptText={script[lang]}
          onLanguageChange={() => setLang(lang === 'en' ? 'hi' : 'en')}
          onClose={() => setShowMode(false)}
        />
      )}
    </main>
  )
}

function SafetyLine() {
  const { t } = useI18n()
  return <p className="safety-line">{t('script.safety')}</p>
}

function ShowToOfficer({
  language,
  scriptText,
  onLanguageChange,
  onClose,
}: {
  language: 'en' | 'hi'
  scriptText: string
  onLanguageChange: () => void
  onClose: () => void
}) {
  const { t } = useI18n()
  const [wakeLockError, setWakeLockError] = useState(false)

  useEffect(() => {
    let sentinel: WakeLockSentinel | undefined
    let cancelled = false

    async function requestWakeLock() {
      if (!('wakeLock' in navigator)) return
      try {
        const lock = await navigator.wakeLock.request('screen')
        if (cancelled) {
          await lock.release()
        } else {
          sentinel = lock
        }
      } catch {
        setWakeLockError(true)
      }
    }

    void requestWakeLock()
    return () => {
      cancelled = true
      if (sentinel) void sentinel.release()
    }
  }, [])

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="officer-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t('show.officer')}
      lang={language}
      onClick={onClose}
    >
      <div className="officer-controls">
        <button type="button" onClick={(event) => { event.stopPropagation(); onLanguageChange() }}>
          {language === 'en' ? 'EN | हि' : 'हि | EN'}
        </button>
        <button type="button" onClick={(event) => { event.stopPropagation(); onClose() }}>{t('show.close')}</button>
      </div>
      <p className="officer-text">{scriptText}</p>
      {wakeLockError && <p className="wake-lock-note">{t('show.wakeLockUnavailable')}</p>}
    </div>
  )
}

function ContactsScreen() {
  const { t, lang, localized } = useI18n()
  const { pinEnabled } = useVault()
  const [contacts, setContacts] = useState<UserContact[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<UserContact['role']>('family')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    readVault()
      .then((data) => setContacts(data.contacts))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : t('storage.readError')))
  }, [t])

  async function addContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim() || !/^\+?[0-9\s()-]+$/.test(phone.trim())) {
      setError(t('contacts.invalid'))
      return
    }
    const next = [...contacts, { id: crypto.randomUUID(), name: name.trim(), phone: phone.trim(), role, note: note.trim() }]
    try {
      const data = await readVault()
      await writeVault({ ...data, contacts: next })
      setContacts(next)
      setName('')
      setPhone('')
      setNote('')
      setError('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('storage.writeError'))
    }
  }

  async function removeContact(id: string) {
    const next = contacts.filter((contact) => contact.id !== id)
    try {
      const data = await readVault()
      await writeVault({ ...data, contacts: next })
      setContacts(next)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('storage.writeError'))
    }
  }

  return (
    <main className="page">
      <Link className="back-link" to="/">{t('nav.home')}</Link>
      <h1>{t('contacts.national')}</h1>
      <p className="empty-state">{t('contacts.verifyWarning')}</p>
      {getContacts().map((contact) => {
        const label = localized(contact.label)
        return (
          <article className="step-card" key={contact.id}>
            <h2>{label.text}</h2>
            {label.englishOnly && <span className="language-badge">{t('english.only')}</span>}
            <p>{contact.note ? localized(contact.note).text : ''}</p>
            {contact.note && lang === 'hi' && !contact.note.hi && <span className="language-badge">{t('english.only')}</span>}
            <a className="phone-link" href={`tel:${contact.number}`}>{contact.number}</a>
            <small>{contact.verifiedOn ?? t('contacts.notVerified')}</small>
          </article>
        )
      })}
      <section className="related-list">
        <h2>{t('contacts.mine')}</h2>
        {!pinEnabled && <p className="empty-state">{t('warn.nopin')}</p>}
        {contacts.map((contact) => (
          <article className="step-card" key={contact.id}>
            <h3>{contact.name}</h3>
            <p>{t(`contact.role.${contact.role}`)}{contact.note ? ` · ${contact.note}` : ''}</p>
            <a className="phone-link" href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}>{contact.phone}</a>
            <button className="secondary-action" type="button" onClick={() => void removeContact(contact.id)}>{t('contacts.remove')}</button>
          </article>
        ))}
        <form className="form-card" onSubmit={(event) => void addContact(event)}>
          <h3>{t('contacts.add')}</h3>
          <label>{t('contacts.name')}<input required value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label>{t('contacts.phone')}<input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
          <label>{t('contacts.role')}<select value={role} onChange={(event) => setRole(event.target.value as UserContact['role'])}>
            {(['family','lawyer','friend','organisation','other'] as const).map((value) => <option key={value} value={value}>{t(`contact.role.${value}`)}</option>)}
          </select></label>
          <label>{t('contacts.note')}<input value={note} onChange={(event) => setNote(event.target.value)} /></label>
          <button className="primary-action" type="submit">{t('contacts.save')}</button>
        </form>
        {error && <p className="error-message" role="alert">{error}</p>}
      </section>
    </main>
  )
}

function LibraryScreen() {
  const { t, lang, localized } = useI18n()
  const [query, setQuery] = useState('')
  const articles = getFundamentalRights()
  const search = useMemo(
    () => new Fuse(modules, {
      threshold: 0.35,
      ignoreLocation: true,
      keys: ['title.en', 'title.hi', 'summary.en', 'summary.hi', 'steps.text.en', 'steps.text.hi', 'tags'],
    }),
    [],
  )
  const matches = query.trim() ? search.search(query).map((result) => result.item) : modules
  const normalizedQuery = normalizeArticleSearch(query)
  const articleMatches = normalizedQuery
    ? articles.filter((article) => articleMatchesQuery(article, normalizedQuery))
    : []
  const groups = [...new Set(matches.map((module) => module.group))]
  const groupNames: Record<Module['group'], string> = {
    situation: t('group.situations'),
    protest: t('group.protest'),
    special: t('group.special'),
    reference: t('group.reference'),
  }

  return (
    <main className="page">
      <Link className="back-link" to="/">{t('nav.home')}</Link>
      <h1>{t('home.search')}</h1>
      <label className="search-label">
        <span>{t('search.label')}</span>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      {!matches.length && <p className="empty-state">{t('search.noResults')}</p>}
      {groups.map((group) => (
        <section className="related-list" key={group}>
          <h2>{groupNames[group]}</h2>
          {matches.filter((module) => module.group === group).map((module) => {
            const title = localized(module.title)
            return (
              <Link className="related-link" key={module.id} to={`/m/${module.id}`}>
                <span>{title.text}{lang === 'hi' && title.englishOnly && <span className="language-badge">{t('english.only')}</span>}</span>
                <span>›</span>
              </Link>
            )
          })}
        </section>
      ))}
      {articleMatches.length > 0 && (
        <section className="related-list">
          <h2>{t('rights.allArticles')}</h2>
          {articleMatches.map((article) => {
            const name = localized(article.name)
            return (
              <Link className="related-link" key={article.id} to={`/rights/${article.id}`}>
                <span>{t('rights.article')} {article.article} · {name.text}{lang === 'hi' && name.englishOnly && <span className="language-badge">{t('english.only')}</span>}</span>
                <span>›</span>
              </Link>
            )
          })}
        </section>
      )}
    </main>
  )
}

function CasesScreen() {
  const { t, localized } = useI18n()
  const [query, setQuery] = useState('')
  const cases = getCases().filter((item) => [
    item.name.en,
    item.name.hi,
    item.holding.en,
    item.holding.hi,
    item.whyItMatters.en,
    item.whyItMatters.hi,
  ].join(' ').toLowerCase().includes(query.toLowerCase()))
  return (
    <main className="page">
      <Link className="back-link" to="/">{t('nav.home')}</Link>
      <h1>{t('nav.cases')}</h1>
      <SearchInput value={query} onChange={setQuery} />
      {cases.map((item) => (
        (() => {
          const name = localized(item.name)
          const holding = localized(item.holding)
          const whyItMatters = localized(item.whyItMatters)
          return (
            <article className="step-card" key={item.id}>
              <h2>{name.text}</h2>
              {name.englishOnly && <span className="language-badge">{t('english.only')}</span>}
              <p>{holding.text}</p>
              {holding.englishOnly && <span className="language-badge">{t('english.only')}</span>}
              <p>{whyItMatters.text}</p>
              {whyItMatters.englishOnly && <span className="language-badge">{t('english.only')}</span>}
              <p>{item.citation ? `${item.year} · ${item.citation}` : item.year}</p>
              {item.verifyCitation && <span className="review-badge">{t('case.verify')}</span>}
            </article>
          )
        })()
      ))}
    </main>
  )
}

function GlossaryScreen() {
  const { t, localized } = useI18n()
  const [query, setQuery] = useState('')
  const terms = getGlossary().filter((item) => [
    item.term.en,
    item.term.hi,
    item.meaning.en,
    item.meaning.hi,
    ...item.tags,
  ].join(' ').toLowerCase().includes(query.toLowerCase()))
  return (
    <main className="page">
      <Link className="back-link" to="/">{t('nav.home')}</Link>
      <h1>{t('nav.glossary')}</h1>
      <SearchInput value={query} onChange={setQuery} />
      {terms.map((item) => (
        (() => {
          const term = localized(item.term)
          const meaning = localized(item.meaning)
          return (
            <article className="step-card" key={item.id}>
              <h2>{term.text}</h2>
              {term.englishOnly && <span className="language-badge">{t('english.only')}</span>}
              <p>{meaning.text}</p>
              {meaning.englishOnly && <span className="language-badge">{t('english.only')}</span>}
            </article>
          )
        })()
      ))}
    </main>
  )
}

function SearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { t } = useI18n()
  return (
    <label className="search-label">
      <span>{t('search.label')}</span>
      <input type="search" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function RightsScreen() {
  const { t, lang, localized } = useI18n()
  const [query, setQuery] = useState('')
  const articles = getFundamentalRights()
  const normalizedQuery = normalizeArticleSearch(query)
  const matches = normalizedQuery
    ? articles.filter((article) => articleMatchesQuery(article, normalizedQuery))
    : articles
  const groups = [...new Set(matches.map((article) => article.group))]
  const keyNumbers = getKeyNumberGroups()

  return (
    <main className="page rights-page">
      <Link className="back-link" to="/">{t('nav.home')}</Link>
      <section className="screen-heading">
        <h1>{t('rights.title')}</h1>
        <p>{t('rights.intro')}</p>
      </section>
      <nav className="rights-actions" aria-label={t('home.more')}>
        <Link className="secondary-action" to="/rights/finder">{t('rights.finder')}</Link>
        <Link className="secondary-action" to="/rights/practice">{t('rights.practice')}</Link>
        <Link className="secondary-action" to="/wallet-card">{t('rights.wallet')}</Link>
      </nav>
      <label className="search-label">
        <span>{t('rights.search')}</span>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <section className="key-number-section">
        <h2>{t('rights.key8')}</h2>
        <div className="key-number-grid">
          {keyNumbers.map(({ keyGroup, article, memory }) => {
            const memoryText = localized(memory)
            return (
              <Link className="key-number-tile" to={`/rights/${article.id}`} key={article.id}>
                <strong>{keyGroup}</strong>
                <span>{memoryText.text}</span>
                {lang === 'hi' && memoryText.englishOnly && <span className="language-badge">{t('english.only')}</span>}
              </Link>
            )
          })}
        </div>
      </section>
      <details className="legal-basis rights-notes">
        <summary>{t('rights.readBefore')}</summary>
        <p>{t('rights.note.articlesection')}</p>
        <p>{t('rights.note.calm')}</p>
      </details>
      {matches.length === 0 && <p className="empty-state">{t('search.noResults')}</p>}
      {groups.map((group) => (
        <section className="related-list" key={group}>
          <h2>{t(`rights.group.${group}`)}</h2>
          {matches.filter((article) => article.group === group).map((article) => {
            const name = localized(article.name)
            const plain = localized(article.plain)
            return (
              <Link className="related-link rights-article-row" key={article.id} to={`/rights/${article.id}`}>
                <span><strong>{t('rights.article')} {article.article} · {name.text}</strong><span className="rights-row-summary">{plain.text}</span></span>
                {lang === 'hi' && (name.englishOnly || plain.englishOnly) && <span className="language-badge">{t('english.only')}</span>}
              </Link>
            )
          })}
        </section>
      ))}
    </main>
  )
}

function RightsArticleScreen() {
  const { id = '' } = useParams()
  const { t, lang, localized } = useI18n()
  const article = getFundamentalRights().find((item) => item.id.toLowerCase() === id.toLowerCase())
  if (!article) return <Navigate to="/rights" replace />
  const name = localized(article.name)
  const plain = localized(article.plain)
  const modulesForArticle = modules.filter((item) => article.moduleIds?.includes(item.id))
  const scriptsForArticle = getScripts().filter((item) => article.scriptIds?.includes(item.id))
  const sayScript = scriptsForArticle.find((script) => ['S15', 'S16', 'S17', 'S18', 'S19', 'S20'].includes(script.id)) ?? scriptsForArticle[0]
  const lawRefs = getLawRefs()
  const cases = getCases()
  const citationRows = (article.refs ?? []).map((citationKey) => ({
    citationKey,
    lawEntry: lawRefs.find((entry) => entry.id === citationKey),
    caseCard: cases.find((card) => card.id === citationKey),
  })).filter((row) => row.lawEntry || row.caseCard)

  function renderLocalized(value: { en: string; hi?: string }) {
    const result = localized(value)
    return <>{result.text}{result.englishOnly && <span className="language-badge">{t('english.only')}</span>}</>
  }

  return (
    <main className="page rights-page">
      <Link className="back-link" to="/rights">{t('rights.title')}</Link>
      <div className="draft-banner" role="status">{t('banner.draft')}</div>
      <section className="screen-heading">
        <span className={`review-badge status-${article.status}`}>{t(`review.${article.status}`)}</span>
        <span className="rights-article-number">{t('rights.article')} {article.article}</span>
        <h1>{name.text}</h1>
        {lang === 'hi' && name.englishOnly && <span className="language-badge">{t('english.only')}</span>}
        <p>{plain.text}</p>
        {lang === 'hi' && plain.englishOnly && <span className="language-badge">{t('english.only')}</span>}
      </section>
      <article className="step-card">
        <h2>{t('rights.who')}</h2>
        <p>{t(article.who === 'citizens' ? 'who.citizens' : article.who === 'every_person' ? 'who.all' : `rights.who.${article.who}`)}</p>
      </article>
      {article.limits && <article className="step-card"><h2>{t('rights.limits')}</h2><p>{renderLocalized(article.limits)}</p></article>}
      {article.atProtest && <article className="step-card"><h2>{t('rights.protest')}</h2><p>{renderLocalized(article.atProtest)}</p></article>}
      <details className="legal-basis rights-notes">
        <summary>{t('rights.readBefore')}</summary>
        <p>{t('rights.note.articlesection')}</p>
        <p>{t('rights.note.calm')}</p>
      </details>
      {sayScript && (
        <Link className="primary-action" to={`/scripts/${sayScript.id}?show=1`}>{t('rights.say')}</Link>
      )}
      {modulesForArticle.length > 0 || scriptsForArticle.length > 0 ? (
        <section className="related-list">
          <h2>{t('rights.related')}</h2>
          {modulesForArticle.map((module) => {
            const title = localized(module.title)
            return <Link className="related-link" to={`/m/${module.id}`} key={module.id}><span>{title.text}</span><span>›</span></Link>
          })}
          {scriptsForArticle.map((script) => {
            const when = localized(script.when)
            return <Link className="related-link" to={`/scripts/${script.id}`} key={script.id}><span>{script.id} · {when.text}</span><span>›</span></Link>
          })}
        </section>
      ) : null}
      {citationRows.length > 0 && (
        <details className="legal-basis">
          <summary>{t('law.basis')}</summary>
          <h2>{t('rights.references')}</h2>
          {citationRows.map(({ citationKey, lawEntry, caseCard }) => {
            if (caseCard) {
              const caseName = localized(caseCard.name)
              return <Link className="related-link" to="/cases" key={citationKey}><span>{caseName.text} · {caseCard.citation}</span><span>›</span></Link>
            }
            if (!lawEntry) return null
            const label = localized(lawEntry.label)
            return (
              <article className="law-ref" key={citationKey}>
                <strong>{label.text}</strong>
                {lawEntry.current && <p>{lawEntry.current}</p>}
                {lawEntry.verify && <small>{t('law.verify')}</small>}
              </article>
            )
          })}
        </details>
      )}
      <footer className="module-footer">
        <span>{t('badge.drafted')}: {article.draftedOn}</span>
        <span>{t('badge.verified')}: {article.lastVerified ?? t('badge.notyet')}</span>
        <span className={`review-badge status-${article.status}`}>{t(`review.${article.status}`)}</span>
        {article.verify && <small>{t('law.verify')}</small>}
      </footer>
    </main>
  )
}

function ArticleFinderScreen() {
  const { t, localized, lang } = useI18n()
  const [query, setQuery] = useState('')
  const articles = getFundamentalRights()
  const rows = getArticleFinder().filter((row) => normalizeArticleSearch([
    row.problem.en,
    row.problem.hi,
    row.plain.en,
    row.plain.hi,
  ].join(' ')).includes(normalizeArticleSearch(query)))

  return (
    <main className="page">
      <Link className="back-link" to="/rights">{t('rights.title')}</Link>
      <section className="screen-heading"><h1>{t('rights.finderTitle')}</h1><p>{t('rights.finderIntro')}</p></section>
      <SearchInput value={query} onChange={setQuery} />
      {rows.length === 0 && <p className="empty-state">{t('search.noResults')}</p>}
      {rows.map((row) => {
        const problem = localized(row.problem)
        const plain = localized(row.plain)
        return (
          <article className="step-card finder-card" key={row.id}>
            <h2>{problem.text}</h2>
            {lang === 'hi' && problem.englishOnly && <span className="language-badge">{t('english.only')}</span>}
            <p>{plain.text}</p>
            {lang === 'hi' && plain.englishOnly && <span className="language-badge">{t('english.only')}</span>}
            <div className="article-chip-list">
              {row.articles.map((articleId) => {
                const article = articles.find((item) => item.id === articleId)
                if (!article) return null
                return <Link className="article-chip" to={`/rights/${article.id}`} key={article.id}>{t('rights.article')} {article.article}</Link>
              })}
            </div>
            {row.moduleIds?.map((moduleId) => {
              const module = modules.find((item) => item.id === moduleId)
              return module && <Link className="related-inline-link" to={`/m/${module.id}`} key={module.id}>{localized(module.title).text}</Link>
            })}
            {row.scriptIds?.map((scriptId) => <Link className="related-inline-link" to={`/scripts/${scriptId}`} key={scriptId}>{scriptId}</Link>)}
          </article>
        )
      })}
    </main>
  )
}

function RightsPracticeScreen() {
  const { t, localized } = useI18n()
  const { pinEnabled } = useVault()
  const cards = useMemo(() => getFundamentalRights().filter((article) => article.priority <= 2), [])
  const [deck, setDeck] = useState<string[]>([])
  const [mode, setMode] = useState<'number' | 'plain'>('number')
  const [flipped, setFlipped] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    readVault().then((data) => {
      if (!active) return
      setDeck(shuffle([...cards.filter((article) => !data.knownArticleIds.includes(article.id)).map((article) => article.id)]))
    }).catch(() => {
      if (active) setError(t('storage.progressReadError'))
    }).finally(() => {
      if (active) setReady(true)
    })
    return () => { active = false }
  }, [cards, t])

  const article = cards.find((item) => item.id === deck[0])

  async function markKnown() {
    if (!article) return
    setError('')
    try {
      const vault = await readVault()
      const nextIds = vault.knownArticleIds.includes(article.id)
        ? vault.knownArticleIds
        : [...vault.knownArticleIds, article.id]
      await writeVault({ ...vault, knownArticleIds: nextIds })
      setDeck((currentDeck) => currentDeck.filter((articleId) => articleId !== article.id))
      setFlipped(false)
    } catch {
      setError(t('storage.progressWriteError'))
    }
  }

  return (
    <main className="page">
      <Link className="back-link" to="/rights">{t('rights.title')}</Link>
      <section className="screen-heading"><h1>{t('rights.practiceTitle')}</h1><p>{t('rights.practiceIntro')}</p></section>
      {!pinEnabled && <p className="empty-state">{t('warn.nopin')}</p>}
      <div className="practice-mode-switch" role="group" aria-label={t('rights.practiceTitle')}>
        <button className={`tab-button${mode === 'number' ? ' active' : ''}`} type="button" onClick={() => { setMode('number'); setFlipped(false) }}>{t('practice.mode.number')}</button>
        <button className={`tab-button${mode === 'plain' ? ' active' : ''}`} type="button" onClick={() => { setMode('plain'); setFlipped(false) }}>{t('practice.mode.plain')}</button>
      </div>
      <p className="practice-progress">{t('practice.left').replace('{count}', String(deck.length))}</p>
      {!ready ? <p className="empty-state">{t('content.comingSoon')}</p> : article ? (
        <>
          <button className="flash-card" type="button" onClick={() => setFlipped((value) => !value)}>
            <span className="eyebrow">{t('practice.flip')}</span>
            <strong>{mode === 'number' ? (flipped ? localized(article.plain).text : article.article) : (flipped ? article.article : localized(article.plain).text)}</strong>
          </button>
          <div className="practice-card-actions">
            <button className="primary-action" type="button" onClick={() => void markKnown()}>{t('practice.known')}</button>
            <button className="secondary-action" type="button" onClick={() => { setDeck((currentDeck) => [...currentDeck.slice(1), article.id]); setFlipped(false) }}>{t('practice.again')}</button>
            <button className="secondary-action" type="button" onClick={() => { setDeck((currentDeck) => shuffle(currentDeck)); setFlipped(false) }}>{t('practice.shuffle')}</button>
          </div>
        </>
      ) : <p className="step-card">{t('practice.done')}</p>}
      {error && <p className="error-message" role="alert">{error}</p>}
    </main>
  )
}

function WalletCardScreen() {
  const { t, localized } = useI18n()
  const goldenRules = modules.find((module) => module.id === 'M01')
  const keyNumbers = getKeyNumberGroups()
  const scripts = getScripts().filter((script) => ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S20'].includes(script.id))
  const contacts = getContacts()

  return (
    <main className="page wallet-page">
      <Link className="back-link no-print" to="/">{t('nav.home')}</Link>
      <div className="wallet-toolbar no-print">
        <h1>{t('wallet.title')}</h1>
        <button className="primary-action" type="button" onClick={() => window.print()}>{t('wallet.print')}</button>
      </div>
      <div className="wallet-card wallet-front">
        <h1>{t('wallet.title')}</h1>
        <p className="wallet-warning">{t('wallet.verifyWarning')}</p>
        <section>
          <h2>{t('wallet.rules')}</h2>
          <ol className="wallet-rules">
            {goldenRules?.steps.map((step, index) => <li key={index}>{localized(step.text).text}</li>)}
          </ol>
        </section>
        <section>
          <h2>{t('wallet.keyNumbers')}</h2>
          <div className="wallet-key-grid">
            {keyNumbers.map(({ keyGroup, article, memory }) => <div key={article.id}><strong>{keyGroup}</strong><span>{localized(memory).text}</span></div>)}
          </div>
        </section>
      </div>
      <div className="wallet-card wallet-back">
        <section>
          <h2>{t('wallet.scripts')}</h2>
          <ol className="wallet-scripts">
            {scripts.map((script) => <li key={script.id}><strong>{script.id}:</strong> {script.en}<br /><span lang="hi">{script.hi}</span></li>)}
          </ol>
        </section>
        <section>
          <h2>{t('wallet.contacts')}</h2>
          <ul className="wallet-contact-list">
            {contacts.map((contact) => <li key={contact.id}>{localized(contact.label).text}: <strong>{contact.number}</strong></li>)}
          </ul>
        </section>
        <p className="wallet-warning">{t('wallet.verifyWarning')}</p>
      </div>
    </main>
  )
}

function ChecklistScreen() {
  const { t, localized } = useI18n()
  const { pinEnabled } = useVault()
  const [checked, setChecked] = useState<Set<string>>(() => new Set())
  const [error, setError] = useState('')
  const checklist = getChecklist()

  useEffect(() => {
    readVault()
      .then((data) => setChecked(new Set(data.checklistTicks)))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : t('storage.readError')))
  }, [t])

  async function toggleItem(id: string) {
    const next = new Set(checked)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    try {
      const data = await readVault()
      await writeVault({ ...data, checklistTicks: [...next] })
      setChecked(next)
      setError('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('storage.writeError'))
    }
  }

  return (
    <main className="page">
      <Link className="back-link" to="/">{t('nav.home')}</Link>
      <h1>{t('nav.checklist')}</h1>
      {!pinEnabled && <p className="empty-state">{t('warn.nopin')}</p>}
      {checklist.map((item) => {
        const text = localized(item.text)
        return (
          <label className="checklist-row" key={item.id}>
            <input
              type="checkbox"
              checked={checked.has(item.id)}
              onChange={() => void toggleItem(item.id)}
            />
            <span>{text.text}</span>
            {text.englishOnly && <span className="language-badge">{t('english.only')}</span>}
          </label>
        )
      })}
      {error && <p className="error-message" role="alert">{error}</p>}
    </main>
  )
}

function NotesScreen() {
  const { t } = useI18n()
  const { pinEnabled } = useVault()
  const [notes, setNotes] = useState<IncidentNote[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    readVault()
      .then((data) => setNotes(data.notes))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : t('storage.readError')))
  }, [t])

  return (
    <main className="page">
      <Link className="back-link" to="/">{t('nav.home')}</Link>
      <h1>{t('home.notes')}</h1>
      {!pinEnabled && <p className="empty-state">{t('warn.nopin')}</p>}
      <Link className="primary-action" to="/notes/new">{t('notes.new')}</Link>
      {!notes.length && !error && <p className="empty-state">{t('notes.empty')}</p>}
      {notes.map((note) => (
        <Link className="related-link" key={note.id} to={`/notes/${note.id}`}>
          <span>{note.place || t('notes.noPlace')} · {new Date(note.createdAt).toLocaleString()}</span><span>›</span>
        </Link>
      ))}
      {error && <p className="error-message" role="alert">{error}</p>}
    </main>
  )
}

function NoteEditor() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [place, setPlace] = useState('')
  const [officer, setOfficer] = useState('')
  const [badge, setBadge] = useState('')
  const [station, setStation] = useState('')
  const [vehicle, setVehicle] = useState('')
  const [whatHappened, setWhatHappened] = useState('')
  const [injuries, setInjuries] = useState('')
  const [sectionsMentioned, setSectionsMentioned] = useState('')
  const [witnesses, setWitnesses] = useState('')
  const [timeline, setTimeline] = useState('')
  const [error, setError] = useState('')

  async function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!whatHappened.trim()) {
      setError(t('notes.required'))
      return
    }
    const note: IncidentNote = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      place: place.trim() || undefined,
      officers: [{ name: officer.trim() || undefined, badge: badge.trim() || undefined, station: station.trim() || undefined, vehicle: vehicle.trim() || undefined }],
      whatHappened: whatHappened.trim(),
      injuries: injuries.trim() || undefined,
      sectionsMentioned: sectionsMentioned.trim() || undefined,
      witnesses: witnesses.trim() || undefined,
      timeline: timeline.trim() ? [{ time: new Date().toLocaleTimeString(), text: timeline.trim() }] : [],
    }
    try {
      const data = await readVault()
      await writeVault({ ...data, notes: [note, ...data.notes] })
      navigate('/notes', { replace: true })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('storage.writeError'))
    }
  }

  return (
    <main className="page">
      <Link className="back-link" to="/notes">{t('home.notes')}</Link>
      <h1>{t('notes.new')}</h1>
      <form className="form-card" onSubmit={(event) => void saveNote(event)}>
        <label>{t('notes.place')}<input value={place} onChange={(event) => setPlace(event.target.value)} /></label>
        <label>{t('notes.officer')}<input value={officer} onChange={(event) => setOfficer(event.target.value)} /></label>
        <label>{t('notes.badge')}<input value={badge} onChange={(event) => setBadge(event.target.value)} /></label>
        <label>{t('notes.station')}<input value={station} onChange={(event) => setStation(event.target.value)} /></label>
        <label>{t('notes.vehicle')}<input value={vehicle} onChange={(event) => setVehicle(event.target.value)} /></label>
        <label>{t('notes.whatHappened')}<textarea required rows={5} value={whatHappened} onChange={(event) => setWhatHappened(event.target.value)} /></label>
        <label>{t('notes.sections')}<input value={sectionsMentioned} onChange={(event) => setSectionsMentioned(event.target.value)} /></label>
        <label>{t('notes.injuries')}<textarea rows={3} value={injuries} onChange={(event) => setInjuries(event.target.value)} /></label>
        <label>{t('notes.witnesses')}<textarea rows={3} value={witnesses} onChange={(event) => setWitnesses(event.target.value)} /></label>
        <label>{t('notes.timeline')}<textarea rows={3} value={timeline} onChange={(event) => setTimeline(event.target.value)} /></label>
        <button className="primary-action" type="submit">{t('notes.save')}</button>
      </form>
      {error && <p className="error-message" role="alert">{error}</p>}
    </main>
  )
}

function NoteDetail() {
  const { id = '' } = useParams()
  const { t } = useI18n()
  const [note, setNote] = useState<IncidentNote | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    readVault()
      .then((data) => setNote(data.notes.find((item) => item.id === id) ?? null))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : t('storage.readError')))
  }, [id, t])

  return (
    <main className="page">
      <Link className="back-link" to="/notes">{t('home.notes')}</Link>
      {note ? (
        <article className="step-card">
          <h1>{note.place || t('notes.noPlace')}</h1>
          <p>{new Date(note.createdAt).toLocaleString()}</p>
          <h2>{t('notes.whatHappened')}</h2><p>{note.whatHappened}</p>
          {note.officers[0]?.name && <p>{t('notes.officer')}: {note.officers[0].name}</p>}
          {note.officers[0]?.badge && <p>{t('notes.badge')}: {note.officers[0].badge}</p>}
          {note.officers[0]?.station && <p>{t('notes.station')}: {note.officers[0].station}</p>}
          {note.officers[0]?.vehicle && <p>{t('notes.vehicle')}: {note.officers[0].vehicle}</p>}
          {note.sectionsMentioned && <p>{t('notes.sections')}: {note.sectionsMentioned}</p>}
          {note.injuries && <p>{t('notes.injuries')}: {note.injuries}</p>}
          {note.witnesses && <p>{t('notes.witnesses')}: {note.witnesses}</p>}
          {note.timeline.map((item, index) => <p key={index}>{item.time}: {item.text}</p>)}
        </article>
      ) : <p className="empty-state">{error || t('notes.notFound')}</p>}
    </main>
  )
}

function SettingsScreen() {
  const { t } = useI18n()
  const vault = useVault()
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [clearArmed, setClearArmed] = useState(false)
  const holdTimer = useRef<number | null>(null)

  function beginHold() {
    window.clearTimeout(holdTimer.current ?? undefined)
    holdTimer.current = window.setTimeout(() => setClearArmed(true), 2_000)
  }

  function cancelHold() {
    window.clearTimeout(holdTimer.current ?? undefined)
  }

  async function submitPin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!/^\d{6,}$/.test(pin)) {
      setError(t('settings.pinInvalid'))
      return
    }
    if (pin !== confirmation) {
      setError(t('settings.pinMismatch'))
      return
    }
    try {
      await vault.setPin(pin)
      setPin('')
      setConfirmation('')
      setError('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('storage.writeError'))
    }
  }

  async function clearData() {
    if (!window.confirm(t('settings.clearConfirm'))) return
    try {
      await clearAllAppData()
      vault.reset()
      setClearArmed(false)
      navigate('/', { replace: true })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('settings.clearError'))
    }
  }

  return (
    <main className="page">
      <Link className="back-link" to="/">{t('nav.home')}</Link>
      <h1>{t('nav.settings')}</h1>
      <section className="step-card">
        <h2>{t('settings.pin')}</h2>
        {vault.pinEnabled ? <p>{t('settings.pinEnabled')}</p> : (
          <>
            <p className="empty-state">{t('warn.nopin')}</p>
            <form className="form-card" onSubmit={(event) => void submitPin(event)}>
              <label>{t('lock.enter')}<input type="password" inputMode="numeric" autoComplete="new-password" value={pin} onChange={(event) => setPin(event.target.value)} /></label>
              <label>{t('settings.confirmPin')}<input type="password" inputMode="numeric" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>
              <button className="primary-action" type="submit">{t('settings.setPin')}</button>
            </form>
          </>
        )}
      </section>
      <section className="step-card">
        <h2>{t('settings.clear')}</h2>
        <p>{t('settings.holdClear')}</p>
        {!clearArmed ? (
          <button
            className="danger-action"
            type="button"
            onPointerDown={beginHold}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            onKeyDown={(event) => { if (event.key === ' ') beginHold() }}
            onKeyUp={cancelHold}
          >
            {t('settings.clear')}
          </button>
        ) : (
          <button className="danger-action" type="button" onClick={() => void clearData()}>{t('settings.confirmClear')}</button>
        )}
      </section>
      {error && <p className="error-message" role="alert">{error}</p>}
    </main>
  )
}

function LockScreen() {
  const { t } = useI18n()
  const vault = useVault()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [delay, setDelay] = useState(remainingPinDelay)

  useEffect(() => {
    const timer = window.setInterval(() => setDelay(remainingPinDelay()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  async function submitPin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (delay > 0) return
    try {
      await vault.unlock(pin)
      clearFailedPinAttempts()
      setPin('')
      setError('')
    } catch {
      const wait = registerFailedPinAttempt()
      setDelay(wait)
      setError(t('lock.wrongPin'))
      setPin('')
    }
  }

  return (
    <main className="page lock-page">
      <h1>{t('lock.title')}</h1>
      <form className="form-card" onSubmit={(event) => void submitPin(event)}>
        <label>{t('lock.enter')}<input autoFocus type="password" inputMode="numeric" autoComplete="current-password" value={pin} onChange={(event) => setPin(event.target.value)} /></label>
        {error && <p className="error-message" role="alert">{error}</p>}
        {delay > 0 && <p role="status">{t('lock.wait').replace('{seconds}', String(delay))}</p>}
        <button className="primary-action" type="submit" disabled={delay > 0}>{t('lock.unlock')}</button>
      </form>
    </main>
  )
}

function AboutScreen() {
  const { t, lang, localized } = useI18n()
  const about = getAboutContent()
  const disclaimer = localized(getDisclaimer())
  const limits = localized(about.limits)
  const privacyNote = localized(about.privacyNote)
  const codeLicense = localized(about.codeLicense)
  // const contentLicense = localized(about.contentLicense)
  return (
    <main className="page">
      <Link className="back-link" to="/">{t('nav.home')}</Link>
      <h1>{t('nav.about')}</h1>
      <section className="step-card">
        <h2>{t('about.disclaimer')}</h2>
        <p>{disclaimer.text}</p>
        <p>{limits.text}</p>
        <p>{privacyNote.text}</p>
      </section>
      <section className="related-list">
        <h2>{t('about.reviewStatuses')}</h2>
        {modules.map((module) => {
          const title = localized(module.title)
          return <p className="status-row" key={module.id}><span>{module.id} · {title.text}{lang === 'hi' && title.englishOnly && <span className="language-badge">{t('english.only')}</span>}</span><span className={`review-badge status-${module.status}`}>{t(`review.${module.status}`)}</span></p>
        })}
      </section>
      <section className="related-list">
        <h2>{t('about.sources')}</h2>
        {about.sources.map((source, index) => <p key={index}>{localized(source).text}</p>)}
      </section>
      <p>{t('about.contentVersion')}: {about.contentVersion}</p>
      <p>{t('about.codeLicense')}: {codeLicense.text}{lang === 'hi' && codeLicense.englishOnly && <span className="language-badge">{t('english.only')}</span>}</p>
      {/* <p>{t('about.contentLicense')}: {contentLicense.text}{lang === 'hi' && contentLicense.englishOnly && <span className="language-badge">{t('english.only')}</span>}</p> */}
      <p>{t('about.offline')}</p>
    </main>
  )
}

function App() {
  return (
    <div className="app-shell">
      <AppChrome />
    </div>
  )
}

export default App
