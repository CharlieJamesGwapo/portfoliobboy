import { ArrowLeft } from 'lucide-react'
import Projects from './Projects'
import './route-pages.css'

export default function ProjectsPage() {
  return (
    <div className="route-page projects-page">
      <header className="page-container route-page-heading">
        <a href="/" className="text-link"><ArrowLeft size={16} aria-hidden="true" /> Back to the portfolio</a>
        <p className="eyebrow">The complete collection</p>
        <h1>Built with purpose.<br />Explored in detail.</h1>
        <p>Client platforms, independent tools, and experiments across AI, web, mobile, desktop, and backend engineering.</p>
      </header>
      <Projects />
    </div>
  )
}
