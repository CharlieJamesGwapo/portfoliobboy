import { pathToFileURL } from 'node:url'

const DEFAULT_ORIGIN = 'https://portfoliobboy.vercel.app'

// Read-only checks only: no POSTs, provider calls, mail or analytics events.
export async function auditSiteSecurity(origin = DEFAULT_ORIGIN, fetcher = fetch) {
  const base = new URL(origin)
  if (base.username || base.password || base.search || base.hash || base.pathname !== '/'
    || (base.protocol !== 'https:' && !(base.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(base.hostname)))) {
    throw new Error('Use a plain HTTPS deployment origin or a local HTTP origin.')
  }
  const request = (path, options = {}) => fetcher(new URL(path, base), {
    method: 'HEAD', redirect: 'error', signal: AbortSignal.timeout(8000), ...options,
  })
  const homepage = await request('/', { method: 'GET' })
  if (!homepage.ok) throw new Error(`Homepage returned ${homepage.status}`)
  const html = await homepage.text()
  const asset = html.match(/src="(\/assets\/index-[^"/]+\.js)"/)?.[1]
  if (!asset) throw new Error('The deployed entry bundle was not found.')
  const checks = [
    ['/', 'document'], ['/projects', 'document'], ['/projects/oneride', 'document'],
    ['/sw.js', 'document'], ['/charlie-james-abejo-resume.pdf', 'document'],
    ['/fonts/geist-sans-variable.woff2', 'font'], ['/profile-2026.webp', 'media'],
    [asset, 'bundle'], ['/api/contact', 'api'], ['/api/analytics', 'api'],
  ]
  const results = await Promise.all(checks.map(async ([path, kind]) => {
    const response = await request(path)
    const errors = []
    const header = name => response.headers.get(name) || ''
    const cache = header('cache-control')
    if (response.status !== (kind === 'api' ? 403 : 200)) errors.push(`Unexpected HTTP ${response.status}`)
    if (header('x-content-type-options') !== 'nosniff') errors.push('Missing nosniff')
    if (!/max-age=\d+/.test(header('strict-transport-security'))) errors.push('Missing HSTS')
    const csp = header('content-security-policy')
    if (!csp.includes("object-src 'none'") || !csp.includes("script-src-attr 'none'")
      || !csp.includes("frame-ancestors 'self'") || /unsafe-eval/.test(csp)) errors.push('Unexpected CSP')
    if (kind === 'document' && !/max-age=0(?:,|$)/.test(cache)) errors.push('Stable document does not revalidate')
    if (kind === 'bundle' && !/max-age=31536000, immutable/.test(cache)) errors.push('Bundle is not immutable')
    if (kind === 'font' && (/immutable/.test(cache) || !/max-age=86400(?:,|$)/.test(cache))) errors.push('Stable font has stale-cache risk')
    if (kind === 'media' && !/max-age=3600(?:,|$)/.test(cache)) errors.push('Stable media freshness differs')
    if (kind === 'api') {
      if (!/private/.test(cache) || !/no-store/.test(cache) || !/no-store/.test(header('cdn-cache-control'))) errors.push('API may be cached')
      if (!/noindex/.test(header('x-robots-tag'))) errors.push('API indexing is not disabled')
    }
    return { path, status: response.status, cache, errors }
  }))
  for (const path of ['/api/contact', '/api/analytics']) {
    for (const [originHeader, expected] of [[base.origin, 204], ['https://unrelated.example', 403], ['http://localhost:5173', 403]]) {
      // Local audits may intentionally allow localhost; hosted audits may not.
      if (base.protocol === 'http:' && originHeader === 'http://localhost:5173') continue
      const response = await request(path, { method: 'OPTIONS', headers: { Origin: originHeader } })
      const errors = response.status === expected ? [] : [`Expected preflight ${expected}`]
      if (expected === 204) {
        const tokens = name => (response.headers.get(name) || '').toLowerCase().split(',').map(value => value.trim())
        if (response.headers.get('access-control-allow-origin') !== originHeader
          || !tokens('access-control-allow-methods').includes('post')
          || !tokens('access-control-allow-headers').includes('content-type')
          || !tokens('vary').includes('origin')) errors.push('Trusted preflight has incomplete CORS permissions')
      } else if (response.headers.get('access-control-allow-origin')) {
        errors.push('Untrusted origin received CORS permission')
      }
      results.push({ path, preflightOrigin: originHeader, status: response.status, errors })
    }
  }
  return { origin: base.origin, passed: results.every(result => result.errors.length === 0), checks: results }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const report = await auditSiteSecurity(process.env.PORTFOLIO_AUDIT_ORIGIN || DEFAULT_ORIGIN)
    console.log(JSON.stringify(report, null, 2))
    if (!report.passed) process.exitCode = 1
  } catch (error) {
    console.error(`Security audit failed: ${error.message}`)
    process.exitCode = 1
  }
}
