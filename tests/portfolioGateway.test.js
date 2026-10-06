import test from 'node:test'
import assert from 'node:assert/strict'

import {
  createPortfolioGatewayForTests,
  PORTFOLIO_AI_MODEL,
} from '../server/portfolioGateway.js'

const collect = async (stream) => {
  const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  return chunks
}

const validArgs = (overrides = {}) => ({
  question: 'What can Charlie build?',
  history: [{ role: 'user', content: 'Earlier question' }],
  signal: new AbortController().signal,
  model: PORTFOLIO_AI_MODEL,
  ...overrides,
})

test('gateway adapter sends one bounded, Vertex-only grounded generation', async () => {
  let options
  const streamTextImpl = (received) => {
    options = received
    return {
      stream: (async function* () {
        yield { type: 'start' }
        yield { type: 'text-delta', text: 'Grounded answer.' }
        yield { type: 'finish', finishReason: 'stop' }
      })(),
    }
  }
  const gateway = createPortfolioGatewayForTests(streamTextImpl)
  const args = validArgs()

  assert.deepEqual(await collect(gateway(args)), ['Grounded answer.'])
  assert.equal(options.model, PORTFOLIO_AI_MODEL)
  assert.equal(typeof options.instructions, 'string')
  assert.deepEqual(options.messages, [{
    role: 'user',
    content: JSON.stringify({ untrustedHistory: args.history, question: args.question }),
  }])
  assert.equal(options.maxOutputTokens, 600)
  assert.equal(options.maxRetries, 0)
  assert.equal(options.streamRetries, 0)
  assert.equal(options.abortSignal, args.signal)
  assert.deepEqual(options.providerOptions, {
    gateway: { only: ['vertex'], byok: {} },
  })
  assert.equal('tools' in options, false)
  assert.equal('prompt' in options, false)
  assert.equal('system' in options, false)
})

test('gateway adapter turns provider error and abort parts into safe failures', async () => {
  for (const part of [
    { type: 'error', error: { message: 'provider payload' } },
    { type: 'abort', reason: 'provider payload' },
  ]) {
    const gateway = createPortfolioGatewayForTests(() => ({
      stream: (async function* () {
        yield part
      })(),
    }))

    await assert.rejects(
      () => collect(gateway(validArgs())),
      (error) => error.code === (part.type === 'abort' ? 'REQUEST_ABORTED' : 'PROVIDER_UNAVAILABLE'),
    )
  }
})

test('gateway adapter does not report incomplete or empty streams as success', async () => {
  for (const [stream, expectedCode] of [
    [(async function* () { yield { type: 'text-delta', text: 'partial' } })(), 'PROVIDER_UNAVAILABLE'],
    [(async function* () { yield { type: 'finish', finishReason: 'stop' } })(), 'EMPTY_RESPONSE'],
  ]) {
    const gateway = createPortfolioGatewayForTests(() => ({ stream }))
    await assert.rejects(
      () => collect(gateway(validArgs())),
      (error) => error.code === expectedCode,
    )
  }
})

test('gateway adapter observes sanitized onError state without logging provider data', async () => {
  const gateway = createPortfolioGatewayForTests((options) => {
    options.onError(new Error('private provider payload'))
    return {
      stream: (async function* () {
        yield { type: 'finish', finishReason: 'stop' }
      })(),
    }
  })

  await assert.rejects(
    () => collect(gateway(validArgs())),
    (error) => error.code === 'PROVIDER_UNAVAILABLE',
  )
})

test('gateway adapter forwards abort signal before starting generation', async () => {
  const controller = new AbortController()
  controller.abort()
  let calls = 0
  const gateway = createPortfolioGatewayForTests(() => {
    calls += 1
    return { stream: (async function* () {})() }
  })

  await assert.rejects(
    () => collect(gateway(validArgs({ signal: controller.signal }))),
    (error) => error.code === 'REQUEST_ABORTED',
  )
  assert.equal(calls, 0)
})
