import { useRef, useState } from 'react'
import { ArrowRight, CheckCircle2, Search, ShieldCheck, Zap } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import { automationPlatforms, automationToolbox, automationWorkflows, filterAutomationWorkflows } from '../data/automationsData'
import { requestContact } from '../lib/contactIntent'
import './automations.css'

const PAGE_SIZE = 6

const WorkflowFlow = ({ trigger, steps, outcome }) => (
  <ol className="auto-flow" aria-label="Workflow steps">
    <li className="auto-node auto-node-trigger">
      <span className="auto-node-kind"><Zap size={11} aria-hidden="true" /> Trigger</span>
      {trigger}
    </li>
    {steps.map((step) => <li key={step} className="auto-node">{step}</li>)}
    <li className="auto-node auto-node-outcome">
      <span className="auto-node-kind"><CheckCircle2 size={11} aria-hidden="true" /> Intended outcome</span>
      {outcome}
    </li>
  </ol>
)

const Automations = () => {
  const [platform, setPlatform] = useState('All')
  const [query, setQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const searchRef = useRef(null)
  const workflows = filterAutomationWorkflows({ platform, query })
  const visibleWorkflows = workflows.slice(0, visibleCount)
  const remaining = workflows.length - visibleWorkflows.length
  const isFiltered = platform !== 'All' || query.trim() !== ''

  const showMore = () => {
    const firstNewId = workflows[visibleWorkflows.length]?.id
    setVisibleCount((count) => count + PAGE_SIZE)
    window.requestAnimationFrame(() => document.getElementById(`auto-card-${firstNewId}`)?.focus())
  }

  const resetFilters = () => {
    setPlatform('All')
    setQuery('')
    setVisibleCount(PAGE_SIZE)
    searchRef.current?.focus()
  }

  return (
    <section id="automations" className="section section-dark automations-section" aria-labelledby="automations-title">
      <div className="page-container">
        <ScrollReveal>
          <div className="auto-intro">
            <div>
              <p className="eyebrow">AI, automation & custom bots</p>
              <h2 id="automations-title">Less busywork.<br />More room to build.</h2>
            </div>
            <div className="auto-intro-copy">
              <p>From a useful CRM handoff to an assistant with approval controls: explore {automationWorkflows.length} solution patterns for everyday business operations.</p>
              <a className="button button-primary" href="#contact" onClick={() => requestContact('AI automation project enquiry')}>
                Discuss your workflow <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="auto-scope-note">
            <ShieldCheck size={20} aria-hidden="true" />
            <p><strong>Service examples, scoped to your business.</strong> These are proposed approaches, not a count of deployed client workflows. Integrations, access, review steps and scope are agreed before a build.</p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="auto-toolbox" aria-label="Platforms and integration options">
            <span>Platforms &amp; integrations</span>
            <ul>{automationToolbox.map((tool) => <li key={tool}>{tool}</li>)}</ul>
          </div>
        </ScrollReveal>

        <div className="auto-toolbar">
          <div className="auto-search">
            <label htmlFor="automation-search">Search solution patterns</label>
            <div className="auto-search-field">
              <Search size={17} aria-hidden="true" />
              <input
                ref={searchRef}
                id="automation-search"
                type="search"
                value={query}
                placeholder="Try calendar, RAG or Docker"
                aria-controls="automation-results"
                onChange={(event) => { setQuery(event.target.value); setVisibleCount(PAGE_SIZE) }}
              />
            </div>
          </div>
          <div className="auto-catalogue-count" aria-label={`${automationWorkflows.length} service examples across ${automationPlatforms.length - 1} categories`}>
            <strong>{String(automationWorkflows.length).padStart(2, '0')}</strong>
            <span>solution patterns<br />{automationPlatforms.length - 1} ways to start</span>
          </div>
        </div>

        <div className="auto-filters" role="group" aria-label="Filter automations by platform">
          {automationPlatforms.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={platform === item}
              aria-controls="automation-results"
              className={platform === item ? 'is-active' : ''}
              onClick={() => { setPlatform(item); setVisibleCount(PAGE_SIZE) }}
            >{item}</button>
          ))}
        </div>
        <div className="auto-results-bar">
          <p role="status" aria-live="polite" aria-atomic="true">Showing {visibleWorkflows.length} of {workflows.length} solution patterns</p>
          {isFiltered && workflows.length > 0 ? <button className="auto-reset" type="button" onClick={resetFilters}>Reset filters</button> : null}
        </div>

        <div id="automation-results" className="auto-grid">
          {visibleWorkflows.map((workflow) => (
            <article key={workflow.id} id={`auto-card-${workflow.id}`} className="auto-card" tabIndex={-1} aria-labelledby={`auto-title-${workflow.id}`}>
              <div className="auto-card-meta">
                <span className="auto-platform">{workflow.platform}</span>
                <span className="auto-proposal-status">{workflow.proposalStatus}</span>
              </div>
              <h3 id={`auto-title-${workflow.id}`}>{workflow.title}</h3>
              <p className="auto-summary">{workflow.summary}</p>
              <WorkflowFlow trigger={workflow.trigger} steps={workflow.steps} outcome={workflow.outcome} />
              <div className="auto-tools" aria-label="Integration options">
                {workflow.tools.map((tool) => <span key={tool}>{tool}</span>)}
              </div>
              <details className="auto-details">
                <summary>Use case, approach & safeguards<span className="sr-only"> for {workflow.title}</span></summary>
                <div className="auto-detail-content">
                  <h4>Where it helps</h4><p>{workflow.useCase}</p>
                  <h4>Implementation approach</h4><p>{workflow.implementation}</p>
                  <h4><ShieldCheck size={14} aria-hidden="true" /> Safeguards & handoff</h4><p>{workflow.safeguards}</p>
                </div>
              </details>
              <a className="auto-card-enquiry" href="#contact" onClick={() => requestContact(`Automation enquiry: ${workflow.title}`)}>
                Discuss this pattern<span className="sr-only">: {workflow.title}</span><ArrowRight size={15} aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>

        {workflows.length === 0 ? (
          <div className="auto-empty">
            <Search size={25} aria-hidden="true" />
            <h3>No matching patterns yet.</h3>
            <p>Try a different platform or a broader term. Your workflow can also start with a conversation.</p>
            <button className="button button-primary" type="button" onClick={resetFilters}>Reset filters</button>
          </div>
        ) : null}
        {remaining > 0 ? (
          <div className="auto-more">
            <button className="button button-secondary" type="button" aria-controls="automation-results" onClick={showMore}>
              Show {Math.min(PAGE_SIZE, remaining)} more patterns <ArrowRight size={16} aria-hidden="true" />
            </button>
            <p>{remaining} more to explore</p>
          </div>
        ) : null}
        <p className="auto-enquiry-note">Enquiry links prepare an editable contact subject. Your existing draft is kept; nothing is sent until you submit the contact form.</p>
      </div>
    </section>
  )
}

export default Automations
