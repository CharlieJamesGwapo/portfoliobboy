import ScrollReveal from './ScrollReveal'
import SectionHeading from './SectionHeading'
import SystemDiagram from './SystemDiagram'
import { caseStudies } from '../data/portfolioData'

const Projects = () => (
  <section id="work" className="section section-paper projects-section">
    <div className="page-container">
      <ScrollReveal variant="left">
        <SectionHeading
          eyebrow="02 · Selected work"
          title="Systems designed around real operational pressure."
          description="Three case studies across CRM operations, regulated fintech, and cross-platform booking products."
          light
        />
      </ScrollReveal>

      <div className="case-study-list">
        {caseStudies.map((study, index) => (
          <ScrollReveal key={study.id} delay={index * 65} variant="up">
            <article className={`case-study ${index % 2 ? 'case-study-reverse' : ''}`}>
              <div className="case-study-story">
                <p className="project-eyebrow">{study.label}</p>
                <h3>{study.title}</h3>
                {study.confidentialityNote && <p className="case-study-confidentiality">{study.confidentialityNote}</p>}

                <div className="case-study-section">
                  <h4>Context</h4>
                  <p>{study.context}</p>
                </div>

                <div className="case-study-section">
                  <h4>Responsibility</h4>
                  <ul>
                    {study.responsibilities.map((responsibility) => <li key={responsibility}>{responsibility}</li>)}
                  </ul>
                </div>

                <div className="case-study-section">
                  <h4>Reliability &amp; safeguards</h4>
                  <ul>
                    {study.reliability.map((safeguard) => <li key={safeguard}>{safeguard}</li>)}
                  </ul>
                </div>

                <div className="case-study-section case-study-delivered">
                  <h4>Delivered</h4>
                  <p>{study.delivered}</p>
                </div>

                <p className="case-study-stack">
                  <span>Stack</span>
                  {study.stack.map((technology) => <span key={technology}>{technology}</span>)}
                </p>
              </div>

              <SystemDiagram nodes={study.system.nodes} edges={study.system.edges} title={`${study.title} system map`} />
            </article>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
)

export default Projects
