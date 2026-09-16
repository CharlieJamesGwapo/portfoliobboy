import { ArrowDown, ArrowUpRight, Github, Linkedin, Mail, MapPin } from 'lucide-react'
import { profile, proofPoints, resumeUrl } from '../data/portfolioData'

const hidePortrait = (event) => {
  event.currentTarget.closest('picture')?.setAttribute('hidden', '')
}

const Hero = () => (
  <section id="home" className="hero-section">
    <div className="hero-grid" aria-hidden="true" />

    <div className="page-container hero-layout">
      <div className="hero-copy">
        <div className="availability-pill">
          <span className="status-dot" aria-hidden="true" />
          {profile.availability}
        </div>

        <p className="hero-kicker">{profile.role}</p>
        <h1>{profile.headline}</h1>

        <p className="hero-intro">{profile.support}</p>

        <div className="hero-actions">
          <a className="button button-primary" href="#work">
            View selected work <ArrowDown size={17} aria-hidden="true" />
          </a>
          <a className="button button-secondary" href={resumeUrl} target="_blank" rel="noreferrer">
            View resume (PDF) <ArrowUpRight size={17} aria-hidden="true" />
            <span className="sr-only">approximately 505 KB, opens in a new tab</span>
          </a>
        </div>

        <div className="hero-socials" aria-label="Profile links">
          <a href={profile.github} target="_blank" rel="noreferrer" aria-label="Open GitHub profile"><Github size={18} aria-hidden="true" /></a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="Open LinkedIn profile"><Linkedin size={18} aria-hidden="true" /></a>
          <a href={`mailto:${profile.email}`} aria-label={`Email ${profile.shortName}`}><Mail size={18} aria-hidden="true" /></a>
          <span><MapPin size={16} aria-hidden="true" /> {profile.location}</span>
        </div>
      </div>

      <div className="hero-visual">
        <div className="portrait-frame">
          <picture>
            <source srcSet="/profile.webp" type="image/webp" />
            <img
              src="/profile.png"
              alt=""
              width="413"
              height="531"
              fetchpriority="high"
              decoding="async"
              onError={hidePortrait}
            />
          </picture>
          <div className="portrait-identity">
            <strong>{profile.name}</strong>
            <span>{profile.role}</span>
            <span>{profile.location}</span>
          </div>
        </div>
      </div>
    </div>

    <div className="page-container proof-strip" aria-label="Professional highlights">
      {proofPoints.map((item, index) => (
        <div key={item.label} style={{ '--proof-index': index }}>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  </section>
)

export default Hero
