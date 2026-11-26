import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ANALYTICS_EVENTS } from '../shared/portfolioAnalytics.js'
const definition = JSON.parse(readFileSync(new URL('../docs/analytics/portfolio-dashboard.json', import.meta.url)))

test('dashboard counts actions rather than anonymous random IDs as visitors or a conversion funnel', () => {
  const allowed = new Set(Object.values(ANALYTICS_EVENTS))
  for (const insight of definition.insights) {
    assert.equal(insight.query.source.kind, 'TrendsQuery')
    for (const series of insight.query.source.series) {
      assert(allowed.has(series.event))
      assert.equal(series.math, 'total')
    }
  }
  const totals = definition.insights.filter(insight => insight.query.source.trendsFilter.display === 'Metric')
  assert.equal(totals.length, 5)
  assert.deepEqual(new Set(totals.map(insight => insight.query.source.series[0].event)), allowed)
  assert.match(definition.textTile.body, /not unique people/)
  assert.match(definition.textTile.body, /does not confirm inbox delivery/)
})

test('dashboard tiles do not overlap or place unrelated count series into the contact total', () => {
  const boxes = [definition.textTile.layout, ...definition.insights.map(insight => insight.layout)]
  for (let i = 0; i < boxes.length; i++) {
    const a = boxes[i]
    assert(a.x >= 0 && a.x + a.w <= 12 && a.y >= 0)
    for (const b of boxes.slice(i + 1)) {
      assert(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y, 'dashboard tiles overlap')
    }
  }
  const contact = definition.insights.find(insight => insight.name === 'Contact messages accepted')
  assert.deepEqual(contact.query.source.series.map(series => series.event), ['portfolio_contact_submitted'])
})
