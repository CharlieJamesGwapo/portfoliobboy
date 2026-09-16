import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { supplementalProjects } from '../data/portfolioData'

const InteractiveLab = lazy(() => import('./InteractiveLab'))

class LabErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="lab-import-error" role="alert">
          <p>The interactive lab could not load. The professional portfolio is still available.</p>
          <button type="button" className="button button-dark" onClick={() => window.location.reload()}>
            Retry lab
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

function LabLoading() {
  return (
    <div className="lab-loading" role="status" aria-live="polite" aria-atomic="true">
      Loading the interactive lab…
    </div>
  )
}

function AdditionalWork() {
  const [open, setOpen] = useState(() => (
    typeof window !== 'undefined' && window.location.hash === '#archive'
  ))
  const [labOpen, setLabOpen] = useState(false)
  const launchButtonRef = useRef(null)

  useEffect(() => {
    const syncHash = () => setOpen(window.location.hash === '#archive')
    const openArchive = () => setOpen(true)

    window.addEventListener('hashchange', syncHash)
    window.addEventListener('portfolio:open-archive', openArchive)
    return () => {
      window.removeEventListener('hashchange', syncHash)
      window.removeEventListener('portfolio:open-archive', openArchive)
    }
  }, [])

  return (
    <section id="archive" className="section section-paper additional-work-section">
      <div className="page-container">
        <details
          className="additional-work-disclosure"
          open={open}
          onToggle={(event) => setOpen(event.currentTarget.open)}
        >
          <summary>More: archive &amp; lab</summary>

          <div className="additional-work-content">
            <section className="additional-work-panel archive-panel" aria-labelledby="archive-panel-title">
              <div className="additional-work-panel-heading">
                <p className="eyebrow">Selected supplemental work</p>
                <h2 id="archive-panel-title">Additional project archive</h2>
                <p>Earlier client and product work, kept available without competing with the primary portfolio narrative.</p>
              </div>

              <div className="project-archive">
                {supplementalProjects.map((project, index) => (
                  <article key={project.id} className="archive-project">
                    <span className="archive-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <p>{project.type}</p>
                      <h3>{project.title}</h3>
                      <span>{project.description}</span>
                    </div>
                    <div className="archive-stack" aria-label={`${project.title} technologies`}>
                      {project.stack.map((technology) => <span key={technology}>{technology}</span>)}
                    </div>
                    {project.url ? (
                      <a href={project.url} target="_blank" rel="noreferrer" aria-label={`${project.title} live project`}>
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="archive-private">{project.status}</span>
                    )}
                  </article>
                ))}
              </div>
            </section>

            <section className="additional-work-panel lab-panel" aria-labelledby="lab-panel-title">
              <div className="additional-work-panel-heading">
                <p className="eyebrow">Optional experiment</p>
                <h2 id="lab-panel-title">Interactive lab</h2>
                <p>Explore the playable experiments only when you choose to open the separate arcade experience.</p>
              </div>

              <button
                ref={launchButtonRef}
                type="button"
                className="button button-dark"
                onClick={() => setLabOpen(true)}
                aria-expanded={labOpen}
              >Launch the lab</button>

              {labOpen && (
                <Suspense fallback={<LabLoading />}>
                  <LabErrorBoundary>
                    <InteractiveLab
                      onClose={() => setLabOpen(false)}
                      returnFocusRef={launchButtonRef}
                    />
                  </LabErrorBoundary>
                </Suspense>
              )}
            </section>
          </div>
        </details>
      </div>
    </section>
  )
}

export default AdditionalWork
