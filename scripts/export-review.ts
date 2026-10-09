import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ArticleFinderRow, CaseCard, FRArticle, LawRef, Module, Script } from '../src/types'

const contentRoot = join(process.cwd(), 'src', 'content')
const modules = readdirSync(join(contentRoot, 'modules'))
  .filter((file) => file.endsWith('.json'))
  .map((file) => JSON.parse(readFileSync(join(contentRoot, 'modules', file), 'utf8')) as Module)
const lawRefs = JSON.parse(readFileSync(join(contentRoot, 'lawrefs.json'), 'utf8')) as LawRef[]
const cases = JSON.parse(readFileSync(join(contentRoot, 'cases.json'), 'utf8')) as CaseCard[]
const articles = JSON.parse(readFileSync(join(contentRoot, 'fundamental-rights.json'), 'utf8')) as FRArticle[]
const finderRows = JSON.parse(readFileSync(join(contentRoot, 'articleFinder.json'), 'utf8')) as ArticleFinderRow[]
const scripts = JSON.parse(readFileSync(join(contentRoot, 'scripts.json'), 'utf8')) as Script[]
const lines = ['# Legal content review', '', 'All content is a draft until reviewed by an advocate. Verify every legal proposition and citation before publication.', '']

for (const module of modules) {
  lines.push(`## ${module.id}: ${module.title.en}`, '', `Status: ${module.status}`, '', module.summary.en, '')
  lines.push(`Hindi title: ${module.title.hi ?? 'MISSING'}`, '', `Hindi summary: ${module.summary.hi ?? 'MISSING'}`, '')
  for (const grayArea of module.grayAreas ?? []) {
    lines.push(`> Gray area: ${grayArea.en}`, '')
    lines.push(`> Hindi: ${grayArea.hi ?? 'MISSING'}`, '')
  }
  for (const step of module.steps) {
    lines.push(`- **${step.type}:** ${step.text.en}`)
    lines.push(`  - Hindi: ${step.text.hi ?? 'MISSING'}`)
    for (const id of step.refs ?? []) {
      const ref = lawRefs.find((item) => item.id === id)
      const caseCard = cases.find((item) => item.id === id)
      if (ref) {
        lines.push(`  - Reference: ${ref.label.en} / ${ref.label.hi ?? 'MISSING'}; current: ${ref.current ?? '—'}; old: ${ref.old ?? '—'}`)
      } else if (caseCard) {
        lines.push(`  - Case: ${caseCard.name.en} / ${caseCard.name.hi ?? 'MISSING'}; citation: ${caseCard.citation ?? caseCard.year}; verify: ${caseCard.verifyCitation}`)
      } else {
        lines.push(`  - Missing reference: ${id}`)
      }
    }
  }
  lines.push('', '- [ ] Correct  - [ ] Needs change  - [ ] Remove', '', 'Reviewer comments:', '')
}

lines.push('## Fundamental Rights Articles', '')
for (const article of articles) {
  lines.push(`### Article ${article.article}: ${article.name.en}`, '', `Status: ${article.status}; verify: ${article.verify}`, '')
  lines.push(`English: ${article.plain.en}`, '', `Hindi: ${article.plain.hi ?? 'MISSING'}`, '')
  lines.push(`Who is covered: ${article.who}`, '')
  if (article.limits) lines.push(`Limits (English): ${article.limits.en}`, '', `Limits (Hindi): ${article.limits.hi ?? 'MISSING'}`, '')
  if (article.atProtest) lines.push(`At a protest (English): ${article.atProtest.en}`, '', `At a protest (Hindi): ${article.atProtest.hi ?? 'MISSING'}`, '')
  if (article.memory) lines.push(`Memory phrase: ${article.memory.en} / ${article.memory.hi ?? 'MISSING'}`, '')
  lines.push(`References: ${(article.refs ?? []).join(', ') || 'none'}`, '', '- [ ] Correct  - [ ] Needs change  - [ ] Remove', '', 'Reviewer comments:', '')
}

lines.push('## Article finder', '')
for (const row of finderRows) {
  lines.push(`- ${row.problem.en} / ${row.problem.hi ?? 'MISSING'}`)
  lines.push(`  - Guidance: ${row.plain.en}`)
  lines.push(`  - Hindi: ${row.plain.hi ?? 'MISSING'}`)
  lines.push(`  - Articles: ${row.articles.join(', ')}`)
}

lines.push('', '## Scripts', '')
for (const script of scripts) {
  lines.push(`### ${script.id}: ${script.when.en}`, '', `English: ${script.en}`, '', `Hindi: ${script.hi}`, '', `Roman Hindi: ${script.hiRoman}`, '')
  if (script.warning) lines.push(`Warning (English): ${script.warning.en}`, '', `Warning (Hindi): ${script.warning.hi ?? 'MISSING'}`, '')
  if (script.safetyLine) lines.push(`Safety (English): ${script.safetyLine.en}`, '', `Safety (Hindi): ${script.safetyLine.hi ?? 'MISSING'}`, '')
  for (const tip of script.tips ?? []) {
    lines.push(`Say it well — Do: ${tip.do.en} / ${tip.do.hi ?? 'MISSING'}`)
    lines.push(`Say it well — Don't: ${tip.dont.en} / ${tip.dont.hi ?? 'MISSING'}`)
  }
  lines.push(`Articles: ${(script.articleIds ?? []).join(', ') || 'none'}`, '', '- [ ] Correct  - [ ] Needs change  - [ ] Remove', '', 'Reviewer comments:', '')
}

lines.push('## References requiring verification', '')
for (const ref of lawRefs.filter((item) => item.verify)) {
  lines.push(`- ${ref.id}: ${ref.label.en} / ${ref.label.hi ?? 'MISSING'} — current: ${ref.current ?? '—'}; old: ${ref.old ?? '—'}`)
}

lines.push('', '## Case citations requiring verification', '')
for (const card of cases.filter((item) => item.verifyCitation)) {
  lines.push(`- [ ] ${card.name.en} / ${card.name.hi ?? 'MISSING'}${card.citation ? ` — ${card.citation}` : ` — ${card.year}`}`)
  lines.push(`  - Holding: ${card.holding.en}`)
  lines.push(`  - Hindi: ${card.holding.hi ?? 'MISSING'}`)
  lines.push(`  - Why it matters: ${card.whyItMatters.en}`)
  lines.push(`  - Hindi: ${card.whyItMatters.hi ?? 'MISSING'}`)
}

writeFileSync(join(process.cwd(), 'REVIEW.md'), `${lines.join('\n')}\n`, 'utf8')
console.log('Wrote REVIEW.md')
