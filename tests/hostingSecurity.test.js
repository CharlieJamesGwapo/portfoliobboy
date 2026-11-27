import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
const headers = config.headers
const policy = source => Object.fromEntries(headers.find(rule => rule.source === source).headers.map(header => [header.key, header.value]))
test('retains immutable hashed assets and revalidates the stable resume', () => {
  const broad = headers.findIndex(rule => rule.source.startsWith('/(.*)\\.'))
  assert.ok(headers.findIndex(rule => rule.source === '/assets/(.*)') > broad)
  assert.ok(headers.findIndex(rule => rule.source === '/fonts/(.*)') > broad)
  assert.match(policy('/assets/(.*)')['Cache-Control'], /immutable/)
  assert.match(policy('/charlie-james-abejo-resume.pdf')['Cache-Control'], /max-age=0, must-revalidate/)
  for (const key of ['Cache-Control', 'CDN-Cache-Control', 'Vercel-CDN-Cache-Control']) {
    assert.match(policy('/api/(.*)')[key], /no-store/)
  }
})
test('blocks injected script attributes, object embeds and foreign framing', () => {
  const csp = policy('/(.*)')['Content-Security-Policy']
  assert.match(csp, /script-src-attr 'none'/)
  assert.match(csp, /object-src 'none'/)
  assert.match(csp, /frame-ancestors 'self'/)
  assert.doesNotMatch(csp, /unsafe-eval/)
  assert.doesNotMatch(csp.match(/script-src [^;]+/)[0], /unsafe-inline/)
})
test('lets the live voice agent work without loosening the policy', () => {
  const rules = policy('/(.*)')
  // The microphone is ours to request, never an embedded third party's.
  assert.match(rules['Permissions-Policy'], /microphone=\(self\)/)
  assert.doesNotMatch(rules['Permissions-Policy'], /microphone=\*/)
  const csp = rules['Content-Security-Policy']
  const connect = csp.match(/connect-src [^;]+/)[0]
  for (const host of ['https://api.elevenlabs.io', 'wss://api.elevenlabs.io', 'wss://livekit.rtc.elevenlabs.io']) assert.ok(connect.includes(host), host)
  // Worklets are self-hosted, so script-src never needs blob:/data: or a whole CDN.
  const script = csp.match(/script-src [^;]+/)[0]
  assert.doesNotMatch(script, /blob:|data:|cdn\.jsdelivr\.net(?:\s|$)|cdn\.jsdelivr\.net\/npm\/?(?:\s|$)/)
})

test('stable fonts revalidate and API responses are excluded from indexing', () => {
  const fontCache = policy('/fonts/(.*)')['Cache-Control']
  assert.doesNotMatch(fontCache, /immutable/)
  assert.match(fontCache, /max-age=86400/)
  assert.match(policy('/api/(.*)')['X-Robots-Tag'], /noindex/)
})

test('font URLs bypass earlier immutable caches and the preload matches its CSS', () => {
  const styles = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
    + readFileSync(new URL('../src/components/studio-polish.css', import.meta.url), 'utf8')
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  for (const file of ['inter-var-latin.woff2', 'geist-sans-variable.woff2', 'geist-mono-variable.woff2']) {
    const fingerprint = createHash('sha256').update(readFileSync(new URL(`../public/fonts/${file}`, import.meta.url))).digest('hex').slice(0, 12)
    const url = `/fonts/${file}?v=${fingerprint}`
    assert.ok(styles.includes(url), `${file} must change URL when its bytes change`)
    if (file === 'geist-sans-variable.woff2') assert.ok(html.includes(`href="${url}"`), 'Preload must reuse the CSS font request')
  }
})
