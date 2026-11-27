import { hasPortfolioAnalyticsConfiguration } from '../server/portfolioAnalytics.js'

// Configuration readiness only: no upstream calls, delivery claims or secrets.
export function getPortfolioReadiness(environment = process.env) {
  const configured = value => typeof value === 'string' && value.trim().length > 0
  const checks = {
    contact: configured(environment.RESEND_API_KEY) ? 'configured' : 'unconfigured',
    analytics: hasPortfolioAnalyticsConfiguration(environment) ? 'configured' : 'unconfigured',
    voice: configured(environment.VITE_ELEVENLABS_AGENT_ID) ? 'configured' : 'unconfigured',
  }
  return { status: Object.values(checks).every(value => value === 'configured') ? 'ok' : 'degraded', checks }
}

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store')
  res.setHeader('CDN-Cache-Control', 'no-store')
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, nosnippet')
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const result = getPortfolioReadiness()
  res.status(result.status === 'ok' ? 200 : 503)
  return req.method === 'HEAD' ? res.end() : res.json(result)
}
