import { ArrowUpRight, Blocks, Bot, Radio, ShieldCheck } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import SectionHeading from './SectionHeading'
import { fitHighlights, profile } from '../data/portfolioData'

const icons = [Bot, Radio, ShieldCheck, Blocks]

const About = () => (
  <section id="about" className="section section-light">
    <div className="page-container about-layout">
      <ScrollReveal className="about-intro" variant="left">
        <SectionHeading
          eyebrow="01 · About"
          title="A product-minded engineer for systems that have to work."
          light
        />
        <div className="about-copy">
          <p>
            I build AI voice agents, custom CRM platforms, lending applications, and web and mobile business systems,
            combining technical leadership, backend and API development, service modernization, and project delivery.
          </p>
          <p>
            At Zalio, I led delivery of a gym CRM and operations platform, built Alex/Hasti voice AI with LiveKit,
            OpenAI, Twilio, and n8n, and delivered Expo mobile features with reliable financial-record
            synchronization. That engagement ran from June through September 2026.
          </p>
          <p>
            I&apos;m also building independent products: AutoFlow AI Pro is in development with planned integrations;
            EasyAppy is a local-first Mac application; AgentForge is a TypeScript developer and AI workflow toolkit;
            and BBOY is a native macOS AI assistant at version 0.7.0.
          </p>
          <a href={`mailto:${profile.email}`} className="text-link">
            Discuss a role or project <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </ScrollReveal>

      <div className="fit-grid">
        {fitHighlights.map((item, index) => {
          const Icon = icons[index]
          return (
            <ScrollReveal key={item.title} delay={index * 70} variant="scale">
              <article className="fit-card">
                <div className="fit-card-icon"><Icon size={21} aria-hidden="true" /></div>
                <span>0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            </ScrollReveal>
          )
        })}
      </div>
    </div>
  </section>
)

export default About
