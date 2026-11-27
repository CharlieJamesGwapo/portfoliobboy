import test from 'node:test'
import assert from 'node:assert/strict'
import { caseStudies } from '../src/data/caseStudies.js'

const contract = () => import('../shared/portfolioAnalytics.js')
const capture = () => import('../server/portfolioAnalytics.js')
const endpoint = () => import('../api/analytics.js')
const validBody = { event: 'portfolio_voice_started', properties: { surface: 'voice_home' } }

test('hosted analytics rejects development origins before recording events', async (t) => {
  configure(t, { VERCEL: '1', VERCEL_ENV: 'preview' })
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('Provider must not be called') })
  const { default: handler } = await endpoint()
  for (const origin of ['http://localhost:5173', 'http://127.0.0.1:5175']) {
    const res = response()
    await handler(request({ method: 'OPTIONS', headers: { origin } }), res)
    assert.equal(res.statusCode, 403)
  }
  assert.equal(fetch.mock.callCount(), 0)
})
function response() {
  return { headers: {}, statusCode: 200, setHeader(key, value) { this.headers[key] = value }, status(code) { this.statusCode = code; return this }, json(body) { this.body = body; return this }, end() { return this } }
}
function request(overrides = {}) {
  return { method: 'POST', headers: { origin: 'https://portfoliobboy.vercel.app', 'content-type': 'application/json' }, socket: { remoteAddress: '192.0.2.80' }, body: validBody, ...overrides }
}
function configure(t, values = {}) {
  for (const [key, value] of Object.entries({ POSTHOG_PROJECT_KEY: 'test-project-key', POSTHOG_API_HOST: 'https://us.i.posthog.com', ...values })) {
    const previous = process.env[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
    t.after(() => { if (previous === undefined) delete process.env[key]; else process.env[key] = previous })
  }
}

test('accepts only fixed event-specific identifiers and preserves canonical project inventory', async () => {
  const { normalizeAnalyticsEvent, ANALYTICS_PROJECT_IDS } = await contract()
  assert.deepEqual([...ANALYTICS_PROJECT_IDS].sort(), caseStudies.map(({ slug }) => slug).sort())
  const fixtures = [
    ['portfolio_voice_started', { surface: 'voice_panel' }],
    ['portfolio_starter_used', { surface: 'text_guide', starter_id: 'ai-agents' }],
    ['portfolio_project_opened', { surface: 'voice_home', project_id: 'zalio-crm' }],
    ['portfolio_enquiry_reviewed', { surface: 'contact' }],
  ]
  for (const [event, properties] of fixtures) assert.deepEqual(normalizeAnalyticsEvent(event, properties), { event, properties })
  for (const project_id of ANALYTICS_PROJECT_IDS) assert.ok(normalizeAnalyticsEvent('portfolio_project_opened', { surface: 'text_guide', project_id }))
})

test('rejects unknown properties, personal strings, wrong surfaces, missing identifiers and public contact claims', async () => {
  const { normalizeAnalyticsEvent: normalize } = await contract()
  for (const key of ['email', 'name', 'phone', 'url', 'query', 'body', 'session_id', 'transcript', '$ip', 'distinct_id']) {
    assert.equal(normalize('portfolio_voice_started', { surface: 'voice_home', [key]: 'private@example.com' }), null)
  }
  for (const [event, properties] of [
    ['portfolio_voice_started', { surface: 'contact' }],
    ['portfolio_starter_used', { surface: 'voice_home' }],
    ['portfolio_starter_used', { surface: 'voice_home', starter_id: 'private enquiry' }],
    ['portfolio_project_opened', { surface: 'text_guide', project_id: 'https://example.com/?email=secret' }],
    ['portfolio_project_opened', { surface: 'contact', project_id: 'bboy' }],
    ['portfolio_enquiry_reviewed', { surface: 'voice_home', project_id: 'bboy' }],
    ['portfolio_contact_submitted', { surface: 'contact' }],
    ['unknown', { surface: 'voice_home' }],
    ['toString', { surface: 'voice_home' }],
    ['portfolio_voice_started', null],
    ['portfolio_voice_started', []],
  ]) assert.equal(normalize(event, properties), null)
  assert.deepEqual(normalize('portfolio_contact_submitted', { surface: 'contact' }, { allowContact: true }), { event: 'portfolio_contact_submitted', properties: { surface: 'contact' } })
})

test('capture sends only sanitized enums with a fresh unlinked ID and privacy flags each time', async (t) => {
  configure(t)
  const outbound = []
  t.mock.method(globalThis, 'fetch', async (...args) => { outbound.push(args); return { ok: true } })
  const { capturePortfolioEvent } = await capture()
  assert.equal(await capturePortfolioEvent('portfolio_voice_started', { surface: 'voice_home', email: 'secret@example.com' }), false)
  assert.equal(outbound.length, 0)
  for (let i = 0; i < 2; i++) assert.equal(await capturePortfolioEvent('portfolio_voice_started', { surface: 'voice_home' }), true)
  const bodies = outbound.map(([, options]) => JSON.parse(options.body))
  assert.notEqual(bodies[0].distinct_id, bodies[1].distinct_id)
  for (const [url, options] of outbound) {
    assert.equal(url, 'https://us.i.posthog.com/i/v0/e/')
    assert.equal(options.method, 'POST')
    assert.ok(options.signal instanceof AbortSignal)
    assert.deepEqual(options.headers, { 'Content-Type': 'application/json' })
    const body = JSON.parse(options.body)
    assert.deepEqual(Object.keys(body).sort(), ['api_key', 'distinct_id', 'event', 'properties', 'timestamp'])
    assert.deepEqual(body.properties, { surface: 'voice_home', $process_person_profile: false, $geoip_disable: true, $ip: null })
    assert.match(body.distinct_id, /^[0-9a-f-]{36}$/)
    assert.ok(Number.isFinite(Date.parse(body.timestamp)))
  }
  assert.equal(await capturePortfolioEvent('portfolio_contact_submitted', { surface: 'contact' }), true)
})

test('capture stays disabled without complete safe configuration', async (t) => {
  const { capturePortfolioEvent } = await capture()
  const outbound = []
  t.mock.method(globalThis, 'fetch', async (...args) => { outbound.push(args); return { ok: true } })
  const cases = [
    { POSTHOG_PROJECT_KEY: undefined }, { POSTHOG_API_HOST: undefined },
    { POSTHOG_API_HOST: 'http://us.i.posthog.com' },
    { POSTHOG_API_HOST: 'https://us.i.posthog.com.attacker.com' },
    { POSTHOG_API_HOST: 'https://us.i.posthog.com/other' },
    { POSTHOG_API_HOST: 'https://secret@us.i.posthog.com' },
    { POSTHOG_API_HOST: 'https://us.i.posthog.com?email=secret' },
  ]
  for (const values of cases) {
    configure(t, values)
    assert.equal(await capturePortfolioEvent('portfolio_voice_started', { surface: 'voice_home' }), false)
  }
  assert.equal(outbound.length, 0)
})

test('capture accepts EU ingestion and treats provider errors and rejection as harmless', async (t) => {
  configure(t, { POSTHOG_API_HOST: 'https://eu.i.posthog.com/' })
  const { capturePortfolioEvent } = await capture()
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false }))
  assert.equal(await capturePortfolioEvent('portfolio_voice_started', { surface: 'voice_home' }), false)
  globalThis.fetch.mock.mockImplementation(async () => { throw new Error('network unavailable with sensitive detail') })
  assert.equal(await capturePortfolioEvent('portfolio_voice_started', { surface: 'voice_home' }), false)
})

test('endpoint accepts allowed origins and preflight while rejecting unrelated origins and methods', async (t) => {
  configure(t, { VERCEL_URL: 'portfolio-preview-owner.vercel.app', VERCEL_BRANCH_URL: 'portfolio-branch-owner.vercel.app' })
  const { default: handler } = await endpoint()
  for (const origin of ['https://portfoliobboy.vercel.app', 'https://portfolio-preview-owner.vercel.app', 'https://portfolio-branch-owner.vercel.app', 'http://localhost:5173']) {
    const res = response()
    await handler(request({ method: 'OPTIONS', headers: { origin } }), res)
    assert.equal(res.statusCode, 204)
    assert.equal(res.headers['Access-Control-Allow-Origin'], origin)
    assert.match(res.headers['Cache-Control'], /no-store/)
  }
  for (const origin of [undefined, 'null', 'https://attacker.vercel.app', 'https://portfoliobboy.vercel.app.attacker.com']) {
    const res = response()
    await handler(request({ headers: { origin } }), res)
    assert.equal(res.statusCode, 403)
  }
  const res = response()
  await handler(request({ method: 'GET' }), res)
  assert.equal(res.statusCode, 405)
  assert.equal(res.headers.Allow, 'POST, OPTIONS')
})

test('endpoint rejects malformed bodies, content types, oversized data and contact spoofing before capture', async (t) => {
  configure(t)
  const outbound = []
  t.mock.method(globalThis, 'fetch', async (...args) => { outbound.push(args); return { ok: true } })
  const { default: handler } = await endpoint()
  const cases = [
    request({ body: { ...validBody, email: 'secret@example.com' } }),
    request({ body: { ...validBody, properties: { surface: 'voice_home', query: 'secret' } } }),
    request({ body: { event: 'portfolio_contact_submitted', properties: { surface: 'contact' } } }),
    request({ body: { event: 'portfolio_voice_started' } }),
    request({ body: null }), request({ body: [] }), request({ body: '{broken' }),
    request({ body: { ...validBody, private: 'x'.repeat(1025) } }),
    request({ headers: { origin: 'https://portfoliobboy.vercel.app', 'content-type': 'text/plain' } }),
    request({ headers: { origin: 'https://portfoliobboy.vercel.app', 'content-type': 'application/json', 'content-length': '1025' } }),
  ]
  for (const req of cases) {
    const res = response()
    await handler(req, res)
    assert.equal(res.statusCode, 400)
  }
  assert.equal(outbound.length, 0)
})

test('endpoint honors DNT and GPC without forwarding request identifiers or counting denied events', async (t) => {
  configure(t)
  const outbound = []
  t.mock.method(globalThis, 'fetch', async (...args) => { outbound.push(args); return { ok: true } })
  const { default: handler } = await endpoint()
  for (let i = 0; i < 65; i++) {
    const res = response()
    await handler(request({ socket: { remoteAddress: '192.0.2.90' }, headers: { origin: 'https://portfoliobboy.vercel.app', 'content-type': 'application/json', [i % 2 ? 'dnt' : 'sec-gpc']: '1' } }), res)
    assert.equal(res.statusCode, 204)
  }
  assert.equal(outbound.length, 0)
  const res = response()
  await handler(request({ socket: { remoteAddress: '192.0.2.90' }, headers: { origin: 'https://portfoliobboy.vercel.app', 'content-type': 'application/json', cookie: 'visitor=secret', 'user-agent': 'secret', referer: 'https://example.com/private', 'x-forwarded-for': '203.0.113.111' } }), res)
  assert.equal(res.statusCode, 204)
  const serialized = JSON.stringify(outbound)
  for (const secret of ['visitor=secret', 'user-agent', 'referer', '203.0.113.111', '192.0.2.90']) assert.equal(serialized.includes(secret), false)
})

test('endpoint returns no-content when disabled or provider unavailable', async (t) => {
  configure(t, { POSTHOG_PROJECT_KEY: undefined })
  const { default: handler } = await endpoint()
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('provider failure') })
  const disabled = response()
  await handler(request(), disabled)
  assert.equal(disabled.statusCode, 204)
  process.env.POSTHOG_PROJECT_KEY = 'test-project-key'
  const unavailable = response()
  await handler(request(), unavailable)
  assert.equal(unavailable.statusCode, 204)
})

test('endpoint limits a burst per instance and keeps IP counters separate', async (t) => {
  configure(t, { POSTHOG_PROJECT_KEY: undefined })
  const { default: handler } = await endpoint()
  for (let i = 0; i < 61; i++) {
    const res = response()
    await handler(request({ socket: { remoteAddress: '192.0.2.99' } }), res)
    assert.equal(res.statusCode, i < 60 ? 204 : 429)
    if (i === 60) assert.ok(Number(res.headers['Retry-After']) > 0)
  }
  const separate = response()
  await handler(request({ socket: { remoteAddress: '192.0.2.100' } }), separate)
  assert.equal(separate.statusCode, 204)
})

test('normalization rejects accessors rather than copying changing private values', async () => {
  const { normalizeAnalyticsEvent } = await contract()
  let reads = 0
  const properties = Object.defineProperty({}, 'surface', { enumerable: true, get: () => ++reads === 1 ? 'voice_home' : 'secret@example.com' })
  assert.equal(normalizeAnalyticsEvent('portfolio_voice_started', properties), null)
  assert.equal(reads, 0)
})

test('capture aborts slow ingestion within the optional analytics deadline', async (t) => {
  configure(t)
  t.mock.method(globalThis, 'fetch', async (_url, { signal }) => new Promise((resolve, reject) => {
    const keepAlive = setTimeout(() => resolve({ ok: true }), 3000)
    signal.addEventListener('abort', () => { clearTimeout(keepAlive); reject(signal.reason) }, { once: true })
  }))
  const { capturePortfolioEvent } = await capture()
  const start = performance.now()
  assert.equal(await capturePortfolioEvent('portfolio_voice_started', { surface: 'voice_home' }), false)
  assert.ok(performance.now() - start < 2500)
})

test('endpoint bounds counter storage and expires it after the rate window', async (t) => {
  configure(t, { POSTHOG_PROJECT_KEY: undefined })
  const { default: handler } = await import('../api/analytics.js?bounded-counters')
  const start = Date.now()
  t.mock.method(Date, 'now', () => start)
  for (let i = 0; i < 1001; i++) {
    const res = response()
    await handler(request({ socket: { remoteAddress: `counter-test-${i}` } }), res)
    assert.equal(res.statusCode, i < 1000 ? 204 : 429)
  }
  Date.now.mock.mockImplementation(() => start + 10 * 60 * 1000)
  const expired = response()
  await handler(request({ socket: { remoteAddress: 'counter-test-1000' } }), expired)
  assert.equal(expired.statusCode, 204)
})
