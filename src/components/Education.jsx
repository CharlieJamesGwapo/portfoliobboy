import { useState } from 'react'
import { Award, BadgeCheck, ChevronDown, Eye, GraduationCap } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import SectionHeading from './SectionHeading'
import { certifications, education, recognitions } from '../data/portfolioData'
import './education.css'

// Records shown per credential panel before the mobile "Show all" toggle (CSS-only; desktop shows all).
const MOBILE_VISIBLE_RECORDS = 4

const aiCredentials = certifications.filter((credential) => credential.issuer === 'Anthropic')
const technicalCredentials = certifications.filter((credential) => credential.issuer !== 'Anthropic')
const certificateImages = certifications.filter((credential) => credential.image)

function CredentialRecord({ credential, extra = false }) {
  const status = credential.expired
    ? `Expired ${credential.expired}`
    : credential.expires
      ? `Expires ${credential.expires}`
      : credential.kind

  return (
    <li className={`credential-record ${extra ? 'is-extra' : ''}`}>
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

function CredentialPanel({ id, icon: Icon, eyebrow, title, credentials, getKey, delay, variant }) {
  const [showAll, setShowAll] = useState(false)
  const listId = `credential-records-${id}`
  const extraCount = Math.max(0, credentials.length - MOBILE_VISIBLE_RECORDS)

  return (
    <ScrollReveal delay={delay} variant={variant}>
      <article className="foundation-card credential-panel">
        <div className="credential-panel-heading">
          <div className="foundation-icon"><Icon size={24} aria-hidden="true" /></div>
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h3>{title}</h3>
          </div>
        </div>
        <ul id={listId} className={`credential-records ${extraCount > 0 && !showAll ? 'is-collapsed' : ''}`}>
          {credentials.map((credential, index) => (
            <CredentialRecord
              key={getKey(credential)}
              credential={credential}
              extra={index >= MOBILE_VISIBLE_RECORDS}
            />
          ))}
        </ul>
        {extraCount > 0 && (
          <button
            type="button"
            className="credential-more"
            aria-expanded={showAll}
            aria-controls={listId}
            onClick={() => setShowAll((current) => !current)}
          >
            {showAll ? 'Show fewer records' : `Show all ${credentials.length} records`}
            <ChevronDown size={16} aria-hidden="true" />
          </button>
        )}
      </article>
    </ScrollReveal>
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
                {/* Gallery uses a 900px WebP thumbnail (~13 kB); the full
                    1800px WebP is only fetched when the card is opened. */}
                <img
                  src={credential.thumb || credential.image}
                  alt={`${credential.title} certificate issued by ${credential.issuer} to Charlie James Abejo`}
                  width="900"
                  height="696"
                  sizes="(max-width: 768px) 46vw, (max-width: 1024px) 30vw, 22vw"
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
        <CredentialPanel
          id="ai"
          icon={Award}
          eyebrow="AI & Anthropic"
          title={`${aiCredentials.length} verified learning records`}
          credentials={aiCredentials}
          getKey={(credential) => `${credential.title}-${credential.credentialId || credential.issuer}`}
          variant="left"
        />
        <CredentialPanel
          id="technical"
          icon={BadgeCheck}
          eyebrow="Technical & professional"
          title={`${technicalCredentials.length} certifications and training records`}
          credentials={technicalCredentials}
          getKey={(credential) => `${credential.title}-${credential.issuer}`}
          delay={80}
          variant="right"
        />
      </div>
    </div>
  </section>
)

export default Education
