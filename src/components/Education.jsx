import { Award, GraduationCap } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import SectionHeading from './SectionHeading'
import CredentialExplorer from './CredentialExplorer'
import { certifications, education, recognitions } from '../data/portfolioData'

const Education = () => (
  <section id="education" className="section section-light credentials-section">
    <div className="page-container">
      <ScrollReveal variant="left">
        <SectionHeading
          eyebrow="05 · Credentials"
          title="Education and verified continued learning."
          description="Twenty-three certificates and technical training records, plus two academic recognitions. Credential URLs are omitted where none were supplied."
          light
        />
      </ScrollReveal>

      <div className="foundation-grid credential-foundation-grid">
        <ScrollReveal variant="scale">
          <article className="foundation-card foundation-card-primary">
            <div className="foundation-icon"><GraduationCap size={24} aria-hidden="true" /></div>
            <p className="eyebrow">Education · {education.period}</p>
            <h3>{education.degree}</h3>
            <p className="foundation-place">{education.institution}</p>
            <p>{education.details}</p>
          </article>
        </ScrollReveal>

        <ScrollReveal delay={90} variant="scale">
          <article className="foundation-card recognition-card">
            <div className="foundation-icon"><Award size={24} aria-hidden="true" /></div>
            <p className="eyebrow">Academic recognition</p>
            <ul className="credential-records recognition-records">
              {recognitions.map((recognition) => (
                <li className="credential-record" key={recognition.title}>
                  <Award size={17} aria-hidden="true" />
                  <span>
                    <strong>{recognition.title}</strong>
                    <small>{recognition.issuer} · {recognition.kind}</small>
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={80} variant="up">
        <CredentialExplorer records={certifications} />
      </ScrollReveal>
    </div>
  </section>
)

export default Education
