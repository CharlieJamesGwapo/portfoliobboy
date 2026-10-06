import { useState } from 'react'
import { ArrowDown, ArrowUpRight, Bot, Check, Headphones, Layers3, LockKeyhole, Network, SlidersHorizontal, Workflow } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import SectionHeading from './SectionHeading'
import './ai-systems.css'
import { aiSystemCapabilities, momentumEngineeringGroups, momentumSystems } from '../data/portfolioData'

const capabilityIcons = [Bot, Headphones, Workflow, Layers3, SlidersHorizontal, Network]
const filters = ['All systems', 'AI Agents', 'Voice', 'Automation', 'CRM', 'Analytics', 'Platforms']

const AISystems = () => {
  const [activeFilter, setActiveFilter] = useState(filters[0])
  const systems = activeFilter === filters[0]
    ? momentumSystems
    : momentumSystems.filter((system) => system.categories.includes(activeFilter))

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
              <a href="#momentum-work">Explore the systems <ArrowDown size={16} aria-hidden="true" /></a>
            </div>
          </div>
        </ScrollReveal>

        <div className="ai-capability-grid">
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

        <div id="momentum-work" className="momentum-work">
          <ScrollReveal>
            <SectionHeading eyebrow="Selected Momentum systems" title="The product. The workflow. The engineering behind it." description="Selected work across the Momentum ecosystem, with public product links and a closer look at the systems behind them." light />
          </ScrollReveal>
          <div className="momentum-toolbar">
            <div className="momentum-filters" role="group" aria-label="Filter Momentum systems">
              {filters.map((filter) => <button key={filter} type="button" aria-pressed={activeFilter === filter} className={activeFilter === filter ? 'is-active' : ''} onClick={() => setActiveFilter(filter)}>{filter}</button>)}
            </div>
            <p aria-live="polite">{systems.length} {systems.length === 1 ? 'system' : 'systems'}</p>
          </div>

          <div className="momentum-grid">
            {systems.map((system) => (
              <article key={system.id} className={`momentum-card ${system.image ? 'has-image' : 'is-engineering'}`}>
                {system.image ? (
                  <a className="momentum-preview" href={system.url} target="_blank" rel="noreferrer" aria-label={`Explore ${system.title} (opens in a new tab)`}>
                    <img src={system.image} alt={system.imageAlt} width="1440" height="900" loading="lazy" decoding="async" />
                    <span><ArrowUpRight size={18} aria-hidden="true" /> Explore live</span>
                  </a>
                ) : (
                  <div className="momentum-engineering-visual" aria-hidden="true">
                    <span>ENGINEERING NOTES</span><div><span>INPUT</span><i /><span>CONTROL</span><i /><span>STATE</span></div>
                    <p>{system.id === 'voice-runtime' ? 'Voice · Events · Booking' : system.id === 'gym-analytics' ? 'Sync · Model · Insights' : 'Agents · Sessions · Evidence'}</p>
                  </div>
                )}
                <div className="momentum-card-copy">
                  <div className="momentum-card-meta"><p className="momentum-card-type">{system.type}</p><span className={`system-status system-status-${system.statusTone}`}>{system.statusTone === 'private' && <LockKeyhole size={11} aria-hidden="true" />}{system.status}</span></div>
                  <h3>{system.title}</h3>
                  <p className="momentum-summary">{system.summary}</p>
                  <details className="momentum-details"><summary>Explore engineering scope <span aria-hidden="true">+</span></summary><p>{system.contribution}</p><div className="momentum-stack">{system.stack.map((item) => <span key={item}>{item}</span>)}</div></details>
                  {system.url ? <a className="momentum-demo-link" href={system.url} target="_blank" rel="noreferrer">{system.id === 'hasti' ? 'Try the AI receptionist' : system.statusTone === 'prototype' ? 'Explore the prototype' : 'Explore live product'}<ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> — {system.title} (opens in a new tab)</span></a> : <span className="momentum-private-note"><LockKeyhole size={13} aria-hidden="true" /> Private client system</span>}
                </div>
              </article>
            ))}
          </div>

          <div className="momentum-index">
            <div className="momentum-index-heading"><p className="eyebrow">Behind the products</p><h3>A connected engineering practice.</h3><p>Related modules and internal systems span four areas. Public case studies focus on product behavior; client source code stays private.</p></div>
            <div>{momentumEngineeringGroups.map((group) => <article key={group.title}><h4>{group.title}</h4><p>{group.description}</p></article>)}</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AISystems
