import test from 'node:test'
import assert from 'node:assert/strict'
import handler from '../api/contact.js'

const request = (headers, address = '192.0.2.108') => ({method:'POST',headers:{origin:'https://portfoliobboy.vercel.app','content-type':'application/json',...headers},body:{name:'Private Name',email:'private@example.com',subject:'Private subject',message:'Private clinic enquiry details'},socket:{remoteAddress:address}})
const response = () => ({setHeader(){},status(code){this.code=code;return this},json(body){this.body=body;return this},end(){return this}})
function configure(t) {
  const next={NODE_ENV:'development',VERCEL:undefined,VERCEL_ENV:undefined,RESEND_API_KEY:'private-mail-key',POSTHOG_PROJECT_KEY:'test-ingest',POSTHOG_API_HOST:'https://us.i.posthog.com'}
  const previous=Object.fromEntries(Object.keys(next).map(k=>[k,process.env[k]]))
  for(const[k,v]of Object.entries(next))v===undefined?delete process.env[k]:process.env[k]=v
  t.after(()=>{for(const[k,v]of Object.entries(previous))v===undefined?delete process.env[k]:process.env[k]=v})
}

test('mail failures report only a trusted fixed category, never the enquiry or exception', async t => {
  configure(t)
  const events=[],logs=[]
  t.mock.method(console,'error',(...args)=>logs.push(args))
  let outcome='reject'
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    if(url==='https://api.resend.com/emails') {
      if(outcome==='reject')return{ok:false,status:500}
      throw Object.assign(new Error('Private clinic enquiry private@example.com'),{name:outcome==='timeout'?'TimeoutError':'Error'})
    }
    events.push(JSON.parse(options.body));return{ok:true}
  })
  for(const [mode,expected]of[['reject','contact_mail_rejected'],['timeout','contact_mail_timeout'],['failure','contact_mail_failed']]) {
    outcome=mode;const res=response();await handler(request(),res);assert.equal(res.code,500)
    const event=events.at(-1);assert.equal(event?.event,'portfolio_health_error');assert.equal(event.properties.code,expected)
    assert.deepEqual(Object.keys(event.properties).sort(),['$geoip_disable','$ip','$process_person_profile','code','surface'])
  }
  assert.equal(events.length,3)
  assert.doesNotMatch(JSON.stringify({events,logs}),/Private|private@example|clinic|192\.0\.2|private-mail-key/)
})

test('contact health reporting respects DNT/GPC and remains nonfatal during a monitoring outage', async t => {
  configure(t)
  const afterPreviousReports=Date.now()+120000
  t.mock.method(Date,'now',()=>afterPreviousReports)
  t.mock.method(console,'error',()=>{})
  let captures=0
  t.mock.method(globalThis,'fetch',async(url)=>{
    if(url==='https://api.resend.com/emails')return{ok:false,status:503}
    captures++;throw new Error('Monitoring offline')
  })
  for(const headers of [{dnt:'1'},{'sec-gpc':'1'}]){const res=response();await handler(request(headers,'192.0.2.109'),res);assert.equal(res.code,500)}
  assert.equal(captures,0)
  const res=response();await handler(request({},'192.0.2.109'),res);assert.equal(res.code,500);assert.equal(captures,1)
})

test('an unconfigured mail service cannot flood health capture before submission throttling', async t => {
  configure(t)
  delete process.env.RESEND_API_KEY
  let now=Date.now()+240000
  t.mock.method(Date,'now',()=>now)
  t.mock.method(console,'error',()=>{})
  let captures=0
  t.mock.method(globalThis,'fetch',async()=>{captures++;return{ok:true}})
  for(let i=0;i<7;i++){const res=response();await handler(request({},'192.0.2.110'),res);assert.equal(res.code,500)}
  assert.equal(captures,1,'fixed outage category should be captured at most once per minute per instance')
  now+=60001
  await handler(request({},'192.0.2.110'),response())
  assert.equal(captures,2)
})
