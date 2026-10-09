import type { AboutContent, ArticleFinderRow, CaseCard, ChecklistItem, Contact, FRArticle, GlossaryTerm, L10n, LawRef, Module, Script } from '../types'

const moduleFiles = import.meta.glob('../content/modules/*.json', {
  eager: true,
  import: 'default',
})
const contentFiles = import.meta.glob('../content/*.json', {
  eager: true,
  import: 'default',
})

export const modules = Object.values(moduleFiles) as Module[]

export function loadContent<T>(path: string): T {
  const content = contentFiles[`../content/${path}`]
  if (content === undefined) {
    throw new Error(`Unable to load bundled content: ${path}`)
  }
  return content as T
}

export function getLawRefs(): LawRef[] {
  return loadContent<LawRef[]>('lawrefs.json')
}

export function getScripts(): Script[] {
  return loadContent<Script[]>('scripts.json')
}

export function getCases(): CaseCard[] {
  return loadContent<CaseCard[]>('cases.json')
}

export function getContacts(): Contact[] {
  return loadContent<Contact[]>('contacts.json')
}

export function getGlossary(): GlossaryTerm[] {
  return loadContent<GlossaryTerm[]>('glossary.json')
}

export function getChecklist(): ChecklistItem[] {
  return loadContent<ChecklistItem[]>('checklists.json')
}

export function getDisclaimer(): L10n {
  return loadContent<L10n>('disclaimer.json')
}

export function getAboutContent(): AboutContent {
  return loadContent<AboutContent>('about.json')
}

export function getFundamentalRights(): FRArticle[] {
  return loadContent<FRArticle[]>('fundamental-rights.json')
}

export function getArticleFinder(): ArticleFinderRow[] {
  return loadContent<ArticleFinderRow[]>('articleFinder.json')
}
