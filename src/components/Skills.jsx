import { useRef, useState } from 'react'
import { Cloud, Code2, Database, GitBranch, Monitor, Search, Server, ShieldCheck, Smartphone, Workflow, Wrench } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import SectionHeading from './SectionHeading'
import { skillGroups } from '../data/portfolioData'
import './skills-explorer.css'

const categoryIcons = [Wrench, Server, Code2, Smartphone, Monitor, Database, Cloud, GitBranch, ShieldCheck, Workflow]
const totalCapabilities = skillGroups.reduce((total, group) => total + group.skills.length, 0)

const Skills = () => {
  const [activeGroupIndex, setActiveGroupIndex] = useState(0)
  const [query, setQuery] = useState('')
  const tabRefs = useRef([])
  const searchRef = useRef(null)
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const visibleGroups = skillGroups.map((group, index) => ({
    ...group,
    index,
    skills: group.skills.filter(skill => terms.every(term => `${group.title} ${skill}`.toLowerCase().includes(term))),
  })).filter(group => group.skills.length > 0)
  const activeGroup = visibleGroups.find(group => group.index === activeGroupIndex) || visibleGroups[0]
  const shownCount = visibleGroups.reduce((total, group) => total + group.skills.length, 0)
  const panelId = 'skill-group-panel'

  const selectGroup = (visibleIndex, moveFocus = false) => {
    const nextGroup = visibleGroups[(visibleIndex + visibleGroups.length) % visibleGroups.length]
    setActiveGroupIndex(nextGroup.index)
    if (moveFocus) tabRefs.current[nextGroup.index]?.focus()
  }

  const handleTabKeyDown = (event, index) => {
    const destinations = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: visibleGroups.length - 1 }
    if (Object.hasOwn(destinations, event.key)) {
      event.preventDefault()
      selectGroup(destinations[event.key], true)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setActiveGroupIndex(0)
    searchRef.current?.focus()
  }
  const ActiveIcon = categoryIcons[activeGroup?.index] || Wrench

  return (
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

        <div className="capability-explorer">
          <p className="capability-context">
            Explore {totalCapabilities} tools and practices across product engineering, AI automation, AWS, and DevOps. Project evidence and toolkit notes explain the scope; depth varies by tool.
          </p>
          <div className="capability-search">
            <label htmlFor="skills-search">Search tools and practices</label>
            <div className="capability-search-field">
              <Search size={18} aria-hidden="true" />
              <input
                ref={searchRef}
                id="skills-search"
                type="search"
                value={query}
                placeholder="Try AWS Lambda, CI/CD, or Playwright"
                aria-describedby="skills-search-status"
                onChange={(event) => { setQuery(event.target.value); setActiveGroupIndex(0) }}
              />
            </div>
            <div className="capability-search-meta">
              <p id="skills-search-status" role="status" aria-live="polite" aria-atomic="true">
                {shownCount} {shownCount === 1 ? 'capability' : 'capabilities'} {terms.length ? 'shown' : 'listed'} · {visibleGroups.length} {visibleGroups.length === 1 ? 'group' : 'groups'}
              </p>
              {query && <button type="button" onClick={clearSearch} aria-label="Clear skills search">Clear search</button>}
            </div>
          </div>
          {visibleGroups.length > 0 ? <>
            <div className="capability-tabs" role="tablist" aria-label="Capability categories" aria-orientation="horizontal">
              {visibleGroups.map((group, visibleIndex) => {
                const Icon = categoryIcons[group.index] || Wrench
                return (
                  <button
                    key={group.title}
                    ref={(element) => { tabRefs.current[group.index] = element }}
                    id={`skill-group-tab-${group.index}`}
                    className={`capability-tab ${activeGroup.index === group.index ? 'is-active' : ''}`}
                    type="button"
                    role="tab"
                    aria-selected={activeGroup.index === group.index}
                    aria-controls={panelId}
                    tabIndex={activeGroup.index === group.index ? 0 : -1}
                    onClick={() => selectGroup(visibleIndex)}
                    onKeyDown={(event) => handleTabKeyDown(event, visibleIndex)}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span>{group.title}</span>
                    <small aria-hidden="true">{String(group.skills.length).padStart(2, '0')}</small>
                    <span className="sr-only">{group.skills.length} listed capabilities</span>
                  </button>
                )
              })}
            </div>

            <div className="capability-panel" id={panelId} role="tabpanel" aria-labelledby={`skill-group-tab-${activeGroup.index}`} tabIndex={0}>
              <div className="capability-panel-heading">
                <span className="capability-panel-icon"><ActiveIcon size={20} aria-hidden="true" /></span>
                <div>
                  <p className="eyebrow">Capability group · {String(activeGroup.index + 1).padStart(2, '0')}</p>
                  <h3>{activeGroup.title}</h3>
                </div>
                <span className="capability-count">{String(activeGroup.skills.length).padStart(2, '0')} listed</span>
              </div>
              <p className="capability-summary">{activeGroup.summary}</p>
              <ul className="capability-use-cases" aria-label={`${activeGroup.title} use cases`}>
                {activeGroup.useCases.map(useCase => <li key={useCase}>{useCase}</li>)}
              </ul>
              <ul className="skill-cloud" aria-label={`${activeGroup.title} technologies and practices`}>
                {activeGroup.skills.map(skill => <li key={skill}>{skill}</li>)}
              </ul>
              {activeGroup.toolkitNote && <p className="capability-toolkit-note">{activeGroup.toolkitNote}</p>}
              <div className="capability-evidence">
                <h4>Explore the project evidence</h4>
                <ul>
                  {activeGroup.evidence.map(item => <li key={item.href}>
                    <a href={item.href}>{item.label}<span aria-hidden="true"> ↗</span></a>
                    <span>{item.status}</span>
                  </li>)}
                </ul>
              </div>
            </div>
          </> : <div className="capability-empty">
            <h3>No tools match this search.</h3>
            <p>Try a technology, platform, or practice such as Python, n8n, or Docker.</p>
          </div>}
        </div>
      </div>
    </section>
  )
}

export default Skills
