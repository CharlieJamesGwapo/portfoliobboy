import test from 'node:test'
import assert from 'node:assert/strict'
import { certifications, momentumSystems } from '../src/data/portfolioData.js'
import { featuredCredentialTitles, getSystemLiveActionLabel, selectCredentials, selectSystems } from '../src/lib/portfolioCollections.js'

test('default credential view contains the six approved featured records', () => {
  const result = selectCredentials(certifications)

  assert.equal(result.length, 6)
  assert.deepEqual(
    new Set(result.map((item) => item.title)),
    new Set([
      'Building with the Claude API',
      'Introduction to Model Context Protocol',
      'Introduction to Agent Skills',
      'Claude Code in Action',
      'Model Context Protocol: Advanced Topics',
      'Go Programming',
    ]),
  )
  assert.equal(featuredCredentialTitles.length, 6)
})

test('expanded credential view keeps all 23 original records reachable', () => {
  const result = selectCredentials(certifications, { expanded: true })

  assert.equal(result.length, 23)
  assert.deepEqual(result, certifications)
})

test('queries search beyond the featured six', () => {
  const result = selectCredentials(certifications, { query: ' active DIRECTORY ' })

  assert.deepEqual(result.map((item) => item.title), ['Active Directory'])
})

test('query matching is case-insensitive and trims surrounding whitespace', () => {
  const result = selectCredentials(certifications, { query: '  cLaUDe 101  ' })

  assert.deepEqual(result.map((item) => item.title), ['Claude 101'])
})

test('category controls search the complete collection before featured limiting', () => {
  const ai = selectCredentials(certifications, { category: 'ai' })
  const technical = selectCredentials(certifications, { category: 'technical' })

  assert.equal(ai.length, 11)
  assert.ok(ai.every((item) => item.issuer === 'Anthropic'))
  assert.equal(technical.length, 12)
  assert.ok(technical.every((item) => item.issuer !== 'Anthropic'))
})

test('selector returns original records with supplied IDs and image absence intact', () => {
  const imageRecord = selectCredentials(certifications, { query: 'model context protocol' })
    .find((item) => item.title === 'Introduction to Model Context Protocol')
  const missingImage = selectCredentials(certifications, { query: 'active directory' })[0]

  assert.strictEqual(imageRecord, certifications.find((item) => item.title === 'Introduction to Model Context Protocol'))
  assert.equal(imageRecord?.credentialId, 'xy5k5u4b47qi')
  assert.equal(imageRecord?.image, '/certificates/introduction-model-context-protocol.webp')
  assert.strictEqual(missingImage, certifications.find((item) => item.title === 'Active Directory'))
  assert.equal(missingImage?.credentialId, undefined)
  assert.equal(missingImage?.image, undefined)
})

test('default Momentum view contains the three approved featured systems', () => {
  const result = selectSystems(momentumSystems)

  assert.deepEqual(result.map((item) => item.id), ['hasti', 'zalio', 'gymfactories'])
})

test('expanded Momentum view keeps all eight original systems reachable', () => {
  const result = selectSystems(momentumSystems, { expanded: true })

  assert.equal(result.length, 8)
  assert.deepEqual(result, momentumSystems)
})

test('filters search private systems outside the featured three', () => {
  const result = selectSystems(momentumSystems, { category: 'Voice' })

  assert.equal(result.length, 2)
  assert.ok(result.some((item) => item.id === 'hasti'))
  assert.ok(result.some((item) => item.id === 'voice-runtime' && !item.url))
})

test('Momentum selector leaves the original records unchanged', () => {
  const snapshot = structuredClone(momentumSystems)

  selectSystems(momentumSystems)
  selectSystems(momentumSystems, { category: 'Voice' })
  selectSystems(momentumSystems, { expanded: true })

  assert.deepEqual(momentumSystems, snapshot)
})

test('live action labels stay status-specific and private systems have no public action', () => {
  const publicLabels = new Map(
    momentumSystems
      .filter((system) => system.url)
      .map((system) => [system.id, getSystemLiveActionLabel(system)]),
  )

  assert.deepEqual(publicLabels, new Map([
    ['hasti', 'Try the AI receptionist'],
    ['zalio', 'Open the product site'],
    ['gymfactories', 'Explore the live product'],
    ['momentum-strength', 'Explore the live demo'],
    ['hsie-site-scoring', 'Explore the prototype'],
  ]))
  assert.equal(getSystemLiveActionLabel(momentumSystems.find((system) => system.id === 'voice-runtime')), null)
})
