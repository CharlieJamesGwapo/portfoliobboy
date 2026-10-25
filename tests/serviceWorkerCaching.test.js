import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'

function worker({ cached, initialKeys = [], fetch = async () => new Response('network') } = {}) {
  const events = {}; const timers = new Map(); let skipped = 0; let writes = 0
  const deleted = []
  const cache = { match: async () => cached, add: async () => {}, put: async () => { writes++ }, keys: async () => initialKeys, delete: async key => { deleted.push(key) } }
  const caches = { open: async () => cache, keys: async () => [], delete: async () => {} }
  const self = { location: { origin: 'https://portfolio.example' }, addEventListener: (name, fn) => { events[name] = fn }, skipWaiting: () => { skipped++ }, registration: {}, clients: { claim: async () => {} } }
  runInNewContext(readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8'), {
    self, caches, fetch, URL, Response, Request, AbortController,
    setTimeout: (fn, ms) => { timers.set(fn, ms); return fn }, clearTimeout: id => timers.delete(id),
  })
  function send(request, preloadResponse) {
    const lifetime = []; let result
    events.fetch({ request, preloadResponse, respondWith: p => { result = p }, waitUntil: p => lifetime.push(p) })
    return { get result() { return result }, lifetime }
  }
  return { events, timers, send, deleted, get skipped() { return skipped }, get writes() { return writes } }
}

test('a pending navigation preload still falls back at the navigation deadline', async () => {
  const w = worker({ cached: new Response('offline shell') })
  const event = w.send({ method: 'GET', url: 'https://portfolio.example/', mode: 'navigate' }, new Promise(() => {}))
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(w.timers.size, 1)
  const [timer, delay] = [...w.timers.entries()][0]
  assert.equal(delay, 4000)
  timer()
  assert.equal(await (await event.result).text(), 'offline shell')
})

test('cached media refresh stays alive and failed fetches preserve cached content', async () => {
  const w = worker({ cached: new Response('old image'), fetch: async () => { throw new Error('offline') } })
  const event = w.send(new Request('https://portfolio.example/projects/autoflow/home.webp'))
  assert.equal(await (await event.result).text(), 'old image')
  assert.ok(event.lifetime.length > 0)
  await Promise.all(event.lifetime)
})

test('updates wait for explicit activation instead of reloading a visitor draft', async () => {
  const w = worker(); let install
  w.events.install({ waitUntil: p => { install = p } })
  await install
  assert.equal(w.skipped, 0)
  w.events.message({ data: 'SKIP_WAITING' })
  assert.equal(w.skipped, 1)
})

test('resume requests prefer fresh bytes while retaining an offline copy', async () => {
  let requestedCacheMode
  const w = worker({ cached: new Response('old resume'), fetch: async (request) => { requestedCacheMode = request.cache; return new Response('updated resume') } })
  const event = w.send(new Request('https://portfolio.example/charlie-james-abejo-resume.pdf'))
  assert.equal(await (await event.result).text(), 'updated resume')
  assert.equal(requestedCacheMode, 'no-cache')
  await Promise.all(event.lifetime)
  assert.equal(w.writes, 1)
})

test('navigation eviction preserves the permanent offline fallback documents', async () => {
  const fixed = ['/', '/offline.html', '/manifest.json', '/favicon.png']
  const runtime = Array.from({ length: 11 }, (_, index) => `/projects/project-${index}`)
  const initialKeys = [...fixed, ...runtime].map(path => new Request(`https://portfolio.example${path}`))
  const w = worker({ initialKeys })
  const event = w.send({ method: 'GET', url: 'https://portfolio.example/projects/project-10', mode: 'navigate' }, Promise.resolve(new Response('fresh page')))
  await event.result
  await Promise.all(event.lifetime)
  assert.equal(w.deleted.length, 1)
  assert.ok(w.deleted.every(key => !fixed.includes(new URL(key.url).pathname)))
})
