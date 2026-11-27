import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { sendHealthAlert } from '../scripts/send_portfolio_health_alert.mjs'

const KEY = 're_fake_test_only_private'
const clock = value => () => new Date(value)
const NOW = clock('2026-11-27T08:02:03.000Z')

function network(response = new Response('{}')) {
  const calls = []
  return { calls, fetchImpl: async (...args) => { calls.push(args); return response } }
}

test('outage email has fixed endpoint, exact recipient and only static public dashboard instructions', async () => {
  const { calls, fetchImpl } = network()
  const result = await sendHealthAlert({ key: KEY, fetchImpl, now: NOW, kind: 'outage', error: 'private enquiry text', diagnostics: { voice: 'private transcript' } })
  assert.deepEqual(result, { ok: true })
  assert.equal(calls.length, 1)
  const [url, options] = calls[0]
  assert.equal(url, 'https://api.resend.com/emails')
  assert.equal(options.method, 'POST')
  assert.equal(options.redirect, 'error')
  assert.equal(options.headers.Authorization, `Bearer ${KEY}`)
  assert.equal(options.headers['Idempotency-Key'], 'portfolio-health-outage-2026-11-27T08')
  assert.equal(options.headers['Content-Type'], 'application/json')
  const body = JSON.parse(options.body)
  assert.deepEqual(body, {
    from: 'Portfolio Health <onboarding@resend.dev>',
    to: ['capstonee2@gmail.com'],
    subject: 'Portfolio Health: availability check needs attention',
    text: 'Availability check needs attention; review dashboard.\n\nDashboard: https://us.posthog.com/project/769787/dashboard/2419841\nActions: https://github.com/CharlieJamesGwapo/portfoliobboy/actions/workflows/portfolio-health.yml',
  })
  assert.doesNotMatch(options.body, /re_fake|private|transcript|2026-11/)
  assert.equal(options.signal.aborted, true)
})

test('same UTC hour uses identical body and key, next hour rotates only key', async () => {
  const { calls, fetchImpl } = network()
  for (const when of ['2026-11-27T08:02:00Z', '2026-11-27T08:57:59Z', '2026-11-27T09:00:00Z']) {
    await sendHealthAlert({ key: KEY, fetchImpl, now: clock(when), kind: 'outage' })
  }
  assert.equal(new Set(calls.map(([, options]) => options.body)).size, 1)
  assert.equal(calls[0][1].headers['Idempotency-Key'], calls[1][1].headers['Idempotency-Key'])
  assert.notEqual(calls[1][1].headers['Idempotency-Key'], calls[2][1].headers['Idempotency-Key'])
})

test('setup test is clearly labelled and deduplicates by UTC day independently from outages', async () => {
  const { calls, fetchImpl } = network()
  for (const when of ['2026-11-27T08:02:00Z', '2026-11-27T23:57:59Z', '2026-11-28T00:00:00Z']) {
    assert.deepEqual(await sendHealthAlert({ key: KEY, fetchImpl, now: clock(when), kind: 'setup' }), { ok: true })
  }
  const bodies = calls.map(([, options]) => JSON.parse(options.body))
  assert.equal(new Set(calls.map(([, options]) => options.body)).size, 1)
  assert.equal(bodies[0].subject, '[Setup test] Portfolio Health email alerts')
  assert.match(bodies[0].text, /^This is a setup test for Portfolio Health email alerts\./)
  assert.doesNotMatch(bodies[0].text, /needs attention|outage|2026-11/)
  assert.deepEqual(bodies[0].to, ['capstonee2@gmail.com'])
  assert.equal(calls[0][1].headers['Idempotency-Key'], 'portfolio-health-setup-2026-11-27')
  assert.equal(calls[0][1].headers['Idempotency-Key'], calls[1][1].headers['Idempotency-Key'])
  assert.notEqual(calls[1][1].headers['Idempotency-Key'], calls[2][1].headers['Idempotency-Key'])
})

test('missing key, invalid kind/time/deadline fail without network or leaking arbitrary values', async () => {
  for (const values of [{ key: undefined }, { key: '' }, { kind: 'private data' }, { now: clock('invalid') }, { timeoutMs: 0 }, { timeoutMs: 5001 }]) {
    const { calls, fetchImpl } = network()
    const result = await sendHealthAlert({ key: KEY, fetchImpl, now: NOW, kind: 'outage', ...values })
    assert.deepEqual(result, { ok: false, reason: 'configuration' })
    assert.equal(calls.length, 0)
    assert.doesNotMatch(JSON.stringify(result), /re_fake|private/)
  }
})

test('provider rejection, redirects, network errors and private response content yield fixed failures', async () => {
  for (const status of [302, 401, 403, 409, 429, 500]) {
    const { calls, fetchImpl } = network(new Response('private response secret', { status }))
    const result = await sendHealthAlert({ key: KEY, fetchImpl, now: NOW, kind: 'outage' })
    assert.deepEqual(result, { ok: false, reason: 'delivery' })
    assert.equal(calls.length, 1)
  }
  const opaqueError = { get message() { assert.fail('must not inspect provider data') } }
  const result = await sendHealthAlert({ key: KEY, now: NOW, kind: 'outage', fetchImpl: async () => { throw opaqueError } })
  assert.deepEqual(result, { ok: false, reason: 'delivery' })
})

test('stalled provider is aborted within deadline with no retry or diagnostic exposure', async () => {
  let signal
  let count = 0
  const started = Date.now()
  const result = await sendHealthAlert({ key: KEY, now: NOW, kind: 'outage', timeoutMs: 15, fetchImpl: async (_, options) => {
    count++
    signal = options.signal
    return new Promise(() => {})
  } })
  assert.deepEqual(result, { ok: false, reason: 'delivery' })
  assert.equal(signal.aborted, true)
  assert.equal(count, 1)
  assert.ok(Date.now() - started < 1000)
})

test('CLI missing key and arbitrary arguments fail visibly with only fixed output', () => {
  for (const args of [[], ['--setup'], ['--to', 'private@example.com']]) {
    const result = spawnSync(process.execPath, ['scripts/send_portfolio_health_alert.mjs', ...args], { cwd: new URL('..', import.meta.url), env: { PATH: process.env.PATH }, encoding: 'utf8' })
    assert.equal(result.status, 1)
    assert.equal(result.stdout, '')
    assert.equal(result.stderr, 'health_email_failed configuration\n')
  }
})

test('workflow only sends on real monitor failure or explicit setup boolean and preserves failure', async () => {
  const workflow = await readFile(new URL('../.github/workflows/portfolio-health.yml', import.meta.url), 'utf8')
  assert.match(workflow, /test_email:\s+description:.*\s+required: false\s+default: false\s+type: boolean/)
  assert.match(workflow, /id: monitor\s+continue-on-error: true/)
  assert.match(workflow, /if: steps\.monitor\.outcome == 'failure'\s+run: node scripts\/send_portfolio_health_alert\.mjs\s/)
  assert.match(workflow, /if: github\.event_name == 'workflow_dispatch' && inputs\.test_email\s+run: node scripts\/send_portfolio_health_alert\.mjs --setup/)
  assert.match(workflow, /if: always\(\) && steps\.monitor\.outcome == 'failure'\s+run: exit 1/)
  assert.equal((workflow.match(/secrets\.PORTFOLIO_MONITOR_RESEND_KEY/g) || []).length, 2)
  assert.doesNotMatch(workflow, /enquiry|transcript|github\.event\.inputs\./)
})
