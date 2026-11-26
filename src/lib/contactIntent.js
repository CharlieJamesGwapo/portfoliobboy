// Lets any "Start a project" link pre-select a subject in the contact form
// without a router, a query string, or storing anything about the visitor.
// An optional message template pre-fills the message (only when it is empty).
export const CONTACT_INTENT_EVENT = 'portfolio:contact-intent'

// Held in memory only, until the contact section mounts after route navigation.
let pendingAssistantIntent = null

export function stageAssistantEnquiry(subject, message) {
  if (typeof window === 'undefined' || !subject || !message) return
  pendingAssistantIntent = { subject, message, source: 'assistant' }
  window.dispatchEvent(new CustomEvent(CONTACT_INTENT_EVENT, { detail: pendingAssistantIntent }))
}

export function takeAssistantEnquiry() {
  const intent = pendingAssistantIntent
  pendingAssistantIntent = null
  return intent
}

export function requestContact(subject, message = '') {
  if (typeof window === 'undefined' || !subject) return
  window.dispatchEvent(new CustomEvent(CONTACT_INTENT_EVENT, { detail: { subject, message } }))
}
