const USERNAME = 'CharlieJamesGwapo'
const PROFILE_URL = `https://github.com/${USERNAME}`
const PROFILE_API_URL = `https://api.github.com/users/${USERNAME}`
const HOUR = 60 * 60 * 1000
const MAX_STALE = 24 * HOUR
const FAILURE_BACKOFF = 60 * 1000
const NUMBER = '(?:0|[1-9]\\d*|[1-9]\\d{0,2}(?:,\\d{3})+)'
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function invalidCalendar() { throw new Error('Invalid public contribution calendar') }

// This is a deliberately narrow parser for GitHub's public calendar, not an
// HTML passthrough. Markup changes fail closed; only validated numbers and UTC
// dates can leave this module.
function attribute(attributes, name) {
  const values = [...attributes.matchAll(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(["'])(.*?)\\1`, 'g'))]
  if (values.length !== 1) invalidCalendar()
  return values[0][2]
}

function number(text, max) {
  if (!new RegExp(`^${NUMBER}$`).test(text)) invalidCalendar()
  const value = Number(text.replaceAll(',', ''))
  if (!Number.isSafeInteger(value) || value > max) invalidCalendar()
  return value
}

function dateLabel(date) {
  const day = date.getUTCDate()
  const suffix = day % 100 >= 11 && day % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[day % 10] || 'th')
  return `${MONTHS[date.getUTCMonth()]} ${day}${suffix}.`
}

export function parseContributions(html, year) {
  if (typeof html !== 'string' || html.length > 1_048_576 || !Number.isInteger(year) || year < 2000 || year > 9999) invalidCalendar()
  const summaries = [...html.matchAll(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/g)]
    .filter(match => /\bid=["']js-contribution-activity-description["']/.test(match[1]))
  if (summaries.length !== 1) invalidCalendar()
  const summary = summaries[0][2].trim().match(new RegExp(`^(${NUMBER})\\s+contributions?\\s+in\\s+${year}$`))
  if (!summary) invalidCalendar()
  const total = number(summary[1], 366_000_000)
  const tooltips = new Map()
  for (const match of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)) {
    const id = attribute(match[1], 'for')
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id) || tooltips.has(id)) invalidCalendar()
    tooltips.set(id, match[2].trim())
  }
  const days = []
  const dates = new Set()
  const ids = new Set()
  for (const match of html.matchAll(/<td\b([^>]*)>/g)) {
    if (!/\bdata-date\s*=/.test(match[1])) continue
    const date = attribute(match[1], 'data-date')
    const id = attribute(match[1], 'id')
    const levelText = attribute(match[1], 'data-level')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !date.startsWith(`${year}-`) || dates.has(date)
      || !/^[a-zA-Z0-9_-]{1,100}$/.test(id) || ids.has(id) || !/^[0-4]$/.test(levelText)) invalidCalendar()
    const parsedDate = new Date(`${date}T00:00:00.000Z`)
    if (!Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) invalidCalendar()
    const tooltip = tooltips.get(id)
    const label = dateLabel(parsedDate)
    if (typeof tooltip !== 'string' || !tooltip.endsWith(` on ${label}`)) invalidCalendar()
    const countText = tooltip.slice(0, -` on ${label}`.length)
    const contribution = countText.match(new RegExp(`^(${NUMBER}) contributions?$`))
    const count = countText === 'No contributions' ? 0 : contribution ? number(contribution[1], 1_000_000) : invalidCalendar()
    const level = Number(levelText)
    if ((count === 0) !== (level === 0)) invalidCalendar()
    days.push({ date, count, level })
    dates.add(date)
    ids.add(id)
  }
  days.sort((left, right) => left.date.localeCompare(right.date))
  const start = Date.UTC(year, 0, 1)
  const length = (Date.UTC(year + 1, 0, 1) - start) / 86_400_000
  if (days.length !== length || days.some((day, index) => day.date !== new Date(start + index * 86_400_000).toISOString().slice(0, 10))
    || days.reduce((sum, day) => sum + day.count, 0) !== total) invalidCalendar()
  return { total, days }
}

async function boundedText(response, limit) {
  if (!response.ok || !response.body || Number(response.headers.get('content-length')) > limit) {
    // Rejected headers must also release the upstream stream. Do not await
    // cancellation: a broken stream must not extend the bounded request.
    if (response.body) void response.body.cancel().catch(() => {})
    throw new Error('Unavailable public upstream')
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8', { fatal: true })
  let bytes = 0
  let text = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > limit) throw new Error('Public upstream body too large')
      text += decoder.decode(value, { stream: true })
    }
    return text + decoder.decode()
  } catch (error) {
    // Cancellation is best effort; never let a stalled cancellation extend the
    // request deadline or cause an unhandled rejection.
    void reader.cancel().catch(() => {})
    throw error
  } finally { reader.releaseLock() }
}

function allowedYear(year, time) {
  const currentYear = new Date(time).getUTCFullYear()
  return Number.isInteger(year) && [currentYear, currentYear - 1].includes(year)
}

export function createGitHubActivityService({ fetchImpl = globalThis.fetch, now = Date.now, timeoutMs = 6000 } = {}) {
  const cache = new Map()

  async function fetchPublic(url, accept, limit) {
    const controller = new AbortController()
    let timer
    const deadline = new Promise((_, reject) => {
      timer = setTimeout(() => {
        controller.abort()
        reject(new Error('Public GitHub request timed out'))
      }, timeoutMs)
    })
    try {
      return await Promise.race([deadline, (async () => {
        const response = await fetchImpl(url, {
          method: 'GET', redirect: 'error', credentials: 'omit', signal: controller.signal,
          headers: { Accept: accept, 'User-Agent': 'CharlieJamesGwapo-Portfolio-Public-Activity' },
        })
        return boundedText(response, limit)
      })()])
    } finally { clearTimeout(timer) }
  }

  async function refresh(year) {
    const calendarUrl = `https://github.com/users/${USERNAME}/contributions?from=${year}-01-01&to=${year}-12-31`
    const [calendar, publicRepositories] = await Promise.all([
      fetchPublic(calendarUrl, 'text/html', 1_048_576).then(html => parseContributions(html, year)),
      fetchPublic(PROFILE_API_URL, 'application/vnd.github+json', 32_768).then(text => {
        const profile = JSON.parse(text)
        return Number.isSafeInteger(profile.public_repos) && profile.public_repos >= 0 && profile.public_repos <= 1_000_000 ? profile.public_repos : null
      }).catch(() => null),
    ])
    return { username: USERNAME, profileUrl: PROFILE_URL, year, updatedAt: new Date(now()).toISOString(), stale: false, publicRepositories, ...calendar }
  }

  return async function getActivity(year = new Date(now()).getUTCFullYear()) {
    const time = now()
    if (!allowedYear(year, time)) throw new Error('Unsupported contribution year')
    for (const key of cache.keys()) if (!allowedYear(key, time)) cache.delete(key)
    let entry = cache.get(year)
    if (!entry) { entry = {}; cache.set(year, entry) }
    if (entry.value && time - entry.fetchedAt < HOUR) return entry.value
    const lastGood = () => {
      if (entry.value && now() - entry.fetchedAt <= MAX_STALE) return { ...entry.value, stale: true }
      throw new Error('Public GitHub activity unavailable')
    }
    if (entry.retryAt && time < entry.retryAt) return lastGood()
    if (!entry.pending) {
      entry.pending = refresh(year).then(value => {
        entry.value = value
        entry.fetchedAt = Date.parse(value.updatedAt)
        entry.retryAt = 0
        return value
      }).catch(() => {
        entry.retryAt = now() + FAILURE_BACKOFF
        return lastGood()
      }).finally(() => { entry.pending = null })
    }
    return entry.pending
  }
}

export const getGitHubActivity = createGitHubActivityService()
