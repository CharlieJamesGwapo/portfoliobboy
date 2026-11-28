import { useState } from 'react'
import { Bookmark, Check } from 'lucide-react'
import { shortlistProjectTitles } from '../lib/projectShortlistSelection.js'
import { useProjectShortlist } from '../lib/useProjectShortlist.js'
import '../project-shortlist.css'

export default function ShortlistButton({ slug }) {
  const { slugs, toggle } = useProjectShortlist()
  const [announcement, setAnnouncement] = useState('')
  const title = shortlistProjectTitles[slug]
  if (!title) return null
  const selected = slugs.includes(slug)
  return <div className="shortlist-save">
    <div className="shortlist-save-actions">
      <button className="shortlist-save-button" type="button" aria-pressed={selected}
        aria-label={`${selected ? 'Remove' : 'Add'} ${title} ${selected ? 'from' : 'to'} shortlist`}
        onClick={() => {
          const result = toggle(slug)
          setAnnouncement(result === 'limit' ? 'Your shortlist holds up to 3 projects. Remove a project before adding another.' : result === 'added' ? `${title} added to shortlist.` : `${title} removed from shortlist.`)
        }}>
        {selected ? <Check size={16} aria-hidden="true" /> : <Bookmark size={16} aria-hidden="true" />}
        {selected ? 'Shortlisted' : 'Shortlist'}
      </button>
      {selected && <a className="shortlist-review-link" href={typeof window !== 'undefined' && /^\/projects\/?$/.test(window.location.pathname) ? '#project-shortlist' : '/projects#project-shortlist'}>View shortlist</a>}
    </div>
    <p className="shortlist-save-status" role="status" aria-live="polite">{announcement}</p>
  </div>
}
