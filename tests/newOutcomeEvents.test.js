import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeAnalyticsEvent } from '../shared/portfolioAnalytics.js'

test('export and scheduler counts accept only fixed action data', () => {
  for (const event of ['portfolio_brief_downloaded', 'portfolio_brief_print_opened']) {
    for (const surface of ['text_guide', 'voice_home', 'voice_panel']) assert.deepEqual(normalizeAnalyticsEvent(event, { surface }), { event, properties: { surface } })
    assert.equal(normalizeAnalyticsEvent(event, { surface: 'text_guide', message: 'private' }), null)
    assert.equal(normalizeAnalyticsEvent(event, { surface: 'contact' }), null)
  }
  assert.deepEqual(normalizeAnalyticsEvent('portfolio_booking_clicked', { surface: 'contact', booking_id: 'intro' }), { event: 'portfolio_booking_clicked', properties: { surface: 'contact', booking_id: 'intro' } })
  for (const properties of [{ surface: 'text_guide' }, { surface: 'text_guide', booking_id: 'private@example.com' }, { surface: 'text_guide', booking_id: 'intro', url: 'https://private.test' }]) assert.equal(normalizeAnalyticsEvent('portfolio_booking_clicked', properties), null)
})
