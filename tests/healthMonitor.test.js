import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolveEntryBundle, probePortfolio, runMonitor } from '../scripts/monitor_portfolio_health.mjs'

const ORIGIN = 'https://portfoliobboy.vercel.app'
const ENV = { POSTHOG_PROJECT_KEY: 'phc_test_only', POSTHOG_API_HOST: 'https://us.i.posthog.com' }
const HTML = '<script type="module" crossorigin src="/assets/index-a1B2_-3.js"></script>'
const READY = { status: 'ok', checks: { contact: 'configured', analytics: 'configured', voice: 'configured' } }

function deployment(override = () => undefined) {
  const calls = []
  const fetchImpl = async (url, options) => {
    const parsed = new URL(url)
    const call = { url: parsed, ...options }
    calls.push(call)
    const custom = await override(call, calls)
    if (custom !== undefined) return custom
    if (parsed.pathname === '/') return new Response(HTML, { headers: { 'Content-Type': 'text/html' } })
    if (parsed.pathname === '/api/health') return Response.json(READY)
    if (options.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
      'Access-Control-Allow-Origin': ORIGIN, 'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    } })
    return new Response(null, { headers: { 'Content-Type': 'application/javascript' } })
  }
  return { calls, fetchImpl }
}

test('monitor uses only fixed safe requests and emits exact synthetic summaries', async () => {
  const { calls, fetchImpl } = deployment()
  const events = []
  const logs = []
  const result = await runMonitor({ fetchImpl, env: ENV, capture: async (...args) => { events.push(args); return true }, log: line => logs.push(line) })
  assert.equal(result.ok, true)
  assert.equal(calls.length, 5)
  assert.deepEqual(result.checks.map(check => check.target), ['homepage', 'entry_bundle', 'contact_api', 'analytics_api', 'health_api'])
  for (const call of calls) {
    assert.equal(call.url.origin, ORIGIN)
    assert.equal(call.redirect, 'error')
    assert.ok(['GET', 'HEAD', 'OPTIONS'].includes(call.method))
    assert.equal(call.body, undefined)
    assert.ok(call.signal instanceof AbortSignal)
    if (call.method === 'OPTIONS') assert.equal(call.headers.Origin, ORIGIN)
  }
  for (const [event, properties] of events) {
    assert.equal(event, 'portfolio_uptime_checked')
    assert.deepEqual(Object.keys(properties).sort(), ['latency_bucket', 'source', 'status', 'target'])
    assert.equal(properties.status, 'up')
    assert.equal(properties.source, 'github_actions')
  }
  assert.equal(events.length, 5)
  assert.ok(logs.every(line => /^(homepage|entry_bundle|contact_api|analytics_api|health_api) (up|down) (fast|slow|timeout)$/.test(line)))
})

test('only a real same-origin entry script asset can become a network target', () => {
  assert.equal(resolveEntryBundle(HTML), `${ORIGIN}/assets/index-a1B2_-3.js`)
  for (const src of ['https://evil.example/assets/index-a.js', '//evil.example/assets/index-a.js', '/assets/../api/contact', '/assets/index-a.js?email=secret', '/assets/index-%2e%2e.js', '/assets/index-a.js#secret', '/assets/index-a.js/extra']) {
    assert.equal(resolveEntryBundle(`<script type="module" src="${src}"></script>`), null, src)
  }
  assert.equal(resolveEntryBundle('<img src="/assets/index-a.js">'), null)
  assert.equal(resolveEntryBundle('<script src="/assets/index-a.js"></script>'), null)
  assert.equal(resolveEntryBundle('<script type="module" src="/assets/index-a.js" src="https://evil.example/x.js"></script>'), null)
})

test('transient failures retry once and report recovery without false down events', async () => {
  let failures = 0
  const { calls, fetchImpl } = deployment(call => {
    if (call.url.pathname === '/api/contact' && failures++ === 0) return new Response(null, { status: 503 })
  })
  const checks = await probePortfolio({ fetchImpl, source: 'manual_check' })
  assert.equal(checks.find(check => check.target === 'contact_api').status, 'up')
  assert.equal(calls.filter(call => call.url.pathname === '/api/contact').length, 2)
  assert.ok(checks.every(check => check.source === 'manual_check'))
})

test('website-wide outage is reported directly even with private errors and no homepage', async () => {
  const { calls, fetchImpl } = deployment(() => { throw new Error('email=private@example.com cookie=secret https://private.example') })
  const events = []
  const logs = []
  const result = await runMonitor({ fetchImpl, env: ENV, capture: async (...args) => { events.push(args); return true }, log: line => logs.push(line) })
  assert.equal(result.ok, false)
  assert.equal(events.length, 5)
  assert.ok(events.every(([, check]) => check.status === 'down'))
  assert.equal(calls.length, 8)
  assert.equal(calls.some(call => call.url.pathname.startsWith('/assets/')), false)
  assert.doesNotMatch(JSON.stringify({ result, events, logs }), /private|cookie|https:|@/)
})

test('opaque network errors are never inspected and completed requests are aborted for cleanup', async () => {
  const opaqueError = { get message() { assert.fail('must not inspect provider errors') } }
  const { calls, fetchImpl } = deployment(call => {
    if (call.url.pathname === '/api/contact') throw opaqueError
  })
  const checks = await probePortfolio({ fetchImpl })
  assert.equal(checks.find(check => check.target === 'contact_api').status, 'down')
  assert.ok(calls.every(call => call.signal.aborted))
})

test('default capture reaches only independent PostHog ingestion during a site outage', async () => {
  const previousFetch = global.fetch
  const previousKey = process.env.POSTHOG_PROJECT_KEY
  const previousHost = process.env.POSTHOG_API_HOST
  const payloads = []
  process.env.POSTHOG_PROJECT_KEY = ENV.POSTHOG_PROJECT_KEY
  process.env.POSTHOG_API_HOST = ENV.POSTHOG_API_HOST
  global.fetch = async (url, options) => {
    assert.equal(String(url), 'https://us.i.posthog.com/i/v0/e/')
    assert.equal(options.method, 'POST')
    payloads.push(JSON.parse(options.body))
    return new Response('{}')
  }
  try {
    const { fetchImpl } = deployment(() => { throw new Error('site unavailable private data') })
    const result = await runMonitor({ fetchImpl, log: () => {} })
    assert.equal(result.ok, false)
    assert.equal(result.reason, undefined)
    assert.equal(payloads.length, 5)
    assert.equal(new Set(payloads.map(payload => payload.distinct_id)).size, 5)
    for (const payload of payloads) {
      assert.equal(payload.event, 'portfolio_uptime_checked')
      assert.equal(payload.properties.status, 'down')
      assert.equal(payload.properties.$process_person_profile, false)
      assert.equal(payload.properties.$geoip_disable, true)
      assert.equal(payload.properties.$ip, null)
      assert.deepEqual(Object.keys(payload.properties).sort(), ['$geoip_disable', '$ip', '$process_person_profile', 'latency_bucket', 'source', 'status', 'target'])
    }
    assert.doesNotMatch(JSON.stringify(payloads), /private data|site unavailable/)
  } finally {
    global.fetch = previousFetch
    if (previousKey === undefined) delete process.env.POSTHOG_PROJECT_KEY
    else process.env.POSTHOG_PROJECT_KEY = previousKey
    if (previousHost === undefined) delete process.env.POSTHOG_API_HOST
    else process.env.POSTHOG_API_HOST = previousHost
  }
})

test('redirects, broken CORS, wrong readiness JSON and invalid asset MIME fail closed', async () => {
  for (const [path, response, target] of [
    ['/', () => new Response(null, { status: 302, headers: { Location: 'https://evil.example' } }), 'homepage'],
    ['/api/contact', () => new Response(null, { status: 204 }), 'contact_api'],
    ['/api/health', () => Response.json({ ...READY, private: 'secret' }), 'health_api'],
    ['/api/health', () => Response.json({ status: 'ok', checks: { ...READY.checks, voice: 'unconfigured' } }), 'health_api'],
    ['/assets/index-a1B2_-3.js', () => new Response(null, { headers: { 'Content-Type': 'text/html' } }), 'entry_bundle'],
  ]) {
    const { calls, fetchImpl } = deployment(call => call.url.pathname === path ? response() : undefined)
    const checks = await probePortfolio({ fetchImpl })
    assert.equal(checks.find(check => check.target === target).status, 'down', target)
    assert.equal(calls.filter(call => call.url.pathname === path).length, 2)
    assert.ok(calls.every(call => call.url.origin === ORIGIN))
  }
})

test('timeouts bound both fetch and streaming response bodies, retry once and never expose errors', async () => {
  for (const bodyStall of [false, true]) {
    const { calls, fetchImpl } = deployment(call => {
      if (call.url.pathname !== '/api/health') return undefined
      return bodyStall ? new Response(new ReadableStream({ start() {} }), { headers: { 'Content-Type': 'application/json' } }) : new Promise(() => {})
    })
    const start = Date.now()
    const checks = await probePortfolio({ fetchImpl, timeoutMs: 15 })
    assert.ok(Date.now() - start < 1000)
    assert.deepEqual(checks.find(check => check.target === 'health_api'), { target: 'health_api', status: 'down', latency_bucket: 'timeout', source: 'github_actions' })
    assert.equal(calls.filter(call => call.url.pathname === '/api/health').length, 2)
    assert.ok(calls.filter(call => call.url.pathname === '/api/health').every(call => call.signal.aborted))
  }
})

test('oversized homepage/health bodies are rejected without further unsafe requests', async () => {
  for (const path of ['/', '/api/health']) {
    const { fetchImpl } = deployment(call => call.url.pathname === path ? new Response('x'.repeat(300_000), { headers: { 'Content-Type': path === '/' ? 'text/html' : 'application/json' } }) : undefined)
    const checks = await probePortfolio({ fetchImpl })
    assert.equal(checks.find(check => check.target === (path === '/' ? 'homepage' : 'health_api')).status, 'down')
  }
})

test('missing telemetry configuration fails visibly before making site requests', async () => {
  for (const env of [{}, { ...ENV, POSTHOG_API_HOST: 'https://evil.example' }, { ...ENV, POSTHOG_API_HOST: 'https://us.i.posthog.com/?secret=value' }]) {
    const { calls, fetchImpl } = deployment()
    const result = await runMonitor({ env, fetchImpl, log: () => {} })
    assert.deepEqual(result, { ok: false, reason: 'telemetry_config', checks: [] })
    assert.equal(calls.length, 0)
  }
})

test('capture rejection, exception or timeout fails visibly and still attempts remaining reports', async () => {
  for (const capture of [async () => false, async () => { throw new Error('secret private data') }, () => new Promise(() => {})]) {
    let count = 0
    const result = await runMonitor({ env: ENV, fetchImpl: deployment().fetchImpl, capture: (...args) => { count++; return capture(...args) }, captureTimeoutMs: 10, log: () => {} })
    assert.equal(result.ok, false)
    assert.equal(result.reason, 'telemetry_capture')
    assert.equal(count, 5)
    assert.doesNotMatch(JSON.stringify(result), /secret|private/)
  }
})

test('invalid source is rejected before any request or event', async () => {
  const { calls, fetchImpl } = deployment()
  await assert.rejects(probePortfolio({ fetchImpl, source: 'private arbitrary string' }), /^Error: Invalid monitor configuration$/)
  assert.equal(calls.length, 0)
})

test('workflow is independent, bounded, pinned and does not accept arbitrary monitor targets', async () => {
  const workflow = await readFile(new URL('../.github/workflows/portfolio-health.yml', import.meta.url), 'utf8')
  assert.match(workflow, /cron: '2-59\/5 \* \* \* \*'/)
  assert.match(workflow, /contents: read/)
  assert.match(workflow, /timeout-minutes: 2/)
  assert.match(workflow, /node-version: '24'/)
  assert.match(workflow, /actions\/checkout@d23441a48e516b6c34aea4fa41551a30e30af803/)
  assert.match(workflow, /actions\/setup-node@249970729cb0ef3589644e2896645e5dc5ba9c38/)
  assert.match(workflow, /secrets\.PORTFOLIO_MONITOR_POSTHOG_KEY/)
  assert.match(workflow, /POSTHOG_API_HOST: https:\/\/us\.i\.posthog\.com/)
  assert.doesNotMatch(workflow, /pull_request|npm ci|npm install/)
  assert.doesNotMatch(workflow, /(?:target|origin|url):\s*\n\s*(?:description|type):/)
})
