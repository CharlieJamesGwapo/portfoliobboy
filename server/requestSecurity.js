const CANONICAL_ORIGIN = 'https://portfoliobboy.vercel.app'
const DEVELOPMENT_ORIGINS = new Set([
  'http://localhost:5173', 'http://127.0.0.1:5173',
  'http://localhost:5175', 'http://127.0.0.1:5175',
  'http://localhost:4173', 'http://127.0.0.1:4173',
])

// Origin checks prevent browser cross-site submissions; they are not client
// authentication. Honeypots, bounded handlers and edge controls remain needed.
export function isAllowedPortfolioOrigin(origin, env = process.env) {
  if (typeof origin !== 'string') return false
  if (origin === CANONICAL_ORIGIN) return true
  const hosted = ['production', 'preview'].includes(env.VERCEL_ENV)
    || (env.VERCEL === '1' && env.VERCEL_ENV !== 'development')
  if (!hosted && DEVELOPMENT_ORIGINS.has(origin)) return true

  return [env.VERCEL_URL, env.VERCEL_BRANCH_URL, env.VERCEL_PROJECT_PRODUCTION_URL]
    .some((host) => {
      if (typeof host !== 'string' || !host) return false
      try {
        const configured = new URL(`https://${host}`)
        return configured.origin === `https://${host}` && origin === configured.origin
      } catch { return false }
    })
}
