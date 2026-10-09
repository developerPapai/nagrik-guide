import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import type {
  CaseCard,
  ChecklistItem,
  Contact,
  GlossaryTerm,
  LawRef,
  Module,
  Script,
} from '../src/types'

const contentRoot = join(process.cwd(), 'src', 'content')
const moduleRoot = join(contentRoot, 'modules')
const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T
const lawRefs = readJson<LawRef[]>(join(contentRoot, 'lawrefs.json'))
const scripts = readJson<Script[]>(join(contentRoot, 'scripts.json'))
const cases = readJson<CaseCard[]>(join(contentRoot, 'cases.json'))
const contacts = readJson<Contact[]>(join(contentRoot, 'contacts.json'))
const glossary = readJson<GlossaryTerm[]>(join(contentRoot, 'glossary.json'))
const checklist = readJson<ChecklistItem[]>(join(contentRoot, 'checklists.json'))
const modules = readdirSync(moduleRoot)
  .filter((file) => file.endsWith('.json'))
  .map((file) => readJson<Module>(join(moduleRoot, file)))
const errors: string[] = []
let verifyCount = 0

function jsonFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? jsonFiles(path) : entry.name.endsWith('.json') ? [path] : []
  })
}

function checkUrls(value: unknown, location: string): void {
  if (typeof value === 'string' && /https?:\/\//i.test(value)) {
    errors.push(`${location}: URLs are not allowed in content`)
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => checkUrls(item, `${location}[${index}]`))
  } else if (value !== null && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => checkUrls(item, `${location}.${key}`))
  }
}

function checkUniqueIds<T extends { id: string }>(items: T[], label: string): void {
  const seen = new Set<string>()
  for (const item of items) {
    if (!item.id) errors.push(`${label}: every item needs an id`)
    else if (seen.has(item.id)) errors.push(`${label}: duplicate id ${item.id}`)
    seen.add(item.id)
  }
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}

for (const file of jsonFiles(contentRoot)) {
  checkUrls(readJson<unknown>(file), relative(contentRoot, file))
}

checkUniqueIds(lawRefs, 'lawrefs.json')
checkUniqueIds(scripts, 'scripts.json')
checkUniqueIds(cases, 'cases.json')
checkUniqueIds(contacts, 'contacts.json')
checkUniqueIds(glossary, 'glossary.json')
checkUniqueIds(checklist, 'checklists.json')
checkUniqueIds(modules, 'modules')

const lawRefIds = new Set(lawRefs.map((ref) => ref.id))
const scriptIds = new Set(scripts.map((script) => script.id))

for (const ref of lawRefs) {
  if (!ref.id || !ref.label?.en) errors.push('Every law reference needs an id and English label')
  if (typeof ref.verify !== 'boolean') errors.push(`${ref.id}: verify must be boolean`)
  if (ref.verify) verifyCount += 1
}

for (const script of scripts) {
  if (!script.en || !script.hi || !script.hiRoman || !script.when?.en) {
    errors.push(`${script.id}: English, Hindi, Roman Hindi, and an English use case are required`)
  }
}

for (const module of modules) {
  if (!module.id || !module.title?.en || !module.summary?.en) {
    errors.push(`${module.id || 'module'}: id, English title, and English summary are required`)
  }
  if (!['ai_draft', 'in_review', 'lawyer_reviewed'].includes(module.status)) {
    errors.push(`${module.id}: invalid review status`)
  }
  if (!isValidDate(module.draftedOn)) errors.push(`${module.id}: draftedOn must be an ISO date`)
  if (module.lastVerified !== null && !isValidDate(module.lastVerified)) {
    errors.push(`${module.id}: lastVerified must be an ISO date or null`)
  }
  if (!Array.isArray(module.tags)) errors.push(`${module.id}: tags must be present`)
  if (module.status === 'lawyer_reviewed' && !module.lastVerified) {
    errors.push(`${module.id}: lawyer-reviewed modules need lastVerified`)
  }

  for (const [index, step] of module.steps.entries()) {
    for (const ref of step.refs ?? []) {
      if (!lawRefIds.has(ref)) errors.push(`${module.id}.steps[${index}]: unknown law ref ${ref}`)
    }
    if (step.scriptId && !scriptIds.has(step.scriptId)) {
      errors.push(`${module.id}.steps[${index}]: unknown script ${step.scriptId}`)
    }
    if (!step.text?.en) errors.push(`${module.id}.steps[${index}]: English text is required`)
  }
  if (!module.title?.hi || !module.summary?.hi || module.steps.some((step) => !step.text.hi)) {
    console.warn(`Warning: ${module.id} is missing Hindi text`)
  }
}

for (const card of cases) {
  if (!card.name?.en || !card.holding?.en || !card.whyItMatters?.en || card.verifyCitation !== true) {
    errors.push(`${card.id}: case name, English summary, and verifyCitation=true are required`)
  }
  for (const ref of card.refs ?? []) {
    if (!lawRefIds.has(ref)) errors.push(`${card.id}: unknown law ref ${ref}`)
  }
}

for (const contact of contacts) {
  if (!contact.label?.en || !/^\d+$/.test(contact.number)) {
    errors.push(`${contact.id}: contact needs an English label and digits-only number`)
  }
}

for (const term of glossary) {
  if (!term.term?.en || !term.meaning?.en) errors.push(`${term.id}: English term and meaning are required`)
}

for (const item of checklist) {
  if (!item.text?.en) errors.push(`${item.id}: checklist item needs English text`)
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'))
  process.exitCode = 1
} else {
  console.log(`Content validation passed. ${verifyCount} law references need human verification.`)
}
