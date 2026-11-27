// Operational telemetry accepts enums only. Never add free-text diagnostics.
export const HEALTH_ERROR_EVENT = 'portfolio_health_error'
export const UPTIME_EVENT = 'portfolio_uptime_checked'
export const UPTIME_TARGETS = Object.freeze(['homepage', 'entry_bundle', 'contact_api', 'analytics_api', 'health_api'])
const appCodes = ['app_unhandled', 'app_unhandled_rejection', 'asset_load_failed']
const voiceCodes = ['voice_start_failed', 'voice_connection_lost', 'voice_send_failed']
const contactCodes = ['contact_verification_unavailable', 'contact_config_missing', 'contact_mail_rejected', 'contact_mail_timeout', 'contact_mail_failed']

function valuesOnly(properties, keys) {
  if (!properties || typeof properties !== 'object' || Array.isArray(properties)) return null
  const prototype = Object.getPrototypeOf(properties)
  if (prototype !== Object.prototype && prototype !== null) return null
  const descriptors = Object.getOwnPropertyDescriptors(properties)
  const found = Reflect.ownKeys(descriptors)
  if (found.length !== keys.length || found.some(key => !keys.includes(key))) return null
  if (keys.some(key => !Object.hasOwn(descriptors[key], 'value'))) return null
  return Object.fromEntries(keys.map(key => [key, descriptors[key].value]))
}

export function normalizeHealthEvent(event, properties, { allowServer = false, allowUptime = false } = {}) {
  if (event === HEALTH_ERROR_EVENT) {
    const safe = valuesOnly(properties, ['surface', 'code'])
    if (!safe) return null
    const codes = safe.surface === 'app' ? appCodes
      : ['voice_home', 'voice_panel'].includes(safe.surface) ? voiceCodes
        : allowServer && safe.surface === 'contact' ? contactCodes : []
    return codes.includes(safe.code) ? { event, properties: safe } : null
  }
  if (event === UPTIME_EVENT && allowUptime) {
    const safe = valuesOnly(properties, ['target', 'status', 'latency_bucket', 'source'])
    if (!safe || !UPTIME_TARGETS.includes(safe.target) || !['up', 'down'].includes(safe.status)
      || !['fast', 'slow', 'timeout'].includes(safe.latency_bucket)
      || !['github_actions', 'manual_check'].includes(safe.source)) return null
    return { event, properties: safe }
  }
  return null
}
