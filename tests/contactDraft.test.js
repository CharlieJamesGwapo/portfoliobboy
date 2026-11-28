import test from 'node:test'
import assert from 'node:assert/strict'

let instance = 0
const freshDraftCache = () => import(`../src/lib/contactDraft.js?test=${instance++}`)
const empty = { name: '', email: '', subject: '', message: '', company: '' }
const draft = { name: 'Ada', email: 'ada@example.test', subject: 'Project scope', message: 'Please discuss this private draft.', company: 'bot-filled' }

test('contact draft snapshots preserve only bounded real fields and isolate caller mutations', async () => {
  const cache = await freshDraftCache()
  assert.deepEqual(cache.readContactDraft(), empty)
  const input = { ...draft, ignored: 'secret', submissionId: 'old-send', name: 'a'.repeat(130), email: 'e'.repeat(300), subject: 's'.repeat(210), message: 'm'.repeat(5100) }
  cache.saveContactDraft(input)
  input.name = 'changed'
  const stored = cache.readContactDraft()
  assert.deepEqual(stored, { name: 'a'.repeat(120), email: 'e'.repeat(254), subject: 's'.repeat(200), message: 'm'.repeat(5000), company: '' })
  stored.message = 'changed'
  assert.equal(cache.readContactDraft().message.length, 5000)
  cache.saveContactDraft({ name: 123, email: {}, subject: null, message: false, company: 'filled', __proto__: { surprise: 'secret' } })
  assert.deepEqual(cache.readContactDraft(), empty)
  cache.saveContactDraft(null)
  assert.deepEqual(cache.readContactDraft(), empty)
  cache.saveContactDraft(Object.create(draft))
  assert.deepEqual(cache.readContactDraft(), empty, 'inherited properties are not form fields')
})

test('starting a send clears the draft available to newly mounted forms and failed sends can restore it', async () => {
  const cache = await freshDraftCache()
  cache.saveContactDraft(draft)
  const version = cache.beginContactDraftSubmission()
  assert.deepEqual(cache.readContactDraft(), empty)
  assert.equal(cache.restoreFailedContactDraft(draft, version), true)
  assert.deepEqual(cache.readContactDraft(), { ...draft, company: '' })
  assert.equal(cache.restoreFailedContactDraft(draft, version), false, 'a settled send cannot restore twice')
})

test('a stale send failure cannot overwrite newer edits or a newer pending submission', async () => {
  const cache = await freshDraftCache()
  cache.saveContactDraft(draft)
  const oldVersion = cache.beginContactDraftSubmission()
  cache.saveContactDraft({ ...draft, subject: 'A newer project', message: 'New private notes' })
  assert.equal(cache.restoreFailedContactDraft(draft, oldVersion), false)
  assert.equal(cache.readContactDraft().message, 'New private notes')
  const newVersion = cache.beginContactDraftSubmission()
  assert.equal(cache.restoreFailedContactDraft(draft, oldVersion), false)
  assert.deepEqual(cache.readContactDraft(), empty)
  assert.equal(cache.restoreFailedContactDraft({ ...draft, message: 'New private notes' }, newVersion), true)
  assert.equal(cache.readContactDraft().message, 'New private notes')
})

test('draft cache needs no browser storage, URL access or telemetry', async t => {
  const deniedGlobals = ['window', 'localStorage', 'sessionStorage', 'location', 'fetch']
  const originals = Object.fromEntries(deniedGlobals.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  const deny = () => { assert.fail('contact draft must remain in memory') }
  const deniedWindow = {}
  for (const key of ['localStorage', 'sessionStorage', 'location', 'navigator', 'fetch']) Object.defineProperty(deniedWindow, key, { get: deny })
  Object.defineProperty(globalThis, 'window', { configurable: true, value: deniedWindow })
  for (const key of deniedGlobals.slice(1)) Object.defineProperty(globalThis, key, { configurable: true, get: deny })
  t.after(() => {
    for (const key of deniedGlobals) {
      if (originals[key]) Object.defineProperty(globalThis, key, originals[key])
      else delete globalThis[key]
    }
  })
  const cache = await freshDraftCache()
  cache.saveContactDraft(draft)
  assert.equal(cache.readContactDraft().message, draft.message)
  const version = cache.beginContactDraftSubmission()
  assert.equal(cache.restoreFailedContactDraft(draft, version), true)
})
