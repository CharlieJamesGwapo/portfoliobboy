import test from 'node:test'
import assert from 'node:assert/strict'
import contact from '../api/contact.js'

// Provider tests use explicit local development; hosted BotID paths have separate coverage.
process.env.NODE_ENV = 'development'

const request = headers => ({ method: 'POST', headers: { origin: 'https://portfoliobboy.vercel.app', 'content-type': 'application/json', ...headers }, body: { name: 'Private Name', email: 'private@example.com', subject: 'Private subject', message: 'Private project details for a clinic.' }, socket: { remoteAddress: '192.0.2.44' } })
const response = () => ({ headers: {}, code: 0, setHeader(key, value) { this.headers[key] = value }, status(code) { this.code = code; return this }, json(body) { this.body = body; return this }, end() { return this } })

test('contact success is counted only after delivery, without contact contents', async () => {
  const original = global.fetch
  const oldEnv = { resend: process.env.RESEND_API_KEY, key: process.env.POSTHOG_PROJECT_KEY, host: process.env.POSTHOG_API_HOST }
  process.env.RESEND_API_KEY = 'test-resend'
  process.env.POSTHOG_PROJECT_KEY = 'test-posthog'
  process.env.POSTHOG_API_HOST = 'https://us.i.posthog.com'
  const events = []
  let deliveryOk = true
  let analyticsOffline = false
  global.fetch = async (url, options) => {
    if (url === 'https://api.resend.com/emails') return { ok: deliveryOk, status: deliveryOk ? 200 : 500 }
    events.push(JSON.parse(options.body))
    if (analyticsOffline) throw new Error('Analytics unavailable')
    return { ok: true }
  }
  try {
    let res = response()
    await contact(request(), res)
    assert.equal(res.code, 200)
    assert.equal(events.length, 1)
    assert.equal(events[0].event, 'portfolio_contact_submitted')
    assert.deepEqual(Object.keys(events[0].properties).sort(), ['$geoip_disable', '$ip', '$process_person_profile', 'surface'])
    assert.equal(events[0].properties.surface, 'contact')
    assert.doesNotMatch(JSON.stringify(events), /Private|private@example|192\.0\.2/)
    deliveryOk = false
    res = response()
    await contact(request(), res)
    assert.equal(res.code, 500)
    assert.equal(events.length, 1)
    deliveryOk = true
    for (const headers of [{ dnt: '1' }, { 'sec-gpc': '1' }]) {
      res = response()
      await contact(request(headers), res)
      assert.equal(res.code, 200)
    }
    assert.equal(events.length, 1)
    analyticsOffline = true
    res = response()
    await contact(request(), res)
    assert.equal(res.code, 200, 'Analytics failure must not turn an accepted email into a failed submission')
  } finally {
    global.fetch = original
    for (const [key, value] of Object.entries({ RESEND_API_KEY: oldEnv.resend, POSTHOG_PROJECT_KEY: oldEnv.key, POSTHOG_API_HOST: oldEnv.host })) value === undefined ? delete process.env[key] : process.env[key] = value
  }
})
