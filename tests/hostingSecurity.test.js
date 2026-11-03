import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
const headers = config.headers
const policy = source => Object.fromEntries(headers.find(rule => rule.source === source).headers.map(header => [header.key, header.value]))
test('retains immutable hashed assets and revalidates the stable resume', () => {
  const broad = headers.findIndex(rule => rule.source.startsWith('/(.*).'))
  assert.ok(headers.findIndex(rule => rule.source === '/assets/(.*)') > broad)
  assert.ok(headers.findIndex(rule => rule.source === '/fonts/(.*)') > broad)
  assert.match(policy('/assets/(.*)')['Cache-Control'], /immutable/)
  assert.match(policy('/charlie-james-abejo-resume.pdf')['Cache-Control'], /max-age=0, must-revalidate/)
  for (const value of Object.values(policy('/api/(.*)'))) assert.match(value, /no-store/)
})
test('blocks injected script attributes, object embeds and foreign framing', () => {
  const csp = policy('/(.*)')['Content-Security-Policy']
  assert.match(csp, /script-src-attr 'none'/)
  assert.match(csp, /object-src 'none'/)
  assert.match(csp, /frame-ancestors 'self'/)
  assert.doesNotMatch(csp, /unsafe-eval/)
  assert.doesNotMatch(csp.match(/script-src [^;]+/)[0], /unsafe-inline/)
})
