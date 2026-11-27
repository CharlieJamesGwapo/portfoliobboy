import { createHmac, randomBytes } from 'node:crypto'
import { normalizeAnalyticsEvent } from '../shared/portfolioAnalytics.js'
import { normalizeHealthEvent } from '../shared/healthTelemetry.js'
import { capturePortfolioEvent } from '../server/portfolioAnalytics.js'
import { isAllowedPortfolioOrigin } from '../server/requestSecurity.js'
const MAX_BODY_BYTES = 1024
const WINDOW_MS = 10 * 60 * 1000
const MAX_EVENTS = 60
const MAX_COUNTERS = 1000
const counters = new Map()
const counterSalt = randomBytes(32)

// An ephemeral, bounded per-instance backstop, not a distributed rate limit.
// IP addresses are salted before entering memory and never sent to PostHog.
function retryAfter(req) {
  const now = Date.now()
  for (const [key, entry] of counters) {
    if (entry.reset <= now) counters.delete(key)
  }
  const forwarded = process.env.VERCEL === '1' ? req.headers['x-vercel-forwarded-for'] : null
  const address = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '')
    || req.socket?.remoteAddress || 'unknown'
  const key = createHmac('sha256', counterSalt).update(address).digest('hex')
  let entry = counters.get(key)
  if (!entry) {
    if (counters.size >= MAX_COUNTERS) return 60
    entry = { count: 0, reset: now + WINDOW_MS }
    counters.set(key, entry)
  }
  if (entry.count >= MAX_EVENTS) return Math.max(1, Math.ceil((entry.reset - now) / 1000))
  entry.count++
  return 0
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store')
  res.setHeader('CDN-Cache-Control', 'no-store')
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store')
  const origin = req.headers.origin
  if (!isAllowedPortfolioOrigin(origin)) return res.status(403).json({ error: 'Forbidden' })
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (req.headers.dnt === '1' || req.headers['sec-gpc'] === '1') return res.status(204).end()

  let normalized
  try {
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')
      || Number(req.headers['content-length']) > MAX_BODY_BYTES) {
      return res.status(400).json({ error: 'Invalid analytics event' })
    }
    const raw = req.body
    const serialized = typeof raw === 'string' ? raw : JSON.stringify(raw)
    if (typeof serialized !== 'string' || Buffer.byteLength(serialized) > MAX_BODY_BYTES) {
      return res.status(400).json({ error: 'Invalid analytics event' })
    }
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!body || typeof body !== 'object' || Array.isArray(body)
      || Reflect.ownKeys(body).length !== 2
      || !Object.hasOwn(body, 'event') || !Object.hasOwn(body, 'properties')) {
      return res.status(400).json({ error: 'Invalid analytics event' })
    }
    normalized = normalizeAnalyticsEvent(body.event, body.properties) || normalizeHealthEvent(body.event, body.properties)
    if (!normalized) return res.status(400).json({ error: 'Invalid analytics event' })
  } catch {
    return res.status(400).json({ error: 'Invalid analytics event' })
  }
  const seconds = retryAfter(req)
  if (seconds) {
    res.setHeader('Retry-After', String(seconds))
    return res.status(429).json({ error: 'Too many events' })
  }
  await capturePortfolioEvent(normalized.event, normalized.properties)
  return res.status(204).end()
}
