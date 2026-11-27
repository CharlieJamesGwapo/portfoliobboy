import test from 'node:test'
import assert from 'node:assert/strict'
import { auditSiteSecurity } from '../scripts/audit_site_security.mjs'

function deployment({ badFont = false, exposedOrigin = false, badCors = false } = {}) {
  const calls = []
  const fetcher = async (url, options) => {
    calls.push({ path: url.pathname, method: options.method })
    if (options.method === 'OPTIONS') {
      const allowed = exposedOrigin || options.headers.Origin === url.origin
      return new Response(null, { status: allowed ? 204 : 403, headers: allowed && !badCors ? {
        'Access-Control-Allow-Origin': options.headers.Origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin',
      } : {} })
    }
    const api = url.pathname.startsWith('/api/')
    const cache = api ? 'private, no-store'
      : url.pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable'
        : url.pathname.startsWith('/fonts/') ? `public, max-age=86400${badFont ? ', immutable' : ''}`
          : url.pathname.endsWith('.webp') ? 'public, max-age=3600' : 'public, max-age=0, must-revalidate'
    return new Response(options.method === 'GET' ? '<script type="module" src="/assets/index-12345678.js"></script>' : null, {
      status: api ? 403 : 200,
      headers: { 'Cache-Control': cache, 'CDN-Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex',
        'X-Content-Type-Options': 'nosniff', 'Strict-Transport-Security': 'max-age=63072000',
        'Content-Security-Policy': "script-src-attr 'none'; object-src 'none'; frame-ancestors 'self'" },
    })
  }
  return { fetcher, calls }
}

test('live security audit verifies headers and origins without sending visitor data', async () => {
  const { fetcher, calls } = deployment()
  const report = await auditSiteSecurity('https://portfoliobboy.vercel.app', fetcher)
  assert.equal(report.passed, true)
  assert.equal(report.checks.length, 16)
  assert.ok(calls.every(call => ['GET', 'HEAD', 'OPTIONS'].includes(call.method)))
})

test('live security audit detects stale immutable fonts and permissive preflights', async () => {
  for (const options of [{ badFont: true }, { exposedOrigin: true }, { badCors: true }]) {
    const report = await auditSiteSecurity('https://portfoliobboy.vercel.app', deployment(options).fetcher)
    assert.equal(report.passed, false)
  }
})
