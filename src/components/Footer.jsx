import { ArrowUpRight } from 'lucide-react'
import { navigation, profile } from '../data/portfolioData'

const Footer = () => {
  const openArchive = () => window.dispatchEvent(new Event('portfolio:open-archive'))

  return (
    <footer className="footer">
      <div className="page-container footer-inner">
        <div>
          <span className="footer-mark">CA</span>
          <p>Designed and built by {profile.name}.</p>
        </div>
        <div className="footer-links">
          {navigation.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
          <a href={profile.github} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14} /></a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={14} /></a>
          <a href="#archive" onClick={openArchive}>More: archive &amp; lab</a>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
