import test from 'node:test'
import assert from 'node:assert/strict'

// These tests protect the anonymous public-data boundary, cache lifetime and
// failure behavior. No GitHub requests or credentials are used by the suite.
import { parseContributions, createGitHubActivityService } from '../server/githubActivity.js'
import { createGitHubActivityHandler } from '../api/github-activity.js'
const START = Date.parse('2026-11-28T00:00:00Z')

function calendar(year = 2026) {
  const end = Date.UTC(year + 1, 0, 1)
  const cells = []
  let index = 0
  for (let time = Date.UTC(year, 0, 1); time < end; time += 86400000) {
    const date = new Date(time)
    const count = index === 0 ? 1200 : index === 1 ? 1 : 0
    const day = date.getUTCDate()
    const suffix = day % 100 >= 11 && day % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[day % 10] || 'th')
    const label = `${date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })} ${day}${suffix}`
    cells.push(`<td id="day-${index}" data-level="${count ? 4 : 0}" data-date="${date.toISOString().slice(0, 10)}"></td><tool-tip for="day-${index}">${count ? `${count.toLocaleString('en-US')} contribution${count === 1 ? '' : 's'}` : 'No contributions'} on ${label}.</tool-tip>`)
    index++
  }
  return `<h2 id="js-contribution-activity-description">1,201 contributions in ${year}</h2>${cells.reverse().join('')}`
}

function response(body, status = 200) { return new Response(body, { status }) }
function fetchCalendar(html = calendar()) {
  return async url => response(url.startsWith('https://api.github.com/') ? JSON.stringify({ public_repos: 37, email: 'private@example.com', private_repos: 99 }) : html)
}
function res() {
  return { headers: {}, statusCode: 0, body: undefined, ended: false,
    setHeader(name, value) { this.headers[name] = value },
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this },
    end() { this.ended = true; return this },
  }
}

test('parses all dates chronologically, deriving counts and total from the public calendar', () => {
  assert.equal(typeof parseContributions, 'function', 'calendar parser is implemented')
  const parsed = parseContributions(calendar(), 2026)
  assert.equal(parsed.total, 1201)
  assert.equal(parsed.days.length, 365)
  assert.deepEqual(parsed.days[0], { date: '2026-01-01', count: 1200, level: 4 })
  assert.deepEqual(parsed.days[364], { date: '2026-12-31', count: 0, level: 0 })
  assert.equal(parseContributions(calendar(2024), 2024).days.length, 366)
})

test('rejects missing, duplicate or invalid dates, levels, counts, labels and summary totals', () => {
  assert.equal(typeof parseContributions, 'function')
  const html = calendar()
  for (const malformed of [
    html.replace('data-date="2026-01-01"', 'data-date="2026-02-30"'),
    html.replace('data-date="2026-01-01"', 'data-date="2026-01-02"'),
    html.replace('data-level="4"', 'data-level="9"'),
    html.replace('1,200 contributions', '<b>1,200</b> contributions'),
    html.replace('1,200 contributions', '-1 contributions'),
    html.replace('on January 1st.', 'on January 2nd.'),
    html.replace('1,201 contributions in 2026', '1,202 contributions in 2026'),
    html.replace(/<td id="day-0"[^>]*><\/td>/, ''),
    '<html>upstream sign-in page</html>',
  ]) assert.throws(() => parseContributions(malformed, 2026))
})

test('fetches only fixed anonymous GitHub URLs and returns only the public contract', async () => {
  assert.equal(typeof createGitHubActivityService, 'function')
  const requests = []
  const getActivity = createGitHubActivityService({ now: () => START, fetchImpl: async (url, options) => {
    requests.push({ url, options })
    return fetchCalendar()(url)
  } })
  const value = await getActivity(2026)
  assert.deepEqual(Object.keys(value).sort(), ['username', 'profileUrl', 'year', 'updatedAt', 'stale', 'publicRepositories', 'total', 'days'].sort())
  assert.equal(value.username, 'CharlieJamesGwapo')
  assert.equal(value.profileUrl, 'https://github.com/CharlieJamesGwapo')
  assert.equal(value.updatedAt, '2026-11-28T00:00:00.000Z')
  assert.equal(value.stale, false)
  assert.equal(value.publicRepositories, 37)
  assert.equal(value.total, 1201)
  assert.deepEqual(requests.map(({ url }) => url).sort(), ['https://api.github.com/users/CharlieJamesGwapo', 'https://github.com/users/CharlieJamesGwapo/contributions?from=2026-01-01&to=2026-12-31'].sort())
  for (const { options } of requests) {
    assert.equal(options.redirect, 'error')
    assert.equal(options.credentials, 'omit')
    assert.equal(options.headers.Authorization, undefined)
    assert.ok(options.signal instanceof AbortSignal)
  }
  await assert.rejects(getActivity('https://evil.example/'))
  await assert.rejects(getActivity(2024))
})

test('coalesces in-flight requests and caches successful years for one hour independently', async () => {
  assert.equal(typeof createGitHubActivityService, 'function')
  let time = START
  let calls = 0
  const getActivity = createGitHubActivityService({ now: () => time, fetchImpl: async url => {
    calls++
    return response(url.startsWith('https://api.github.com/') ? '{}' : calendar(url.includes('2025') ? 2025 : 2026))
  } })
  const results = await Promise.all([getActivity(2026), getActivity(2026), getActivity(2026)])
  assert.deepEqual(results[0], results[2])
  assert.equal(calls, 2)
  time += 3599999
  await getActivity(2026)
  assert.equal(calls, 2)
  await getActivity(2025)
  assert.equal(calls, 4)
  time++
  assert.equal((await getActivity(2026)).updatedAt, '2026-11-28T01:00:00.000Z')
  assert.equal(calls, 6)
})

test('serves last good calendar for up to 24 hours without changing its timestamp, with failure backoff', async () => {
  assert.equal(typeof createGitHubActivityService, 'function')
  let time = START
  let broken = false
  let calls = 0
  const getActivity = createGitHubActivityService({ now: () => time, fetchImpl: async url => {
    calls++
    if (broken) throw new Error('secret upstream failure')
    return fetchCalendar()(url)
  } })
  await getActivity(2026)
  broken = true
  time += 3600000
  const stale = await getActivity(2026)
  assert.equal(stale.stale, true)
  assert.equal(stale.updatedAt, '2026-11-28T00:00:00.000Z')
  const failedCalls = calls
  await getActivity(2026)
  assert.equal(calls, failedCalls)
  time += 86400000
  await assert.rejects(getActivity(2026))
})

test('backs off initial failures and ignores optional public-profile failure', async () => {
  assert.equal(typeof createGitHubActivityService, 'function')
  let calls = 0
  const unavailable = createGitHubActivityService({ now: () => START, fetchImpl: async () => { calls++; throw new Error('private') } })
  await assert.rejects(unavailable(2026))
  const firstCalls = calls
  await assert.rejects(unavailable(2026))
  assert.equal(calls, firstCalls)
  const getActivity = createGitHubActivityService({ now: () => START, fetchImpl: async url => {
    if (url.startsWith('https://api.github.com/')) throw new Error('rate limited')
    return response(calendar())
  } })
  assert.equal((await getActivity(2026)).publicRepositories, null)
})

test('rejects oversized bodies and aborts stalled body consumption within the complete deadline', async () => {
  assert.equal(typeof createGitHubActivityService, 'function')
  const oversized = createGitHubActivityService({ now: () => START, fetchImpl: async () => response('x'.repeat(1_100_000)) })
  await assert.rejects(oversized(2026))
  let aborted = false
  const stalled = createGitHubActivityService({ now: () => START, timeoutMs: 15, fetchImpl: async (url, { signal }) => {
    signal.addEventListener('abort', () => { aborted = true })
    return new Response(new ReadableStream({ start() {} }))
  } })
  await assert.rejects(stalled(2026))
  assert.equal(aborted, true)
})

test('cancels rejected upstream bodies before reading, without awaiting broken cancellation', async () => {
  for (const upstream of [
    { status: 503 },
    { status: 200, headers: { 'Content-Length': '2000000' } },
  ]) {
    for (const cancellation of ['success', 'reject', 'stall']) {
      let cancelled = 0
      let deadlineAborted = false
      const getActivity = createGitHubActivityService({ now: () => START, timeoutMs: 30, fetchImpl: async (url, { signal }) => {
        if (url.startsWith('https://api.github.com/')) return response('{}')
        signal.addEventListener('abort', () => { deadlineAborted = true })
        return new Response(new ReadableStream({
          cancel() {
            cancelled++
            if (cancellation === 'reject') return Promise.reject(new Error('private cancellation failure'))
            if (cancellation === 'stall') return new Promise(() => {})
          },
        }), upstream)
      } })
      await assert.rejects(getActivity(2026))
      assert.equal(cancelled, 1, `${upstream.status}/${cancellation}`)
      assert.equal(deadlineAborted, false, 'invalid response returns immediately without waiting for cancellation')
    }
  }
})

test('route accepts only current/previous year and GET/HEAD, and never forwards invalid queries', async () => {
  assert.equal(typeof createGitHubActivityHandler, 'function')
  let calls = 0
  const handler = createGitHubActivityHandler({ now: () => START, getActivity: async year => { calls++; return { year } } })
  for (const url of ['/api/github-activity?year=2024', '/api/github-activity?year=2027', '/api/github-activity?year=2026&year=2025', '/api/github-activity?username=other', '/api/github-activity?year=2026&token=secret', '/api/github-activity?year=02026']) {
    const result = res()
    await handler({ method: 'GET', url }, result)
    assert.equal(result.statusCode, 400, url)
    assert.equal(result.headers['Cache-Control'], 'no-store')
  }
  const invalidMethod = res()
  await handler({ method: 'POST', url: '/api/github-activity' }, invalidMethod)
  assert.equal(invalidMethod.statusCode, 405)
  assert.equal(invalidMethod.headers.Allow, 'GET, HEAD')
  assert.equal(calls, 0)
  for (const [url, year] of [['/api/github-activity', 2026], ['/api/github-activity?year=2025', 2025]]) {
    const result = res()
    await handler({ method: 'GET', url }, result)
    assert.equal(result.statusCode, 200)
    assert.deepEqual(result.body, { year })
    for (const header of ['Cache-Control', 'CDN-Cache-Control', 'Vercel-CDN-Cache-Control']) assert.match(result.headers[header], /public.*s-maxage=3600.*stale-while-revalidate=/)
  }
  const head = res()
  await handler({ method: 'HEAD', url: '/api/github-activity' }, head)
  assert.equal(head.statusCode, 200)
  assert.equal(head.body, undefined)
  assert.equal(head.ended, true)
})

test('route sanitizes upstream errors and overrides all global CDN caching for errors', async () => {
  assert.equal(typeof createGitHubActivityHandler, 'function')
  const handler = createGitHubActivityHandler({ now: () => START, getActivity: async () => { throw new Error('secret upstream response') } })
  for (const method of ['GET', 'HEAD']) {
    const result = res()
    await handler({ method, url: '/api/github-activity?year=2026' }, result)
    assert.equal(result.statusCode, 503)
    assert.equal(result.headers['X-Robots-Tag'], 'noindex, nofollow, nosnippet')
    for (const header of ['Cache-Control', 'CDN-Cache-Control', 'Vercel-CDN-Cache-Control']) assert.equal(result.headers[header], 'no-store')
    if (method === 'GET') assert.deepEqual(result.body, { error: 'GitHub activity is temporarily unavailable' })
    else assert.equal(result.body, undefined)
  }
})

test('concurrent upstream failures are single-flight and enter the same failure backoff', async () => {
  let calls = 0
  const getActivity = createGitHubActivityService({ now: () => START, fetchImpl: async () => {
    calls++
    throw new Error('private upstream failure')
  } })
  const results = await Promise.allSettled([getActivity(2026), getActivity(2026), getActivity(2026)])
  assert.ok(results.every(result => result.status === 'rejected'))
  assert.equal(calls, 2)
  await assert.rejects(getActivity(2026))
  assert.equal(calls, 2)
})

test('stale last-good responses cannot gain another CDN lifetime beyond the 24-hour limit', async () => {
  const handler = createGitHubActivityHandler({ now: () => START, getActivity: async () => ({ stale: true, updatedAt: '2026-11-27T01:00:00Z' }) })
  const result = res()
  await handler({ method: 'GET', url: '/api/github-activity' }, result)
  assert.equal(result.statusCode, 200)
  assert.equal(result.body.stale, true)
  for (const header of ['Cache-Control', 'CDN-Cache-Control', 'Vercel-CDN-Cache-Control']) assert.equal(result.headers[header], 'no-store')
})
