import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

test('voice section offers inline listening without a callback and discloses synthetic speech', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false } })
  try {
    const { default: VoiceAgentDemo } = await server.ssrLoadModule('/src/components/VoiceAgentDemo.jsx')
    const html = renderToStaticMarkup(createElement(VoiceAgentDemo))
    assert.match(html, /<audio[^>]*controls/)
    assert.match(html, /Illustrative synthetic audio/)
    assert.match(html, /Read sample transcript/)
  } finally {
    await server.close()
  }
})

test('projects expose search and use available official OneRide screenshots', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false } })
  try {
    const { default: Projects } = await server.ssrLoadModule('/src/components/Projects.jsx')
    const html = renderToStaticMarkup(createElement(Projects))
    assert.match(html, /type="search"/)
    assert.match(html, /official-screen-01.png/)
  } finally {
    await server.close()
  }
})
