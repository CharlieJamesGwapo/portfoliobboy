import { useState } from 'react'
import { ArrowUpRight, CheckCircle2, FileText, Github, Linkedin, Loader2, Mail, MapPin, Phone } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import { profile, resumeUrl } from '../data/portfolioData'

const initialForm = { name: '', email: '', subject: '', message: '', company: '' }

const validate = (form) => {
  const errors = {}
  if (form.name.trim().length < 2) errors.name = 'Please enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address.'
  if (form.subject.trim().length < 3) errors.subject = 'Add a short subject.'
  if (form.message.trim().length < 10) errors.message = 'Share at least 10 characters so I have enough context.'
  return errors
}

const Contact = () => {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    if (status !== 'idle') setStatus('idle')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
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
    setErrors({})
    setMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) throw new Error('Request failed')
      setForm(initialForm)
      setErrors({})
      setStatus('success')
      setMessage('Thanks — your message is on its way. I’ll reply as soon as I can.')
    } catch {
      setStatus('error')
      setMessage(`The form could not send right now. Please email me directly at ${profile.email}.`)
    }
  }

  return (
    <section id="contact" className="contact-section">
      <div className="page-container contact-layout">
        <ScrollReveal className="contact-copy" variant="left">
          <p className="eyebrow">06 · Contact</p>
          <h2>Have a system to improve or a product to ship?</h2>
          <p>
            {profile.availability}. Based in {profile.location}. I build reliable web, mobile, and CRM systems with
            API integrations, real-time sync, secure data workflows, and AI-assisted delivery.
          </p>

          <a className="contact-email" href={`mailto:${profile.email}`}>
            <span>{profile.email}</span>
            <ArrowUpRight size={22} aria-hidden="true" />
          </a>

          <div className="contact-details">
            <a href={profile.phoneHref} aria-label={`Call ${profile.phoneDisplay}`}><Phone size={17} aria-hidden="true" /> {profile.phoneDisplay}</a>
            <span><MapPin size={17} aria-hidden="true" /> {profile.location}</span>
            <span><Mail size={17} aria-hidden="true" /> {profile.availability}</span>
          </div>

          <div className="contact-socials">
            <a href={profile.github} target="_blank" rel="noreferrer" aria-label="Open GitHub profile"><Github size={18} aria-hidden="true" /> GitHub</a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="Open LinkedIn profile"><Linkedin size={18} aria-hidden="true" /> LinkedIn</a>
            <a href={resumeUrl} download="charlie-james-abejo-resume.pdf" aria-label="Download resume PDF, approximately 505 KB"><FileText size={18} aria-hidden="true" /> Download resume</a>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100} variant="scale">
          <form className="contact-form" onSubmit={handleSubmit} noValidate aria-busy={status === 'sending'}>
            {status === 'error' && Object.keys(errors).length > 0 && (
              <div className="form-error-summary" role="alert" aria-labelledby="contact-error-title">
                <strong id="contact-error-title">Please fix the following fields:</strong>
                <ul>
                  {Object.entries(errors).map(([field, error]) => error && (
                    <li key={field}><a href={`#contact-${field}`}>{error}</a></li>
                  ))}
                </ul>
              </div>
            )}

            <div className="form-row">
              <label htmlFor="contact-name">
                <span>Name</span>
                <input id="contact-name" name="name" value={form.name} onChange={updateField} autoComplete="name" required placeholder="Your name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'contact-name-error' : undefined} />
                {errors.name && <small id="contact-name-error" className="field-error">{errors.name}</small>}
              </label>
              <label htmlFor="contact-email">
                <span>Email</span>
                <input id="contact-email" name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" required placeholder="you@company.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'contact-email-error' : undefined} />
                {errors.email && <small id="contact-email-error" className="field-error">{errors.email}</small>}
              </label>
            </div>
            <label htmlFor="contact-subject">
              <span>Subject</span>
              <input id="contact-subject" name="subject" value={form.subject} onChange={updateField} required placeholder="What would you like to build?" aria-invalid={Boolean(errors.subject)} aria-describedby={errors.subject ? 'contact-subject-error' : undefined} />
              {errors.subject && <small id="contact-subject-error" className="field-error">{errors.subject}</small>}
            </label>
            <label htmlFor="contact-message">
              <span>Message</span>
              <textarea id="contact-message" name="message" value={form.message} onChange={updateField} required minLength="10" rows="5" placeholder="Share a little context, timeline, or role details." aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'contact-message-error' : undefined} />
              {errors.message && <small id="contact-message-error" className="field-error">{errors.message}</small>}
            </label>

            <div className="honeypot" aria-hidden="true">
              <label htmlFor="contact-company">Company (leave this field empty)</label>
              <input id="contact-company" name="company" type="text" value={form.company} onChange={updateField} tabIndex={-1} autoComplete="off" />
            </div>

            <button className="button button-dark" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? <Loader2 className="spin" size={18} /> : status === 'success' ? <CheckCircle2 size={18} /> : <Mail size={18} />}
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </button>
            <p className={`form-status ${status}`} role="status" aria-live="polite" aria-atomic="true">{message}</p>
          </form>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default Contact
