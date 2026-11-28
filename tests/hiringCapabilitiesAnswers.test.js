import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { buildVoiceEvidenceContext } from '../src/lib/voiceEvidence.js'
import { assessRole } from '../src/lib/assistantWorkflows.js'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

let server, answerQuestion, answerSuggestion
before(async () => {
  server = await createServer({ envDir: 'tests', server: { middlewareMode: true, hmr: false, ws: false } })
  ;({ answerQuestion, answerSuggestion } = await server.ssrLoadModule('/src/lib/assistantAnswers.js'))
})
after(async () => { await server?.close() })

test('AWS and DevOps questions point to actual cloud and deployment evidence', () => {
  for (const question of ['Tell me about AWS and DevOps', 'Does Charlie work with AWS?', 'What CI/CD pipelines has he worked with?']) {
    const result = answerQuestion(question)
    assert.match(result.text, /AWS Lambda/)
    assert.match(result.text, /Docker/)
    assert.match(result.text, /confirm|not established|not published/i)
    assert.ok(result.actions.some(action => action.href === '/projects/fintech-lending'))
    assert.ok(result.actions.some(action => action.href === '/#skills'))
  }
})

test('custom bot answers distinguish service examples from completed deployments', () => {
  for (const question of ['Can he build a custom bot?', 'Tell me about Telegram bots', 'Discord bot development']) {
    const result = answerQuestion(question)
    assert.match(result.text, /custom bots/i)
    assert.match(result.text, /service|solution patterns/i)
    assert.match(result.text, /not.*(?:completed|deployed)|confirm.*(?:scope|integrations)/i)
    assert.ok(result.actions.some(action => action.href === '/#automations'))
  }
})

test('automation overview describes the catalogue without turning examples into delivered metrics', () => {
  const result = answerSuggestion('automations')
  assert.match(result.text, /custom bots/i)
  assert.match(result.text, /patterns|examples/i)
  assert.doesNotMatch(result.text, /150\+|150 completed|\d+ workflows (?:delivered|deployed)/i)
})

test('the skills suggestion makes AWS and DevOps discoverable without a special question', () => {
  const result = answerSuggestion('skills')
  assert.match(result.text, /AWS Lambda/)
  assert.match(result.text, /Docker/)
  assert.ok(result.actions.some(action => action.href === '/#skills'))
})

test('AWS expertise and certifications remain unconfirmed', () => {
  for (const input of ['Is Charlie AWS certified?', 'Is he an expert in Kubernetes?', 'Does he hold an AWS Solutions Architect certification?']) {
    assert.match(answerQuestion(input).text, /not (?:published|confirmed)|unconfirmed|cannot verify/i)
    assert.doesNotMatch(answerQuestion(input).text, /^Yes:/)
  }
})

test('a proposed local-model adapter does not become delivered experience through the larger skills list', () => {
  const requirement = assessRole('Ollama').requirements[0]
  assert.equal(requirement.status, 'unverified')
  assert.match(requirement.evidence[0].text, /planned|in development/i)
})

test('offered platforms retain their deployment caveat in role summaries and text answers', () => {
  for (const tool of ['Make', 'Zapier', 'Insighto.ai']) {
    const requirement = assessRole(tool).requirements[0]
    assert.equal(requirement.status, 'unverified', tool)
    assert.match(requirement.evidence[0].text, /offered.*toolkit/i)
    assert.match(requirement.evidence[0].text, /deployed.*not established/i)
    const answer = answerQuestion(`Does he have experience with ${tool}?`)
    assert.doesNotMatch(answer.text, /^Yes:/)
    assert.match(answer.text, /offered.*toolkit/i)
    assert.match(answer.text, /confirm/i)
  }
})

test('voice context includes bounded cloud evidence while retaining every public project', () => {
  const context = buildVoiceEvidenceContext()
  assert.match(context, /AWS Lambda/)
  assert.match(context, /Docker Compose/)
  assert.match(context, /solution patterns.*not.*completed/i)
  assert.ok(context.length <= 7000)
  assert.match(context, /\/projects\/zero-to-hero-dev/)
})

test('hero introduces cloud delivery and custom bots without inventing a larger project count', async () => {
  const { default: Hero } = await server.ssrLoadModule('/src/components/Hero.jsx')
  const markup = renderToStaticMarkup(createElement(Hero))
  assert.match(markup, /AWS &amp; DevOps/)
  assert.match(markup, /Custom bots/)
  assert.match(markup, /22\+/)
  assert.doesNotMatch(markup, /150\+/)
})
