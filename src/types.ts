export type Lang = 'en' | 'hi'
export type L10n = { en: string; hi?: string }
export type ReviewStatus = 'ai_draft' | 'in_review' | 'lawyer_reviewed'

export interface LawRef {
  id: string
  kind: 'constitution' | 'statute' | 'case' | 'guideline'
  label: L10n
  current?: string
  old?: string
  note?: L10n
  verify: boolean
}

export interface Step {
  type: 'do' | 'dont' | 'say' | 'know' | 'next'
  text: L10n
  refs?: string[]
  scriptId?: string
}

export interface Module {
  id: string
  group: 'situation' | 'protest' | 'special' | 'reference'
  situationId?: 'stopped' | 'detained' | 'arrested' | 'custody' | 'court'
  icon: string
  title: L10n
  summary: L10n
  steps: Step[]
  grayAreas?: L10n[]
  related?: string[]
  tags: string[]
  status: ReviewStatus
  draftedOn: string
  lastVerified: string | null
  reviewers?: string[]
  translation?: ReviewStatus
}

export interface Script {
  id: string
  situations: string[]
  en: string
  hi: string
  hiRoman: string
  when: L10n
  warning?: L10n
  translation?: ReviewStatus
}

export interface Contact {
  id: string
  kind: 'emergency' | 'legal_aid' | 'helpline'
  label: L10n
  number: string
  note?: L10n
  verifiedOn: string | null
}

export interface CaseCard {
  id: string
  name: L10n
  citation?: string
  year: number
  holding: L10n
  whyItMatters: L10n
  refs?: string[]
  verifyCitation: true
  translation?: ReviewStatus
}

export interface GlossaryTerm {
  id: string
  term: L10n
  meaning: L10n
  tags: string[]
  translation?: ReviewStatus
}

export interface ChecklistItem {
  id: string
  text: L10n
}

export interface AboutContent {
  contentVersion: string
  sources: L10n[]
  limits: L10n
  privacyNote: L10n
  codeLicense: L10n
  contentLicense: L10n
}

export interface IncidentNote {
  id: string
  createdAt: string
  place?: string
  officers: { name?: string; badge?: string; station?: string; vehicle?: string }[]
  whatHappened: string
  injuries?: string
  sectionsMentioned?: string
  witnesses?: string
  timeline: { time: string; text: string }[]
}

export interface UserContact {
  id: string
  name: string
  phone: string
  role: 'family' | 'lawyer' | 'friend' | 'organisation' | 'other'
  note?: string
}

export interface VaultData {
  notes: IncidentNote[]
  contacts: UserContact[]
  checklistTicks: string[]
}
