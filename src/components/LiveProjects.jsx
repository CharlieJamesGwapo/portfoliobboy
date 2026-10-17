import { useState } from 'react'
import { ArrowUpRight, AudioLines, PhoneCall } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import { liveLinks } from '../data/portfolioData'
import './live-projects.css'

const VOICE_KIND = 'AI voice demo'

// Filter chips map onto the `kind` values in the data. Chips whose kind has no
// items are not rendered, so the row never offers an empty result.
const FILTERS = [
  { label: 'All', kinds: null },
  { label: 'Products', kinds: ['Product'] },
  { label: 'Web apps', kinds: ['Web app'] },
  { label: 'Mobile', kinds: ['Mobile app'] },
  { label: 'Client sites', kinds: ['Client site'] },
]

const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

const LiveProjects = () => {
  const [activeFilter, setActiveFilter] = useState('All')
  const links = Array.isArray(liveLinks) ? liveLinks : []
  if (links.length === 0) return null

  const feature = links.find((item) => item.kind === VOICE_KIND)
  const rest = links.filter((item) => item !== feature)
  const filters = FILTERS.filter((filter) => !filter.kinds || rest.some((item) => filter.kinds.includes(item.kind)))
  const current = filters.find((filter) => filter.label === activeFilter) ?? filters[0]
  const visible = current.kinds ? rest.filter((item) => current.kinds.includes(item.kind)) : rest

  return (
    <section id="live-projects" className="section section-dark live-projects-section" aria-labelledby="live-projects-title">
      <div className="page-container">
        <ScrollReveal>
          <div className="live-projects-heading">
            <p className="eyebrow">Live now</p>
            <h2 id="live-projects-title">Live projects you can open right now.</h2>
            <p>Real products, apps, and client sites in production. Every card opens the live thing, not a screenshot.</p>
          </div>
        </ScrollReveal>

        {feature && (
          <ScrollReveal delay={60}>
            <article className="live-feature">
              <div className="live-feature-icon" aria-hidden="true"><AudioLines size={26} /></div>
              <div className="live-feature-copy">
                <p className="live-kind live-kind-accent"><span className="live-pulse" aria-hidden="true" />{feature.kind}</p>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
              <a
                className="button button-primary live-feature-cta"
                href={feature.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Talk to Alex, ${feature.title} (opens in a new tab)`}
              >
                <PhoneCall size={17} aria-hidden="true" />
                Talk to Alex
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
              <p className="live-feature-host">{hostOf(feature.url)}</p>
            </article>
          </ScrollReveal>
        )}

        {filters.length > 2 && (
          <div className="live-toolbar">
            <div className="live-filters" role="group" aria-label="Filter live projects by type">
              {filters.map((filter) => (
                <button
                  key={filter.label}
                  type="button"
                  aria-pressed={current.label === filter.label}
                  className={current.label === filter.label ? 'is-active' : ''}
                  onClick={() => setActiveFilter(filter.label)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <p aria-live="polite">{visible.length} {visible.length === 1 ? 'project' : 'projects'}</p>
          </div>
        )}

        <ul className="live-grid">
          {visible.map((item) => {
            const host = hostOf(item.url)
            return (
              <li key={item.id ?? item.url}>
                <a
                  className="live-card"
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${item.title}, ${item.kind}${host ? `, ${host}` : ''} (opens in a new tab)`}
                >
                  <span className="live-card-title">{item.title}</span>
                  <span className="live-card-desc">{item.description}</span>
                  <span className="live-card-meta">
                    <span className="live-kind">{item.kind}</span>
                    {host && <span className="live-host">{host}</span>}
                  </span>
                  <ArrowUpRight className="live-card-icon" size={18} aria-hidden="true" />
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export default LiveProjects
