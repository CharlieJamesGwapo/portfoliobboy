import { useState } from 'react'
import { Archive, ArrowUpRight, FolderGit2, ImageOff, LockKeyhole, Search, X } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import SectionHeading from './SectionHeading'
import { oneRidePreview } from '../data/productPreviewData'
import './project-discovery.css'
import { featuredProjects, projectArchive, projectCategories } from '../data/portfolioData'

// How many builds sit behind each filter. Computed once at module scope: the
// project data is static, so recomputing it per render (or per keystroke on
// the filter row) would be pure waste.
const categoryCounts = Object.fromEntries(
  projectCategories.map((category) => [
    category,
    category === 'All'
      ? featuredProjects.length + projectArchive.length
      : featuredProjects.filter((item) => item.categories.includes(category)).length
        + projectArchive.filter((item) => item.categories.includes(category)).length,
  ]),
)

const Projects = () => {
  const [query, setQuery] = useState('')
  const [archiveOpen, setArchiveOpen] = useState(false)
  const matchesQuery = (item) => !query.trim() || [item.title, item.overview, item.description, ...item.stack].join(' ').toLowerCase().includes(query.trim().toLowerCase())
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeProjectId, setActiveProjectId] = useState(featuredProjects[0].id)
  const visibleFeatured = featuredProjects.filter((item) => (activeCategory === 'All' || item.categories.includes(activeCategory)) && matchesQuery(item))
  const visibleArchive = projectArchive.filter((item) => (activeCategory === 'All' || item.categories.includes(activeCategory)) && matchesQuery(item))
  const shownArchive = archiveOpen || query.trim() || activeCategory !== 'All' ? visibleArchive : visibleArchive.slice(0, 3)
  const project = visibleFeatured.find((item) => item.id === activeProjectId) || visibleFeatured[0]
  const activeProject = project ? visibleFeatured.findIndex((item) => item.id === project.id) : -1

  const selectCategory = (category) => {
    const nextProjects = category === 'All'
      ? featuredProjects
      : featuredProjects.filter((item) => item.categories.includes(category))
    setActiveCategory(category)
    // Optional chaining, not `[0].id`: every category currently has at least
    // one featured project, but a future data edit that empties one would
    // otherwise take the whole page down with a TypeError during render.
    setActiveProjectId(nextProjects[0]?.id ?? null)
  }

  const handleTabKeyDown = (event, index) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const nextIndex = event.key === 'Home'
      ? 0
        : event.key === 'End'
        ? visibleFeatured.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + visibleFeatured.length) % visibleFeatured.length
    setActiveProjectId(visibleFeatured[nextIndex].id)
    document.getElementById(`project-tab-${nextIndex}`)?.focus()
  }

  return (
    <section id="projects" className="section section-paper projects-section">
      <div className="page-container">
        <ScrollReveal variant="left">
          <SectionHeading
            eyebrow="03 · Product work"
            title="Systems designed around real operational pressure."
            description={`${featuredProjects.length} detailed case studies and ${projectArchive.length} additional builds. Explore the product, the engineering decisions, and what was delivered.`}
            light
          />
        </ScrollReveal>

        <div className="project-search-row">
          <label className="project-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search projects</span>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a project, technology, or workflow…" />
          </label>
          {query && <button type="button" className="project-search-clear" onClick={() => setQuery('')}><X size={16} aria-hidden="true" /> Clear search</button>}
          <span className="project-search-count" role="status">{visibleFeatured.length + visibleArchive.length} builds found</span>
        </div>

        <ScrollReveal variant="up" delay={45}>
          <div className="project-filters" aria-label="Filter projects by category">
            {projectCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={activeCategory === category ? 'is-active' : ''}
                aria-pressed={activeCategory === category}
                onClick={() => selectCategory(category)}
              >
                {category}
                <small aria-hidden="true">{categoryCounts[category]}</small>
                <span className="sr-only">{` — ${categoryCounts[category]} builds`}</span>
              </button>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal variant="up" delay={80}>
          <div className="project-tabs" role="tablist" aria-label="Featured project case studies">
            {visibleFeatured.map((item, index) => (
              <button
                key={item.id}
                id={`project-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={activeProject === index}
                aria-controls="active-project-panel"
                tabIndex={activeProject === index ? 0 : -1}
                className={activeProject === index ? 'is-active' : ''}
                onClick={() => setActiveProjectId(item.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                {item.title}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Screen readers get told what the filter did; sighted users can see
            the tab strip change, but that change is silent otherwise. */}
        <p className="sr-only" aria-live="polite">
          {`${visibleFeatured.length} case ${visibleFeatured.length === 1 ? 'study' : 'studies'} and ${visibleArchive.length} archived ${visibleArchive.length === 1 ? 'build' : 'builds'} in ${activeCategory}.`}
        </p>

        {!visibleFeatured.length && !visibleArchive.length && (
          <div className="project-empty" role="status">
            <h3>No projects match your search.</h3>
            <p>Try a different technology or select another category.</p>
            <button className="button button-dark" type="button" onClick={() => { setQuery(''); selectCategory('All') }}>Reset filters</button>
          </div>
        )}

        {project && (
        <div
          key={project.id}
          id="active-project-panel"
          className="project-showcase"
          role="tabpanel"
          aria-labelledby={`project-tab-${activeProject}`}
        >
          <div className="project-story">
            <div className="project-story-heading">
              <p className="project-eyebrow">{project.eyebrow}</p>
              <h3>{project.title}</h3>
              <p className="project-overview">{project.overview}</p>
            </div>

            <div className="project-story-grid">
              <div>
                <span>Context</span>
                <p>{project.context}</p>
              </div>
              <div>
                <span>Implementation</span>
                <p>{project.implementation}</p>
              </div>
              <div>
                <span>Engineering scope</span>
                <p>{project.engineering}</p>
              </div>
              <div className="project-result">
                <span>Delivered</span>
                <p>{project.delivered}</p>
              </div>
            </div>

            <div className="project-detail-row">
              <div>
                <span>Architecture</span>
                <ul>{project.architecture.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div>
                <span>Product features</span>
                <ul>{project.features.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </div>

            <div className="project-showcase-footer">
              <div className="tag-list tag-list-dark">
                {project.stack.map((item) => <span key={item}>{item}</span>)}
              </div>
              <div className="project-links">
                {project.url && (
                  <a href={project.url} target="_blank" rel="noreferrer">
                    Live product <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                )}
                {project.private ? (
                  <span><LockKeyhole size={14} aria-hidden="true" /> Repository · Private client code</span>
                ) : (
                  <span><FolderGit2 size={14} aria-hidden="true" /> Repository · Asset pending</span>
                )}
              </div>
            </div>
          </div>

          {project.id === oneRidePreview.projectId ? (
            <aside className="project-official-gallery" aria-label="OneRide official product screenshots">
              <p className="eyebrow">Inside the product</p>
              <h4>From home screen to everyday errands.</h4>
              <div className="project-official-screens">
                {oneRidePreview.screenshots.map((screen) => <a key={screen.id} href={screen.src} target="_blank" rel="noreferrer" aria-label={`View full OneRide ${screen.label} screenshot`}><img src={screen.src} alt={screen.alt} loading="lazy" decoding="async" /><span>{screen.label}</span></a>)}
              </div>
              <a className="project-gallery-source" href={oneRidePreview.sourceUrl} target="_blank" rel="noreferrer">Official Google Play screenshots <ArrowUpRight size={15} aria-hidden="true" /></a>
            </aside>
          ) : (
          <aside className="project-media-pending" aria-label={`${project.title} gallery status`}>
            <div className="asset-pending-mark"><ImageOff size={25} aria-hidden="true" /></div>
            <p>Product gallery</p>
            <h4>Authentic media pending</h4>
            <span>
              Screenshots will be added when original project assets are available. No placeholder or stock imagery is used.
            </span>
          </aside>
          )}
        </div>
        )}

        {visibleArchive.length > 0 && (
          <>
            <div className="project-archive-heading">
              <div>
                <p className="eyebrow">Project archive · {String(visibleArchive.length).padStart(2, '0')} {activeCategory === 'All' ? 'additional builds' : `${activeCategory} builds`}</p>
                <h3>Earlier client and independent work</h3>
              </div>
              <p>Client and independent products spanning commerce, developer tooling, education, and professional services.</p>
            </div>

            <div className="project-archive" id="project-archive-list">
              {shownArchive.map((item) => {
                const originalIndex = projectArchive.findIndex((projectItem) => projectItem.title === item.title)
                return (
                  <ScrollReveal key={item.title} delay={(originalIndex % 4) * 45} variant="up">
                    <article className="archive-project">
                      <span className="archive-number">{String(originalIndex + featuredProjects.length + 1).padStart(2, '0')}</span>
                      <div>
                        <p>{item.type}</p>
                        <h4>{item.title}</h4>
                        <span>{item.description}</span>
                      </div>
                      <div className="archive-stack">{item.stack.map((tech) => <span key={tech}>{tech}</span>)}</div>
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noreferrer" aria-label={`Open ${item.title}`}>
                          <ArrowUpRight size={18} aria-hidden="true" />
                        </a>
                      ) : item.private ? (
                        <span className="archive-private"><LockKeyhole size={15} aria-hidden="true" /> Private</span>
                      ) : (
                        <span className="archive-private"><Archive size={15} aria-hidden="true" /> {item.status || 'Archived'}</span>
                      )}
                    </article>
                  </ScrollReveal>
                )
              })}
            </div>
            {activeCategory === 'All' && !query.trim() && visibleArchive.length > 3 && (
              <button type="button" className="project-archive-toggle" aria-expanded={archiveOpen} aria-controls="project-archive-list" onClick={() => setArchiveOpen((value) => !value)}>
                {archiveOpen ? 'Show fewer builds' : `Explore all ${visibleArchive.length} archived builds`} <Archive size={17} aria-hidden="true" />
              </button>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default Projects
