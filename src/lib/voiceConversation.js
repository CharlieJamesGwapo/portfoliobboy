import { recommendProjects } from './assistantWorkflows.js'
import { caseStudies } from '../data/caseStudies.js'
import { isVoiceFarewell } from './voiceFarewell.js'

export const VOICE_TRANSCRIPT_LIMIT = 80

export const voiceStarters = [
  { id: 'crm', label: 'Show me your CRM work', prompt: 'Show me your CRM work' },
  { id: 'ai-agents', label: 'What AI agents have you built?', prompt: 'What AI agents have you built?' },
  { id: 'work-together', label: 'How can we work together?', prompt: 'How can we work together?' },
]

const textValue = (value, limit = 2000) => typeof value === 'string' ? value.trim().slice(0, limit) : ''
const validSource = source => source === 'user' || source === 'ai'
const eventKey = value => typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value)) ? String(value).slice(0, 200) : null

// Metadata belongs only to the open workspace. No transcript is stored or sent.
export function mergeVoiceTranscript(messages, event, sessionId) {
  const previous = Array.isArray(messages) ? messages.slice(-VOICE_TRANSCRIPT_LIMIT) : []
  const text = textValue(event?.message)
  if (!validSource(event?.source) || !text) return previous
  const session = String(sessionId ?? '')
  const source = event.source
  const providerId = eventKey(event.event_id)
  let index = providerId === null ? -1 : previous.findIndex(message => (
    message.sessionId === session && message.source === source && message.eventId === providerId
  ))

  // The SDK may echo a clicked starter after an AI response has already arrived.
  // Bind that provider ID to the optimistic row so subsequent corrections work.
  if (index < 0 && source === 'user' && event.local !== true) {
    index = previous.findIndex(message => message.sessionId === session && message.source === source && message.local === true && message.text === text)
  }
  const last = previous[previous.length - 1]
  if (index < 0 && providerId === null && last?.sessionId === session && last.source === source && last.text === text) index = previous.length - 1

  if (index >= 0) {
    return previous.map((message, position) => position === index ? {
      ...message,
      text,
      eventId: providerId ?? message.eventId,
      local: event.local === true,
    } : message)
  }
  const sequence = previous.reduce((maximum, message) => Math.max(maximum, message.sequence || 0), 0) + 1
  return [...previous, {
    id: `${session}:${source}:${sequence}`,
    source,
    text,
    sessionId: session,
    eventId: providerId,
    local: event.local === true,
    sequence,
  }].slice(-VOICE_TRANSCRIPT_LIMIT)
}

function substantive(text) {
  if (!text || isVoiceFarewell(text)) return false
  const normalized = text.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()
  return normalized.length >= 8 && !/^(?:(?:hello|hi|hey)(?: alex| charlie)?(?: how are you)?|(?:good morning|good afternoon|good evening)(?: alex)?|(?:thanks|thank you)(?: alex| for your help| for the help)?|yes|no|okay|ok|alright|sure|great|sounds good|tell me more|how are you)$/.test(normalized)
}

const transcript = messages => (Array.isArray(messages) ? messages : []).slice(-VOICE_TRANSCRIPT_LIMIT)
  .filter(message => validSource(message?.source) && textValue(message.text))
const escaped = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
// Distinctive short names already used by the published project records.
// Alex alone is excluded because it is also this portfolio assistant's name.
const shortNames = { 'alex-hasti': ['Hasti'], 'zalio-crm': ['Zalio'] }
const named = (text, study) => [study.title, study.slug, study.slug.replace(/-/g, ' '), ...(shortNames[study.slug] || [])]
  .some(name => new RegExp(`(?<![a-z0-9])${escaped(name)}(?![a-z0-9])`, 'i').test(text))
const projectCard = study => recommendProjects(study.title).projects.find(project => project.href === `/projects/${study.slug}`)
// Pricing/scheduling follow-ups are not new product requirements. In
// particular, "delivery date" must not replace CRM evidence with rider apps.
const commercialFollowUp = text => /^(?:what|how|when|can|is|are|does|will)\b/i.test(text)
  && /\b(?:pric\w*|costs?|rates?|quotes?|budget|availability|available|timelines?|delivery\s+(?:date|time|deadline|schedule|estimate)|guarantee\w*)\b/i.test(text)
  && !caseStudies.some(study => named(text, study))

export function getVoiceProjects(messages) {
  const turns = transcript(messages)
  let latestVisitorIndex = -1
  for (let index = turns.length - 1; index >= 0; index--) {
    if (turns[index].source === 'user' && substantive(textValue(turns[index].text)) && !commercialFollowUp(textValue(turns[index].text))) {
      latestVisitorIndex = index
      break
    }
  }
  const latestVisitor = latestVisitorIndex >= 0 ? textValue(turns[latestVisitorIndex].text) : ''
  // A response from an earlier topic should not override a newer visitor request.
  const latestAI = turns.slice(latestVisitorIndex + 1).reverse().find(message => message.source === 'ai')
  const mentioned = latestAI ? caseStudies.filter(study => named(textValue(latestAI.text), study)).map(projectCard).filter(Boolean) : []
  const relevant = latestVisitor ? recommendProjects(latestVisitor).projects : []
  const requestedByName = caseStudies.filter(study => named(latestVisitor, study)).map(projectCard).filter(Boolean)
  // Leave room for named response evidence without sacrificing the visitor's
  // most relevant match. Every card is rebuilt from the public case study data.
  const ranked = [...requestedByName, ...relevant.slice(0, 1), ...mentioned, ...relevant.slice(1)]
  return [...new Map(ranked.map(project => [project.href, project])).values()].slice(0, 3)
}

export function buildVoiceEnquiry(messages, projects) {
  const notes = transcript(messages).filter(message => message.source === 'user')
    .map(message => textValue(message.text)).filter(substantive)
  if (!notes.length) return null
  const references = (Array.isArray(projects) ? projects : []).map(project => (
    caseStudies.find(study => project?.href === `/projects/${study.slug}`)
  )).filter(Boolean)
  const titles = [...new Set(references.map(study => study.title))].slice(0, 3)
  // Reserve space for review instructions and unconfirmed details. Keep the
  // latest visitor notes when a lengthy conversation exceeds the draft budget.
  let remaining = 3300
  const included = []
  for (const note of notes.slice().reverse()) {
    if (remaining <= 0) break
    const entry = note.slice(0, Math.max(0, remaining - 3))
    if (!entry) break
    included.unshift(`- ${entry}`)
    remaining -= entry.length + 3
  }
  return {
    subject: `Voice project enquiry: ${notes[notes.length - 1].replace(/\s+/g, ' ')}`.slice(0, 120),
    message: `Hi Charlie, I would like to discuss the following.\n\nVisitor notes (please review):\n${included.join('\n')}\n\nScope: To discuss\nTimeline: To discuss\nBudget: To discuss${titles.length ? `\n\nRelevant public portfolio examples:\n${titles.map(title => `- ${title}`).join('\n')}` : ''}\n\nPlease confirm the scope, feasibility, timeline and budget with me.`,
  }
}
