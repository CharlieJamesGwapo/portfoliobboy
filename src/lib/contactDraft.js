// Unsent form text survives internal navigation only in this page's memory.
// It is never persisted to browser storage or included in navigation URLs.
const limits = { name: 120, email: 254, subject: 200, message: 5000 }
const snapshot = value => ({
  ...Object.fromEntries(Object.entries(limits).map(([field, limit]) => {
    const text = value && Object.getOwnPropertyDescriptor(value, field)?.value
    return [field, typeof text === 'string' ? text.slice(0, limit) : '']
  })),
  company: '',
})

let draft = snapshot(null)
let version = 0

export function readContactDraft() {
  return { ...draft }
}

export function saveContactDraft(value) {
  draft = snapshot(value)
  version += 1
}

export function beginContactDraftSubmission() {
  draft = snapshot(null)
  version += 1
  return version
}

export function restoreFailedContactDraft(value, submissionVersion) {
  if (submissionVersion !== version) return false
  saveContactDraft(value)
  return true
}
