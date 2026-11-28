import { bookingOptions, experiences, profile } from '../data/portfolioData.js'
import { caseStudies } from '../data/caseStudies.js'
import { selectedCaseStudies } from '../data/selectedCaseStudies.js'

const MAX_CONTEXT_CHARS = 7000
const compact = value => String(value ?? '').replace(/\s+/g, ' ').trim()
const clip = (value, limit) => {
  const text = compact(value)
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text
}

// Public editorial evidence only. No visitor text, configuration, provider
// settings, or network access participates in this contextual update.
export function buildVoiceEvidenceContext() {
  const featured = experiences.find(role => role.featured) ?? experiences[0]
  const ongoing = experiences.filter(role => /present/i.test(role.period))
  const lines = [
    'PUBLIC PORTFOLIO EVIDENCE. Use these facts; do not invent projects, clients, credentials, prices, availability, seniority/years, or metrics. A published stack is evidence of documented work, not proof of expert proficiency or years using it. Preserve private, planned, prototype, and in-development status; never present planned integrations as delivered.',
    'Unpublished commercial prices, hourly rates, delivery dates and live availability: confirm with Charlie. A meeting request does not reserve a calendar event. Only call an intro/discovery option free when its published price is Free. Do not promise outcomes, access to private systems, bookings, or contact delivery.',
    'IDENTITY: You are the portfolio Alex, an ElevenLabs-powered portfolio guide when voice is available. The separate Alex / Hasti case study uses LiveKit Agents, GPT-Live and Twilio SIP. Accent and bilingual recordings are fictional AI-generated previews, not evidence of real client conversations.',
    `PROFILE: ${profile.name}; ${profile.role}; ${profile.location}; ${profile.portfolio}. Contact: ${profile.email}; ${profile.phoneDisplay}.`,
    `FEATURED ROLE (${ /present/i.test(featured.period) ? 'ongoing' : 'ended; do not describe as current' }): ${featured.role}, ${featured.company}, ${featured.period}.`,
    ...ongoing.map(role => `ONGOING PUBLISHED ROLE: ${role.role}, ${role.company}, ${role.period}.`),
    `CALL OPTIONS: ${bookingOptions.map(option => `${option.minutes}-minute ${option.title}: ${option.price}`).join('; ')}. ${bookingOptions.every(option => !option.url) ? 'Published options use a contact request; Charlie confirms scheduling.' : 'Use the published booking links where available.'}`,
    'CLOUD & DELIVERY: AWS Lambda integrations are documented in /projects/fintech-lending; Docker Compose in /projects/omji-billing; Linux VPS, GitLab/Buddy CI/CD and GitHub Actions in the published work. Additional AWS services, certifications and depth need confirmation. Automation and custom-bot solution patterns are service examples, not a count of completed deployments.',
    'SELECTED PRIORITIES: CRM, voice AI and automation. Personal contributions:',
    ...selectedCaseStudies.map(study => `${study.title}: ${clip(study.contribution, 300)}`),
    'PROJECT INDEX (public portfolio routes; external URLs are published links, not a live uptime check):',
  ]

  // Reserve space for every published project name and route first. Divide
  // the remainder evenly so future longer copy cannot drop later projects.
  const headers = caseStudies.map(study => `${compact(study.title)} | /projects/${study.slug}`)
  const fixedSize = [...lines, ...headers].join('\n').length
  const detailBudget = Math.max(0, Math.floor((MAX_CONTEXT_CHARS - fixedSize) / Math.max(1, caseStudies.length)) - 1)
  const projectLines = caseStudies.map((study, index) => {
    const external = study.links.find(link => /^https:\/\//.test(link.href ?? link.url ?? ''))
    const detail = `${compact(study.status)} | ${study.stack.slice(0, 3).join(', ')}${external ? ` | ${external.href ?? external.url}` : ''}`
    return `${headers[index]}${detailBudget ? ` | ${clip(detail, Math.max(0, detailBudget - 3))}` : ''}`
  })
  // Hard cap also covers any future expansion of profile or index metadata.
  return [...lines, ...projectLines].join('\n').slice(0, MAX_CONTEXT_CHARS)
}
