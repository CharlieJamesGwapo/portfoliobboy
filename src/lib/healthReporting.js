import { normalizeHealthEvent } from '../../shared/healthTelemetry.js'

// Only fixed categories cross this boundary. No SDK, storage, visitor IDs,
// exception payloads or retry queue; even unsuccessful sends consume the cap.
export function createHealthReporter({
  enabled = false,
  fetchImpl = globalThis.fetch,
  navigatorImpl = globalThis.navigator,
  maxReports = 8,
  timeoutMs = 2500,
  AbortControllerImpl = globalThis.AbortController,
  setTimeoutImpl = globalThis.setTimeout,
  clearTimeoutImpl = globalThis.clearTimeout,
} = {}) {
  const sent = new Set()
  const cap = Number.isFinite(maxReports) ? Math.min(8, Math.max(0, Math.floor(maxReports))) : 8
  const deadline = Number.isFinite(timeoutMs) ? Math.min(2500, Math.max(1, timeoutMs)) : 2500
  return properties => {
    let timer
    const clearDeadline = () => {
      try { if (timer !== undefined) clearTimeoutImpl(timer) } catch { /* Optional telemetry cannot create an unhandled error. */ }
    }
    try {
      if (!enabled || navigatorImpl?.doNotTrack === '1' || navigatorImpl?.globalPrivacyControl === true) return false
      const payload = normalizeHealthEvent('portfolio_health_error', properties)
      if (!payload || typeof fetchImpl !== 'function' || typeof AbortControllerImpl !== 'function') return false
      const key = `${payload.properties.surface}:${payload.properties.code}`
      if (sent.has(key) || sent.size >= cap) return false
      const controller = new AbortControllerImpl()
      sent.add(key)
      timer = setTimeoutImpl(() => {
        try { controller.abort() } catch { /* Best effort; never throw into a visitor action. */ }
        clearDeadline()
      }, deadline)
      // Promise.resolve handles a synchronous fetch mock as well as native fetch.
      Promise.resolve(fetchImpl('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        keepalive: true,
        signal: controller.signal,
        body: JSON.stringify(payload),
      })).then(clearDeadline, clearDeadline)
      return true
    } catch {
      clearDeadline()
      return false
    }
  }
}

export const reportHealthError = createHealthReporter({
  enabled: import.meta.env?.VITE_PORTFOLIO_ANALYTICS_ENABLED === 'true',
  fetchImpl: (...args) => globalThis.fetch(...args),
})

// ErrorEvent details and PromiseRejectionEvent.reason may contain private
// content. Deliberately never read them, including for categorization.
export function installHealthReporting({ windowImpl = globalThis.window, report = reportHealthError } = {}) {
  const safelyReport = code => {
    try { report({ surface: 'app', code }) } catch { /* Reporting must not report itself. */ }
  }
  const onError = event => {
    try {
      if (event.target === windowImpl) safelyReport('app_unhandled')
      else if (typeof windowImpl.Element === 'function' && event.target instanceof windowImpl.Element && ['SCRIPT', 'LINK', 'IMG'].includes(event.target.tagName)) safelyReport('asset_load_failed')
    } catch { /* An unusual event target must not interfere with rendering. */ }
  }
  const onRejection = () => safelyReport('app_unhandled_rejection')
  const remove = () => {
    try { windowImpl?.removeEventListener('error', onError, true) } catch { /* Best effort teardown. */ }
    try { windowImpl?.removeEventListener('unhandledrejection', onRejection) } catch { /* Best effort teardown. */ }
  }
  try {
    windowImpl?.addEventListener('error', onError, true)
    windowImpl?.addEventListener('unhandledrejection', onRejection)
  } catch { remove() }
  return remove
}

// SDK error/disconnect/rejected-start callbacks can describe one failure.
// Keep the classification local to an attempt; intentional teardown silences
// late callbacks without reading provider diagnostics or spoken content.
export function createVoiceHealthAttempt({ surface, report = reportHealthError } = {}) {
  let connected = false
  let ended = false
  let failed = false
  return {
    connected() { connected = true },
    end() { ended = true },
    fail(kind, exceptionName) {
      if (ended || failed || !['provider', 'send'].includes(kind)) return false
      // Permission can change after the precheck. The SDK forwards the
      // original DOMException; compare its standard name, never its message.
      if (['NotAllowedError', 'SecurityError', 'NotFoundError'].includes(exceptionName)) {
        ended = true
        return false
      }
      failed = true
      const code = kind === 'send' ? 'voice_send_failed' : connected ? 'voice_connection_lost' : 'voice_start_failed'
      try { report({ surface, code }) } catch { /* Voice controls stay usable without telemetry. */ }
      return true
    },
  }
}
