import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import Fuse from 'fuse.js'
import {
  getAboutContent,
  getCases,
  getChecklist,
  getContacts,
  getDisclaimer,
  getGlossary,
  getLawRefs,
  getScripts,
  modules,
} from './lib/content'
import { clearAllAppData, readVault, writeVault } from './lib/storage'
import { clearFailedPinAttempts, registerFailedPinAttempt, remainingPinDelay } from './lib/lock'
import { useVault } from './lib/useVault'
import { useI18n } from './i18n/useI18n'
import type { IncidentNote, Module, UserContact } from './types'
import './App.css'

const situations = ['stopped', 'detained', 'arrested', 'custody', 'court'] as const

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
  ]
  const actionTitles: Record<string, string> = {
    stopped: 'home.stopped',
    detained: 'home.arrested',
    custody: 'home.custody',
    court: 'home.court',
    protest: 'home.protest',
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
          <Link className="situation-button" key={id} to={id === 'protest' ? '/m/M07' : `/s/${id}`}>
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
      </section>
      <nav className="footer-links" aria-label={t('home.more')}>
        <Link to="/shutdown">{t('home.shutdown')}</Link>
        <Link to="/checklist">{t('nav.checklist')}</Link>
        <Link to="/cases">{t('nav.cases')}</Link>
        <Link to="/glossary">{t('nav.glossary')}</Link>
        <Link to="/about">{t('nav.about')}</Link>
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
  return (
    <article className={`step-card step-${step.type}`}>
      <h2>{t(`step.${step.type}`)}</h2>
      <p>{text.text}</p>
      {text.englishOnly && <span className="language-badge">{t('english.only')}</span>}
    </article>
  )
}

function LegalBasis({ module }: { module: Module }) {
  const { t, localized } = useI18n()
  const refs = getLawRefs()
  const usedIds = new Set(module.steps.flatMap((step) => step.refs ?? []))
  const usedRefs = refs.filter((ref) => usedIds.has(ref.id))
  if (usedRefs.length === 0) return null

  return (
    <details className="legal-basis">
      <summary>{t('law.basis')}</summary>
      {usedRefs.map((ref) => {
        const label = localized(ref.label)
        return (
          <div className="law-ref" key={ref.id}>
            <strong>{label.text}</strong>
            {label.englishOnly && <span className="language-badge">{t('english.only')}</span>}
            <dl>
              {ref.current && <><dt>{t('law.current')}</dt><dd>{ref.current}</dd></>}
              {ref.old && <><dt>{t('law.old')}</dt><dd>{ref.old}</dd></>}
            </dl>
            {ref.verify && <small>{t('law.verify')}</small>}
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
  const { lang, setLang, t, localized } = useI18n()
  const script = getScripts().find((item) => item.id.toLowerCase() === id.toLowerCase())
  const [showMode, setShowMode] = useState(false)
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
      <SafetyLine />
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
  const search = useMemo(
    () => new Fuse(modules, {
      threshold: 0.35,
      ignoreLocation: true,
      keys: ['title.en', 'title.hi', 'summary.en', 'summary.hi', 'steps.text.en', 'steps.text.hi', 'tags'],
    }),
    [],
  )
  const matches = query.trim() ? search.search(query).map((result) => result.item) : modules
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
  const contentLicense = localized(about.contentLicense)
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
      <p>{t('about.contentLicense')}: {contentLicense.text}{lang === 'hi' && contentLicense.englishOnly && <span className="language-badge">{t('english.only')}</span>}</p>
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
