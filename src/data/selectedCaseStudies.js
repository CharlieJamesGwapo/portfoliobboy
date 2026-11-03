import { featuredProjects, momentumSystems } from './portfolioData.js'
import { liveProjectLinks, oneRidePreview } from './productPreviewData.js'

const oneRide = featuredProjects.find(project => project.id === oneRidePreview.projectId)
const crm = momentumSystems.find(system => system.id === 'zalio-crm')
const hasti = momentumSystems.find(system => system.id === 'hasti')

// Editorial summaries of the existing project and resume records. No measured
// business outcomes are claimed; public product imagery is labelled as such.
const clientCaseStudies = [
  {
    id: 'oneride',
    title: 'OneRide Balingasag',
    category: 'Mobile · API · Operations',
    role: 'Full-stack & mobile development',
    overview: 'Transport, delivery and local shopping in one working platform.',
    problem: oneRide.context,
    contribution: 'Built the mobile, API, web and administrative workflows for Pasugo delivery, Pasabay rides, Pasundo pickup and local-store orders.',
    approach: 'React Native and Expo connect to a Go/Gin API and PostgreSQL. WebSockets carry live rider tracking, alongside OTP/JWT authentication, fare estimates and scheduled bookings.',
    scope: ['Customer, rider, store and admin workflows', 'Payments, ratings and SOS', 'Maps, live tracking and recurring bookings'],
    delivered: oneRide.delivered,
    stack: ['React Native', 'Expo', 'Go / Gin', 'PostgreSQL', 'WebSockets'],
    media: 'oneride',
    caption: 'Official Google Play screenshot · customer app',
    proof: 'Published Android app · client source code private',
    links: liveProjectLinks.filter(link => ['oneride-app', 'oneride-site'].includes(link.id)),
  },
  {
    id: 'zalio-crm',
    title: 'Zalio CRM',
    category: 'CRM · Realtime · Integrations',
    role: 'Lead engineer · CRM module',
    overview: 'A connected workspace for the gym member and lead lifecycle.',
    problem: 'Gym teams need a connected workflow for handling enquiries, following up with leads, booking appointments and retaining members.',
    contribution: 'Led the CRM module: built SMS, WhatsApp and email inbox workflows, response-time SLA alerts, lead deduplication, forms, retention workflows, browser calling and calendar bookings.',
    approach: 'Realtime inbox streams work alongside replay-safe form webhooks, lead merge workflows and consent-safe intake of Alex voice enquiries. Twilio supports browser calling; Google Calendar supports bookings.',
    scope: ['Omnichannel inbox and lead intake', 'Retention and reactivation workflows', 'Calling, booking and voice-agent handoff'],
    delivered: 'An integrated CRM module spanning lead intake, conversations, follow-up, calling, booking and retention.',
    stack: crm.stack,
    image: '/projects/zalio.png',
    imageAlt: 'Zalio public product website, not the private CRM interface',
    caption: 'Public product website · private CRM interface not shown',
    proof: 'Public product tour · CRM source code private',
    links: liveProjectLinks.filter(link => link.id === 'zalio-tour'),
  },
  {
    id: 'alex-hasti',
    title: 'Alex / Hasti',
    category: 'AI voice · Automation · CRM handoff',
    role: 'Voice runtime & callback experience',
    overview: 'From a caller’s first enquiry to a connected CRM workflow.',
    problem: 'Businesses need a first-response workflow that can answer enquiries, collect details and hand the next step to their CRM.',
    contribution: 'Built Alex’s self-hosted voice runtime and Hasti’s live callback experience, including request verification, live call status and captions, hang-up controls, consent capture and rate limits.',
    approach: 'LiveKit Agents and GPT-Live connect through Twilio SIP. A restart-safe call queue and transcript-cited call reviews support voice operations; a durable enquiry outbox connects the callback experience to the CRM.',
    scope: ['Voice call lifecycle and recovery', 'Consent-aware enquiry capture', 'Durable CRM handoff and call review'],
    delivered: 'A public callback demo on hasti.com.au, supported by voice-call operations and consent-aware enquiry handoff.',
    stack: ['LiveKit Agents', 'GPT-Live', 'Twilio SIP', 'Python', 'n8n'],
    image: hasti.image,
    imageAlt: hasti.imageAlt,
    caption: 'Public Hasti website · live callback experience',
    proof: 'Live callback demo · portfolio recordings are illustrative',
    links: liveProjectLinks.filter(link => link.id === 'hasti'),
  },
]

export const selectedCaseStudies = ['alex-hasti', 'zalio-crm', 'oneride'].map(id => clientCaseStudies.find(study => study.id === id))
