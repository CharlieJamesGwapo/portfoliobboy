export const featuredCredentialTitles = [
  'Building with the Claude API',
  'Introduction to Model Context Protocol',
  'Introduction to Agent Skills',
  'Claude Code in Action',
  'Model Context Protocol: Advanced Topics',
  'Go Programming',
]

export const featuredTitles = new Set(featuredCredentialTitles)

export const featuredMomentumIds = ['hasti', 'zalio', 'gymfactories']
export const momentumSystemFilters = ['All systems', 'AI Agents', 'Voice', 'Automation', 'CRM', 'Analytics', 'Platforms']

export function getSystemLiveActionLabel(system) {
  if (!system?.url) return null
  if (system.id === 'hasti') return 'Try the AI receptionist'
  if (system.id === 'zalio') return 'Open the product site'
  if (system.statusTone === 'prototype') return 'Explore the prototype'
  if (system.status.toLocaleLowerCase('en').includes('demo')) return 'Explore the live demo'
  return 'Explore the live product'
}

export function selectCredentials(records, { query = '', category = 'all', expanded = false } = {}) {
  const needle = String(query).trim().toLocaleLowerCase('en')
  const matches = records.filter((record) => {
    const categoryMatches = category === 'all'
      || (category === 'ai') === (record.issuer === 'Anthropic')
    if (!categoryMatches) return false

    const searchable = `${record.title} ${record.issuer} ${record.credentialId || ''}`
      .toLocaleLowerCase('en')
    return searchable.includes(needle)
  })

  return expanded || needle || category !== 'all'
    ? matches
    : matches.filter((record) => featuredTitles.has(record.title))
}

export function selectSystems(records, { category = 'All systems', expanded = false } = {}) {
  const matches = category === 'All systems'
    ? records
    : records.filter((record) => record.categories.includes(category))

  return expanded || category !== 'All systems'
    ? matches
    : matches.filter((record) => featuredMomentumIds.includes(record.id))
}
