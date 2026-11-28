import { caseStudies } from '../data/caseStudies.js'
import { normalizeShortlist } from './projectShortlistSelection.js'

export { MAX_SHORTLIST, shortlistProjectTitles, normalizeShortlist, toggleShortlist, readSharedShortlist, shortlistShareUrl } from './projectShortlistSelection.js'
const studyBySlug = new Map(caseStudies.map(study => [study.slug, study]))
const origin = 'https://portfoliobboy.vercel.app'
const toList = value => Array.isArray(value) ? value : value ? [value] : []

export function getShortlistStudies(slugs) {
  return normalizeShortlist(slugs).map(slug => studyBySlug.get(slug)).filter(Boolean)
}

function projectEvidence(slugs) {
  const studies = getShortlistStudies(slugs)
  if (!studies.length) return 'No projects selected. Choose up to three published case studies to compare.'
  return studies.map((study, index) => [
    `${index + 1}. ${study.title}`,
    `Role: ${study.role}`,
    `Status: ${study.status}`,
    'Responsibilities:',
    ...toList(study.responsibilities).map(responsibility => `- ${responsibility}`),
    `Outcome: ${study.outcome}`,
    `Stack: ${study.stack.join(', ')}`,
    `Case study: ${origin}/projects/${study.slug}`,
  ].join('\n')).join('\n\n')
}

export function buildShortlistDocument(slugs) {
  return {
    kind: 'Project comparison',
    eyebrow: 'PROJECT COMPARISON',
    subject: 'Charlie Abejo · Project comparison',
    filename: 'charlie-abejo-project-comparison.txt',
    message: projectEvidence(slugs),
    disclaimer: 'Published portfolio evidence. Confirm project scope, availability, timing and suitability directly. Private-source and in-development caveats apply as published.',
  }
}

export function buildShortlistEnquiry(slugs) {
  return {
    subject: 'Project enquiry · Selected portfolio examples',
    message: [
      'Hi Charlie, I would like to discuss a project using these selected portfolio examples as a starting point.',
      projectEvidence(slugs),
      'Scope to discuss: goals, responsibilities, integrations, budget and timing. Please confirm the relevant experience and availability.',
    ].join('\n\n'),
  }
}
