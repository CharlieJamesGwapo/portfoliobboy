import { useState } from 'react'
import { ArrowRight, CheckCircle2, Zap } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import { automationPlatforms, automationToolbox, automationWorkflows } from '../data/automationsData'
import './automations.css'

const WorkflowFlow = ({ trigger, steps, outcome }) => (
  <ol className="auto-flow" aria-label="Workflow steps">
    <li className="auto-node auto-node-trigger">
      <span className="auto-node-kind"><Zap size={11} aria-hidden="true" /> Trigger</span>
      {trigger}
    </li>
    {steps.map((step) => (
      <li key={step} className="auto-node">{step}</li>
    ))}
    <li className="auto-node auto-node-outcome">
      <span className="auto-node-kind"><CheckCircle2 size={11} aria-hidden="true" /> Result</span>
      {outcome}
    </li>
  </ol>
)

const Automations = () => {
  const [platform, setPlatform] = useState(automationPlatforms[0])
  const workflows = platform === automationPlatforms[0]
    ? automationWorkflows
    : automationWorkflows.filter((workflow) => workflow.platform === platform)

  return (
    <section id="automations" className="section section-dark automations-section" aria-labelledby="automations-title">
      <div className="page-container">
        <ScrollReveal>
          <div className="auto-intro">
            <div>
              <p className="eyebrow">AI automations</p>
              <h2 id="automations-title">Workflows that run<br />the busywork for you.</h2>
            </div>
            <div className="auto-intro-copy">
              <p>
                n8n, GoHighLevel, Make, and Zapier workflows, plus AI agents that qualify leads, book appointments,
                and follow up automatically. Each one is built with retries, logging, and a human handoff.
              </p>
              <a className="button button-primary" href="#contact">
                Automate a workflow <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="auto-toolbox" aria-label="Platforms I build with">
            <span>Platforms I build with</span>
            <ul>{automationToolbox.map((tool) => <li key={tool}>{tool}</li>)}</ul>
          </div>
        </ScrollReveal>

        <div className="auto-toolbar">
          <div className="auto-filters" role="group" aria-label="Filter automations by platform">
            {automationPlatforms.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={platform === item}
                className={platform === item ? 'is-active' : ''}
                onClick={() => setPlatform(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <p aria-live="polite">{workflows.length} {workflows.length === 1 ? 'workflow' : 'workflows'}</p>
        </div>

        <div className="auto-grid">
          {workflows.map((workflow) => (
            <article key={workflow.id} className="auto-card">
              <div className="auto-card-meta">
                <span className="auto-platform">{workflow.platform}</span>
              </div>
              <h3>{workflow.title}</h3>
              <p className="auto-summary">{workflow.summary}</p>
              <WorkflowFlow trigger={workflow.trigger} steps={workflow.steps} outcome={workflow.outcome} />
              <div className="auto-tools">
                {workflow.tools.map((tool) => <span key={tool}>{tool}</span>)}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Automations
