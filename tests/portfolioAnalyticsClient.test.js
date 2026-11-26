import test from 'node:test'
import assert from 'node:assert/strict'
import { createPortfolioTracker } from '../src/lib/portfolioAnalytics.js'

test('disabled analytics and browser privacy signals never produce a request', () => {
  let sends = 0
  for (const options of [{ enabled: false }, { enabled: true, navigatorImpl: { doNotTrack: '1' } }, { enabled: true, navigatorImpl: { globalPrivacyControl: true } }]) {
    const track = createPortfolioTracker({ fetchImpl: () => { sends++ }, ...options })
    assert.equal(track('portfolio_voice_started', { surface: 'voice_home' }), false)
  }
  assert.equal(sends, 0)
})

test('explicit allowed events carry only fixed fields without credentials or referrer', async () => {
  const requests = []
  const track = createPortfolioTracker({ enabled: true, navigatorImpl: {}, fetchImpl: (...args) => { requests.push(args); return Promise.resolve({ ok: true }) } })
  assert.equal(track('portfolio_starter_used', { surface: 'voice_panel', starter_id: 'crm' }), true)
  const [url, options] = requests[0]
  assert.equal(url, '/api/analytics')
  assert.equal(options.credentials, 'omit')
  assert.equal(options.referrerPolicy, 'no-referrer')
  assert.equal(options.keepalive, true)
  assert.deepEqual(JSON.parse(options.body), { event: 'portfolio_starter_used', properties: { surface: 'voice_panel', starter_id: 'crm' } })
  assert.equal(track('portfolio_voice_started', { surface: 'voice_home', email: 'private@example.com' }), false)
  assert.equal(track('portfolio_contact_submitted', { surface: 'contact' }), false)
  assert.equal(track('unknown', { surface: 'voice_home' }), false)
  assert.equal(requests.length, 1)
})

test('analytics failure cannot throw into a visitor action', async () => {
  const syncFailure = createPortfolioTracker({ enabled: true, navigatorImpl: {}, fetchImpl: () => { throw new Error('offline') } })
  const asyncFailure = createPortfolioTracker({ enabled: true, navigatorImpl: {}, fetchImpl: () => Promise.reject(new Error('offline')) })
  assert.doesNotThrow(() => syncFailure('portfolio_voice_started', { surface: 'voice_home' }))
  assert.doesNotThrow(() => asyncFailure('portfolio_voice_started', { surface: 'voice_home' }))
  await new Promise(resolve => setImmediate(resolve))
})
