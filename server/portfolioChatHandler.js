import {
  ChatPolicyError,
  MAX_BODY_BYTES,
  validateChatRequestEnvelope,
  validateChatRequest,
} from './portfolioChatPolicy.js'
import { buildKnowledge, selectSources } from './portfolioKnowledge.js'

export const CANONICAL_CHAT_PATH = '/api/portfolio-chat'
export const DEFAULT_DEADLINE_MS = 9000

const SOURCE_ALLOWLIST = new Map(
  buildKnowledge().sources.map((source) => [`${source.id}\u0000${source.href}`, source]),
)

const ERROR_MESSAGES = Object.freeze({
  NOT_FOUND: 'Not found.',
  ASSISTANT_DISABLED: 'Portfolio assistant is unavailable.',
  ASSISTANT_MISCONFIGURED: 'Portfolio assistant is unavailable.',
  INVALID_BODY: 'Request body is invalid.',
  INVALID_REQUEST: 'Request body is invalid.',
  INVALID_QUESTION: 'Question is invalid.',
  INVALID_HISTORY: 'Conversation history is invalid.',
  METHOD_NOT_ALLOWED: 'Method is not allowed.',
  ORIGIN_NOT_ALLOWED: 'Request origin is not allowed.',
  UNSUPPORTED_MEDIA_TYPE: 'JSON content is required.',
  PAYLOAD_TOO_LARGE: 'Request body is too large.',
  EMPTY_RESPONSE: 'The assistant returned no answer.',
  PROVIDER_UNAVAILABLE: 'The assistant could not complete this request.',
})

class ClientDisconnectedError extends Error {
  constructor() {
    super('client disconnected')
    this.name = 'ClientDisconnectedError'
  }
}

class BodyReadError extends Error {
  constructor(code) {
    super(code)
    this.name = 'BodyReadError'
    this.code = code
  }
}

const isObject = (value) => value !== null && typeof value === 'object'

const isResponseClosed = (response) => Boolean(
  response?.writableEnded || response?.finished || response?.destroyed,
)

const responseHeader = (response, name, value) => {
  if (typeof response?.setHeader === 'function') response.setHeader(name, value)
}

const responseStatus = (response, status) => {
  response.statusCode = status
}

const safeMessage = (code) => ERROR_MESSAGES[code] || ERROR_MESSAGES.PROVIDER_UNAVAILABLE

const sendJson = (response, status, code) => {
  if (isResponseClosed(response)) return false
  responseStatus(response, status)
  if (status === 405) responseHeader(response, 'Allow', 'POST')
  responseHeader(response, 'Cache-Control', 'no-store')
  responseHeader(response, 'Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify({ error: { code, message: safeMessage(code) } }))
  return true
}

const parseCanonicalPath = (value) => {
  if (typeof value !== 'string') return false
  try {
    return new URL(value, 'http://portfolio.invalid').pathname === CANONICAL_CHAT_PATH
  } catch {
    return false
  }
}

const bufferFromRawBody = (value) => {
  if (Buffer.isBuffer(value)) return value
  if (typeof value === 'string') return Buffer.from(value, 'utf8')
  if (value instanceof Uint8Array) return Buffer.from(value)
  return null
}

const removeListener = (emitter, event, listener) => {
  if (typeof emitter?.off === 'function') emitter.off(event, listener)
  else if (typeof emitter?.removeListener === 'function') emitter.removeListener(event, listener)
}

const readRawBody = (request, maxBytes, signal) => {
  const explicitRawBody = bufferFromRawBody(request?.rawBody)
  if (explicitRawBody) {
    if (explicitRawBody.byteLength > maxBytes) throw new BodyReadError('PAYLOAD_TOO_LARGE')
    return Promise.resolve(explicitRawBody)
  }

  if (!request || typeof request.on !== 'function') {
    return Promise.reject(new BodyReadError('INVALID_BODY'))
  }

  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    let settled = false
    const cleanup = () => {
      removeListener(request, 'data', onData)
      removeListener(request, 'end', onEnd)
      removeListener(request, 'error', onError)
      removeListener(request, 'aborted', onAborted)
      signal?.removeEventListener?.('abort', onSignalAbort)
    }

    const finish = (error, body) => {
      if (settled) return
      settled = true
      cleanup()
      if (error) reject(error)
      else resolve(body)
    }

    const onData = (chunk) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      size += buffer.byteLength
      if (size > maxBytes) {
        request.pause?.()
        finish(new BodyReadError('PAYLOAD_TOO_LARGE'))
        return
      }
      chunks.push(buffer)
    }

    const onEnd = () => finish(null, Buffer.concat(chunks, size))
    const onError = () => finish(new BodyReadError('INVALID_BODY'))
    const onAborted = () => finish(new BodyReadError('REQUEST_ABORTED'))
    const onSignalAbort = () => finish(new BodyReadError('REQUEST_ABORTED'))

    if (signal?.aborted) {
      finish(new BodyReadError('REQUEST_ABORTED'))
      return
    }
    signal?.addEventListener?.('abort', onSignalAbort, { once: true })
    request.on('data', onData)
    request.once?.('end', onEnd)
    request.once?.('error', onError)
    request.once?.('aborted', onAborted)

    if (!settled && request.readableEnded && request.readableLength === 0) {
      // Give a helper-restored PassThrough one turn to publish its buffered
      // bytes/end event before treating an already-ended request as empty.
      const defer = typeof setImmediate === 'function' ? setImmediate : setTimeout
      defer(() => {
        if (!settled && request.readableEnded && request.readableLength === 0) {
          finish(null, Buffer.concat(chunks, size))
        }
      }, 0)
    }

  })
}

const waitForDrain = (response, signal) => new Promise((resolve, reject) => {
  let settled = false
  const cleanup = () => {
    removeListener(response, 'drain', onDrain)
    removeListener(response, 'close', onClose)
    removeListener(response, 'error', onError)
    signal?.removeEventListener?.('abort', onAbort)
  }
  const finish = (error) => {
    if (settled) return
    settled = true
    cleanup()
    if (error) reject(error)
    else resolve()
  }
  const onDrain = () => finish()
  const onClose = () => finish(new ClientDisconnectedError())
  const onError = () => finish(new ClientDisconnectedError())
  const onAbort = () => finish(new ClientDisconnectedError())

  if (signal?.aborted || isResponseClosed(response)) {
    finish(new ClientDisconnectedError())
    return
  }
  response.once?.('drain', onDrain)
  response.once?.('close', onClose)
  response.once?.('error', onError)
  signal?.addEventListener?.('abort', onAbort, { once: true })
})

const writeEvent = async (response, event, signal) => {
  if (signal?.aborted || isResponseClosed(response)) throw new ClientDisconnectedError()
  let accepted
  try {
    accepted = response.write(JSON.stringify(event) + '\n')
  } catch {
    throw new ClientDisconnectedError()
  }
  if (accepted === false) await waitForDrain(response, signal)
}

const safeSources = (records) => {
  if (!Array.isArray(records)) return []
  const selected = []
  const seen = new Set()
  for (const record of records) {
    if (!isObject(record) || typeof record.id !== 'string' || typeof record.href !== 'string') continue
    const allowlisted = SOURCE_ALLOWLIST.get(`${record.id}\u0000${record.href}`)
    if (!allowlisted || seen.has(allowlisted.id)) continue
    seen.add(allowlisted.id)
    selected.push({ id: allowlisted.id, label: allowlisted.label, href: allowlisted.href })
  }
  return selected
}

const safeStreamErrorCode = (error, signal) => {
  if (signal?.aborted) return 'REQUEST_ABORTED'
  if (error?.code === 'EMPTY_RESPONSE') return 'EMPTY_RESPONSE'
  if (error?.code === 'ASSISTANT_MISCONFIGURED') return 'ASSISTANT_MISCONFIGURED'
  return 'PROVIDER_UNAVAILABLE'
}

export function createChatHandler({
  enabled = false,
  allowedOrigins = new Set(),
  streamAnswer,
  sourcesFor = selectSources,
  model,
  deadlineMs = DEFAULT_DEADLINE_MS,
} = {}) {
  return async function portfolioChatHandler(request, response) {
    if (!parseCanonicalPath(request?.url)) {
      sendJson(response, 404, 'NOT_FOUND')
      return
    }

    try {
      validateChatRequestEnvelope({
        method: request?.method,
        headers: request?.headers,
        allowedOrigins,
      })
    } catch (error) {
      if (error instanceof ChatPolicyError) {
        sendJson(response, error.status, error.code)
        return
      }
      sendJson(response, 400, 'INVALID_BODY')
      return
    }

    const controller = new AbortController()
    let deadline
    let responseFinished = false
    let clientDisconnected = false
    let deadlineExceeded = false
    const abort = (reason) => {
      if (!controller.signal.aborted) controller.abort(reason)
    }
    const onRequestSignal = () => {
      clientDisconnected = true
      abort(request.signal?.reason)
    }
    const onRequestAborted = () => {
      clientDisconnected = true
      abort(new Error('request aborted'))
    }
    const onResponseClose = () => {
      if (!responseFinished && !response.writableEnded && !response.finished) {
        clientDisconnected = true
        abort(new Error('response disconnected'))
      }
    }
    const onResponseFinish = () => {
      responseFinished = true
    }

    request.signal?.addEventListener?.('abort', onRequestSignal, { once: true })
    request.once?.('aborted', onRequestAborted)
    response.once?.('close', onResponseClose)
    response.once?.('finish', onResponseFinish)
    deadline = setTimeout(() => {
      deadlineExceeded = true
      abort(new Error('deadline exceeded'))
    }, deadlineMs)

    try {
      let rawBody
      try {
        rawBody = await readRawBody(request, MAX_BODY_BYTES, controller.signal)
      } catch (error) {
        if (error?.code === 'REQUEST_ABORTED' && clientDisconnected) return
        if (error?.code === 'REQUEST_ABORTED' && deadlineExceeded) {
          sendJson(response, 503, 'PROVIDER_UNAVAILABLE')
          return
        }
        if (error?.code === 'REQUEST_ABORTED' && (controller.signal.aborted || isResponseClosed(response))) return
        sendJson(response, error?.code === 'PAYLOAD_TOO_LARGE' ? 413 : 400, error?.code || 'INVALID_BODY')
        return
      }

      let body
      try {
        body = JSON.parse(rawBody.toString('utf8'))
      } catch {
        sendJson(response, 400, 'INVALID_BODY')
        return
      }

      let parsed
      try {
        parsed = validateChatRequest({
          method: request.method,
          headers: request.headers,
          body,
          rawBytes: rawBody.byteLength,
          allowedOrigins,
        })
      } catch (error) {
        if (error instanceof ChatPolicyError) {
          sendJson(response, error.status, error.code)
          return
        }
        sendJson(response, 400, 'INVALID_BODY')
        return
      }

      if (!enabled) {
        sendJson(response, 503, 'ASSISTANT_DISABLED')
        return
      }
      if (typeof streamAnswer !== 'function') {
        sendJson(response, 503, 'ASSISTANT_MISCONFIGURED')
        return
      }

      let relatedSources = []
      try {
        relatedSources = safeSources(sourcesFor(parsed.question))
      } catch {
        relatedSources = []
      }
      responseStatus(response, 200)
      responseHeader(response, 'Cache-Control', 'no-store')
      responseHeader(response, 'Content-Type', 'application/x-ndjson; charset=utf-8')
      await writeEvent(response, { type: 'start' }, controller.signal)

      let answerText = ''
      try {
        const stream = streamAnswer({
          question: parsed.question,
          history: parsed.history,
          signal: controller.signal,
          model,
        })
        for await (const chunk of stream) {
          if (typeof chunk !== 'string') throw new Error('invalid provider chunk')
          if (!chunk) continue
          answerText += chunk
          await writeEvent(response, { type: 'delta', text: chunk }, controller.signal)
        }
        if (!answerText.trim()) {
          const error = new Error('empty provider stream')
          error.code = 'EMPTY_RESPONSE'
          throw error
        }
      } catch (error) {
        if (clientDisconnected || error instanceof ClientDisconnectedError) return
        if (!isResponseClosed(response)) {
          const code = deadlineExceeded ? 'PROVIDER_UNAVAILABLE' : safeStreamErrorCode(error, controller.signal)
          await writeEvent(response, {
            type: 'error',
            code,
            message: safeMessage(code),
          }, deadlineExceeded ? undefined : controller.signal).catch(() => {})
          if (!isResponseClosed(response)) response.end()
        }
        return
      }

      if (clientDisconnected || isResponseClosed(response)) return
      if (deadlineExceeded) {
        await writeEvent(response, {
          type: 'error',
          code: 'PROVIDER_UNAVAILABLE',
          message: safeMessage('PROVIDER_UNAVAILABLE'),
        }, undefined).catch(() => {})
        if (!isResponseClosed(response)) response.end()
        return
      }
      await writeEvent(response, { type: 'done', sources: relatedSources }, controller.signal)
      if (!isResponseClosed(response)) response.end()
    } finally {
      clearTimeout(deadline)
      request.signal?.removeEventListener?.('abort', onRequestSignal)
      removeListener(request, 'aborted', onRequestAborted)
      removeListener(response, 'close', onResponseClose)
      removeListener(response, 'finish', onResponseFinish)
    }
  }
}
