import { getGitHubActivity } from '../server/githubActivity.js'

const CACHE_HEADERS = ['Cache-Control', 'CDN-Cache-Control', 'Vercel-CDN-Cache-Control']
const PUBLIC_CACHE = 'public, max-age=0, s-maxage=3600, stale-while-revalidate=3600'

function requestedYear(req, currentYear) {
  const url = new URL(req.url || '/api/github-activity', 'https://portfoliobboy.vercel.app')
  const params = url.searchParams
  if ([...params.keys()].some(key => key !== 'year') || params.getAll('year').length > 1) throw new Error('Invalid query')
  let value = params.get('year')
  if (req.query) {
    if (Object.keys(req.query).some(key => key !== 'year')) throw new Error('Invalid query')
    if (Object.hasOwn(req.query, 'year')) {
      if (typeof req.query.year !== 'string' || (value !== null && value !== req.query.year)) throw new Error('Invalid query')
      value = req.query.year
    }
  }
  if (value === null) return currentYear
  if (!/^\d{4}$/.test(value) || ![currentYear, currentYear - 1].includes(Number(value))) throw new Error('Invalid query')
  return Number(value)
}

export function createGitHubActivityHandler({ getActivity = getGitHubActivity, now = Date.now } = {}) {
  return async function handler(req, res) {
    for (const header of CACHE_HEADERS) res.setHeader(header, 'no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, nosnippet')
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    const send = (code, body) => {
      res.status(code)
      return req.method === 'HEAD' ? res.end() : res.json(body)
    }
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.setHeader('Allow', 'GET, HEAD')
      return send(405, { error: 'Method not allowed' })
    }
    let year
    try { year = requestedYear(req, new Date(now()).getUTCFullYear()) }
    catch { return send(400, { error: 'Invalid year query' }) }
    try {
      const activity = await getActivity(year)
      // A stale fallback retains its original timestamp and cannot gain an
      // additional CDN lifetime beyond the service's 24-hour maximum.
      if (!activity.stale) for (const header of CACHE_HEADERS) res.setHeader(header, PUBLIC_CACHE)
      return send(200, activity)
    } catch { return send(503, { error: 'GitHub activity is temporarily unavailable' }) }
  }
}

export default createGitHubActivityHandler()
