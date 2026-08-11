import { useState } from 'react'
import { ChevronDown, MapPin } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import SectionHeading from './SectionHeading'
import { experiences } from '../data/portfolioData'

const Experience = () => {
  const [expanded, setExpanded] = useState(0)

  return (
    <section id="experience" className="section section-dark">
      <div className="page-container">
        <ScrollReveal variant="left">
          <SectionHeading
            eyebrow="02 · Experience"
            title="Building across product, platform, and integration layers."
            description="Recent roles where I owned meaningful systems, not just isolated tickets."
          />
        </ScrollReveal>

        <div className="experience-list">
          {experiences.map((experience, index) => {
            const isExpanded = expanded === index
            const panelId = `experience-panel-${index}`
            return (
              <ScrollReveal key={`${experience.company}-${experience.period}`} delay={(index % 4) * 55} variant="right">
                {index === 4 && (
                  <div className="timeline-chapter">
                    <span>2021—2023</span>
                    <strong>Earlier product engagements</strong>
                    <p>Project-based experience across point of sale, scheduling, mobile, and real-time products.</p>
                  </div>
                )}
                <article className={`experience-item ${experience.featured ? 'is-featured' : ''}`}>
                  <button
                    type="button"
                    className="experience-trigger"
                    onClick={() => setExpanded(isExpanded ? -1 : index)}
                    aria-expanded={isExpanded}
                    aria-controls={panelId}
                  >
                    <span className="experience-index">{String(index + 1).padStart(2, '0')}</span>
                    <span className="experience-title">
                      <strong>{experience.role}</strong>
                      <span>{experience.company}</span>
                    </span>
                    <span className="experience-meta">
                      <span>{experience.period}</span>
                      <span><MapPin size={13} aria-hidden="true" /> {experience.location}</span>
                    </span>
                    <span className={`experience-toggle ${isExpanded ? 'is-open' : ''}`}>
                      <ChevronDown size={20} aria-hidden="true" />
                    </span>
                  </button>

                  <div id={panelId} className={`experience-panel ${isExpanded ? 'is-open' : ''}`}>
                    <div className="experience-panel-inner">
                      <p className="experience-summary">{experience.summary}</p>
                      <ul>
                        {experience.achievements.map((achievement) => <li key={achievement}>{achievement}</li>)}
                      </ul>
                      <div className="tag-list">
                        {experience.stack.map((item) => <span key={item}>{item}</span>)}
                      </div>
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            )
          })}
        </div>

        <ScrollReveal variant="fade">
          <div className="experience-summary-strip" aria-label="Experience summary">
            <div><strong>2</strong><span>Years shipping</span></div>
            <div><strong>10</strong><span>Roles and engagements</span></div>
            <div><strong>Web + mobile</strong><span>Product coverage</span></div>
            <div><strong>Remote</strong><span>Australia and US overlap</span></div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default Experience
