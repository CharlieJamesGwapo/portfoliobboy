// Contact form handler — sends via Resend's REST API (no SDK, zero imports,
// so Vercel's bundler never hangs).

// This endpoint sends mail on the site owner's Resend account. It previously
// answered `Access-Control-Allow-Origin: *`, which let any site on the web POST
// to it — an open relay for spam billed to this account. Only the portfolio's
// own origins may call it now. Same-origin form posts send no Origin header on
// some browsers, so a missing Origin is allowed; a foreign one is not.
const ALLOWED_ORIGINS = new Set([
  'https://portfoliobboy.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
])

const isAllowedOrigin = (origin) => {
  if (!origin) return true
  if (ALLOWED_ORIGINS.has(origin)) return true
  // Vercel preview deployments for this project.
  return /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)
}

const LIMITS = { name: 120, email: 254, subject: 200, message: 5000 }
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default async function handler(req, res) {
  const origin = req.headers.origin

  if (!isAllowedOrigin(origin)) {
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
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {}
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const subject = typeof body.subject === 'string' ? body.subject.trim() : ''
    const message = typeof body.message === 'string' ? body.message.trim() : ''

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

    // Check environment variables
    if (!process.env.RESEND_API_KEY) {
      console.error('Missing RESEND_API_KEY environment variable')
      return res.status(500).json({ error: 'Server configuration error' })
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
      headers: {
        Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json',
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
      const errorBody = await response.text()
      console.error('Resend API error:', response.status, errorBody)
      return res.status(500).json({ error: 'Failed to send email' })
    }

    return res.status(200).json({ success: true, message: 'Email sent successfully' })
  } catch (error) {
    // Log the detail server-side; don't hand internals back to the caller.
    console.error('Contact form error:', error.message, error.stack)
    return res.status(500).json({ error: 'Failed to send email' })
  }
}
