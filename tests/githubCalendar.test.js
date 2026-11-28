import test from 'node:test'
import assert from 'node:assert/strict'
import { buildCalendar, validateActivity, dayDescription, calendarTarget } from '../src/lib/githubCalendar.js'

const fullDays = () => Array.from({ length: 365 }, (_, index) => ({ date: new Date(Date.UTC(2026, 0, index + 1)).toISOString().slice(0, 10), count: index === 0 ? 12 : 0, level: index === 0 ? 4 : 0 }))
const fixture = () => ({ username: 'CharlieJamesGwapo', profileUrl: 'https://github.com/CharlieJamesGwapo', year: 2026, updatedAt: '2026-11-28T01:00:00.000Z', stale: false, publicRepositories: 42, total: 12, days: fullDays() })

test('calendar places January 1 in its weekday and labels all twelve months without invented activity', () => {
  const calendar = buildCalendar([{ date: '2026-01-01', count: 12, level: 4 }], 2026)
  assert.equal(calendar.cells[4].date, '2026-01-01')
  assert.equal(calendar.cells[4].count, 12)
  assert.equal(calendar.cells[0], null)
  assert.equal(calendar.cells[5], null)
  assert.equal(calendar.months.length, 12)
  assert.equal(calendar.months[11].label, 'Dec')
  assert.equal(calendar.weeks, 53)
})

test('validates activity and rejects unsafe, duplicate, out-of-year and impossible dates', () => {
  assert.equal(validateActivity(fixture(), 2026).total, 12)
  for (const mutation of [
    { days: [] }, { days: fullDays().slice(1) }, { total: 13 }, { days: fullDays().map(day => ({ ...day, level: 0 })) }, { total: -1 }, { total: Number.MAX_SAFE_INTEGER + 1 }, { publicRepositories: '42' },
    { year: 2025 }, { username: 'someone-else' }, { updatedAt: 'not-a-date' },
    { days: [{ date: '2026-02-30', count: 0, level: 0 }] },
    { days: [{ date: '2025-01-01', count: 0, level: 0 }] },
    { days: [{ date: '2026-01-01', count: -1, level: 0 }] },
    { days: [{ date: '2026-01-01', count: 0, level: 5 }] },
    { days: [...fixture().days, ...fixture().days] },
  ]) assert.throws(() => validateActivity({ ...fixture(), ...mutation }, 2026))
})

test('formats UTC calendar dates and navigates available days without entering empty cells', () => {
  assert.equal(dayDescription({ date: '2026-01-01', count: 12 }), '12 contributions on January 1, 2026')
  assert.equal(dayDescription({ date: '2026-01-02', count: 1 }), '1 contribution on January 2, 2026')
  const cells = buildCalendar([{ date: '2026-01-01', count: 12, level: 4 }, { date: '2026-01-02', count: 0, level: 0 }, { date: '2026-01-08', count: 1, level: 1 }], 2026).cells
  assert.equal(calendarTarget(cells, 4, 'ArrowRight'), 11)
  assert.equal(calendarTarget(cells, 4, 'ArrowDown'), 5)
  assert.equal(calendarTarget(cells, 5, 'Home'), 4)
  assert.equal(calendarTarget(cells, 4, 'End'), 11)
  cells.findLastIndex = undefined // ES2020-era browsers do not provide this API.
  assert.equal(calendarTarget(cells, 4, 'End'), 11)
  assert.equal(calendarTarget(cells, 4, 'ArrowLeft'), 4)
})
