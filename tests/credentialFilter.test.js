import test from 'node:test'
import assert from 'node:assert/strict'
import { certifications } from '../src/data/portfolioData.js'
import { filterCredentials, isAiCredential } from '../src/lib/credentialFilter.js'

const aiCount = certifications.filter(isAiCredential).length

test('returns every credential when nothing is filtered', () => {
  assert.equal(filterCredentials(certifications).length, certifications.length)
  assert.equal(filterCredentials(certifications, { query: '   ' }).length, certifications.length)
})

test('splits credentials by category', () => {
  const ai = filterCredentials(certifications, { category: 'ai' })
  const technical = filterCredentials(certifications, { category: 'technical' })
  assert.equal(ai.length, aiCount)
  assert.ok(ai.every(isAiCredential))
  assert.equal(technical.length, certifications.length - aiCount)
  assert.ok(technical.every((credential) => !isAiCredential(credential)))
})

test('matches title and issuer case-insensitively, requiring every word', () => {
  const claudeCode = filterCredentials(certifications, { query: 'CLAUDE code' })
  assert.ok(claudeCode.length > 0)
  assert.ok(claudeCode.every((credential) => /claude/i.test(credential.title) && /code/i.test(credential.title)))

  const byIssuer = filterCredentials(certifications, { query: 'anthropic' })
  assert.equal(byIssuer.length, aiCount)
})

test('matches credential IDs and combines search with category', () => {
  const withId = certifications.find((credential) => credential.credentialId)
  assert.ok(withId, 'fixture needs a credential with an ID')
  const found = filterCredentials(certifications, { query: withId.credentialId })
  assert.ok(found.includes(withId))

  const category = isAiCredential(withId) ? 'technical' : 'ai'
  assert.equal(filterCredentials(certifications, { query: withId.credentialId, category }).includes(withId), false)
})

test('returns nothing for an unmatched search', () => {
  assert.deepEqual(filterCredentials(certifications, { query: 'zzzz-no-such-credential' }), [])
})
