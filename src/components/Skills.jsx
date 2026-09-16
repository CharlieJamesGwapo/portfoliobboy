import ScrollReveal from './ScrollReveal'
import SectionHeading from './SectionHeading'
import { capabilityGroups } from '../data/portfolioData'

const Skills = () => (
  <section id="capabilities" className="section section-dark skills-section">
    <div className="page-container skills-layout">
      <ScrollReveal variant="left">
        <div className="skills-sticky">
          <SectionHeading
            eyebrow="04 · Capabilities"
            title="Modern tools, applied with production judgment."
            description="I choose technology around product constraints, operating cost, reliability, and the team that will maintain it."
          />
          <div className="principles">
            <span>Secure by design</span>
            <span>Observable systems</span>
            <span>Accessible interfaces</span>
            <span>Maintainable delivery</span>
          </div>
        </div>
      </ScrollReveal>

      <div className="skill-groups">
        {capabilityGroups.map((group, index) => (
          <ScrollReveal key={group.title} delay={index * 65} variant="right">
            <article className="skill-group">
              <div className="skill-group-heading">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{group.title}</h3>
              </div>
              <p className="skill-group-description">{group.description}</p>
              <ul className="skill-metadata-list" aria-label={`${group.title} technologies`}>
                {group.skills.map((skill) => <li key={skill}>{skill}</li>)}
              </ul>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
)

export default Skills
