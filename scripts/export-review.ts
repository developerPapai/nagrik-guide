import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { CaseCard, LawRef, Module } from '../src/types'

const contentRoot = join(process.cwd(), 'src', 'content')
const modules = readdirSync(join(contentRoot, 'modules'))
  .filter((file) => file.endsWith('.json'))
  .map((file) => JSON.parse(readFileSync(join(contentRoot, 'modules', file), 'utf8')) as Module)
const lawRefs = JSON.parse(readFileSync(join(contentRoot, 'lawrefs.json'), 'utf8')) as LawRef[]
const cases = JSON.parse(readFileSync(join(contentRoot, 'cases.json'), 'utf8')) as CaseCard[]
const lines = ['# Legal content review', '', 'All content is a draft until reviewed by an advocate.', '']

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
      lines.push(`  - Reference: ${ref?.label.en ?? id} / ${ref?.label.hi ?? 'MISSING'}; current: ${ref?.current ?? '—'}; old: ${ref?.old ?? '—'}`)
    }
  }
  lines.push('', '- [ ] Correct  - [ ] Needs change  - [ ] Remove', '', 'Reviewer comments:', '')
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
