import { normalizeAnalyticsEvent } from '../../shared/portfolioAnalytics.js'

// Explicit aggregate events only. No browser SDK, cookies, storage, queue or
// visitor identifier. A failure must never affect the action being measured.
export function createPortfolioTracker({ enabled = false, fetchImpl = globalThis.fetch, navigatorImpl = globalThis.navigator } = {}) {
  return (event, properties) => {
    if (!enabled || navigatorImpl?.doNotTrack === '1' || navigatorImpl?.globalPrivacyControl === true) return false
    const payload = normalizeAnalyticsEvent(event, properties)
    if (!payload || typeof fetchImpl !== 'function') return false
    try {
      Promise.resolve(fetchImpl('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        keepalive: true,
        body: JSON.stringify(payload),
      })).catch(() => {})
      return true
    } catch { return false }
  }
}

export const portfolioAnalyticsEnabled = import.meta.env?.VITE_PORTFOLIO_ANALYTICS_ENABLED === 'true'

export const trackPortfolioEvent = createPortfolioTracker({
  enabled: portfolioAnalyticsEnabled,
  fetchImpl: (...args) => globalThis.fetch(...args),
})

export function trackBookingClick(event, surface, bookingId) {
  if (event.type !== 'click' && !(event.type === 'auxclick' && event.button === 1)) return
  trackPortfolioEvent('portfolio_booking_clicked', { surface, booking_id: bookingId })
}
