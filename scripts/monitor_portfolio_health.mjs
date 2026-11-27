import { pathToFileURL } from 'node:url'
import { capturePortfolioEvent } from '../server/portfolioAnalytics.js'

const ORIGIN = 'https://portfoliobboy.vercel.app'
const SOURCES = new Set(['github_actions', 'manual_check'])
const INGEST_ORIGINS = new Set(['https://us.i.posthog.com', 'https://eu.i.posthog.com'])
const READY = { status: 'ok', checks: { contact: 'configured', analytics: 'configured', voice: 'configured' } }
const TIMEOUT = Symbol('monitor_timeout')

// This parser accepts only the fixed Vite entry filename pattern. HTML may never
// choose a host, query, API path, credentials or redirect destination to probe.
export function resolveEntryBundle(html) {
  if (typeof html !== 'string') return null
  for (const script of html.matchAll(/<script\b([^>]*)>/gi)) {
    const attributes = new Map()
    let duplicate = false
    for (const match of script[1].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
      const name = match[1].toLowerCase()
      if (attributes.has(name)) duplicate = true
      attributes.set(name, match[2] ?? match[3])
    }
    const src = attributes.get('src')
    if (!duplicate && attributes.get('type') === 'module'
      && /^\/assets\/index-[A-Za-z0-9_-]{1,120}\.js$/.test(src || '')) return `${ORIGIN}${src}`
  }
  return null
}

function deadline(work, milliseconds) {
  const controller = new AbortController()
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort()
      reject(TIMEOUT)
    }, milliseconds)
  })
  return Promise.race([Promise.resolve().then(() => work(controller.signal)), timeout])
    .finally(() => {
      clearTimeout(timer)
      controller.abort()
    })
}

async function readBounded(response, limit, signal) {
  if (!response.body || Number(response.headers.get('content-length')) > limit) throw new Error('response')
  const reader = response.body.getReader()
  const cancel = () => { void reader.cancel().catch(() => {}) }
  signal.addEventListener('abort', cancel, { once: true })
  const chunks = []
  let length = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (signal.aborted) throw TIMEOUT
      if (done) break
      length += value.byteLength
      if (length > limit) { cancel(); throw new Error('response') }
      chunks.push(value)
    }
    return Buffer.concat(chunks, length).toString('utf8')
  } finally {
    signal.removeEventListener('abort', cancel)
    reader.releaseLock()
  }
}

function exactReadiness(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).sort().join(',') !== 'checks,status'
    || value.status !== READY.status || !value.checks || typeof value.checks !== 'object'
    || Array.isArray(value.checks)
    || Object.keys(value.checks).sort().join(',') !== 'analytics,contact,voice') return false
  return Object.entries(READY.checks).every(([key, expected]) => value.checks[key] === expected)
}

function hasToken(response, header, token) {
  return (response.headers.get(header) || '').toLowerCase().split(',').some(value => value.trim() === token)
}

// Five low-volume probes, at most two attempts each. Readiness validates
// configuration only; it deliberately makes no provider, email or voice calls.
export async function probePortfolio({ fetchImpl = fetch, now = Date.now, timeoutMs = 5000, source = 'github_actions' } = {}) {
  if (!SOURCES.has(source) || !Number.isFinite(timeoutMs) || timeoutMs < 1 || timeoutMs > 5000) throw new Error('Invalid monitor configuration')
  let entryBundle = null
  const check = async (target, url, method, validate) => {
    const started = now()
    let timedOut = false
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await deadline(async signal => {
          const response = await fetchImpl(url, {
            method, redirect: 'error', signal,
            headers: method === 'OPTIONS' ? { Origin: ORIGIN, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'Content-Type' } : {},
          })
          // Reject fake/nonconforming redirect responses too; never follow them.
          if (response.redirected || response.status < 200 || response.status >= 300) throw new Error('response')
          await validate(response, signal)
        }, timeoutMs)
        return { target, status: 'up', latency_bucket: now() - started >= 1000 ? 'slow' : 'fast', source }
      } catch (error) {
        // Only a locally generated enum is retained. No response, URL, private
        // body or network error is returned, logged or sent as event properties.
        timedOut = error === TIMEOUT
      }
    }
    return { target, status: 'down', latency_bucket: timedOut ? 'timeout' : now() - started >= 1000 ? 'slow' : 'fast', source }
  }
  const homepageAndBundle = async () => {
    const homepage = await check('homepage', `${ORIGIN}/`, 'GET', async (response, signal) => {
      if (!/^text\/html(?:\s*;|$)/i.test(response.headers.get('content-type') || '')) throw new Error('response')
      const html = await readBounded(response, 262144, signal)
      entryBundle = resolveEntryBundle(html)
    })
    const bundle = entryBundle
      ? await check('entry_bundle', entryBundle, 'HEAD', async response => {
        if (!/^(?:application|text)\/(?:javascript|ecmascript)(?:\s*;|$)/i.test(response.headers.get('content-type') || '')) throw new Error('response')
      })
      : { target: 'entry_bundle', status: 'down', latency_bucket: homepage.latency_bucket, source }
    return [homepage, bundle]
  }
  const preflight = (target, path) => check(target, `${ORIGIN}${path}`, 'OPTIONS', async response => {
    if (response.status !== 204 || response.headers.get('access-control-allow-origin') !== ORIGIN
      || !hasToken(response, 'access-control-allow-methods', 'post')
      || !hasToken(response, 'access-control-allow-headers', 'content-type')) throw new Error('response')
  })
  const [pages, contact, analytics, health] = await Promise.all([
    homepageAndBundle(),
    preflight('contact_api', '/api/contact'),
    preflight('analytics_api', '/api/analytics'),
    check('health_api', `${ORIGIN}/api/health`, 'GET', async (response, signal) => {
      if (!/^application\/json(?:\s*;|$)/i.test(response.headers.get('content-type') || '')
        || !exactReadiness(JSON.parse(await readBounded(response, 2048, signal)))) throw new Error('response')
    }),
  ])
  return [...pages, contact, analytics, health]
}

function validTelemetryConfiguration(env) {
  try {
    if (typeof env.POSTHOG_PROJECT_KEY !== 'string' || !env.POSTHOG_PROJECT_KEY.trim()) return false
    const host = new URL(env.POSTHOG_API_HOST)
    return INGEST_ORIGINS.has(host.origin) && !host.username && !host.password && host.pathname === '/' && !host.search && !host.hash
  } catch { return false }
}

export async function runMonitor({ fetchImpl = fetch, capture = capturePortfolioEvent, env = process.env, log = console.log, now = Date.now, timeoutMs = 5000, captureTimeoutMs = 2000, source = 'github_actions' } = {}) {
  if (!validTelemetryConfiguration(env)) return { ok: false, reason: 'telemetry_config', checks: [] }
  if (!Number.isFinite(captureTimeoutMs) || captureTimeoutMs < 1 || captureTimeoutMs > 2000) throw new Error('Invalid monitor configuration')
  const checks = await probePortfolio({ fetchImpl, now, timeoutMs, source })
  let captured = true
  for (const check of checks) {
    log(`${check.target} ${check.status} ${check.latency_bucket}`)
    try {
      if (await deadline(() => capture('portfolio_uptime_checked', check), captureTimeoutMs) !== true) captured = false
    } catch { captured = false }
  }
  if (!captured) return { ok: false, reason: 'telemetry_capture', checks }
  return { ok: checks.every(check => check.status === 'up'), checks }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    // The CLI has no target argument or target environment override.
    if (process.argv.length !== 2) throw new Error('configuration')
    const result = await runMonitor()
    if (!result.ok) {
      if (result.reason) console.error(`monitor_failed ${result.reason}`)
      process.exitCode = 1
    }
  } catch {
    console.error('monitor_failed configuration')
    process.exitCode = 1
  }
}
