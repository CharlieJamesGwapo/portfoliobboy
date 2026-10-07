import { ArrowDown, ArrowUpRight, Briefcase, Github, Linkedin, Mail, MapPin } from 'lucide-react'
import { aiCapabilityRibbon, profile, proofPoints, resumeUrl } from '../data/portfolioData'
import AnimatedStat from './AnimatedStat'
import { OneRidePhonePreview } from './ProductStudioPreview'

const Hero = () => (
  <section id="home" className="hero-section">
    <div className="hero-grid" aria-hidden="true" />
    <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
    <div className="hero-orbit hero-orbit-two" aria-hidden="true" />

    <div className="page-container hero-layout">
      <div className="hero-copy">
        <div className="availability-pill hero-enter hero-enter-1">
          <span className="status-dot" aria-hidden="true" />
          Available for remote AI, full-stack, and backend opportunities
        </div>

        <div className="hero-identity hero-enter hero-enter-2">
          <picture>
            <source srcSet="/profile.webp" type="image/webp" />
            <img src="/profile.png" alt="" width="56" height="56" fetchpriority="high" decoding="async" />
          </picture>
          <div>
            <p className="hero-kicker">Charlie Abejo</p>
            <span>Philippines · Working globally</span>
          </div>
        </div>
        <h1>
          <span className="hero-line hero-line-primary">AI Developer &amp;</span>{' '}
          <span className="hero-line hero-line-accent">Full-Stack Engineer.</span>
        </h1>

        <p className="hero-intro hero-enter hero-enter-5">
          I build AI systems, CRM workflows, mobile apps, and APIs that move products from idea to reliable operation.
        </p>

        <div className="hero-actions hero-enter hero-enter-6">
          <a className="button button-primary" href="#product-studio-preview">
            Explore projects <ArrowDown size={17} aria-hidden="true" />
          </a>
          <a className="button button-secondary" href={resumeUrl} target="_blank" rel="noreferrer">
            View resume <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>

        <div className="hero-support-actions hero-enter hero-enter-6">
          <a className="hero-contact-link" href="#contact">
            <Briefcase size={16} aria-hidden="true" /> Get in touch <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>

        <div className="hero-socials hero-enter hero-enter-7" aria-label="Profile links">
          <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub profile"><Github size={18} /></a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn profile"><Linkedin size={18} /></a>
          <a href={`mailto:${profile.email}`} aria-label={`Email ${profile.shortName}`}><Mail size={18} /></a>
          <span><MapPin size={16} aria-hidden="true" /> {profile.location}</span>
        </div>
      </div>

      <div className="hero-visual hero-enter hero-enter-visual">
        <OneRidePhonePreview />
      </div>
    </div>

    <div className="page-container ai-hero-ribbon" aria-label="AI and automation services">
      <a href="#ai-systems">What I build <ArrowUpRight size={15} aria-hidden="true" /></a>
      <ul>{aiCapabilityRibbon.map((capability) => <li key={capability}>{capability}</li>)}</ul>
    </div>

    <div className="page-container proof-strip" aria-label="Professional highlights">
      {proofPoints.map((item, index) => (
        <div key={item.label} style={{ '--proof-index': index }}>
          <AnimatedStat {...item} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  </section>
)

export default Hero
