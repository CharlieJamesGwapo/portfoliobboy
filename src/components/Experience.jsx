import { MapPin } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import SectionHeading from './SectionHeading'
import { earlierWork, experienceTimeline } from '../data/portfolioData'

const Experience = () => (
  <section id="experience" className="section section-dark">
    <div className="page-container">
      <ScrollReveal variant="left">
        <SectionHeading
          eyebrow="03 · Experience"
          title="Building across product, platform, and integration layers."
          description="Recent roles where I owned meaningful systems, not just isolated tickets."
        />
      </ScrollReveal>

      <div className="experience-list">
        {experienceTimeline.map((experience, index) => (
          <ScrollReveal key={experience.id} delay={index * 55} variant="right">
            <article className="experience-item experience-record">
              <div className="experience-record-heading">
                <span className="experience-index">{String(index + 1).padStart(2, '0')}</span>
                <div className="experience-title">
                  <h3>{experience.role}</h3>
                  <span>{experience.company}</span>
                </div>
                <div className="experience-meta">
                  <span>{experience.period}</span>
                  <span><MapPin size={13} aria-hidden="true" /> {experience.location}</span>
                </div>
              </div>

              <div className="experience-record-body">
                <p className="experience-summary">{experience.summary}</p>
                <ul>
                  {experience.achievements.map((achievement) => <li key={achievement}>{achievement}</li>)}
                </ul>
                <p className="experience-stack" aria-label={`${experience.role} technologies`}>
                  {experience.stack.map((technology) => <span key={technology}>{technology}</span>)}
                </p>
              </div>
            </article>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal variant="up">
        <aside className="earlier-work" aria-labelledby="earlier-work-title">
          <div className="earlier-work-heading">
            <p className="eyebrow">2021 - 2023</p>
            <h3 id="earlier-work-title">Earlier Full-Stack &amp; Mobile Projects</h3>
          </div>
          <div className="earlier-work-list">
            {earlierWork.map((project) => (
              <article key={project.title} className="earlier-work-record">
                <h4>{project.title}</h4>
                <p>{project.summary}</p>
                <p className="experience-stack" aria-label={`${project.title} technologies`}>
                  {project.stack.map((technology) => <span key={technology}>{technology}</span>)}
                </p>
              </article>
            ))}
          </div>
        </aside>
      </ScrollReveal>
    </div>
  </section>
)

export default Experience
