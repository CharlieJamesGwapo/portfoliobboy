import test from 'node:test'
import assert from 'node:assert/strict'
import handler from '../api/contact.js'

const validBody = { name: 'Portfolio visitor', email: 'visitor@example.com', subject: 'Project enquiry', message: 'I would like to discuss a project.' }
function response() {
  return { headers: {}, statusCode: 200, setHeader(key, value) { this.headers[key] = value }, status(code) { this.statusCode = code; return this }, json(body) { this.body = body; return this }, end() { return this } }
}
function request(overrides = {}) {
  return { method: 'POST', headers: { origin: 'https://portfoliobboy.vercel.app', 'content-type': 'application/json' }, socket: { remoteAddress: '127.0.0.1' }, body: validBody, ...overrides }
}
test('rejects unrelated Vercel sites and missing origin before sending email', async () => {
  for (const origin of ['https://attacker.vercel.app', 'https://portfoliobboy.vercel.app.attacker.com', undefined]) {
    const res = response()
    await handler(request({ headers: { origin, 'content-type': 'application/json' } }), res)
    assert.equal(res.statusCode, 403)
    assert.match(res.headers['Cache-Control'], /no-store/)
  }
})
test('rejects oversized payloads and non-JSON requests before provider access', async () => {
  const huge = response()
  await handler(request({ headers: { origin: 'https://portfoliobboy.vercel.app', 'content-type': 'application/json', 'content-length': '40000' } }), huge)
  assert.equal(huge.statusCode, 413)
  const form = response()
  await handler(request({ headers: { origin: 'https://portfoliobboy.vercel.app', 'content-type': 'text/plain' } }), form)
  assert.equal(form.statusCode, 415)
})
test('bounds repeated email submissions and never caches provider responses', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true }))
  const oldKey = process.env.RESEND_API_KEY
  const oldVercel = process.env.VERCEL
  process.env.RESEND_API_KEY = 'test-placeholder'
  delete process.env.VERCEL
  try {
    for (let i = 0; i < 6; i++) {
      const res = response()
      await handler(request({ socket: { remoteAddress: '192.0.2.15' } }), res)
      assert.equal(res.statusCode, i < 5 ? 200 : 429)
      assert.match(res.headers['Cache-Control'], /no-store/)
      if (i === 5) assert.ok(Number(res.headers['Retry-After']) > 0)
    }
    assert.equal(fetch.mock.callCount(), 5)
  } finally {
    if (oldKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = oldKey
    if (oldVercel === undefined) delete process.env.VERCEL; else process.env.VERCEL = oldVercel
  }
})

test('only accepts the exact deployment origin supplied by trusted configuration', async () => {
  const previous = process.env.VERCEL_URL
  process.env.VERCEL_URL = 'portfoliobboy-preview-owner.vercel.app'
  try {
    const accepted = response()
    await handler(request({ method: 'OPTIONS', headers: { origin: `https://${process.env.VERCEL_URL}` } }), accepted)
    assert.equal(accepted.statusCode, 204)
    const rejected = response()
    await handler(request({ method: 'OPTIONS', headers: { origin: 'https://other-preview-owner.vercel.app' } }), rejected)
    assert.equal(rejected.statusCode, 403)
  } finally {
    if (previous === undefined) delete process.env.VERCEL_URL; else process.env.VERCEL_URL = previous
  }
})
