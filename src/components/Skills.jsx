import ScrollReveal from './ScrollReveal'
import SectionHeading from './SectionHeading'
import { skillGroups } from '../data/portfolioData'

const Skills = () => (
  <section id="skills" className="section section-dark skills-section">
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
        {skillGroups.map((group, index) => (
          <ScrollReveal key={group.title} delay={index * 65} variant="right">
            <article className="skill-group">
              <div className="skill-group-heading">
                <span>0{index + 1}</span>
                <h3>{group.title}</h3>
              </div>
              <div className="skill-cloud">
                {group.skills.map((skill) => <span key={skill}>{skill}</span>)}
              </div>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
)

export default Skills
