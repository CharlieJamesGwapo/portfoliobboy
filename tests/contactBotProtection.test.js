import test from 'node:test'
import assert from 'node:assert/strict'
import handler from '../api/contact.js'

const contextKey = Symbol.for('@vercel/request-context')
const response = () => ({ headers: {}, code: 0, setHeader(key, value) { this.headers[key] = value }, status(code) { this.code = code; return this }, json(body) { this.body = body; return this }, end() { return this } })
const request = body => ({ method: 'POST', headers: { origin: 'https://portfoliobboy.vercel.app', 'content-type': 'application/json' }, body, socket: { remoteAddress: '192.0.2.78' } })
const valid = { name: 'Test visitor', email: 'nobody@example.com', subject: 'Test enquiry', message: 'A private test enquiry.', submissionId: 'f05e346c-9163-4afb-909d-0de7d9a588b2' }

function hosted(t, verdict) {
  const previous = { VERCEL: process.env.VERCEL, NODE_ENV: process.env.NODE_ENV, VERCEL_OIDC_TOKEN: process.env.VERCEL_OIDC_TOKEN }
  Object.assign(process.env, { VERCEL: '1', NODE_ENV: 'production', VERCEL_OIDC_TOKEN: 'test-oidc' })
  const oldContext = globalThis[contextKey]
  globalThis[contextKey] = { get: () => ({ headers: { host: 'portfoliobboy.vercel.app', 'x-is-human': 'test-challenge' }, url: 'https://portfoliobboy.vercel.app/api/contact', mutateResponseHeadersBeforeFlush() {} }) }
  const calls = []
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options })
    if (String(url).startsWith('https://api.vercel.com/bot-protection/')) {
      if (verdict instanceof Error) throw verdict
      return { json: async () => verdict }
    }
    if (url === 'https://api.resend.com/emails') return { ok: true }
    throw new Error('Unexpected provider')
  })
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) value === undefined ? delete process.env[key] : process.env[key] = value
    if (oldContext === undefined) delete globalThis[contextKey]; else globalThis[contextKey] = oldContext
  })
  return calls
}

test('hosted bot verdict blocks even valid contact details before mail provider access', async t => {
  const calls = hosted(t, { isBot: true, isVerifiedBot: false, bypassed: false })
  const res = response()
  await handler(request(valid), res)
  assert.equal(res.code, 403)
  assert.equal(res.body.code, 'BOT_VERIFICATION_FAILED')
  assert.equal(calls.length, 1)
  assert.equal(JSON.parse(calls[0].options.body).forceCheckLevel, 'basic')
})

test('unavailable hosted verification fails closed without mail provider access', async t => {
  const calls = hosted(t, new Error('Verification unavailable'))
  const res = response()
  await handler(request(valid), res)
  assert.equal(res.code, 503)
  assert.equal(res.body.code, 'BOT_VERIFICATION_UNAVAILABLE')
  assert.equal(calls.length, 1)
})

test('successful Basic verification reaches harmless empty-body validation', async t => {
  const calls = hosted(t, { isBot: false, isVerifiedBot: false, bypassed: false })
  const res = response()
  await handler(request({}), res)
  assert.equal(res.code, 400)
  assert.equal(calls.length, 1)
})

test('hosted development mode never enables the SDK human bypass', async t => {
  const calls = hosted(t, { isBot: true, isVerifiedBot: false, bypassed: false })
  process.env.NODE_ENV = 'development'
  const res = response()
  await handler(request({}), res)
  assert.equal(res.code, 403)
  assert.equal(calls.length, 1)
})

test('mail retry identity is stable across retries and scoped to the message', async t => {
  const calls = hosted(t, { isBot: false, isVerifiedBot: false, bypassed: false })
  const previous = process.env.RESEND_API_KEY
  process.env.RESEND_API_KEY = 'test-resend'
  t.after(() => previous === undefined ? delete process.env.RESEND_API_KEY : process.env.RESEND_API_KEY = previous)
  for (const body of [valid, valid, { ...valid, message: 'A changed private enquiry.' }]) {
    const res = response()
    await handler(request(body), res)
    assert.equal(res.code, 200)
  }
  const keys = calls.filter(call => call.url === 'https://api.resend.com/emails').map(call => call.options.headers['Idempotency-Key'])
  assert.equal(keys.length, 3)
  assert.match(keys[0], /^contact\/[a-f0-9]{64}$/)
  assert.equal(keys[0], keys[1])
  assert.notEqual(keys[0], keys[2])
})

test('a bypassed hosted verdict never reaches the mail provider', async t => {
  const calls = hosted(t, { isBot: false, isVerifiedBot: false, bypassed: true })
  const res = response()
  await handler(request(valid), res)
  assert.equal(res.code, 403)
  assert.equal(calls.length, 1)
})
