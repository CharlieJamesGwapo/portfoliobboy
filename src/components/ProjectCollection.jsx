import { Archive, ChevronDown } from 'lucide-react'
import Projects from './Projects'
import LiveProjects from './LiveProjects'
import { MomentumSystems } from './AISystems'
import { liveProjectLinks } from '../data/productPreviewData'

const designer = liveProjectLinks.find(link => link.id === 'gymfactories-designer')

export default function ProjectCollection({ children }) {
  return (
    <details id="full-project-archive" className="full-project-archive">
      <summary>
        <Archive size={22} aria-hidden="true" />
        <span><strong>Explore the full project archive</strong><span>Search earlier builds, browse engineering systems, and open live products.</span></span>
        <ChevronDown size={20} aria-hidden="true" />
      </summary>
      <div className="full-project-archive-content">
        <Projects />
        <section className="section section-paper" aria-label="Momentum engineering archive">
          <div className="page-container"><MomentumSystems /></div>
        </section>
        <LiveProjects />
        <div className="archive-extra-links"><a href={designer.href} target="_blank" rel="noreferrer">{designer.label}</a></div>
        {children}
      </div>
    </details>
  )
}
