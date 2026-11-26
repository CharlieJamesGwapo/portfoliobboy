// This contract is also bundled in the browser. Only fixed public identifiers
// belong here; never add free-text or visitor properties.
export const ANALYTICS_EVENTS = Object.freeze({
  VOICE_STARTED: 'portfolio_voice_started',
  STARTER_USED: 'portfolio_starter_used',
  PROJECT_OPENED: 'portfolio_project_opened',
  ENQUIRY_REVIEWED: 'portfolio_enquiry_reviewed',
  CONTACT_SUBMITTED: 'portfolio_contact_submitted',
  BRIEF_DOWNLOADED: 'portfolio_brief_downloaded',
  BRIEF_PRINT_OPENED: 'portfolio_brief_print_opened',
  BOOKING_CLICKED: 'portfolio_booking_clicked',
})
export const ANALYTICS_SURFACES = Object.freeze(['voice_home', 'voice_panel', 'text_guide', 'contact'])
export const ANALYTICS_STARTER_IDS = Object.freeze(['crm', 'ai-agents', 'work-together'])
export const ANALYTICS_BOOKING_IDS = Object.freeze(['intro', 'discovery', 'consult'])
// Kept separate from the rich case-study data to keep the browser contract tiny.
// A contract test verifies that this inventory matches the canonical slugs.
export const ANALYTICS_PROJECT_IDS = Object.freeze([
  'alex-hasti', 'zalio-crm', 'oneride', 'autoflow-ai-pro', 'easyappy',
  'bboy', 'agentforge', 'contextpilot', 'omji-billing', 'fitness-crm',
  'fintech-lending', 'moist-alumni', 'filtra-pos', 'ecycle-hub',
  'mobile-booking', 'scale-with-accounting', 'st-john-baptist',
  'freelancepath', 'idealink', 'zero-to-hero-dev',
])

const voiceSurfaces = ['voice_home', 'voice_panel']
const guideSurfaces = [...voiceSurfaces, 'text_guide']
const schemas = new Map([
  [ANALYTICS_EVENTS.VOICE_STARTED, { surfaces: voiceSurfaces }],
  [ANALYTICS_EVENTS.STARTER_USED, { surfaces: guideSurfaces, identifier: 'starter_id', values: ANALYTICS_STARTER_IDS }],
  [ANALYTICS_EVENTS.PROJECT_OPENED, { surfaces: guideSurfaces, identifier: 'project_id', values: ANALYTICS_PROJECT_IDS }],
  [ANALYTICS_EVENTS.ENQUIRY_REVIEWED, { surfaces: ANALYTICS_SURFACES }],
  [ANALYTICS_EVENTS.CONTACT_SUBMITTED, { surfaces: ['contact'] }],
  [ANALYTICS_EVENTS.BRIEF_DOWNLOADED, { surfaces: guideSurfaces }],
  [ANALYTICS_EVENTS.BRIEF_PRINT_OPENED, { surfaces: guideSurfaces }],
  [ANALYTICS_EVENTS.BOOKING_CLICKED, { surfaces: ANALYTICS_SURFACES, identifier: 'booking_id', values: ANALYTICS_BOOKING_IDS }],
])

export function normalizeAnalyticsEvent(event, properties, { allowContact = false } = {}) {
  if (event === ANALYTICS_EVENTS.CONTACT_SUBMITTED && !allowContact) return null
  const schema = schemas.get(event)
  if (!schema || !properties || typeof properties !== 'object' || Array.isArray(properties)) return null
  const prototype = Object.getPrototypeOf(properties)
  if (prototype !== Object.prototype && prototype !== null) return null
  const keys = Reflect.ownKeys(properties)
  const expectedKeys = schema.identifier ? ['surface', schema.identifier] : ['surface']
  if (keys.length !== expectedKeys.length || keys.some((key) => !expectedKeys.includes(key))) return null
  const descriptors = Object.getOwnPropertyDescriptors(properties)
  if (expectedKeys.some((key) => !Object.hasOwn(descriptors[key], 'value'))) return null
  const surface = descriptors.surface.value
  if (!schema.surfaces.includes(surface)) return null
  const normalized = { surface }
  if (schema.identifier) {
    const identifier = descriptors[schema.identifier].value
    if (!schema.values.includes(identifier)) return null
    normalized[schema.identifier] = identifier
  }
  return { event, properties: normalized }
}
