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

test('multilingual scripts switch from English, tag every phrase, and fit the recording budget', async () => {
  await withServer(async (server) => {
    const { voiceConversations, scriptText } = await server.ssrLoadModule('/src/data/voiceConversations.js')
    assert.deepEqual(voiceConversations.map((item) => item.id), ['es-mx', 'fil-taglish'])
    const allowed = new Set(['en-US', 'es-MX', 'fil'])
    for (const conversation of voiceConversations) {
      const langs = conversation.turns.flatMap((turn) => turn.parts.map(([lang]) => lang))
      for (const lang of langs) assert.ok(allowed.has(lang), `${conversation.id} uses unexpected lang ${lang}`)
      // The call opens in American English and then switches language.
      assert.equal(conversation.turns[0].parts[0][0], 'en-US')
      assert.ok(langs.some((lang) => lang !== 'en-US'), `${conversation.id} never switches language`)
      // 25-35 seconds of speech is roughly 400-560 characters at the gallery's measured pace.
      const characters = [...scriptText(conversation).replace(/\n/g, '')].length
      assert.ok(characters >= 380 && characters <= 560, `${conversation.id} is ${characters} characters`)
      // A card only claims audio when a recording exists.
      if (conversation.status === 'ready') assert.ok(conversation.src && conversation.peaks.length > 0)
      else assert.equal(conversation.src, null)
    }
  })
})

test('Voice Studio keeps eight accents and adds an honest multilingual section', async () => {
  await withServer(async (server) => {
    const { default: VoiceAgentDemo } = await server.ssrLoadModule('/src/components/VoiceAgentDemo.jsx')
    const html = renderToStaticMarkup(createElement(VoiceAgentDemo))
    assert.equal((html.match(/class="vs-accent[ "]/g) ?? []).length, 8)
    assert.match(html, /<h3 id="vs-ml-title">Multilingual Conversations<\/h3>/)
    assert.match(html, /One conversation\. Multiple languages\. Natural communication\./)
    assert.equal((html.match(/<article class="vs-ml-card/g) ?? []).length, 2)
    assert.match(html, />Mexican Spanish</)
    assert.match(html, />Filipino \/ Taglish</)
    // Unrecorded cards are labelled as such and never render a player.
    assert.match(html, /Recording soon/)
    assert.match(html, />Planned</)
    assert.equal((html.match(/<audio /g) ?? []).length, 1, 'only the accent gallery has audio')
    // Each phrase is marked in the language actually spoken.
    assert.match(html, /<span lang="es-MX">[^<]*¿le puedo hablar en español\?<\/span>/)
    assert.match(html, /<span lang="fil">[^<]*Pero pwede mag-Tagalog na lang\?/)
    assert.match(html, /<span lang="en-US">Northgate Family Clinic/)
    // Disclosure stays, provider and model branding stay out.
    assert.match(html, /show the script only; no audio is played\./)
    assert.doesNotMatch(html, /Eleven ?Labs|Eleven v\d|11\.ai/i)
  })
})

test('Alex only claims multilingual recordings that exist', async () => {
  await withServer(async (server) => {
    const { answerQuestion } = await server.ssrLoadModule('/src/lib/assistantAnswers.js')
    const { voiceConversations } = await server.ssrLoadModule('/src/data/voiceConversations.js')
    const answer = answerQuestion('Can your AI speak Spanish?').text
    if (voiceConversations.every((item) => item.status !== 'ready')) {
      assert.match(answer, /Mexican Spanish and Filipino \/ Taglish are coming soon/)
      assert.doesNotMatch(answer, /There are also bilingual/)
    }
    assert.match(answerQuestion('do you do taglish').text, /Voice Studio/)
  })
})
