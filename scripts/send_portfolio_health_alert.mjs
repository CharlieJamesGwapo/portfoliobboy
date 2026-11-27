import { pathToFileURL } from 'node:url'

const ENDPOINT = 'https://api.resend.com/emails'
const LINKS = '\n\nDashboard: https://us.posthog.com/project/769787/dashboard/2419841\nActions: https://github.com/CharlieJamesGwapo/portfoliobboy/actions/workflows/portfolio-health.yml'
const MESSAGES = Object.freeze({
  outage: Object.freeze({
    subject: 'Portfolio Health: availability check needs attention',
    text: `Availability check needs attention; review dashboard.${LINKS}`,
  }),
  setup: Object.freeze({
    subject: '[Setup test] Portfolio Health email alerts',
    text: `This is a setup test for Portfolio Health email alerts.${LINKS}`,
  }),
})

// No diagnostic payload is accepted. Retries within the same UTC bucket use
// identical keys and bodies so Resend returns the previous send instead of spam.
export async function sendHealthAlert({ key, fetchImpl = fetch, now = () => new Date(), kind = 'outage', timeoutMs = 5000 } = {}) {
  let bucket
  try {
    if (typeof key !== 'string' || !key.trim() || !Object.hasOwn(MESSAGES, kind)
      || !Number.isFinite(timeoutMs) || timeoutMs < 1 || timeoutMs > 5000) {
      return { ok: false, reason: 'configuration' }
    }
    const date = now()
    if (!(date instanceof Date) || !Number.isFinite(date.getTime())) return { ok: false, reason: 'configuration' }
    bucket = date.toISOString().slice(0, kind === 'outage' ? 13 : 10)
  } catch { return { ok: false, reason: 'configuration' } }

  const controller = new AbortController()
  let timer
  let response
  try {
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        controller.abort()
        reject()
      }, timeoutMs)
    })
    response = await Promise.race([
      Promise.resolve().then(() => fetchImpl(ENDPOINT, {
        method: 'POST',
        redirect: 'error',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `portfolio-health-${kind}-${bucket}`,
        },
        body: JSON.stringify({
          from: 'Portfolio Health <onboarding@resend.dev>',
          to: ['capstonee2@gmail.com'],
          ...MESSAGES[kind],
        }),
      })),
      timeout,
    ])
    return response.redirected !== true && response.status >= 200 && response.status < 300
      ? { ok: true } : { ok: false, reason: 'delivery' }
  } catch {
    // Provider messages and response bodies can contain private data; never
    // inspect them or include them in workflow logs, email or return values.
    return { ok: false, reason: 'delivery' }
  } finally {
    clearTimeout(timer)
    controller.abort()
    try { void response?.body?.cancel().catch(() => {}) } catch { /* best effort */ }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2)
  const kind = args.length === 0 ? 'outage' : args.length === 1 && args[0] === '--setup' ? 'setup' : null
  const result = kind
    ? await sendHealthAlert({ key: process.env.PORTFOLIO_MONITOR_RESEND_KEY, kind })
    : { ok: false, reason: 'configuration' }
  if (!result.ok) {
    console.error(`health_email_failed ${result.reason}`)
    process.exitCode = 1
  } else {
    console.log(`health_email_accepted ${kind}`)
  }
}
