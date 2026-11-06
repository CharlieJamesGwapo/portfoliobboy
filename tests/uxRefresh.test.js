import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const withServer = async (run) => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false } })
  try {
    await run(server)
  } finally {
    await server.close()
  }
}

test('"What can I build for you?" maps four services to existing evidence and contact subjects', async () => {
  await withServer(async (server) => {
    const { default: Services, services } = await server.ssrLoadModule('/src/components/Services.jsx')
    const html = renderToStaticMarkup(createElement(Services))
    assert.match(html, /<h2 id="services-title">What can I build for you\?<\/h2>/)
    assert.deepEqual(services.map((service) => service.title), ['AI Agents', 'Automation', 'Web & Mobile', 'Backend Systems'])
    // Evidence must point at a homepage section that ships today or the projects route.
    const { readFileSync } = await import('node:fs')
    const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
    const sectionIds = { '#voice-demo': 'VoiceAgentDemo', '#automations': 'Automations', '#product-studio-preview': 'ProductStudioPreview' }
    for (const { evidence, subject } of services) {
      if (evidence.href === '/projects') continue
      assert.ok(sectionIds[evidence.href], `unknown evidence target ${evidence.href}`)
      assert.match(app, new RegExp(`<${sectionIds[evidence.href]} />`))
      assert.ok(subject.length >= 3)
    }
    // No invented outcomes: the copy makes no numeric or client claims.
    assert.doesNotMatch(html, /\d+%|\$\d|clients? (say|love)/i)
  })
})

test('Voice Studio renders both demos as tab panels so prerendered HTML keeps every recording', async () => {
  await withServer(async (server) => {
    const { default: VoiceAgentDemo } = await server.ssrLoadModule('/src/components/VoiceAgentDemo.jsx')
    const html = renderToStaticMarkup(createElement(VoiceAgentDemo))
    assert.match(html, /role="tablist" aria-label="Voice Studio demos"/)
    assert.equal((html.match(/role="tab"/g) ?? []).length, 2)
    assert.match(html, /id="vs-tab-accents"[^>]*aria-selected="true"/)
    assert.match(html, /id="vs-tab-multilingual"[^>]*aria-selected="false"/)
    // The inactive panel is hidden, not removed.
    assert.match(html, /id="vs-panel-multilingual"[^>]*hidden=""/)
    assert.doesNotMatch(html, /id="vs-panel-accents"[^>]*hidden=""/)
    assert.match(html, />8 recordings</)
    assert.match(html, />1 recorded · 1 planned</)
  })
})
