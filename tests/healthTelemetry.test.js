import test from 'node:test'
import assert from 'node:assert/strict'

const contract = () => import('../shared/healthTelemetry.js')
const errorEvent = 'portfolio_health_error'
const uptimeEvent = 'portfolio_uptime_checked'

test('health reports accept only fixed categories and reject private fields without reading getters', async () => {
  const { normalizeHealthEvent: normalize } = await contract()
  const safe = { surface: 'voice_home', code: 'voice_start_failed' }
  assert.deepEqual(normalize(errorEvent, safe), { event: errorEvent, properties: safe })
  for (const key of ['message', 'stack', 'email', 'name', 'transcript', 'url', 'ip', 'request_id', 'distinct_id']) {
    assert.equal(normalize(errorEvent, { ...safe, [key]: 'private@example.com' }), null)
  }
  assert.equal(normalize(errorEvent, { surface: 'voice_home', code: 'private enquiry' }), null)
  assert.equal(normalize(errorEvent, { surface: 'app', code: 'voice_start_failed' }), null)
  assert.equal(normalize(errorEvent, Object.create(safe)), null)
  const getter = { surface: 'app' }
  Object.defineProperty(getter, 'code', { enumerable: true, get() { throw Error('Must not read private getter') } })
  assert.equal(normalize(errorEvent, getter), null)
})

test('client reports cannot claim trusted contact failures or uptime checks', async () => {
  const { normalizeHealthEvent: normalize } = await contract()
  const contact = { surface: 'contact', code: 'contact_mail_failed' }
  assert.equal(normalize(errorEvent, contact), null)
  assert.deepEqual(normalize(errorEvent, contact, { allowServer: true }), { event: errorEvent, properties: contact })
  const uptime = { target: 'homepage', status: 'up', latency_bucket: 'fast', source: 'github_actions' }
  assert.equal(normalize(uptimeEvent, uptime), null)
  assert.deepEqual(normalize(uptimeEvent, uptime, { allowUptime: true }), { event: uptimeEvent, properties: uptime })
  assert.equal(normalize(uptimeEvent, { ...uptime, target: 'https://private.example' }, { allowUptime: true }), null)
  assert.equal(normalize('toString', {}), null)
})

test('public analytics accepts safe client health but refuses trusted health claims', async t => {
  const { default: handler } = await import('../api/analytics.js')
  const outbound = []
  const previous = { POSTHOG_PROJECT_KEY: process.env.POSTHOG_PROJECT_KEY, POSTHOG_API_HOST: process.env.POSTHOG_API_HOST }
  Object.assign(process.env, { POSTHOG_PROJECT_KEY: 'test-health', POSTHOG_API_HOST: 'https://us.i.posthog.com' })
  t.after(() => { for (const [k,v] of Object.entries(previous)) v === undefined ? delete process.env[k] : process.env[k] = v })
  t.mock.method(globalThis, 'fetch', async (_url, options) => { outbound.push(JSON.parse(options.body)); return { ok: true } })
  const response = () => ({ headers: {}, setHeader(k,v) { this.headers[k]=v }, status(code) { this.code=code;return this }, json(body) { this.body=body;return this }, end() { return this } })
  const request = properties => ({ method: 'POST', headers: { origin: 'https://portfoliobboy.vercel.app', 'content-type':'application/json' }, body:{event:errorEvent,properties}, socket:{remoteAddress:'192.0.2.100'} })
  let res=response(); await handler(request({surface:'app',code:'app_unhandled'}),res)
  assert.equal(res.code,204)
  assert.equal(outbound.length,1)
  assert.deepEqual(outbound[0].properties,{surface:'app',code:'app_unhandled',$process_person_profile:false,$geoip_disable:true,$ip:null})
  res=response(); await handler(request({surface:'contact',code:'contact_mail_failed'}),res)
  assert.equal(res.code,400)
  const uptime=request({target:'homepage',status:'down',latency_bucket:'timeout',source:'github_actions'});uptime.body.event=uptimeEvent
  res=response(); await handler(uptime,res); assert.equal(res.code,400)
  assert.equal(outbound.length,1)
  const privateRequest=request({surface:'app',code:'app_unhandled'});privateRequest.headers.dnt='1'
  res=response();await handler(privateRequest,res);assert.equal(res.code,204);assert.equal(outbound.length,1)
})
