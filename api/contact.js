import { createHash } from 'node:crypto'
import { capturePortfolioEvent } from '../server/portfolioAnalytics.js'
import { isAllowedPortfolioOrigin } from '../server/requestSecurity.js'
import { verifyContactBot } from '../server/contactBotVerification.js'

const LIMITS = { name: 120, email: 254, subject: 200, message: 5000 }
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_BODY_BYTES = 32768
const WINDOW_MS = 10 * 60 * 1000
const submissions = new Map()
const failureReports = new Map()

async function reportContactFailure(req, code) {
  if (req.headers.dnt === '1' || req.headers['sec-gpc'] === '1') return
  // Fixed category keys only (five possible codes), no visitor state. Outage
  // paths run before the mail-submission limiter, so independently bound them.
  const now = Date.now()
  if ((failureReports.get(code) || 0) > now) return
  failureReports.set(code, now + 60000)
  await capturePortfolioEvent('portfolio_health_error', { surface: 'contact', code })
}

// A bounded, per-instance abuse backstop. Distributed enforcement belongs in
// the Vercel Firewall; this is deliberately not described as a global limit.
function retryAfter(req) {
  const now = Date.now()
  for (const [key, entry] of submissions) {
    if (entry.reset <= now) submissions.delete(key)
  }
  const forwarded = process.env.VERCEL === '1' ? req.headers['x-vercel-forwarded-for'] : null
  const address = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : null)
    || req.socket?.remoteAddress || 'unknown'
  const key = createHash('sha256').update(address).digest('hex')
  let entry = submissions.get(key)
  if (!entry) {
    if (submissions.size >= 1000) return 60
    entry = { count: 0, reset: now + WINDOW_MS }
    submissions.set(key, entry)
  }
  if (entry.count >= 5) return Math.max(1, Math.ceil((entry.reset - now) / 1000))
  entry.count++
  return 0
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store')
  res.setHeader('CDN-Cache-Control', 'no-store')
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store')
  const origin = req.headers.origin

  if (!isAllowedPortfolioOrigin(origin)) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    if (Number(req.headers['content-length']) > MAX_BODY_BYTES) {
      return res.status(413).json({ error: 'Request too large' })
    }
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) {
      return res.status(415).json({ error: 'Expected application/json' })
    }
    const body = req.body && typeof req.body === 'object' ? req.body : {}
    if (Buffer.byteLength(JSON.stringify(body)) > MAX_BODY_BYTES) {
      return res.status(413).json({ error: 'Request too large' })
    }
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const subject = typeof body.subject === 'string' ? body.subject.trim() : ''
    const message = typeof body.message === 'string' ? body.message.trim() : ''

    // Honeypot. The field is off-screen and never focusable, so a human cannot
    // have filled it. Answer 200 rather than 4xx: a rejection tells the bot
    // exactly which field gave it away, and it will simply stop sending that
    // one next time.
    if (typeof body.company === 'string' && body.company.trim() !== '') {
      return res.status(200).json({ success: true, message: 'Email sent successfully' })
    }

    const verification = await verifyContactBot(req)
    if (!verification.allowed) {
      if (verification.code === 'BOT_VERIFICATION_UNAVAILABLE') await reportContactFailure(req, 'contact_verification_unavailable')
      return res.status(verification.status).json({ error: 'Verification could not complete. Please use the email option.', code: verification.code })
    }

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    // Cap field lengths so a single request can't be used to blast a huge
    // payload through the mail provider.
    const tooLong = Object.entries({ name, email, subject, message })
      .find(([field, value]) => value.length > LIMITS[field])
    if (tooLong) {
      return res.status(400).json({ error: `${tooLong[0]} is too long` })
    }

    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required' })
    }

    const submissionId = body.submissionId
    if (submissionId !== undefined && (typeof submissionId !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(submissionId))) {
      return res.status(400).json({ error: 'Invalid submission identity' })
    }
    // Resend keeps this key for 24 hours. Retrying the same draft after an
    // ambiguous network failure cannot deliver it twice, even across instances.
    const idempotencyKey = submissionId ? 'contact/' + createHash('sha256').update(JSON.stringify([submissionId, name, email, subject, message])).digest('hex') : null

    // Check environment variables
    if (!process.env.RESEND_API_KEY) {
      console.error('Contact delivery configuration unavailable')
      await reportContactFailure(req, 'contact_config_missing')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    const seconds = retryAfter(req)
    if (seconds) {
      res.setHeader('Retry-After', String(seconds))
      return res.status(429).json({ error: 'Too many messages. Please try again later.' })
    }

    // Sanitize inputs for HTML
    const sanitize = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

    const safeName = sanitize(name)
    const safeEmail = sanitize(email)
    const safeSubject = sanitize(subject)
    const safeMessage = sanitize(message)

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 20px; border-radius: 12px 12px 0 0;">
            <h2 style="color: white; margin: 0;">New Contact Form Message</h2>
          </div>
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 12px;"><strong>Name:</strong> ${safeName}</p>
            <p style="margin: 0 0 12px;"><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
            <p style="margin: 0 0 12px;"><strong>Subject:</strong> ${safeSubject}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p style="margin: 0 0 8px;"><strong>Message:</strong></p>
            <p style="margin: 0; white-space: pre-wrap; color: #374151;">${safeMessage}</p>
          </div>
        </div>
      `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: AbortSignal.timeout(6000),
      headers: {
        Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json',
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: ['capstonee2@gmail.com'],
        reply_to: email,
        // Strip CR/LF before the value reaches a mail header, and use the raw
        // (not HTML-escaped) text so subjects don't arrive full of &amp;.
        subject: 'Portfolio: ' + subject.replace(/[\r\n]+/g, ' '),
        html,
      }),
    })

    if (!response.ok) {
      console.error('Contact email provider rejected delivery')
      await reportContactFailure(req, 'contact_mail_rejected')
      return res.status(500).json({ error: 'Failed to send email' })
    }

    if (req.headers.dnt !== '1' && req.headers['sec-gpc'] !== '1') {
      await capturePortfolioEvent('portfolio_contact_submitted', { surface: 'contact' })
    }
    return res.status(200).json({ success: true, message: 'Email sent successfully' })
  } catch (error) {
    // Fixed categories only: provider errors may contain private message data.
    console.error('Contact delivery failed')
    await reportContactFailure(req, error?.name === 'TimeoutError' || error?.name === 'AbortError' ? 'contact_mail_timeout' : 'contact_mail_failed')
    return res.status(500).json({ error: 'Failed to send email' })
  }
}
