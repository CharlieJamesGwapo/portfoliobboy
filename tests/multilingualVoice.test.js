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
    assert.deepEqual(voiceConversations.map((item) => item.id), ['es-mx', 'fil-taglish', 'ja-jp', 'fr-fr', 'pt-br', 'hi-in', 'ar-gulf'])
    const allowed = new Set(['en-US', 'es-MX', 'fil', 'ja-JP', 'fr-FR', 'pt-BR', 'hi-IN', 'ar'])
    for (const conversation of voiceConversations) {
      const langs = conversation.turns.flatMap((turn) => turn.parts.map(([lang]) => lang))
      for (const lang of langs) assert.ok(allowed.has(lang), `${conversation.id} uses unexpected lang ${lang}`)
      // The call opens in American English and then switches language.
      assert.equal(conversation.turns[0].parts[0][0], 'en-US')
      assert.ok(langs.some((lang) => lang !== 'en-US'), `${conversation.id} never switches language`)
      // 25-35 seconds of speech is roughly 400-560 Latin characters at the
      // gallery's measured pace. Japanese, Arabic and Hindi pack more speech
      // into each character, so their floor is lower.
      const characters = [...scriptText(conversation).replace(/\n/g, '')].length
      const dense = /^(ja|ar|hi)/.test(conversation.id)
      assert.ok(characters >= (dense ? 300 : 380) && characters <= 560, `${conversation.id} is ${characters} characters`)
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
    assert.equal((html.match(/<article class="vs-ml-card/g) ?? []).length, 7)
    for (const name of ['Mexican Spanish', 'Filipino / Taglish', 'Japanese', 'French', 'Brazilian Portuguese', 'Hindi', 'Gulf Arabic']) {
      assert.match(html, new RegExp(`>${name.replace('/', '\\/')}<`))
    }
    // The recorded Spanish call gets the studio player (lazy, no autoplay);
    // the unrecorded Taglish card is labelled and renders no player.
    assert.match(html, /<audio src="[^"]*\/conversations\/es-mx[^"]*\.mp3" preload="metadata">/)
    assert.match(html, /aria-label="Play Mexican Spanish conversation"/)
    // Cards without audio say so and render no player.
    const recorded = (html.match(/aria-label="Play [^"]+ conversation"/g) ?? []).length
    assert.equal((html.match(/<audio /g) ?? []).length, 1 + recorded, 'accent gallery + recorded calls only')
    // Each phrase is marked in the language actually spoken.
    assert.match(html, /<span lang="es-MX">[^<]*¿le puedo hablar en español\?<\/span>/)
    assert.match(html, /<span lang="fil">[^<]*Pero pwede mag-Tagalog na lang\?/)
    assert.match(html, /<span lang="en-US">Northgate Family Clinic/)
    // Arabic phrases are isolated right to left inside the English transcript.
    assert.match(html, /<span lang="ar" dir="rtl">[^<]*ممكن نكمل بالعربي؟<\/span>/)
    // Disclosure stays, provider and model branding stay out.
    assert.match(html, /These demonstrations feature AI-generated voices and fictional conversations\./)
    assert.doesNotMatch(html, /Eleven ?Labs|Eleven v\d|11\.ai/i)
  })
})

test('Alex only claims multilingual recordings that exist', async () => {
  await withServer(async (server) => {
    const { answerQuestion } = await server.ssrLoadModule('/src/lib/assistantAnswers.js')
    const { voiceConversations } = await server.ssrLoadModule('/src/data/voiceConversations.js')
    const answer = answerQuestion('Can your AI speak Spanish?').text
    const ready = voiceConversations.filter((item) => item.status === 'ready').map((item) => item.name)
    const coming = voiceConversations.filter((item) => item.status !== 'ready').map((item) => item.name)
    assert.ok(ready.includes('Mexican Spanish'))
    assert.match(answer, /bilingual receptionist calls? that switch(?:es)? from English to/)
    for (const name of ready) assert.ok(answer.includes(name), name)
    // Every language without a recording is described as coming, never as available.
    for (const name of coming) assert.ok(answer.includes(name) && /coming soon/.test(answer), name)
    assert.match(answerQuestion('do you do taglish').text, /Voice Studio/)
  })
})
