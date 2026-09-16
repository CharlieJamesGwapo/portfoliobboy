import { ArrowUpRight } from 'lucide-react'
import { profile } from '../data/portfolioData'

const Footer = () => (
  <footer className="footer">
    <div className="page-container footer-inner">
      <div>
        <span className="footer-mark">CA</span>
        <p>Designed and built by {profile.name}.</p>
      </div>
      <div className="footer-links">
        <a href={profile.github} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14} /></a>
        <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={14} /></a>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </div>
  </footer>
)

export default Footer
