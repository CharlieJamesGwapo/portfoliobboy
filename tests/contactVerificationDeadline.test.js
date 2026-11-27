import test from 'node:test'
import assert from 'node:assert/strict'
import { verifyContactBot } from '../server/contactBotVerification.js'

test('a stalled verifier is bounded and cannot start mail delivery after the deadline', async t => {
  const previous = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'
  t.after(() => previous === undefined ? delete process.env.NODE_ENV : process.env.NODE_ENV = previous)
  const result = await verifyContactBot({ headers: {} }, { check: () => new Promise(() => {}), timeoutMs: 15 })
  assert.equal(result.allowed, false)
  assert.equal(result.status, 503)
  assert.equal(result.code, 'BOT_VERIFICATION_UNAVAILABLE')
})

test('an SDK response with missing classification fails closed', async t => {
  const previous = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'
  t.after(() => previous === undefined ? delete process.env.NODE_ENV : process.env.NODE_ENV = previous)
  const result = await verifyContactBot({ headers: {} }, { check: async () => ({ isHuman: true }) })
  assert.equal(result.allowed, false)
})
