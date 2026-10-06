import { ArrowDown, ArrowUpRight, Bot, Check, Headphones, Layers3, Network, SlidersHorizontal, Workflow } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import './ai-systems.css'
import { aiSystemCapabilities } from '../data/portfolioData'

const capabilityIcons = [Bot, Headphones, Workflow, Layers3, SlidersHorizontal, Network]

export const AISystems = () => {
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
                  <details className="ai-capability-details">
                    <summary>See outcomes &amp; stack <span aria-hidden="true">+</span></summary>
                    <ul>{capability.outcomes.map((outcome) => <li key={outcome}><Check size={14} aria-hidden="true" />{outcome}</li>)}</ul>
                    <div className="ai-capability-stack">{capability.stack.map((item) => <span key={item}>{item}</span>)}</div>
                  </details>
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
