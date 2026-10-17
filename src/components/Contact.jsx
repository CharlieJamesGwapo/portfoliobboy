import { useState } from 'react'
import { ArrowUpRight, CheckCircle2, Clock3, FileText, Github, Linkedin, Loader2, Mail, MapPin, Phone } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import { profile, resumeUrl } from '../data/portfolioData'

// `company` is a honeypot: hidden from people, irresistible to the bots that
// fill every field they can find. The server drops any submission that has it
// set, and reports success so the bot has nothing to tune against.
const initialForm = { name: '', email: '', subject: '', message: '', company: '' }

const validate = (form) => {
  const errors = {}
  if (form.name.trim().length < 2) errors.name = 'Please enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address.'
  if (form.subject.trim().length < 3) errors.subject = 'Add a short subject.'
  if (form.message.trim().length < 10) errors.message = 'Share at least 10 characters so I have enough context.'
  return errors
}

// Lets a visitor send what they typed from their own mail client when the
// server could not, instead of retyping it.
const buildMailto = (form) => {
  const body = `Name: ${form.name.trim()}\nEmail: ${form.email.trim()}\n\n${form.message.trim()}`
  return `mailto:${profile.email}?subject=${encodeURIComponent(form.subject.trim())}&body=${encodeURIComponent(body)}`
}

const Contact = () => {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  // Separate from `status`, which editing a field resets: the mail fallback
  // should stay available (and track the edits) until the visitor resends.
  const [sendFailed, setSendFailed] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    // Never reset while a request is in flight: that would flip `status` back
    // to idle, re-enable the submit button and allow a duplicate send.
    if (status === 'error' || status === 'success') {
      setStatus('idle')
      setMessage('')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status === 'sending') return
    const nextErrors = validate(form)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      setStatus('error')
      setMessage('Please review the highlighted fields.')
      const firstInvalid = Object.keys(nextErrors)[0]
      window.setTimeout(() => document.getElementById(`contact-${firstInvalid}`)?.focus(), 0)
      return
    }

    setStatus('sending')
    setMessage('')
    setSendFailed(false)

    // A hung connection would otherwise leave the button on "Sending…" forever.
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 20000)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        signal: controller.signal,
      })

      if (!response.ok) throw new Error('Request failed')
      setForm(initialForm)
      setErrors({})
      setStatus('success')
      setMessage('Thanks — your message is on its way. I’ll reply as soon as I can.')
    } catch {
      // The form is deliberately left as typed.
      setSendFailed(true)
      setStatus('error')
      setMessage(`The form could not send right now. Please email me directly at ${profile.email}.`)
    } finally {
      window.clearTimeout(timeout)
    }
  }

  return (
    <section id="contact" className="contact-section">
      <div className="page-container contact-layout">
        <ScrollReveal className="contact-copy" variant="left">
          <p className="eyebrow">07 · Contact</p>
          <h2>Have a system to improve or a product to ship?</h2>
          <p>
            Have an AI product, SaaS platform, backend system, or mobile application to build? Let’s discuss
            the product, architecture, and delivery plan. I work remotely and can overlap US business hours.
          </p>

          <a className="contact-email" href={`mailto:${profile.email}`}>
            <span>{profile.email}</span>
            <ArrowUpRight size={22} aria-hidden="true" />
          </a>

          <div className="contact-details">
            <a href={profile.phoneHref}><Phone size={17} aria-hidden="true" /> {profile.phoneDisplay}</a>
            <span><MapPin size={17} aria-hidden="true" /> {profile.location}</span>
            <span><Clock3 size={17} aria-hidden="true" /> PHT (UTC+8) · US business-hours overlap</span>
          </div>

          <div className="contact-socials">
            <a href={profile.github} target="_blank" rel="noreferrer"><Github size={18} /> GitHub</a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer"><Linkedin size={18} /> LinkedIn</a>
            <a href={resumeUrl} download="charlie-james-abejo-resume.pdf"><FileText size={18} /> Download resume</a>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100} variant="scale">
          <form className="contact-form" onSubmit={handleSubmit} noValidate aria-busy={status === 'sending'}>
            <div className="form-row">
              <label>
                <span>Name</span>
                <input id="contact-name" name="name" type="text" value={form.name} onChange={updateField} autoComplete="name" autoCapitalize="words" maxLength={120} required aria-required="true" placeholder="Your name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'contact-name-error' : undefined} />
                {errors.name && <small id="contact-name-error" className="field-error">{errors.name}</small>}
              </label>
              <label>
                <span>Email</span>
                <input id="contact-email" name="email" type="email" inputMode="email" value={form.email} onChange={updateField} autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck="false" maxLength={254} required aria-required="true" placeholder="you@company.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'contact-email-error' : undefined} />
                {errors.email && <small id="contact-email-error" className="field-error">{errors.email}</small>}
              </label>
            </div>
            <label>
              <span>Subject</span>
              <input id="contact-subject" name="subject" type="text" value={form.subject} onChange={updateField} autoComplete="off" autoCapitalize="sentences" enterKeyHint="next" maxLength={200} required aria-required="true" placeholder="What would you like to build?" aria-invalid={Boolean(errors.subject)} aria-describedby={errors.subject ? 'contact-subject-error' : undefined} />
              {errors.subject && <small id="contact-subject-error" className="field-error">{errors.subject}</small>}
            </label>
            <label>
              <span>Message</span>
              <textarea id="contact-message" name="message" value={form.message} onChange={updateField} autoComplete="off" autoCapitalize="sentences" required aria-required="true" minLength={10} maxLength={5000} rows="5" placeholder="Share a little context, timeline, or role details." aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'contact-message-error' : undefined} />
              {errors.message && <small id="contact-message-error" className="field-error">{errors.message}</small>}
            </label>
            {/* Off-screen rather than display:none — some bots skip fields
                they can tell are hidden. tabIndex/aria-hidden keep it out of
                the keyboard order and out of the accessibility tree. */}
            <div className="honeypot" aria-hidden="true">
              <label htmlFor="contact-company">Company (leave this field empty)</label>
              <input
                id="contact-company"
                name="company"
                type="text"
                value={form.company}
                onChange={updateField}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <button className="button button-dark" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? <Loader2 className="spin" size={18} /> : status === 'success' ? <CheckCircle2 size={18} /> : <Mail size={18} />}
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </button>
            <p className={`form-status ${status}`} role="status" aria-live="polite">{message}</p>
            {sendFailed && (
              <a className="form-fallback" href={buildMailto(form)}>
                <Mail size={15} aria-hidden="true" /> Open in your email app
              </a>
            )}
          </form>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default Contact
