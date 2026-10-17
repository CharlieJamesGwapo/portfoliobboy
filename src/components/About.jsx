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
            I build web and mobile applications, focusing on useful features, reliable backends, and clear interfaces.
          </p>
          <p>
            At Zalio I build the gym CRM and operations platform, Alex—an AI voice agent that researches, calls,
            and follows up—and Hasti&apos;s AI reception products, connected through n8n workflows that
            replace scattered tools with a single dependable workflow.
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
