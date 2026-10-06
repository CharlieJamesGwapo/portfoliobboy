import test from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { PassThrough } from 'node:stream'

import { createChatHandler } from '../server/portfolioChatHandler.js'

const ALLOWED_ORIGINS = new Set(['https://portfoliobboy.vercel.app'])

const requestFixture = ({
  body = { question: 'What can Charlie build?', history: [] },
  rawText = JSON.stringify(body),
  method = 'POST',
  origin = 'https://portfoliobboy.vercel.app',
  contentType = 'application/json',
  path = '/api/portfolio-chat',
  helperRestored = false,
} = {}) => {
  const request = new PassThrough()
  request.method = method
  request.url = path
  request.headers = {
    origin,
    'content-type': contentType,
  }

  if (helperRestored) {
    // Vercel's Node helpers may have consumed the original request before
    // restoring a PassThrough. The original remains ended while the restored
    // stream still carries the exact bytes; req.body is intentionally not a
    // raw-body source.
    const original = new PassThrough()
    original.end(Buffer.from(rawText, 'utf8'))
    original.resume()
    Object.defineProperty(request, 'originalRequest', { value: original })
    Object.defineProperty(request, 'readableEnded', { value: true, configurable: true })
    Object.defineProperty(request, 'body', {
      configurable: true,
      get() {
        throw new Error('lazy parsed body must not replace raw byte collection')
      },
    })
  }

  process.nextTick(() => request.end(Buffer.from(rawText, 'utf8')))
  return request
}

const alreadyBufferedVercelRequestFixture = ({
  body = requestBody(),
  rawText = JSON.stringify(body),
  origin = 'https://portfoliobboy.vercel.app',
} = {}) => {
  const original = new PassThrough()
  original.end(Buffer.from(rawText, 'utf8'))
  original.resume()

  const restored = new PassThrough()
  restored.end(Buffer.from(rawText, 'utf8'))

  const request = new PassThrough()
  request.method = 'POST'
  request.url = '/api/portfolio-chat'
  request.headers = {
    origin,
    'content-type': 'application/json',
  }

  // Model the installed Vercel Node helper: the original request has already
  // ended, while data listeners and read() are delegated to one buffered
  // PassThrough restored by the helper. The route must choose one byte-reader.
  Object.defineProperty(request, 'originalRequest', { value: original })
  Object.defineProperty(request, 'readableEnded', { value: true, configurable: true })
  const requestOn = request.on.bind(request)
  request.on = (event, listener) => {
    if (event === 'data' || event === 'end' || event === 'error' || event === 'aborted') {
      return restored.on(event, listener)
    }
    return requestOn(event, listener)
  }
  request.addListener = request.on
  request.read = restored.read.bind(restored)
  Object.defineProperty(request, 'body', {
    configurable: true,
    get() {
      throw new Error('lazy parsed body must not replace raw byte collection')
    },
  })

  return request
}

class ResponseFixture extends EventEmitter {
  constructor({ backpressure = false } = {}) {
    super()
    this.statusCode = 200
    this.headers = {}
    this.body = ''
    this.writableEnded = false
    this.finished = false
    this.destroyed = false
    this.headersSent = false
    this.backpressure = backpressure
  }

  setHeader(name, value) {
    this.headers[name.toLowerCase()] = String(value)
    this.headersSent = true
  }

  getHeader(name) {
    return this.headers[name.toLowerCase()]
  }

  write(chunk) {
    if (this.writableEnded || this.destroyed) throw new Error('write after close')
    this.headersSent = true
    this.body += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk)
    if (this.backpressure) {
      this.backpressure = false
      process.nextTick(() => this.emit('drain'))
      return false
    }
    return true
  }

  end(chunk = '') {
    if (this.writableEnded) return this
    if (chunk) this.write(chunk)
    this.writableEnded = true
    this.finished = true
    this.emit('finish')
    return this
  }

  disconnect() {
    this.destroyed = true
    this.emit('close')
  }
}

const responseEvents = (response) => response.body
  .trim()
  .split('\n')
  .filter(Boolean)
  .map((line) => JSON.parse(line))

const requestBody = () => ({ question: 'What can Charlie build?', history: [] })

test('disabled configuration never calls the provider and returns a safe 503', async () => {
  let calls = 0
  const handler = createChatHandler({
    enabled: false,
    allowedOrigins: ALLOWED_ORIGINS,
    streamAnswer: async function* () {
      calls += 1
      yield 'incorrect'
    },
    sourcesFor: () => [],
  })
  const response = new ResponseFixture()

  await handler(requestFixture({ body: requestBody() }), response)

  assert.equal(calls, 0)
  assert.equal(response.statusCode, 503)
  assert.equal(response.getHeader('cache-control'), 'no-store')
  assert.deepEqual(JSON.parse(response.body), {
    error: { code: 'ASSISTANT_DISABLED', message: 'Portfolio assistant is unavailable.' },
  })
})

test('foreign origin is rejected before the provider is called', async () => {
  let calls = 0
  const handler = createChatHandler({
    enabled: true,
    allowedOrigins: ALLOWED_ORIGINS,
    streamAnswer: async function* () {
      calls += 1
      yield 'should not run'
    },
    sourcesFor: () => [],
  })
  const response = new ResponseFixture()

  await handler(requestFixture({ origin: 'https://evil.vercel.app' }), response)

  assert.equal(calls, 0)
  assert.equal(response.statusCode, 403)
  assert.deepEqual(JSON.parse(response.body), {
    error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Request origin is not allowed.' },
  })
})

test('oversized UTF-8 body is rejected before parsing or generation', async () => {
  let calls = 0
  const handler = createChatHandler({
    enabled: false,
    allowedOrigins: ALLOWED_ORIGINS,
    streamAnswer: async function* () {
      calls += 1
      yield 'should not run'
    },
    sourcesFor: () => [],
  })
  const response = new ResponseFixture()

  await handler(requestFixture({
    body: { question: '界'.repeat(9000), history: [] },
  }), response)

  assert.equal(calls, 0)
  assert.equal(response.statusCode, 413)
  assert.deepEqual(JSON.parse(response.body), {
    error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large.' },
  })
})

test('valid request emits a streamed start, delta, and allowlisted done event', async () => {
  const handler = createChatHandler({
    enabled: true,
    allowedOrigins: ALLOWED_ORIGINS,
    model: 'test-model',
    streamAnswer: async function* ({ question, history, signal, model }) {
      assert.equal(question, 'What can Charlie build?')
      assert.deepEqual(history, [])
      assert.equal(model, 'test-model')
      assert.equal(signal.aborted, false)
      yield 'Charlie builds '
      yield 'public portfolio systems.'
    },
    sourcesFor: () => [{ id: 'about', label: 'About Charlie', href: '/#about', topics: ['about'] }],
  })
  const response = new ResponseFixture({ backpressure: true })

  await handler(requestFixture({ body: requestBody() }), response)

  assert.equal(response.statusCode, 200)
  assert.equal(response.getHeader('content-type'), 'application/x-ndjson; charset=utf-8')
  assert.equal(response.getHeader('cache-control'), 'no-store')
  assert.deepEqual(responseEvents(response), [
    { type: 'start' },
    { type: 'delta', text: 'Charlie builds ' },
    { type: 'delta', text: 'public portfolio systems.' },
    { type: 'done', sources: [{ id: 'about', label: 'About Charlie', href: '/#about' }] },
  ])
})

test('provider failures become a safe error event without logging question or answer', async () => {
  const question = 'private question should never be logged'
  const answer = 'secret provider payload should never be logged'
  const logs = []
  const originalError = console.error
  const originalLog = console.log
  console.error = (...args) => logs.push(args.join(' '))
  console.log = (...args) => logs.push(args.join(' '))
  try {
    const handler = createChatHandler({
      enabled: true,
      allowedOrigins: ALLOWED_ORIGINS,
      streamAnswer: async function* () {
        throw new Error(`${answer}: ${question}`)
      },
      sourcesFor: () => [],
    })
    const response = new ResponseFixture()

    await handler(requestFixture({ body: { question, history: [] } }), response)

    assert.equal(response.statusCode, 200)
    assert.deepEqual(responseEvents(response), [
      { type: 'start' },
      { type: 'error', code: 'PROVIDER_UNAVAILABLE', message: 'The assistant could not complete this request.' },
    ])
    assert.equal(response.writableEnded, true)
    assert.doesNotMatch(response.body, new RegExp(answer))
    assert.doesNotMatch(response.body, new RegExp(question))
    assert.equal(logs.some((line) => line.includes(question) || line.includes(answer)), false)
  } finally {
    console.error = originalError
    console.log = originalLog
  }
})

test('an empty or truncated provider stream never emits a successful done event', async () => {
  for (const streamAnswer of [
    async function* () {},
    async function* () {
      yield 'partial answer'
      throw new Error('provider dropped the connection')
    },
  ]) {
    const handler = createChatHandler({
      enabled: true,
      allowedOrigins: ALLOWED_ORIGINS,
      streamAnswer,
      sourcesFor: () => [],
    })
    const response = new ResponseFixture()

    await handler(requestFixture(), response)

    const events = responseEvents(response)
    assert.equal(events.some((event) => event.type === 'done'), false)
    assert.equal(events.at(-1)?.type, 'error')
  }
})

test('unknown source hrefs are omitted from the done envelope', async () => {
  const handler = createChatHandler({
    enabled: true,
    allowedOrigins: ALLOWED_ORIGINS,
    streamAnswer: async function* () {
      yield 'Grounded answer.'
    },
    sourcesFor: () => [
      { id: 'about', label: 'About Charlie', href: '/#about', topics: ['about'] },
      { id: 'unknown', label: 'Private notes', href: 'https://evil.example/private', topics: ['private'] },
      { id: 'about', label: 'Forged label', href: 'javascript:alert(1)', topics: ['about'] },
    ],
  })
  const response = new ResponseFixture()

  await handler(requestFixture(), response)

  assert.deepEqual(responseEvents(response).at(-1), {
    type: 'done',
    sources: [{ id: 'about', label: 'About Charlie', href: '/#about' }],
  })
})

test('response disconnect aborts the one provider signal and never writes after close', async () => {
  let receivedSignal
  const handler = createChatHandler({
    enabled: true,
    allowedOrigins: ALLOWED_ORIGINS,
    deadlineMs: 1000,
    streamAnswer: async function* ({ signal }) {
      receivedSignal = signal
      await new Promise((resolve) => signal.addEventListener('abort', resolve, { once: true }))
      throw new Error('cancelled provider payload')
    },
    sourcesFor: () => [],
  })
  const response = new ResponseFixture()
  const pending = handler(requestFixture(), response)
  await new Promise((resolve) => setImmediate(resolve))
  response.disconnect()
  await pending

  assert.equal(receivedSignal?.aborted, true)
  assert.equal(responseEvents(response).some((event) => event.type === 'done'), false)
})

test('server deadline ends an open stream with a safe error', async () => {
  const handler = createChatHandler({
    enabled: true,
    allowedOrigins: ALLOWED_ORIGINS,
    deadlineMs: 10,
    streamAnswer: async function* ({ signal }) {
      await new Promise((resolve) => signal.addEventListener('abort', resolve, { once: true }))
      throw new Error('deadline provider payload')
    },
    sourcesFor: () => [],
  })
  const response = new ResponseFixture()

  await handler(requestFixture(), response)

  assert.equal(response.writableEnded, true)
  assert.deepEqual(responseEvents(response).at(-1), {
    type: 'error',
    code: 'PROVIDER_UNAVAILABLE',
    message: 'The assistant could not complete this request.',
  })
})

test('raw bytes are collected from the helper-restored stream before lazy req.body access', async () => {
  const handler = createChatHandler({
    enabled: true,
    allowedOrigins: ALLOWED_ORIGINS,
    streamAnswer: async function* () {
      yield 'UTF-8 accepted.'
    },
    sourcesFor: () => [],
  })
  const response = new ResponseFixture()

  await handler(requestFixture({
    helperRestored: true,
    rawText: ' \n' + JSON.stringify({ question: '界', history: [] }) + ' \n',
  }), response)

  assert.equal(response.statusCode, 200)
  assert.equal(responseEvents(response).at(-1)?.type, 'done')
})

test('already-buffered Vercel helper body is consumed once for disabled requests', async () => {
  let calls = 0
  const handler = createChatHandler({
    enabled: false,
    allowedOrigins: ALLOWED_ORIGINS,
    streamAnswer: async function* () {
      calls += 1
      yield 'must remain disabled'
    },
  })
  const response = new ResponseFixture()

  await handler(alreadyBufferedVercelRequestFixture(), response)

  assert.equal(response.statusCode, 503)
  assert.equal(calls, 0)
})

test('already-buffered Vercel helper body streams enabled requests without duplicate bytes', async () => {
  let calls = 0
  const handler = createChatHandler({
    enabled: true,
    allowedOrigins: ALLOWED_ORIGINS,
    streamAnswer: async function* () {
      calls += 1
      yield 'buffered body accepted.'
    },
    sourcesFor: () => [],
  })
  const response = new ResponseFixture()

  await handler(alreadyBufferedVercelRequestFixture(), response)

  assert.equal(calls, 1)
  assert.equal(responseEvents(response).at(-1)?.type, 'done')
})

test('already-buffered helper counts a 24 KiB raw UTF-8 body once', async () => {
  const body = {
    question: 'q'.repeat(2000),
    history: Array.from({ length: 5 }, () => ({ role: 'user', content: 'h'.repeat(1800) })),
  }
  const bodyText = JSON.stringify(body)
  const rawText = `${bodyText}${' '.repeat(24 * 1024 - Buffer.byteLength(bodyText, 'utf8'))}`
  assert.equal(Buffer.byteLength(rawText, 'utf8'), 24 * 1024)

  let calls = 0
  const handler = createChatHandler({
    enabled: false,
    allowedOrigins: ALLOWED_ORIGINS,
    streamAnswer: async function* () {
      calls += 1
      yield 'must remain disabled'
    },
  })
  const response = new ResponseFixture()

  await handler(alreadyBufferedVercelRequestFixture({ body, rawText }), response)

  assert.equal(response.statusCode, 503)
  assert.equal(calls, 0)
})

test('already-buffered helper rejects raw UTF-8 bytes above 24 KiB before provider use', async () => {
  const bodyText = JSON.stringify(requestBody())
  const rawText = `${bodyText}${' \n'.repeat(14000)}界`
  assert.ok(Buffer.byteLength(rawText, 'utf8') > 24 * 1024)

  let calls = 0
  const handler = createChatHandler({
    enabled: true,
    allowedOrigins: ALLOWED_ORIGINS,
    streamAnswer: async function* () {
      calls += 1
      yield 'must not run'
    },
  })
  const response = new ResponseFixture()

  await handler(alreadyBufferedVercelRequestFixture({ rawText }), response)

  assert.equal(response.statusCode, 413)
  assert.equal(calls, 0)
})

test('canonical path is required while query strings remain accepted', async () => {
  for (const path of ['/api/PORTFOLIO-CHAT', '/api/portfolio-chat/', '/api/%70ortfolio-chat']) {
    let calls = 0
    const handler = createChatHandler({
      enabled: true,
      allowedOrigins: ALLOWED_ORIGINS,
      streamAnswer: async function* () {
        calls += 1
        yield 'should not run'
      },
      sourcesFor: () => [],
    })
    const response = new ResponseFixture()

    await handler(requestFixture({ path }), response)

    assert.equal(response.statusCode, 404, path)
    assert.equal(calls, 0, path)
  }

  const handler = createChatHandler({
    enabled: false,
    allowedOrigins: ALLOWED_ORIGINS,
    streamAnswer: async function* () {
      throw new Error('must remain disabled')
    },
    sourcesFor: () => [],
  })
  const response = new ResponseFixture()
  await handler(requestFixture({ path: '/api/portfolio-chat?view=assistant' }), response)
  assert.equal(response.statusCode, 503)
})
