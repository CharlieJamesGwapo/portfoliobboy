import { randomUUID } from 'node:crypto'
import { normalizeAnalyticsEvent } from '../shared/portfolioAnalytics.js'
import { normalizeHealthEvent } from '../shared/healthTelemetry.js'

const INGEST_ORIGINS = new Set(['https://us.i.posthog.com', 'https://eu.i.posthog.com'])

export function hasPortfolioAnalyticsConfiguration(environment = process.env) {
  if (typeof environment.POSTHOG_PROJECT_KEY !== 'string' || !environment.POSTHOG_PROJECT_KEY.trim()) return false
  try {
    const url = new URL(environment.POSTHOG_API_HOST)
    return INGEST_ORIGINS.has(url.origin) && !url.username && !url.password
      && url.pathname === '/' && !url.search && !url.hash
  } catch { return false }
}

// Server callers may report confirmed contact delivery. The public endpoint
// validates separately with allowContact=false before calling this helper.
export async function capturePortfolioEvent(event, properties) {
  try {
    const normalized = normalizeAnalyticsEvent(event, properties, { allowContact: true })
      || normalizeHealthEvent(event, properties, { allowServer: true, allowUptime: true })
    const key = process.env.POSTHOG_PROJECT_KEY
    const host = process.env.POSTHOG_API_HOST
    if (!normalized || !hasPortfolioAnalyticsConfiguration()) return false
    const url = new URL(host)
    if (!INGEST_ORIGINS.has(url.origin) || url.username || url.password
      || url.pathname !== '/' || url.search || url.hash) return false

    const result = await fetch(`${url.origin}/i/v0/e/`, {
      method: 'POST',
      redirect: 'error',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(1500),
      body: JSON.stringify({
        api_key: key,
        event: normalized.event,
        // A different random ID for every event prevents visitor attribution.
        distinct_id: randomUUID(),
        properties: {
          ...normalized.properties,
          $process_person_profile: false,
          $geoip_disable: true,
          $ip: null,
        },
        timestamp: new Date().toISOString(),
      }),
    })
    return result.ok === true
  } catch {
    // Analytics is optional. Avoid logging request details or provider errors.
    return false
  }
}
