const DAY_MS = 86_400_000
const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
const numberFormat = new Intl.NumberFormat('en-US')
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const nonnegativeInteger = value => Number.isSafeInteger(value) && value >= 0

export function validateActivity(value, year) {
  const invalid = () => { throw new Error('GitHub activity is temporarily unavailable.') }
  if (!value || value.username !== 'CharlieJamesGwapo' || value.profileUrl !== 'https://github.com/CharlieJamesGwapo' || value.year !== year || !nonnegativeInteger(value.total) || !Array.isArray(value.days) || value.days.length > 366 || typeof value.stale !== 'boolean' || typeof value.updatedAt !== 'string' || !Number.isFinite(Date.parse(value.updatedAt)) || (value.publicRepositories !== null && !nonnegativeInteger(value.publicRepositories))) invalid()
  const expectedDays = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / DAY_MS
  if (value.days.length !== expectedDays) invalid()
  let sum = 0
  const dates = new Set()
  for (const day of value.days) {
    if (!day || typeof day.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day.date) || !day.date.startsWith(`${year}-`) || !nonnegativeInteger(day.count) || !Number.isInteger(day.level) || day.level < 0 || day.level > 4 || (day.count === 0) !== (day.level === 0) || dates.has(day.date)) invalid()
    const timestamp = Date.parse(`${day.date}T00:00:00Z`)
    if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== day.date) invalid()
    dates.add(day.date)
    sum += day.count
  }
  if (!Number.isSafeInteger(sum) || sum !== value.total) invalid()
  return { ...value, days: [...value.days].sort((a, b) => a.date.localeCompare(b.date)) }
}

export function buildCalendar(days, year) {
  const start = Date.UTC(year, 0, 1)
  const end = Date.UTC(year + 1, 0, 1)
  const offset = new Date(start).getUTCDay()
  const weeks = Math.ceil((offset + (end - start) / DAY_MS) / 7)
  const cells = Array(weeks * 7).fill(null)
  for (const day of days) cells[offset + (Date.parse(`${day.date}T00:00:00Z`) - start) / DAY_MS] = day
  const months = monthNames.map((label, month) => ({ label, column: Math.floor((offset + (Date.UTC(year, month, 1) - start) / DAY_MS) / 7) + 1 }))
  return { cells, weeks, months }
}

export function dayDescription(day) {
  return `${numberFormat.format(day.count)} ${day.count === 1 ? 'contribution' : 'contributions'} on ${dateFormat.format(new Date(`${day.date}T00:00:00Z`))}`
}

export function calendarTarget(cells, index, key) {
  if (key === 'Home') return cells.findIndex(Boolean)
  if (key === 'End') {
    for (let last = cells.length - 1; last >= 0; last--) if (cells[last]) return last
    return -1
  }
  const step = { ArrowRight: 7, ArrowLeft: -7, ArrowDown: 1, ArrowUp: -1 }[key]
  if (!step) return index
  for (let next = index + step; next >= 0 && next < cells.length; next += step) if (cells[next]) return next
  return index
}
