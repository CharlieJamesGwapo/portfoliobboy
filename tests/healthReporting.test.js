import test from 'node:test'
import assert from 'node:assert/strict'
import { createHealthReporter, installHealthReporting, createVoiceHealthAttempt } from '../src/lib/healthReporting.js'

const tick = () => new Promise(resolve => setImmediate(resolve))
const properties = { surface: 'app', code: 'app_unhandled' }

function setup(options = {}) {
  const requests = []
  const timers = new Map()
  let nextTimer = 0
  const report = createHealthReporter({
    enabled: true, navigatorImpl: {},
    fetchImpl: (...args) => { requests.push(args); return Promise.resolve({ ok: true }) },
    setTimeoutImpl: callback => { timers.set(++nextTimer, callback); return nextTimer },
    clearTimeoutImpl: id => timers.delete(id),
    ...options,
  })
  return { report, requests, timers }
}

test('health sends only strict fixed client categories and rejects private or privileged fields', async () => {
  const { report, requests, timers } = setup()
  for (const privateProperties of [
    { ...properties, message: 'private email and transcript' },
    { ...properties, stack: 'secret stack' },
    { ...properties, url: 'https://private.example/?email=private' },
    { surface: 'contact', code: 'contact_mail_failed' },
    { surface: 'voice_home', code: 'app_unhandled' },
    { surface: 'app', code: 'email@example.com' },
    null,
  ]) assert.equal(report(privateProperties), false)
  const poisonous = Object.defineProperty({}, 'surface', { enumerable: true, get() { throw new Error('private') } })
  assert.doesNotThrow(() => assert.equal(report(poisonous), false))
  assert.equal(report(properties), true)
  const [url, request] = requests[0]
  assert.equal(url, '/api/analytics')
  assert.equal(request.credentials, 'omit')
  assert.equal(request.referrerPolicy, 'no-referrer')
  assert.equal(request.keepalive, true)
  assert.ok(request.signal instanceof AbortSignal)
  assert.deepEqual(JSON.parse(request.body), { event: 'portfolio_health_error', properties })
  assert.equal(requests.length, 1)
  await tick()
  assert.equal(timers.size, 0)
})

test('disabled, DNT and GPC suppress all health requests, including changes after startup', () => {
  for (const options of [{ enabled: false }, { navigatorImpl: { doNotTrack: '1' } }, { navigatorImpl: { globalPrivacyControl: true } }]) {
    const { report, requests } = setup(options)
    assert.equal(report(properties), false)
    assert.equal(requests.length, 0)
  }
  const navigatorImpl = {}
  const { report, requests } = setup({ navigatorImpl })
  navigatorImpl.globalPrivacyControl = true
  assert.equal(report(properties), false)
  assert.equal(requests.length, 0)
})

test('deduplication and the page cap bound failed requests without retries', async () => {
  const { report, requests } = setup({ maxReports: 2 })
  assert.equal(report(properties), true)
  assert.equal(report(properties), false)
  assert.equal(report({ surface: 'app', code: 'asset_load_failed' }), true)
  assert.equal(report({ surface: 'voice_panel', code: 'voice_start_failed' }), false)
  assert.equal(requests.length, 2)
  for (const fetchImpl of [() => { throw new Error('private sync failure') }, () => Promise.reject(new Error('private network failure'))]) {
    const broken = setup({ fetchImpl })
    assert.doesNotThrow(() => broken.report(properties))
    assert.equal(broken.report(properties), false)
    await tick()
    assert.equal(broken.timers.size, 0)
  }
})

test('a stalled fetch is aborted at the bounded deadline and never retries', async () => {
  const { report, requests, timers } = setup({ fetchImpl: (...args) => { requests.push(args); return new Promise(() => {}) } })
  report(properties)
  assert.equal(timers.size, 1)
  for (const callback of timers.values()) callback()
  assert.equal(requests[0][1].signal.aborted, true)
  assert.equal(report(properties), false)
  assert.equal(requests.length, 1)
})

function fakeWindow() {
  class Element { constructor(tagName) { this.tagName = tagName } }
  const listeners = new Map()
  return { Element, listeners, addEventListener: (type, fn) => listeners.set(type, fn), removeEventListener: type => listeners.delete(type) }
}

test('global listeners never inspect raw errors, URLs, rejection reasons or private form elements', () => {
  const windowImpl = fakeWindow()
  const events = []
  const remove = installHealthReporting({ windowImpl, report: value => events.push(value) })
  const poison = { get() { throw new Error('must not inspect private detail') } }
  const globalError = Object.defineProperties({ target: windowImpl }, { message: poison, error: poison, filename: poison })
  windowImpl.listeners.get('error')(globalError)
  windowImpl.listeners.get('unhandledrejection')(Object.defineProperty({}, 'reason', poison))
  for (const tag of ['SCRIPT', 'LINK', 'IMG']) {
    const target = Object.defineProperty(new windowImpl.Element(tag), 'src', poison)
    windowImpl.listeners.get('error')({ target })
  }
  windowImpl.listeners.get('error')({ target: new windowImpl.Element('INPUT') })
  assert.deepEqual(events, [properties, { surface: 'app', code: 'app_unhandled_rejection' }, ...Array.from({ length: 3 }, () => ({ surface: 'app', code: 'asset_load_failed' }))])
  remove()
  assert.equal(windowImpl.listeners.size, 0)
})

test('startup/listener failures are nonfatal and cannot recursively report rejected telemetry', async () => {
  const windowImpl = fakeWindow()
  windowImpl.addEventListener = () => { throw new Error('startup failure') }
  assert.doesNotThrow(() => installHealthReporting({ windowImpl }))
  const working = fakeWindow()
  installHealthReporting({ windowImpl: working, report: () => { throw new Error('report failure') } })
  assert.doesNotThrow(() => working.listeners.get('error')({ target: working }))
  assert.doesNotThrow(() => working.listeners.get('unhandledrejection')({}))
  await tick()
})

test('voice failures are classified once per attempt and expose no provider payload', () => {
  for (const surface of ['voice_home', 'voice_panel']) {
    for (const [connected, kind, code] of [[false, 'provider', 'voice_start_failed'], [true, 'provider', 'voice_connection_lost'], [true, 'send', 'voice_send_failed']]) {
      const events = []
      const attempt = createVoiceHealthAttempt({ surface, report: value => events.push(value) })
      if (connected) attempt.connected()
      attempt.fail(kind)
      attempt.fail('provider')
      assert.deepEqual(events, [{ surface, code }])
    }
  }
})

test('voice permission refusal, no input, goodbye, timer, manual end and cleanup are excluded', () => {
  for (const ending of ['permission', 'no-input', 'goodbye', 'timer', 'manual', 'cleanup']) {
    const events = []
    const attempt = createVoiceHealthAttempt({ surface: 'voice_home', report: value => events.push(value) })
    attempt.end()
    attempt.fail('provider')
    attempt.fail('send')
    assert.deepEqual(events, [], ending)
  }
  const attempt = createVoiceHealthAttempt({ surface: 'voice_home', report: () => { throw new Error('reporter offline') } })
  assert.doesNotThrow(() => attempt.fail('provider'))
})

test('permission changes between the precheck and SDK microphone open are excluded by fixed exception name', () => {
  for (const name of ['NotAllowedError', 'SecurityError', 'NotFoundError']) {
    const events = []
    const attempt = createVoiceHealthAttempt({ surface: 'voice_home', report: value => events.push(value) })
    attempt.fail('provider', name)
    attempt.fail('provider')
    assert.deepEqual(events, [])
  }
})
