import { useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronRight, LockKeyhole } from 'lucide-react'
import { caseStudies, getCaseStudyBySlug } from '../data/caseStudies.js'
import { ProductMedia } from './IndependentProducts.jsx'
import './case-study-page.css'

const toList = (value) => (Array.isArray(value) ? value : value ? [value] : [])

function ScreenshotGallery({ study }) {
  const [failedIds, setFailedIds] = useState([])
  const screenshots = study.screenshots || []

  return (
    <figure className="case-study-gallery">
      <div className="case-study-gallery-grid">
        {screenshots.map((screen) => {
          const failed = failedIds.includes(screen.id)
          return (
            <a
              key={screen.id}
              className={`case-study-gallery-item${failed ? ' is-unavailable' : ''}`}
              href={failed ? undefined : screen.src}
              target={failed ? undefined : '_blank'}
              rel={failed ? undefined : 'noreferrer noopener'}
              aria-label={failed ? undefined : `View full OneRide ${screen.label} screenshot`}
              onClick={failed ? (event) => event.preventDefault() : undefined}
            >
              {failed ? (
                <span className="case-study-media-failure" role="status">Screenshot preview unavailable</span>
              ) : (
                <img
                  src={screen.src}
                  alt={screen.alt}
                  loading="lazy"
                  decoding="async"
                  onError={() => setFailedIds((ids) => (ids.includes(screen.id) ? ids : [...ids, screen.id]))}
                />
              )}
              <span>{screen.label}</span>
            </a>
          )
        })}
      </div>
      {study.screenshotSource?.href && (
        <figcaption>
          <span>{study.mediaCaption}</span>
          <a href={study.screenshotSource.href} target="_blank" rel="noreferrer noopener">
            {study.screenshotSource.label} <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </figcaption>
      )}
    </figure>
  )
}

function ProjectImage({ study }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <figure className="case-study-image-figure">
        <div className="case-study-image-failure" role="status">
          <span>Preview image unavailable</span>
          <strong>Project details, architecture, and links remain available.</strong>
        </div>
        <figcaption>{study.mediaCaption}</figcaption>
      </figure>
    )
  }

  return (
    <figure className="case-study-image-figure">
      <img src={study.image} alt={study.imageAlt} loading="lazy" decoding="async" onError={() => setFailed(true)} />
      <figcaption>{study.mediaCaption}</figcaption>
    </figure>
  )
}

function ArchitectureDiagram({ study }) {
  const flows = study.architectureFlows || []
  const components = study.architecture || []

  return (
    <div className="case-study-architecture-map">
      {flows.length > 0 && (
        <div className="case-study-flows">
          {flows.map((flow) => (
            <div className="case-study-flow" key={flow.label}>
              <h3>{flow.label}</h3>
              <ol aria-label={`${flow.label} sequence`}>
                {flow.stages.map((stage, index) => (
                  <li key={stage}>
                    <span>{stage}</span>
                    {index < flow.stages.length - 1 && <ChevronRight className="case-study-flow-arrow" size={17} aria-hidden="true" />}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
      {components.length > 0 && (
        <div className="case-study-components">
          <h3>Documented system components</h3>
          <ul>
            {components.map((component) => <li key={component}>{component}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}

function CaseStudyVisual({ study }) {
  if (study.mediaProduct) return <ProductMedia product={study.mediaProduct} variant="project" />
  if (study.screenshots?.length) return <ScreenshotGallery study={study} />
  if (study.image) return <ProjectImage study={study} />

  return (
    <figure className="case-study-documentation-map">
      <div>
        <p>Engineering map</p>
        <strong>{study.title}</strong>
        <ul>{toList(study.architecture).slice(0, 4).map((component) => <li key={component}>{component}</li>)}</ul>
      </div>
      <figcaption>Architecture summary from the project record · no interface screenshot supplied.</figcaption>
    </figure>
  )
}

function NotFound({ slug }) {
  return (
    <article className="case-study-page case-study-not-found" aria-labelledby="case-study-not-found-title">
      <div className="case-study-container">
        <nav className="case-study-breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li><a href="/">Home</a><ChevronRight size={14} aria-hidden="true" /></li>
            <li><a href="/projects">All projects</a></li>
          </ol>
        </nav>
        <div className="case-study-not-found-card">
          <p className="case-study-eyebrow">Project case study</p>
          <h1 id="case-study-not-found-title">This project page is unavailable.</h1>
          <p>No case study was found for “{slug}”. Browse the project list to choose another project.</p>
          <a className="case-study-button case-study-button-primary" href="/projects"><ArrowLeft size={16} aria-hidden="true" /> All projects</a>
        </div>
      </div>
    </article>
  )
}

export default function CaseStudyPage({ slug, study: providedStudy }) {
  const study = providedStudy || getCaseStudyBySlug(slug)
  if (!study) return <NotFound slug={slug || ''} />

  const studyIndex = caseStudies.findIndex((item) => item.slug === study.slug)
  const nextStudy = caseStudies[(studyIndex + 1) % caseStudies.length]
  const featureList = toList(study.workflows)
  const currentCapabilities = study.slug === 'contextpilot'

  return (
    <article className="case-study-page" aria-labelledby="case-study-title" data-case-study={study.slug}>
      <div className="case-study-container">
        <nav className="case-study-breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li><a href="/">Home</a><ChevronRight size={14} aria-hidden="true" /></li>
            <li><a href="/projects">All projects</a><ChevronRight size={14} aria-hidden="true" /></li>
            <li aria-current="page">{study.title}</li>
          </ol>
        </nav>

        <header className="case-study-hero">
          <div className="case-study-hero-copy">
            <p className="case-study-eyebrow">Project case study{study.categories?.length ? ` · ${study.categories.join(' · ')}` : ''}</p>
            <h1 id="case-study-title">{study.title}</h1>
            <p className="case-study-overview">{study.overview}</p>
            <div className="case-study-hero-meta">
              <span className="case-study-role">{study.role}</span>
              <span className="case-study-status"><span aria-hidden="true" />{study.status}</span>
            </div>
            <div className="case-study-hero-actions">
              <a className="case-study-button case-study-button-primary" href="/projects">Explore my work <ArrowRight size={16} aria-hidden="true" /></a>
              <a className="case-study-button case-study-button-secondary" href="/#contact">Discuss a similar project</a>
            </div>
          </div>
          <CaseStudyVisual study={study} />
        </header>

        <div className="case-study-body">
          <section className="case-study-section case-study-problem" aria-labelledby="case-study-problem-title">
            <p className="case-study-section-index">01 / Context</p>
            <h2 id="case-study-problem-title">Problem</h2>
            <p>{study.problem}</p>
          </section>

          <section className="case-study-section case-study-role-section" aria-labelledby="case-study-role-title">
            <p className="case-study-section-index">02 / Contribution</p>
            <h2 id="case-study-role-title">My role</h2>
            <p className="case-study-role-intro">{study.role}</p>
            <ul className="case-study-responsibilities">
              {toList(study.responsibilities).map((responsibility) => <li key={responsibility}>{responsibility}</li>)}
            </ul>
          </section>

          <section className="case-study-section case-study-architecture" aria-labelledby="case-study-architecture-title">
            <p className="case-study-section-index">03 / System design</p>
            <h2 id="case-study-architecture-title">Architecture</h2>
            <p>Component summary based on the documented project stack. The flow rows show only relationships described for this system.</p>
            <ArchitectureDiagram study={study} />
            <ul className="case-study-stack" aria-label="Technology stack">
              {study.stack.map((technology) => <li key={technology}>{technology}</li>)}
            </ul>
          </section>

          <section className="case-study-section case-study-decisions" aria-labelledby="case-study-decisions-title">
            <p className="case-study-section-index">04 / Implementation</p>
            <h2 id="case-study-decisions-title">Implementation decisions</h2>
            <p>{study.implementationDecision}</p>
          </section>

          <section className="case-study-section case-study-workflows" aria-labelledby="case-study-workflows-title">
            <p className="case-study-section-index">05 / Product workflows</p>
            <h2 id="case-study-workflows-title">Key workflows & integrations</h2>
            <ul>{featureList.map((feature) => <li key={feature}>{feature}</li>)}</ul>
          </section>

          {currentCapabilities && (
            <>
              <section className="case-study-section case-study-current" aria-labelledby="contextpilot-current-title">
                <p className="case-study-section-index">Current product</p>
                <h2 id="contextpilot-current-title">Current capabilities</h2>
                <ul>{study.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
              </section>
              <section className="case-study-section case-study-proposed" aria-labelledby="contextpilot-proposed-title">
                <p className="case-study-section-index">Proposed direction</p>
                <h2 id="contextpilot-proposed-title">Proposed Voice AI Agents</h2>
                <p>This is a proposed experience. These voice capabilities are not presented as current shipped features.</p>
                <ul>{study.proposedFeatures.map((feature) => <li key={feature}>{feature}</li>)}</ul>
              </section>
            </>
          )}

          <details className="case-study-engineering-disclosure" open>
            <summary>Engineering & reliability details</summary>
          <div className="case-study-engineering-grid">
            <section className="case-study-section" aria-labelledby="case-study-challenges-title">
              <p className="case-study-section-index">06 / Engineering</p>
              <h2 id="case-study-challenges-title">Engineering challenges</h2>
              <p>{study.engineeringChallenges}</p>
            </section>
            <section className="case-study-section" aria-labelledby="case-study-security-title">
              <p className="case-study-section-index">07 / Operations</p>
              <h2 id="case-study-security-title">Security, reliability & operations</h2>
              <p>{study.securityReliability}</p>
            </section>
          </div>
          </details>

          <section className="case-study-outcome" aria-labelledby="case-study-outcome-title">
            <div>
              <p className="case-study-section-index">08 / Delivery</p>
              <h2 id="case-study-outcome-title">Delivered outcome</h2>
              <p>{study.outcome}</p>
            </div>
            <p className="case-study-outcome-status"><span>Project status</span><strong>{study.status}</strong></p>
          </section>

          <section className="case-study-links" aria-labelledby="case-study-links-title">
            <div>
              <p className="case-study-section-index">Continue exploring</p>
              <h2 id="case-study-links-title">Relevant links</h2>
              <p>Public demos and repositories are linked when a shareable URL is available.</p>
            </div>
            <div className="case-study-link-list">
              {study.links.length ? study.links.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer noopener">
                  {link.label} <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              )) : (
                <p className="case-study-no-public-link"><LockKeyhole size={15} aria-hidden="true" /> No public demo or repository link is provided.</p>
              )}
              {study.proof && <p className="case-study-proof-note">{study.proof}</p>}
            </div>
          </section>

          {nextStudy && (
            <nav className="case-study-next" aria-label="Recommended next project">
              <a className="case-study-next-card" href={`/projects/${nextStudy.slug}`}>
                <span><ArrowRight size={16} aria-hidden="true" /> Next project</span>
                <strong>{nextStudy.title}</strong>
                <small>{nextStudy.overview}</small>
              </a>
              <a className="case-study-back-link" href="/projects"><ArrowLeft size={15} aria-hidden="true" /> All projects</a>
            </nav>
          )}
        </div>
      </div>
    </article>
  )
}
