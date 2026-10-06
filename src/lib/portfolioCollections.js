export const featuredCredentialTitles = [
  'Building with the Claude API',
  'Introduction to Model Context Protocol',
  'Introduction to Agent Skills',
  'Claude Code in Action',
  'Model Context Protocol: Advanced Topics',
  'Go Programming',
]

export const featuredTitles = new Set(featuredCredentialTitles)

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
