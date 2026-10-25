import { useEffect, useState } from 'react'
import { ArrowUp, ArrowUpRight, Bot, Check, Headphones, Layers3, LockKeyhole, Network, SlidersHorizontal, Workflow } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import SectionHeading from './SectionHeading'
import './ai-systems.css'
import { aiSystemCapabilities, momentumEngineeringGroups, momentumSystems } from '../data/portfolioData'

const capabilityIcons = [Bot, Headphones, Workflow, Layers3, SlidersHorizontal, Network]
const filters = ['All systems', 'AI Agents', 'Voice', 'Automation', 'CRM', 'Analytics', 'Platforms']

const MOBILE_QUERY = '(max-width: 640px)'
const MOBILE_VISIBLE_SYSTEMS = 3

// Reports whether the viewport is phone-sized. Starts false on the server so
// SSR output (and tests) render the full desktop markup, and every browser API
// access is guarded.
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
    const query = window.matchMedia(MOBILE_QUERY)
    const update = () => setIsMobile(query.matches)
    update()
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])
  return isMobile
}

export const MomentumSystems = () => {
  const [activeFilter, setActiveFilter] = useState(filters[0])
  const [showAll, setShowAll] = useState(false)
  const isMobile = useIsMobile()
  const systems = activeFilter === filters[0]
    ? momentumSystems
    : momentumSystems.filter((system) => system.categories.includes(activeFilter))

  const canCollapse = systems.length > MOBILE_VISIBLE_SYSTEMS
  const collapsed = isMobile && canCollapse && !showAll
  const visibleSystems = collapsed ? systems.slice(0, MOBILE_VISIBLE_SYSTEMS) : systems
  const selectFilter = (filter) => {
    setActiveFilter(filter)
    setShowAll(false)
  }

  return (
    <div id="momentum-work" className="momentum-work">
      <ScrollReveal>
        <SectionHeading eyebrow="Selected Momentum systems" title="The product. The workflow. The engineering behind it." description="Selected work across the Momentum ecosystem, with public product links and a closer look at the systems behind them." light />
      </ScrollReveal>
      <div className="momentum-toolbar">
        <div className="momentum-filters" role="group" aria-label="Filter Momentum systems">
          {filters.map((filter) => <button key={filter} type="button" aria-pressed={activeFilter === filter} className={activeFilter === filter ? 'is-active' : ''} onClick={() => selectFilter(filter)}>{filter}</button>)}
        </div>
        <p aria-live="polite">{systems.length} {systems.length === 1 ? 'system' : 'systems'}</p>
      </div>

      <div id="momentum-grid" className="momentum-grid">
        {visibleSystems.map((system) => (
          <article key={system.id} className={`momentum-card ${system.image ? 'has-image' : 'is-engineering'}`}>
            {system.image ? (
              <a className="momentum-preview" href={system.url} target="_blank" rel="noreferrer" aria-label={`Explore live — ${system.title} (opens in a new tab)`}>
                <img src={system.image} alt={system.imageAlt} width="1440" height="900" loading="lazy" decoding="async" />
                <span><ArrowUpRight size={18} aria-hidden="true" /> Explore live</span>
              </a>
            ) : (
              <div className="momentum-engineering-visual" aria-hidden="true">
                <span>ENGINEERING NOTES</span><div><span>INPUT</span><i /><span>CONTROL</span><i /><span>STATE</span></div>
                <p>{system.visualLabel ?? 'Input · Control · State'}</p>
              </div>
            )}
            <div className="momentum-card-copy">
              <div className="momentum-card-meta"><p>{system.type}</p><span className={`system-status system-status-${system.statusTone}`}>{system.statusTone === 'private' && <LockKeyhole size={11} aria-hidden="true" />}{system.status}</span></div>
              <h3>{system.title}</h3>
              <p className="momentum-summary">{system.summary}</p>
              <details className="momentum-details"><summary>Explore engineering scope <span aria-hidden="true">+</span></summary><p>{system.contribution}</p><div className="momentum-stack">{system.stack.map((item) => <span key={item}>{item}</span>)}</div></details>
              {system.url ? <a className="momentum-demo-link" href={system.url} target="_blank" rel="noreferrer">{system.linkLabel ?? (system.statusTone === 'prototype' ? 'Explore the prototype' : 'Explore live product')}<ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> — {system.title} (opens in a new tab)</span></a> : <span className="momentum-private-note"><LockKeyhole size={13} aria-hidden="true" /> Private client system</span>}
            </div>
          </article>
        ))}
      </div>

      {isMobile && canCollapse && (
        <button type="button" className="momentum-toggle" aria-expanded={showAll} aria-controls="momentum-grid" onClick={() => setShowAll((value) => !value)}>
          {showAll ? 'Show fewer' : `Show all ${systems.length} systems`}
        </button>
      )}

      <div className="momentum-index">
        <div className="momentum-index-heading"><p className="eyebrow">Behind the products</p><h3>A connected engineering practice.</h3><p>Related modules and internal systems span four areas. Public case studies focus on product behavior; client source code stays private.</p></div>
        <div>{momentumEngineeringGroups.map((group) => <article key={group.title}><h4>{group.title}</h4><p>{group.description}</p></article>)}</div>
      </div>
    </div>
  )
}

const AISystems = () => {
  const isMobile = useIsMobile()

  return (
    <section id="ai-systems" className="section section-paper ai-systems-section" aria-labelledby="ai-systems-title">
      <div className="page-container">
        <ScrollReveal>
          <div className="ai-systems-intro">
            <div>
              <p className="eyebrow">AI systems &amp; automation</p>
              <h2 id="ai-systems-title">From a business idea<br />to a working system.</h2>
            </div>
            <div className="ai-systems-intro-copy">
              <p>I build custom AI agents, voice agents, automations, and CRM systems that connect the tools, data, and people behind a business.</p>
              <a href="#momentum-work">Explore the systems <ArrowUp size={16} aria-hidden="true" /></a>
            </div>
          </div>
        </ScrollReveal>

        <div
          className="ai-capability-grid"
          {...(isMobile ? { role: 'region', 'aria-label': 'AI system capabilities, swipe to browse', tabIndex: 0 } : {})}
        >
          {aiSystemCapabilities.map((capability, index) => {
            const Icon = capabilityIcons[index]
            return (
              <ScrollReveal key={capability.title} delay={index * 45}>
                <article className="ai-capability">
                  <div className="ai-capability-top"><Icon size={24} aria-hidden="true" /><span>{capability.number}</span></div>
                  <h3>{capability.title}</h3>
                  <p>{capability.description}</p>
                  <ul>{capability.outcomes.map((outcome) => <li key={outcome}><Check size={14} aria-hidden="true" />{outcome}</li>)}</ul>
                  <div className="ai-capability-stack">{capability.stack.map((item) => <span key={item}>{item}</span>)}</div>
                </article>
              </ScrollReveal>
            )
          })}
        </div>

        <div className="ai-delivery-note">
          <Workflow size={22} aria-hidden="true" />
          <div><strong>Built for the next step, too.</strong><p>Clear API contracts, secure access, reliable retries, observable workflows, and interfaces your team can use every day.</p></div>
          <a href="#contact">Discuss your workflow <ArrowUpRight size={17} aria-hidden="true" /></a>
        </div>

      </div>
    </section>
  )
}

export default AISystems
