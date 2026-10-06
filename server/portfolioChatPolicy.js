export const MAX_BODY_BYTES = 24 * 1024
export const MAX_QUESTION_LENGTH = 2000
export const MAX_HISTORY_MESSAGES = 10
export const MAX_HISTORY_CONTENT_LENGTH = 4000

const REQUEST_KEYS = new Set(['question', 'history'])
const HISTORY_KEYS = new Set(['role', 'content'])
const HISTORY_ROLES = new Set(['user', 'assistant'])

export class ChatPolicyError extends Error {
  constructor(status, code) {
    super(code)
    this.name = 'ChatPolicyError'
    this.status = status
    this.code = code
  }
}

const fail = (status, code) => {
  throw new ChatPolicyError(status, code)
}

const header = (headers, name) => {
  if (!headers) return undefined
  if (typeof headers.get === 'function') return headers.get(name) ?? headers.get(name.toLowerCase()) ?? undefined
  const wanted = name.toLowerCase()
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === wanted) return value
  }
  return undefined
}

const isRecord = (value) => value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
  && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)

const hasOnlyKeys = (value, allowed) => Object.keys(value).every((key) => allowed.has(key))

const originAllowed = (origin, allowedOrigins) => {
  if (typeof origin !== 'string' || origin.length === 0) return false
  if (allowedOrigins instanceof Set) return allowedOrigins.has(origin)
  if (Array.isArray(allowedOrigins)) return allowedOrigins.includes(origin)
  if (allowedOrigins && typeof allowedOrigins.has === 'function') return allowedOrigins.has(origin)
  return false
}

const serializedBytes = (body) => {
  try {
    const serialized = JSON.stringify(body)
    if (serialized === undefined) return null
    return Buffer.byteLength(serialized, 'utf8')
  } catch {
    return null
  }
}

export function validateChatRequest({ method, headers, body, rawBytes, allowedOrigins } = {}) {
  if (method !== 'POST') fail(405, 'METHOD_NOT_ALLOWED')

  const origin = header(headers, 'origin')
  if (!originAllowed(origin, allowedOrigins)) fail(403, 'ORIGIN_NOT_ALLOWED')

  const contentType = header(headers, 'content-type')
  if (typeof contentType !== 'string' || contentType.split(';', 1)[0].trim().toLocaleLowerCase('en') !== 'application/json') {
    fail(415, 'UNSUPPORTED_MEDIA_TYPE')
  }

  if (rawBytes !== undefined && rawBytes !== null) {
    if (!Number.isSafeInteger(rawBytes) || rawBytes < 0) fail(400, 'INVALID_BODY')
    if (rawBytes > MAX_BODY_BYTES) fail(413, 'PAYLOAD_TOO_LARGE')
  }

  const bodyBytes = serializedBytes(body)
  if (bodyBytes === null) fail(400, 'INVALID_BODY')
  if (bodyBytes > MAX_BODY_BYTES) fail(413, 'PAYLOAD_TOO_LARGE')
  if (!isRecord(body) || !hasOnlyKeys(body, REQUEST_KEYS) || !Object.hasOwn(body, 'question') || !Object.hasOwn(body, 'history')) {
    fail(400, 'INVALID_REQUEST')
  }

  if (typeof body.question !== 'string' || body.question.trim().length === 0 || body.question.length > MAX_QUESTION_LENGTH) {
    fail(400, 'INVALID_QUESTION')
  }

  if (!Array.isArray(body.history) || body.history.length > MAX_HISTORY_MESSAGES) {
    fail(400, 'INVALID_HISTORY')
  }

  const history = []
  for (const item of body.history) {
    if (!isRecord(item) || !hasOnlyKeys(item, HISTORY_KEYS) || !Object.hasOwn(item, 'role') || !Object.hasOwn(item, 'content')) {
      fail(400, 'INVALID_HISTORY')
    }
    if (!HISTORY_ROLES.has(item.role) || typeof item.content !== 'string' || item.content.length > MAX_HISTORY_CONTENT_LENGTH) {
      fail(400, 'INVALID_HISTORY')
    }
    history.push({ role: item.role, content: item.content })
  }

  return { question: body.question, history }
}
