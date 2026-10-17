import { useState } from 'react'
import { ArrowUpRight, ChevronDown, MapPin } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import SectionHeading from './SectionHeading'
import { experiences } from '../data/portfolioData'
import './experience.css'

// Achievements shown before the mobile "Show more" toggle (CSS-only; desktop shows all).
const MOBILE_VISIBLE_ACHIEVEMENTS = 3

const Experience = () => {
  const [expanded, setExpanded] = useState(0)
  const [showAll, setShowAll] = useState({})

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
            const listId = `experience-achievements-${index}`
            const extraCount = Math.max(0, experience.achievements.length - MOBILE_VISIBLE_ACHIEVEMENTS)
            const allShown = Boolean(showAll[index])
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
                      {Array.isArray(experience.links) && experience.links.length > 0 && (
                        <ul className="experience-links" aria-label={`Links for ${experience.company}`}>
                          {experience.links.map((link) => (
                            <li key={link.url}>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`${link.label} (opens in a new tab)`}
                              >
                                {link.label}
                                <ArrowUpRight size={14} aria-hidden="true" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                      <ul id={listId} className={extraCount > 0 && !allShown ? 'is-collapsed' : ''}>
                        {experience.achievements.map((achievement, achievementIndex) => (
                          <li
                            key={achievement}
                            className={achievementIndex >= MOBILE_VISIBLE_ACHIEVEMENTS ? 'is-extra' : undefined}
                          >
                            {achievement}
                          </li>
                        ))}
                      </ul>
                      {extraCount > 0 && (
                        <button
                          type="button"
                          className="experience-more"
                          aria-expanded={allShown}
                          aria-controls={listId}
                          onClick={() => setShowAll((current) => ({ ...current, [index]: !current[index] }))}
                        >
                          {allShown ? 'Show less' : `Show ${extraCount} more`}
                          <ChevronDown size={16} aria-hidden="true" />
                        </button>
                      )}
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
            <div><strong>Hands-on</strong><span>Development</span></div>
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
