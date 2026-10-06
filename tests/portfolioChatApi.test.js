import test from 'node:test'
import assert from 'node:assert/strict'

import handler, {
  buildAllowedOrigins,
  config,
} from '../api/portfolio-chat.js'

test('portfolio chat route opts into cancellation without changing the contact timeout', () => {
  assert.equal(typeof handler, 'function')
  assert.equal(config.maxDuration, 10)
  assert.equal(config.supportsCancellation, true)
  assert.deepEqual(config.api, { bodyParser: false })
})

test('preview origin derivation accepts only exact platform URLs', () => {
  const origins = buildAllowedOrigins({
    VERCEL_URL: 'portfoliobboy-preview.vercel.app',
    VERCEL_BRANCH_URL: 'https://portfoliobboy-git-main.vercel.app',
  })

  assert.equal(origins.has('https://portfoliobboy-preview.vercel.app'), true)
  assert.equal(origins.has('https://portfoliobboy-git-main.vercel.app'), true)
  assert.equal(origins.has('https://*.vercel.app'), false)
  assert.equal(origins.has('https://evil.vercel.app'), false)
})

test('malformed or wildcard platform environment values are ignored', () => {
  const origins = buildAllowedOrigins({
    VERCEL_URL: '*.vercel.app',
    VERCEL_BRANCH_URL: 'https://evil.example/path',
  })

  assert.equal(origins.has('https://*.vercel.app'), false)
  assert.equal(origins.has('https://evil.example'), false)
})
