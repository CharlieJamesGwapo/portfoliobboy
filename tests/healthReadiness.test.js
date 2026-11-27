import test from 'node:test'
import assert from 'node:assert/strict'

const environment = { RESEND_API_KEY:'private-mail-key',POSTHOG_PROJECT_KEY:'private-ingest-key',POSTHOG_API_HOST:'https://us.i.posthog.com',VITE_ELEVENLABS_AGENT_ID:'agent_public' }
test('readiness describes configuration without exposing credentials or calling providers', async () => {
  const { getPortfolioReadiness } = await import('../api/health.js')
  assert.deepEqual(getPortfolioReadiness(environment),{status:'ok',checks:{contact:'configured',analytics:'configured',voice:'configured'}})
  const result=getPortfolioReadiness({...environment,RESEND_API_KEY:''})
  assert.equal(result.status,'degraded');assert.equal(result.checks.contact,'unconfigured')
  assert.doesNotMatch(JSON.stringify(result),/private|RESEND|POSTHOG|agent_public/)
  assert.equal(getPortfolioReadiness({...environment,POSTHOG_API_HOST:'https://attacker.example'}).status,'degraded')
})
test('health GET and HEAD are fresh, safe and return503 for missing configuration', async t => {
  const { default:handler } = await import('../api/health.js')
  const saved=Object.fromEntries(Object.keys(environment).map(k=>[k,process.env[k]]));Object.assign(process.env,environment)
  t.after(()=>{for(const[k,v]of Object.entries(saved))v===undefined?delete process.env[k]:process.env[k]=v})
  t.mock.method(globalThis,'fetch',()=>{throw new Error('Readiness must not send email or start voice')})
  const response=()=>({headers:{},setHeader(k,v){this.headers[k]=v},status(code){this.code=code;return this},json(body){this.body=body;return this},end(){return this}})
  for(const method of ['GET','HEAD']) {
    const res=response();await handler({method},res);assert.equal(res.code,200)
    assert.equal(res.headers['Cache-Control'],'private, no-store');assert.equal(res.headers['X-Robots-Tag'],'noindex, nofollow, nosnippet')
    if(method==='HEAD')assert.equal(res.body,undefined)
  }
  delete process.env.RESEND_API_KEY
  const degraded=response();await handler({method:'GET'},degraded);assert.equal(degraded.code,503)
  const post=response();await handler({method:'POST'},post);assert.equal(post.code,405)
  assert.equal(fetch.mock.callCount(),0)
})
