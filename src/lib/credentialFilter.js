// Search and category filtering for the credentials section. Kept free of
// React so the matching rules can be unit tested on their own.

export const credentialCategories = [
  { id: 'all', label: 'All' },
  { id: 'ai', label: 'AI & Anthropic' },
  { id: 'technical', label: 'Technical' },
]

export const isAiCredential = (credential) => credential.issuer === 'Anthropic'

export function filterCredentials(records, { query = '', category = 'all' } = {}) {
  const terms = String(query).toLocaleLowerCase('en').split(/\s+/).filter(Boolean)

  return records.filter((credential) => {
    if (category === 'ai' && !isAiCredential(credential)) return false
    if (category === 'technical' && isAiCredential(credential)) return false
    if (terms.length === 0) return true

    const searchable = [credential.title, credential.issuer, credential.kind, credential.credentialId]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('en')
    return terms.every((term) => searchable.includes(term))
  })
}
