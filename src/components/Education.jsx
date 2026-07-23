import { Award, BadgeCheck, Eye, GraduationCap } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import SectionHeading from './SectionHeading'
import { certifications, education, recognitions } from '../data/portfolioData'

const aiCredentials = certifications.filter((credential) => credential.issuer === 'Anthropic')
const technicalCredentials = certifications.filter((credential) => credential.issuer !== 'Anthropic')
const certificateImages = certifications.filter((credential) => credential.image)

function CredentialRecord({ credential }) {
  const status = credential.expired
    ? `Expired ${credential.expired}`
    : credential.expires
      ? `Expires ${credential.expires}`
      : credential.kind

  return (
    <li className="credential-record">
      <BadgeCheck size={17} aria-hidden="true" />
      <span>
        <strong>{credential.title}</strong>
        <small>{credential.issuer}{credential.issued ? ` · Issued ${credential.issued}` : ''}</small>
        <small className={credential.expired ? 'credential-expired' : ''}>{status}</small>
        {credential.credentialId && <code>Credential ID {credential.credentialId}</code>}
      </span>
    </li>
  )
}

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
        <div className="certificate-gallery-heading">
          <div>
            <p className="eyebrow">Authentic certificate gallery · {String(certificateImages.length).padStart(2, '0')}</p>
            <h3>Uploaded completion records</h3>
          </div>
          <p>Original certificate images supplied for this portfolio. Open any image to inspect the full record.</p>
        </div>
      </ScrollReveal>

      <div className="certificate-gallery">
        {certificateImages.map((credential, index) => (
          <ScrollReveal key={credential.title} delay={(index % 5) * 50} variant="up">
            <a
              className="certificate-image-card"
              href={credential.image}
              target="_blank"
              rel="noreferrer"
              aria-label={`View full certificate: ${credential.title}`}
            >
              <span className="certificate-image-frame">
                <img
                  src={credential.image}
                  alt={`${credential.title} certificate issued by ${credential.issuer} to Charlie James Abejo`}
                  width="3300"
                  height="2550"
                  loading="lazy"
                  decoding="async"
                />
                <span className="certificate-view"><Eye size={16} aria-hidden="true" /> View certificate</span>
              </span>
              <span className="certificate-image-copy">
                <strong>{credential.title}</strong>
                <small>{credential.issuer} · {credential.issued}</small>
              </span>
            </a>
          </ScrollReveal>
        ))}
      </div>

      <div className="credential-columns">
        <ScrollReveal variant="left">
          <article className="foundation-card credential-panel">
            <div className="credential-panel-heading">
              <div className="foundation-icon"><Award size={24} aria-hidden="true" /></div>
              <div>
                <p className="eyebrow">AI & Anthropic</p>
                <h3>{aiCredentials.length} verified learning records</h3>
              </div>
            </div>
            <ul className="credential-records">
              {aiCredentials.map((credential) => <CredentialRecord key={`${credential.title}-${credential.credentialId || credential.issuer}`} credential={credential} />)}
            </ul>
          </article>
        </ScrollReveal>

        <ScrollReveal delay={80} variant="right">
          <article className="foundation-card credential-panel">
            <div className="credential-panel-heading">
              <div className="foundation-icon"><BadgeCheck size={24} aria-hidden="true" /></div>
              <div>
                <p className="eyebrow">Technical & professional</p>
                <h3>{technicalCredentials.length} certifications and training records</h3>
              </div>
            </div>
            <ul className="credential-records">
              {technicalCredentials.map((credential) => <CredentialRecord key={`${credential.title}-${credential.issuer}`} credential={credential} />)}
            </ul>
          </article>
        </ScrollReveal>
      </div>
    </div>
  </section>
)

export default Education
