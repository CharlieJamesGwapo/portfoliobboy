import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

test('voice studio offers eight inline accent previews and discloses AI voices', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false } })
  try {
    const { default: VoiceAgentDemo } = await server.ssrLoadModule('/src/components/VoiceAgentDemo.jsx')
    const html = renderToStaticMarkup(createElement(VoiceAgentDemo))
    // Inline listening: a local recording, metadata-only preload, no autoplay, a labelled play control.
    assert.match(html, /<audio src="[^"]*\/accents\/american-english\.mp3" preload="metadata">/)
    assert.doesNotMatch(html, /autoplay/i)
    assert.match(html, /aria-label="Play American English preview"/)
    assert.equal((html.match(/class="vs-accent[ "]/g) ?? []).length, 8)
    // Honest AI-voice disclosure, with no provider or model branding in the public UI.
    assert.match(html, /These demonstrations feature AI-generated voices and fictional conversations\./)
    assert.doesNotMatch(html, /Eleven ?Labs|Eleven v\d|11\.ai/i)
    assert.match(html, /Read the conversation/)
    // No legacy recordings or model branding in the public copy.
    assert.doesNotMatch(html, /William|Natasha|edge-tts|synthetic neural/i)
    assert.doesNotMatch(html, /Eleven v4/)
    // The live agent stays disabled until an agent ID is configured.
    assert.match(html, /Live agent · coming soon/)
  } finally {
    await server.close()
  }
})

test('Alex answers locally from portfolio data with honest fallbacks and route-safe links', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false } })
  try {
    const { answerQuestion, suggestedQuestions } = await server.ssrLoadModule('/src/lib/assistantAnswers.js')
    const { profile } = await server.ssrLoadModule('/src/data/portfolioData.js')
    assert.ok(suggestedQuestions.length >= 4)
    assert.match(answerQuestion('How do I contact him?').text, new RegExp(profile.email.replace('.', '\\.')))
    assert.match(answerQuestion('what is the weather today').text, /don't have an answer/)
    assert.match(answerQuestion('are you a real AI?').text, /rather than a live AI model/)
    assert.match(answerQuestion('how much does he charge').text, /quotes each one individually/)
    assert.match(answerQuestion('does he work with react?').text, /React 19/)
    // Section links must work from /projects and /lab too, so they are absolute.
    for (const question of ['what has he built', 'tell me about his skills', 'contact', 'his experience', 'voice studio']) {
      for (const action of answerQuestion(question).actions ?? []) {
        assert.match(action.href, /^(\/|https:\/\/|mailto:)/, `${question} → ${action.href}`)
      }
    }
  } finally {
    await server.close()
  }
})

test('projects expose search and label the initial AutoFlow concept preview', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false } })
  try {
    const { default: Projects } = await server.ssrLoadModule('/src/components/Projects.jsx')
    const html = renderToStaticMarkup(createElement(Projects))
    assert.match(html, /type="search"/)
    assert.match(html, /src="\/projects\/autoflow\/home\.webp"/)
    assert.match(html, /alt="AutoFlow AI Pro promotional concept preview showing its automation dashboard\."/)
    assert.match(html, /Promotional concept preview/)
    assert.match(html, /In development · Planned integrations/)
  } finally {
    await server.close()
  }
})
