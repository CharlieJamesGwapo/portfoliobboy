import { ArrowDown, ArrowRight, Braces, Database, Sparkles } from 'lucide-react'

// A small architecture sketch, not a live product or a performance claim.
const HeroWorkflowSignature = () => (
  <figure className="hero-workflow" aria-label="Illustrative AI workflow: input, AI processing, and API or CRM integration">
    <figcaption className="hero-workflow-heading">
      <strong>How the pieces connect</strong>
      <span>Illustrative workflow</span>
    </figcaption>
    <ol className="hero-workflow-path">
      <li>
        <span className="hero-workflow-icon"><Braces size={17} aria-hidden="true" /></span>
        <span><strong>Input</strong><small>A request</small></span>
        <ArrowRight className="hero-workflow-arrow" size={15} aria-hidden="true" />
      </li>
      <li>
        <span className="hero-workflow-icon"><Sparkles size={17} aria-hidden="true" /></span>
        <span><strong>AI layer</strong><small>Interpret + route</small></span>
        <ArrowRight className="hero-workflow-arrow" size={15} aria-hidden="true" />
      </li>
      <li>
        <span className="hero-workflow-icon"><Database size={17} aria-hidden="true" /></span>
        <span><strong>API / CRM</strong><small>Connect systems</small></span>
      </li>
    </ol>
    <details className="hero-workflow-details">
      <summary>Trace the workflow <ArrowDown size={13} aria-hidden="true" /></summary>
      <p>A request becomes structured information. An AI layer interprets it, then an API connects the next step to a CRM or another system. This sketch illustrates the architecture; explore the projects for real implementations.</p>
    </details>
  </figure>
)

export default HeroWorkflowSignature
