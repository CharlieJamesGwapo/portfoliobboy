import { ArrowUpRight, Award, BadgeCheck, GraduationCap } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import SectionHeading from './SectionHeading'
import { credentials, education, recognitions, resumeUrl } from '../data/portfolioData'

const CredentialRecord = ({ credential }) => (
  <li className="credential-record">
    <BadgeCheck size={17} aria-hidden="true" />
    <span>
      <strong>{credential.title}</strong>
      <small>{credential.issuer}{credential.issued ? ` · ${credential.issued}` : ''}</small>
      {credential.image && (
        <a
          href={credential.image}
          target="_blank"
          rel="noreferrer"
          aria-label={`View certificate for ${credential.title}`}
        >
          View certificate <ArrowUpRight size={13} aria-hidden="true" />
        </a>
      )}
    </span>
  </li>
)

const Education = () => (
  <section id="credentials" className="section section-light credentials-section">
    <div className="page-container">
      <ScrollReveal variant="left">
        <SectionHeading
          eyebrow="05 · Credentials"
          title="Education and verified continued learning."
          description="Academic grounding and selected training records that support the way I build production systems."
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
                    <small>{recognition.issuer}{recognition.period ? ` · ${recognition.period}` : ''}</small>
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={80} variant="up">
        <section className="credentials-list-section" aria-labelledby="credentials-list-title">
          <div className="credentials-list-heading">
            <p className="eyebrow">Professional learning</p>
            <h3 id="credentials-list-title">Training records</h3>
          </div>
          <ul className="credential-records credential-list">
            {credentials.map((credential) => <CredentialRecord key={credential.title} credential={credential} />)}
          </ul>
          <a className="resume-download" href={resumeUrl} download="charlie-james-abejo-resume.pdf">
            Download resume (PDF, approximately 505 KB) <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </section>
      </ScrollReveal>
    </div>
  </section>
)

export default Education
