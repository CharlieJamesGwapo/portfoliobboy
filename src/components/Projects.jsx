import { useEffect, useState } from 'react'
import { Archive, ArrowUpRight, FolderGit2, LockKeyhole, Search, X } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import SectionHeading from './SectionHeading'
import { AgentArchitectureDiagram } from './IndependentProducts'
import { oneRidePreview } from '../data/productPreviewData'
import './project-discovery.css'
import { featuredProjects, projectArchive, projectCategories } from '../data/portfolioData'

const allProjects = [...featuredProjects, ...projectArchive]
const technologyOptions = [...new Set(allProjects.flatMap((item) => item.stack || []))].sort((a, b) => a.localeCompare(b))
const caseStudySlugByProjectId = {
  'autoflow-ai-pro': 'autoflow-ai-pro',
  easyappy: 'easyappy',
  'bboy-assistant': 'bboy',
  agentforge: 'agentforge',
  contextpilot: 'contextpilot',
  'one-ride-balingasag': 'oneride',
  'omji-billing': 'omji-billing',
  'fitness-crm': 'fitness-crm',
  'fintech-lending': 'fintech-lending',
  'moist-alumni': 'moist-alumni',
  'filtra-pos': 'filtra-pos',
  'ecycle-hub': 'ecycle-hub',
  'mobile-booking': 'mobile-booking',
  'scale-with-accounting': 'scale-with-accounting',
  'st-john-baptist': 'st-john-baptist',
  freelancepath: 'freelancepath',
  idealink: 'idealink',
  'zero-to-hero-dev': 'zero-to-hero-dev',
}

function readProjectFilters() {
  if (typeof window === 'undefined') return { query: '', category: 'All', technology: '' }
  const params = new URLSearchParams(window.location.search)
  const category = params.get('category')
  const technology = params.get('tech')
  return {
    query: params.get('q') || '',
    category: projectCategories.includes(category) ? category : 'All',
    technology: technologyOptions.includes(technology) ? technology : '',
  }
}

function writeProjectFilters({ query, category, technology }) {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (query.trim()) url.searchParams.set('q', query.trim())
  else url.searchParams.delete('q')
  if (category !== 'All') url.searchParams.set('category', category)
  else url.searchParams.delete('category')
  if (technology) url.searchParams.set('tech', technology)
  else url.searchParams.delete('tech')
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
}

function projectMatches(item, { query, category, technology }) {
  const searchText = [
    item.title,
    item.overview,
    item.description,
    item.context,
    item.implementation,
    item.engineering,
    item.delivered,
    item.status,
    item.role,
    item.type,
    ...(item.categories || []),
    ...(item.stack || []),
    ...(item.architecture || []),
    ...(item.features || []),
  ].filter(Boolean).join(' ').toLowerCase()
  return (category === 'All' || item.categories?.includes(category))
    && (!technology || item.stack?.includes(technology))
    && (!query.trim() || searchText.includes(query.trim().toLowerCase()))
}

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

function ProjectCardPreview({ project }) {
  const isOneRide = project.id === oneRidePreview.projectId
  const media = isOneRide ? oneRidePreview.screenshots[0] : project.media?.[0]

  if (project.visual === 'agent-architecture') {
    return (
      <div className="project-card-preview project-card-preview--architecture">
        <AgentArchitectureDiagram compact />
      </div>
    )
  }

  if (media) {
    return (
      <div className={`project-card-preview${project.mediaLayout === 'portrait' || isOneRide ? ' is-portrait' : ''}`}>
        <span className="project-card-preview-fallback" aria-hidden="true">Preview unavailable</span>
        <img
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          loading="lazy"
          decoding="async"
          onError={(event) => event.currentTarget.closest('.project-card-preview')?.classList.add('is-failed')}
        />
        <span className="project-card-preview-label">
          {isOneRide ? 'Official Google Play preview' : media.label || 'Project preview'}
        </span>
      </div>
    )
  }

  return (
    <div className="project-card-preview project-card-preview--placeholder" aria-hidden="true">
      <span className="project-card-placeholder-index">{project.categories?.[0] || 'Case study'}</span>
      <strong>{project.title}</strong>
      <span className="project-card-placeholder-note">Project profile</span>
    </div>
  )
}

function ProjectCard({ project, index }) {
  const caseStudySlug = caseStudySlugByProjectId[project.id]
  const caseStudyUrl = caseStudySlug ? `/projects/${caseStudySlug}` : null
  const technologies = project.stack || []

  return (
    <article className="project-discovery-card" aria-labelledby={`project-card-title-${project.id}`}>
      <ProjectCardPreview project={project} />
      <div className="project-card-content">
        <div className="project-card-copy">
          <p className="project-card-eyebrow">{project.eyebrow || project.categories?.join(' · ') || 'Product case study'}</p>
          <h3 id={`project-card-title-${project.id}`}>{project.title}</h3>
          <p className="project-card-overview">{project.overview}</p>
          <p className="project-card-status">{project.status || 'Case study available'}</p>
        </div>

        <ul className="project-card-technologies" aria-label={`Technologies used for ${project.title}`}>
          {technologies.slice(0, 4).map((technology) => <li key={technology}>{technology}</li>)}
          {technologies.length > 4 && <li className="project-card-more-technologies">+{technologies.length - 4} more</li>}
        </ul>

        <div className="project-card-actions">
          {caseStudyUrl && (
            <a className="project-card-action project-card-action--primary" href={caseStudyUrl} aria-label={`Read the ${project.title} case study`}>
              Case study <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          )}
          {project.url && (
            <a className="project-card-action project-card-action--secondary" href={project.url} target="_blank" rel="noreferrer" aria-label={`Open ${project.title} live product in a new tab`}>
              Live product <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          )}
        </div>
        <span className="sr-only">Featured project {String(index + 1).padStart(2, '0')} of {featuredProjects.length}</span>
      </div>
    </article>
  )
}

const Projects = () => {
  const [initialFilters] = useState(readProjectFilters)
  const [query, setQuery] = useState(initialFilters.query)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(initialFilters.category)
  const [activeTechnology, setActiveTechnology] = useState(initialFilters.technology)
  const activeFilters = { query, category: activeCategory, technology: activeTechnology }
  const visibleFeatured = featuredProjects.filter((item) => projectMatches(item, activeFilters))
  const visibleArchive = projectArchive.filter((item) => projectMatches(item, activeFilters))
  const shownArchive = archiveOpen || query.trim() || activeCategory !== 'All' || activeTechnology ? visibleArchive : visibleArchive.slice(0, 3)
  useEffect(() => {
    const syncFromLocation = () => {
      const filters = readProjectFilters()
      setQuery(filters.query)
      setActiveCategory(filters.category)
      setActiveTechnology(filters.technology)
    }
    window.addEventListener('popstate', syncFromLocation)
    return () => window.removeEventListener('popstate', syncFromLocation)
  }, [])

  const updateFilters = (next) => {
    const filters = { query, category: activeCategory, technology: activeTechnology, ...next }
    setQuery(filters.query)
    setActiveCategory(filters.category)
    setActiveTechnology(filters.technology)
    writeProjectFilters(filters)
  }

  const selectCategory = (category) => {
    updateFilters({ category })
  }

  const clearSearch = () => updateFilters({ query: '' })
  const clearAllFilters = () => {
    updateFilters({ query: '', category: 'All', technology: '' })
    setArchiveOpen(false)
  }

  return (
    <section id="projects" className="section section-paper projects-section">
      <div className="page-container">
        <ScrollReveal variant="left">
          <SectionHeading
            eyebrow="03 · Product work"
            title="Explore the work."
            description={`${featuredProjects.length} detailed case studies and ${projectArchive.length} additional builds. Explore the product, the engineering decisions, and what was delivered.`}
            light
          />
        </ScrollReveal>

        <div className="project-search-row">
          <label className="project-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search projects</span>
            <input type="search" aria-label="Search projects" value={query} onChange={(event) => updateFilters({ query: event.target.value })} placeholder="Find a project, technology, or workflow…" />
          </label>
          {query && <button type="button" className="project-search-clear" onClick={clearSearch}><X size={16} aria-hidden="true" /> Clear search</button>}
          <label className="project-technology-filter">
            <span>Technology</span>
            <select aria-label="Filter by technology" value={activeTechnology} onChange={(event) => updateFilters({ technology: event.target.value })}>
              <option value="">All technologies</option>
              {technologyOptions.map((technology) => <option key={technology} value={technology}>{technology}</option>)}
            </select>
          </label>
          {(query || activeCategory !== 'All' || activeTechnology) && (
            <button type="button" className="project-filter-reset" onClick={clearAllFilters}><X size={16} aria-hidden="true" /> Clear all filters</button>
          )}
          <span className="project-search-count" role="status">{visibleFeatured.length + visibleArchive.length} {visibleFeatured.length + visibleArchive.length === 1 ? 'project' : 'projects'} found</span>
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

        {/* Screen readers get a concise update when filters change. */}
        <p className="sr-only" aria-live="polite">
          {`${visibleFeatured.length} featured ${visibleFeatured.length === 1 ? 'project' : 'projects'} and ${visibleArchive.length} archived ${visibleArchive.length === 1 ? 'project' : 'projects'} match the selected filters.`}
        </p>

        {!visibleFeatured.length && !visibleArchive.length && (
          <div className="project-empty" role="status">
            <h3>No projects match your search.</h3>
            <p>Try a different technology or select another category.</p>
            <button className="button button-dark" type="button" onClick={clearAllFilters}>Reset filters</button>
          </div>
        )}

        {visibleFeatured.length > 0 && (
          <section className="project-discovery-grid" aria-label="Featured project case studies">
            {visibleFeatured.map((item, index) => <ProjectCard key={item.id} project={item} index={index} />)}
          </section>
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
            {activeCategory === 'All' && !query.trim() && !activeTechnology && visibleArchive.length > 3 && (
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
