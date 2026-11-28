import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowUpRight, Link as LinkIcon, Plus, X } from 'lucide-react'
import { MAX_SHORTLIST, shortlistProjectTitles, shortlistShareUrl, getShortlistStudies, buildShortlistDocument, buildShortlistEnquiry } from '../lib/projectShortlist.js'
import { useProjectShortlist } from '../lib/useProjectShortlist.js'
import { stageAssistantEnquiry } from '../lib/contactIntent.js'
import { navigatePortfolio } from '../lib/portfolioRoute.js'
import DocumentActions from './assistant/DocumentActions.jsx'
import '../project-shortlist.css'

const statusMessages = {
  added: 'Project added to your shortlist.',
  removed: 'Project removed from your shortlist.',
  cleared: 'Your shortlist is clear.',
  limit: 'Your shortlist holds up to 3 projects. Remove a project before adding another.',
  invalid: 'Choose a published case study to add.',
}

export default function ProjectShortlist({ embedded = false }) {
  const { slugs, toggle, remove, clear, status } = useProjectShortlist()
  const studies = getShortlistStudies(slugs)
  const [choice, setChoice] = useState('')
  const [linkState, setLinkState] = useState({ key: '', message: '', fallback: false, copying: false })
  const heading = useRef(null)
  const removeButtons = useRef(new Map())
  const nextFocus = useRef(null)
  const revision = useRef(0)
  const selectionKey = slugs.join(',')
  const currentSelection = useRef(selectionKey)
  currentSelection.current = selectionKey
  const link = shortlistShareUrl(slugs)
  const shownLinkState = linkState.key === selectionKey ? linkState : {}

  useLayoutEffect(() => {
    revision.current++
    setLinkState({ key: selectionKey, message: '', fallback: false, copying: false })
    if (nextFocus.current === null) return
    const target = nextFocus.current
    nextFocus.current = null
    if (target === 'heading') heading.current?.focus()
    else (removeButtons.current.get(target) || heading.current)?.focus()
  }, [selectionKey])
  useLayoutEffect(() => () => { revision.current++ }, [])

  const copyLink = async () => {
    const key = selectionKey
    const current = revision.current
    setLinkState({ key, message: '', fallback: false, copying: true })
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard-unavailable')
      await navigator.clipboard.writeText(link)
      if (current === revision.current && key === currentSelection.current) setLinkState({ key, message: 'Comparison link copied. Only the selected public project links are included.', fallback: false, copying: false })
    } catch {
      if (current === revision.current && key === currentSelection.current) setLinkState({ key, message: 'Link copy is unavailable. Select and copy the comparison link below.', fallback: true, copying: false })
    }
  }

  return <section id={embedded ? undefined : 'project-shortlist'} className="project-shortlist" aria-labelledby="project-shortlist-heading">
    <div className="shortlist-heading-row">
      <div>
        <p className="shortlist-eyebrow">A closer look</p>
        <h2 id="project-shortlist-heading" ref={heading} tabIndex={-1}>Your project shortlist</h2>
        <p className="shortlist-intro">Choose up to {MAX_SHORTLIST} case studies. Compare the work, keep the evidence, and prepare an enquiry.</p>
      </div>
      <span className="shortlist-count" aria-label={`${slugs.length} of ${MAX_SHORTLIST} projects selected`}>{slugs.length}<span> / {MAX_SHORTLIST}</span></span>
    </div>

    <form className="shortlist-add" onSubmit={event => {
      event.preventDefault()
      if (!choice || slugs.includes(choice)) return
      const result = toggle(choice)
      if (result === 'added') setChoice('')
    }}>
      <label htmlFor="shortlist-study">Add a case study</label>
      <div className="shortlist-add-controls">
        <select id="shortlist-study" value={choice} onChange={event => setChoice(event.target.value)}>
          <option value="">Choose a project…</option>
          {Object.entries(shortlistProjectTitles).map(([slug, title]) => <option key={slug} value={slug} disabled={slugs.includes(slug)}>{title}{slugs.includes(slug) ? ' — selected' : ''}</option>)}
        </select>
        <button type="submit" disabled={!choice}><Plus size={16} aria-hidden="true" />Add project</button>
      </div>
    </form>
    <p className="shortlist-status" role="status" aria-live="polite">{statusMessages[status] || ''}</p>

    {studies.length ? <>
      <div className="shortlist-comparison" style={{ '--shortlist-columns': studies.length }}>
        {studies.map((study, index) => <article className="shortlist-study" key={study.slug} aria-labelledby={`shortlist-${study.slug}`}>
          <header className="shortlist-study-heading">
            <p className="shortlist-study-index">0{index + 1} / Case study</p>
            <h3 id={`shortlist-${study.slug}`}>{study.title}</h3>
            <a href={`/projects/${study.slug}`} aria-label={`Read ${study.title} case study`}>Read case study <ArrowUpRight size={16} aria-hidden="true" /></a>
            <button className="shortlist-remove" type="button" aria-label={`Remove ${study.title} from shortlist`}
              ref={element => { if (element) removeButtons.current.set(study.slug, element); else removeButtons.current.delete(study.slug) }}
              onClick={() => {
                nextFocus.current = slugs[index + 1] || slugs[index - 1] || 'heading'
                remove(study.slug)
              }}><X size={16} aria-hidden="true" /><span>Remove</span></button>
          </header>
          <div className="shortlist-fact"><h4>Role</h4><p>{study.role}</p></div>
          <div className="shortlist-fact"><h4>Responsibilities</h4><ul>{[].concat(study.responsibilities || []).map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul></div>
          <div className="shortlist-fact"><h4>Stack</h4><ul className="shortlist-stack">{study.stack.map(item => <li key={item}>{item}</li>)}</ul></div>
          <div className="shortlist-fact"><h4>Outcome</h4><p>{study.outcome}</p></div>
          <div className="shortlist-fact shortlist-published-status"><h4>Published status</h4><p>{study.status}</p></div>
        </article>)}
      </div>
      <div className="shortlist-footer">
        <div className="shortlist-primary-actions">
          <button type="button" className="shortlist-enquiry" onClick={() => {
            const enquiry = buildShortlistEnquiry(slugs)
            stageAssistantEnquiry(enquiry.subject, enquiry.message, { preserveSubject: true })
            navigatePortfolio('/#contact')
          }}>Prepare an enquiry <ArrowUpRight size={16} aria-hidden="true" /></button>
          <button type="button" onClick={copyLink} disabled={Boolean(shownLinkState.copying)}><LinkIcon size={16} aria-hidden="true" />{shownLinkState.copying ? 'Copying link…' : 'Copy comparison link'}</button>
          <button className="shortlist-clear" type="button" onClick={() => { nextFocus.current = 'heading'; clear() }}>Clear shortlist</button>
        </div>
        <p className="shortlist-share-status" role="status" aria-live="polite">{shownLinkState.message || ''}</p>
        {shownLinkState.fallback && <label className="shortlist-share-fallback">Comparison link<input type="url" readOnly value={link} onFocus={event => event.target.select()} /></label>}
        <DocumentActions document={buildShortlistDocument(slugs)} noun="comparison" />
        <p className="shortlist-privacy">Only published project evidence is included. Preparing an enquiry opens a draft for your review; nothing is sent.</p>
      </div>
    </> : <div className="shortlist-empty"><p>No projects selected yet.</p><p>Add a case study above, or use <strong>Shortlist</strong> on any project card or case study. Your selection stays in this tab.</p></div>}
  </section>
}
