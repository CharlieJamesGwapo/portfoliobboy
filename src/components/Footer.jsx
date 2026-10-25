import { ArrowUpRight, FileText } from 'lucide-react'
import { profile, resumeUrl } from '../data/portfolioData'

const resources = [
  { label: 'Project archive', href: '/projects' },
  { label: 'Interactive lab', href: '/lab' },
  { label: 'Voice demo', href: '/#voice-demo' },
  { label: 'Contact', href: '/#contact' },
]

const Footer = () => (
  <footer className="footer">
    <div className="page-container footer-layout">
      <div className="footer-top">
        <div className="footer-brand">
          <span className="footer-mark" aria-hidden="true">CA</span>
          <div>
            <p className="footer-name">{profile.shortName}</p>
            <p className="footer-role">{profile.role}</p>
          </div>
          <p className="footer-byline">Designed and built by {profile.name}.</p>
        </div>

        <nav className="footer-resource-grid" aria-label="Portfolio resources">
          <p className="footer-resource-heading">Explore</p>
          {resources.map((resource) => (
            <a href={resource.href} key={resource.label}>
              {resource.label}
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          ))}
          <a href={resumeUrl} download="charlie-james-abejo-resume.pdf">
            Resume PDF <FileText size={14} aria-hidden="true" />
          </a>
        </nav>

        <div className="footer-socials" aria-label="Professional profiles">
          <p className="footer-resource-heading">Find me</p>
          <a href={profile.github} target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} {profile.shortName}</span>
        <a href="/#home">Back to top</a>
      </div>
    </div>
  </footer>
)

export default Footer
