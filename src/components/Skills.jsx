import { useRef, useState } from 'react'
import { Code2, Database, Monitor, Server, Smartphone, Workflow, Wrench } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import SectionHeading from './SectionHeading'
import { skillGroups } from '../data/portfolioData'

const categoryIcons = [Wrench, Server, Code2, Smartphone, Monitor, Database, Workflow]

const Skills = () => {
  const [activeGroupIndex, setActiveGroupIndex] = useState(0)
  const tabRefs = useRef([])
  const activeGroup = skillGroups[activeGroupIndex]
  const panelId = `skill-group-panel-${activeGroupIndex}`

  const selectGroup = (index, moveFocus = false) => {
    const nextIndex = (index + skillGroups.length) % skillGroups.length
    setActiveGroupIndex(nextIndex)
    if (moveFocus) tabRefs.current[nextIndex]?.focus()
  }

  const handleTabKeyDown = (event, index) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      selectGroup(index + 1, true)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      selectGroup(index - 1, true)
    } else if (event.key === 'Home') {
      event.preventDefault()
      selectGroup(0, true)
    } else if (event.key === 'End') {
      event.preventDefault()
      selectGroup(skillGroups.length - 1, true)
    }
  }

  const ActiveIcon = categoryIcons[activeGroupIndex] || Wrench

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
            These are tools and patterns represented in my projects and workflows; the list does not imply equal depth in every item.
          </p>
          <div className="capability-tabs" role="tablist" aria-label="Capability categories" aria-orientation="horizontal">
            {skillGroups.map((group, index) => {
              const Icon = categoryIcons[index] || Wrench
              const tabId = `skill-group-tab-${index}`
              return (
                <button
                  key={group.title}
                  ref={(element) => { tabRefs.current[index] = element }}
                  id={tabId}
                  className={`capability-tab ${activeGroupIndex === index ? 'is-active' : ''}`}
                  type="button"
                  role="tab"
                  aria-selected={activeGroupIndex === index}
                  aria-controls={panelId}
                  tabIndex={activeGroupIndex === index ? 0 : -1}
                  onClick={() => selectGroup(index)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                >
                  <Icon size={16} aria-hidden="true" />
                  <span>{group.title}</span>
                  <small aria-hidden="true">{String(group.skills.length).padStart(2, '0')}</small>
                  <span className="sr-only">{group.skills.length} listed capabilities</span>
                </button>
              )
            })}
          </div>

          <div
            className="capability-panel"
            id={panelId}
            role="tabpanel"
            aria-labelledby={`skill-group-tab-${activeGroupIndex}`}
            tabIndex={0}
          >
            <div className="capability-panel-heading">
              <span className="capability-panel-icon"><ActiveIcon size={20} aria-hidden="true" /></span>
              <div>
                <p className="eyebrow">Capability group · {String(activeGroupIndex + 1).padStart(2, '0')}</p>
                <h3>{activeGroup.title}</h3>
              </div>
              <span className="capability-count">{String(activeGroup.skills.length).padStart(2, '0')} listed</span>
            </div>
            <ul className="skill-cloud" aria-label={`${activeGroup.title} technologies and practices`}>
              {activeGroup.skills.map((skill) => <li key={skill}>{skill}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Skills
