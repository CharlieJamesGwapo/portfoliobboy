import test from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { readFile } from 'node:fs/promises'

import handler, {
  buildAllowedOrigins,
  isPortfolioChatActivationEnabled,
} from '../api/portfolio-chat.js'
import { PORTFOLIO_AI_MODEL } from '../server/portfolioGateway.js'
import { createChatHandler } from '../server/portfolioChatHandler.js'

test('standalone Vercel config opts only portfolio chat into cancellation', async () => {
  assert.equal(typeof handler, 'function')
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'))
  assert.deepEqual(config.functions['api/portfolio-chat.js'], {
    maxDuration: 10,
    supportsCancellation: true,
  })
  assert.deepEqual(config.functions['api/*.js'], { maxDuration: 10 })
  assert.equal(config.functions['api/contact.js'], undefined)
})

const firstVercelFunctionMatch = (functions, sourceFile) => Object.entries(functions)
  .find(([pattern]) => pattern === sourceFile || (
    pattern === 'api/*.js' && /^api\/[^/]+\.js$/.test(sourceFile)
  ))

test('Vercel first-match selection preserves chat cancellation and contact wildcard timeout', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'))
  const chatMatch = firstVercelFunctionMatch(config.functions, 'api/portfolio-chat.js')
  const contactMatch = firstVercelFunctionMatch(config.functions, 'api/contact.js')

  assert.deepEqual(chatMatch, ['api/portfolio-chat.js', {
    maxDuration: 10,
    supportsCancellation: true,
  }])
  assert.deepEqual(contactMatch, ['api/*.js', { maxDuration: 10 }])
})

test('preview origin derivation accepts only exact platform URLs', () => {
  const origins = buildAllowedOrigins({
    VERCEL_URL: 'portfoliobboy-preview.vercel.app',
    VERCEL_BRANCH_URL: 'https://portfoliobboy-git-main.vercel.app',
  })

  assert.equal(origins.has('https://portfoliobboy-preview.vercel.app'), true)
  assert.equal(origins.has('https://portfoliobboy-git-main.vercel.app'), true)
  assert.equal(origins.has('https://*.vercel.app'), false)
  assert.equal(origins.has('https://evil.vercel.app'), false)
})

test('malformed or wildcard platform environment values are ignored', () => {
  const origins = buildAllowedOrigins({
    VERCEL_URL: '*.vercel.app',
    VERCEL_BRANCH_URL: 'https://evil.example/path',
  })

  assert.equal(origins.has('https://*.vercel.app'), false)
  assert.equal(origins.has('https://evil.example'), false)
})

const attestedEnvironment = () => ({
  PORTFOLIO_CHAT_ENABLED: 'true',
  PORTFOLIO_AI_MODEL: PORTFOLIO_AI_MODEL,
  VERCEL_OIDC_TOKEN: 'test-project-oidc',
  PORTFOLIO_CHAT_PROTECTION_ATTESTED: 'true',
  PORTFOLIO_CHAT_COST_ATTESTED: 'true',
})

test('activation requires both explicit root-controlled protection and cost attestations', () => {
  const valid = attestedEnvironment()
  assert.equal(isPortfolioChatActivationEnabled(valid), true)

  for (const name of ['PORTFOLIO_CHAT_PROTECTION_ATTESTED', 'PORTFOLIO_CHAT_COST_ATTESTED']) {
    const missing = { ...valid }
    delete missing[name]
    assert.equal(isPortfolioChatActivationEnabled(missing), false, `${name} missing`)

    const wrong = { ...valid, [name]: 'verified' }
    assert.equal(isPortfolioChatActivationEnabled(wrong), false, `${name} wrong value`)
  }
})

test('activation remains disabled for missing or unsafe prerequisite values', () => {
  const valid = attestedEnvironment()
  const cases = [
    ['PORTFOLIO_CHAT_ENABLED', undefined],
    ['PORTFOLIO_CHAT_ENABLED', 'false'],
    ['PORTFOLIO_AI_MODEL', 'google/gemini-2.5-flash'],
    ['VERCEL_OIDC_TOKEN', undefined],
    ['AI_GATEWAY_API_KEY', 'unexpected-key'],
    ['VERCEL_ACCESS_TOKEN', 'unexpected-token'],
  ]

  for (const [name, value] of cases) {
    const candidate = { ...valid }
    if (value === undefined) delete candidate[name]
    else candidate[name] = value
    assert.equal(isPortfolioChatActivationEnabled(candidate), false, `${name}=${value}`)
  }
})

class ApiResponseFixture extends EventEmitter {
  constructor() {
    super()
    this.statusCode = 200
    this.headers = {}
    this.body = ''
    this.writableEnded = false
    this.finished = false
    this.destroyed = false
  }

  setHeader(name, value) {
    this.headers[name.toLowerCase()] = String(value)
  }

  write(chunk) {
    if (this.writableEnded) throw new Error('write after close')
    this.body += String(chunk)
    return true
  }

  end(chunk = '') {
    if (chunk) this.write(chunk)
    this.writableEnded = true
    this.finished = true
    this.emit('finish')
  }
}

const apiRequestFixture = () => ({
  method: 'POST',
  url: '/api/portfolio-chat',
  headers: {
    origin: 'https://portfoliobboy.vercel.app',
    'content-type': 'application/json',
  },
  rawBody: Buffer.from(JSON.stringify({ question: 'What can Charlie build?', history: [] }), 'utf8'),
})

test('activation predicate gates a test-only handler without any provider network call', async () => {
  const valid = attestedEnvironment()
  const invalidEnvironments = [
    { ...valid, PORTFOLIO_CHAT_PROTECTION_ATTESTED: undefined },
    { ...valid, PORTFOLIO_CHAT_COST_ATTESTED: undefined },
    { ...valid, PORTFOLIO_CHAT_PROTECTION_ATTESTED: 'verified' },
    { ...valid, PORTFOLIO_CHAT_COST_ATTESTED: 'verified' },
  ]

  for (const env of invalidEnvironments) {
    let calls = 0
    const route = createChatHandler({
      enabled: isPortfolioChatActivationEnabled(env),
      allowedOrigins: new Set(['https://portfoliobboy.vercel.app']),
      streamAnswer: async function* () {
        calls += 1
        yield 'must not run'
      },
      sourcesFor: () => [],
    })
    const response = new ApiResponseFixture()

    await route(apiRequestFixture(), response)

    assert.equal(response.statusCode, 503)
    assert.equal(calls, 0)
  }

  let calls = 0
  const enabledRoute = createChatHandler({
    enabled: isPortfolioChatActivationEnabled(valid),
    allowedOrigins: new Set(['https://portfoliobboy.vercel.app']),
    streamAnswer: async function* () {
      calls += 1
      yield 'test-only bounded answer'
    },
    sourcesFor: () => [],
  })
  const enabledResponse = new ApiResponseFixture()

  await enabledRoute(apiRequestFixture(), enabledResponse)

  assert.equal(calls, 1)
  assert.match(enabledResponse.body, /"type":"done"/)
})
