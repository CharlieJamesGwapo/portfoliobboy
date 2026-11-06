import { ArrowRight, ArrowUpRight, Bot, Database, MonitorSmartphone, Workflow } from 'lucide-react'
import { requestContact } from '../lib/contactIntent'
import './services.css'

// "What can I build for you?" translates the skills list into outcomes a
// client can hire for. Every card points at real, published evidence on this
// site; nothing here claims a result that is not shown elsewhere.
export const services = [
  {
    id: 'ai-agents',
    icon: Bot,
    title: 'AI Agents',
    summary: 'Intelligent assistants and voice experiences.',
    detail: 'Voice receptionists, callback flows, tool-calling agents, and human handoff.',
    evidence: { label: 'Hear the voice demos', href: '#voice-demo' },
    subject: 'AI agent project enquiry',
  },
  {
    id: 'automation',
    icon: Workflow,
    title: 'Automation',
    summary: 'Business workflows and API integrations.',
    detail: 'n8n, GoHighLevel, Make, and Zapier workflows with retries, logging, and a human in the loop.',
    evidence: { label: 'See eight workflows', href: '#automations' },
    subject: 'AI automation project enquiry',
  },
  {
    id: 'web-mobile',
    icon: MonitorSmartphone,
    title: 'Web & Mobile',
    summary: 'Production-ready applications and SaaS products.',
    detail: 'React and Next.js web apps, Expo and native mobile apps, and the admin tools behind them.',
    evidence: { label: 'Browse client work', href: '#product-studio-preview' },
    subject: 'Web or mobile app enquiry',
  },
  {
    id: 'backend',
    icon: Database,
    title: 'Backend Systems',
    summary: 'APIs, databases, cloud infrastructure and integrations.',
    detail: 'Multi-tenant APIs, PostgreSQL, webhooks, queues, and secure access control.',
    evidence: { label: 'Read the case studies', href: '/projects' },
    subject: 'Backend system enquiry',
  },
]

export default function Services() {
  return (
    <section id="services" className="services-section" aria-labelledby="services-title">
      <div className="page-container">
        <div className="services-head">
          <div>
            <p className="eyebrow">Services</p>
            <h2 id="services-title">What can I build for you?</h2>
          </div>
          <p>
            Four kinds of work I take on, each backed by something you can open, play, or read on this site.
          </p>
        </div>

        <ul className="services-grid">
          {services.map(({ id, icon: Icon, title, summary, detail, evidence, subject }) => (
            <li key={id} className="service-card">
              <span className="service-icon" aria-hidden="true"><Icon size={20} /></span>
              <h3 id={`service-${id}-title`}>{title}</h3>
              <p className="service-summary">{summary}</p>
              <p className="service-detail">{detail}</p>
              <div className="service-links">
                <a href={evidence.href}>
                  {evidence.label} <ArrowRight size={15} aria-hidden="true" />
                </a>
                <a
                  href="#contact"
                  className="service-start"
                  onClick={() => requestContact(subject)}
                  aria-label={`Start a ${title} project`}
                >
                  Start a project <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
