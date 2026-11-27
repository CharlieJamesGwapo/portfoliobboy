import test from 'node:test'
import assert from 'node:assert/strict'
import { isAllowedPortfolioOrigin } from '../server/requestSecurity.js'

test('hosted APIs accept only canonical and exact configured deployment origins', () => {
  const env = { VERCEL: '1', VERCEL_ENV: 'production', VERCEL_URL: 'deployment-owner.vercel.app', VERCEL_BRANCH_URL: 'branch-owner.vercel.app', VERCEL_PROJECT_PRODUCTION_URL: 'production-owner.vercel.app' }
  for (const origin of ['https://portfoliobboy.vercel.app', 'https://deployment-owner.vercel.app', 'https://branch-owner.vercel.app', 'https://production-owner.vercel.app']) {
    assert.equal(isAllowedPortfolioOrigin(origin, env), true, origin)
  }
  for (const origin of [undefined, 'null', 'https://attacker.vercel.app', 'https://portfoliobboy.vercel.app.attacker.com', 'https://deployment-owner.vercel.app/path', 'http://deployment-owner.vercel.app', 'http://localhost:5173', 'http://127.0.0.1:4173']) {
    assert.equal(isAllowedPortfolioOrigin(origin, env), false, String(origin))
  }
})

test('loopback development remains usable without opening deployed preview APIs', () => {
  for (const origin of ['http://localhost:5173', 'http://127.0.0.1:5175', 'http://127.0.0.1:4173']) {
    assert.equal(isAllowedPortfolioOrigin(origin, {}), true)
    assert.equal(isAllowedPortfolioOrigin(origin, { VERCEL: '1', VERCEL_ENV: 'development' }), true)
    assert.equal(isAllowedPortfolioOrigin(origin, { VERCEL_ENV: 'preview' }), false)
    assert.equal(isAllowedPortfolioOrigin(origin, { VERCEL: '1' }), false)
  }
})

test('malformed configuration cannot expand an origin into a path, userinfo or query', () => {
  for (const host of ['user@attacker.example', 'owner.vercel.app/path', 'owner.vercel.app?x=1', 'https://owner.vercel.app']) {
    assert.equal(isAllowedPortfolioOrigin(`https://${host}`, { VERCEL: '1', VERCEL_URL: host }), false)
  }
})
