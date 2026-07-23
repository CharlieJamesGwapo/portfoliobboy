import { lazy, Suspense } from 'react'
import { ArrowDown, ArrowUpRight, Briefcase, Gamepad2, Github, Linkedin, Mail, MapPin } from 'lucide-react'
import { professionalTitles, profile, proofPoints, resumeUrl } from '../data/portfolioData'
import AnimatedStat from './AnimatedStat'
import RotatingTitle from './RotatingTitle'

const HeroSystemsScene = lazy(() => import('./HeroSystemsScene'))

const openGames = () => window.dispatchEvent(new CustomEvent('portfolio:open-games'))

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

        <p className="hero-kicker hero-enter hero-enter-2">AI development · Systems engineering · Product delivery</p>
        <h1>
          <span className="hero-line hero-line-primary">I build intelligent systems behind</span>{' '}
          <span className="hero-line hero-line-accent">modern digital products.</span>
        </h1>

        <div className="hero-enter hero-enter-5">
          <RotatingTitle titles={professionalTitles} />
        </div>

        <p className="hero-intro hero-enter hero-enter-5">
          I’m {profile.name}, an AI Developer and Full-Stack Engineer building AI-integrated applications,
          scalable APIs, SaaS platforms, CRM integrations, mobile products, and reliable backend systems.
        </p>

        <div className="hero-actions hero-enter hero-enter-6">
          <a className="button button-primary" href="#projects">
            Explore selected work <ArrowDown size={17} aria-hidden="true" />
          </a>
          <a className="button button-secondary" href={resumeUrl} target="_blank" rel="noreferrer">
            View resume <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <a className="button button-quiet" href="#contact">
            <Briefcase size={17} aria-hidden="true" /> Hire me
          </a>
          <button type="button" className="button button-quiet" onClick={openGames}>
            <Gamepad2 size={17} aria-hidden="true" /> Play games
          </button>
        </div>

        <div className="hero-socials hero-enter hero-enter-7" aria-label="Profile links">
          <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub profile"><Github size={18} /></a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn profile"><Linkedin size={18} /></a>
          <a href={`mailto:${profile.email}`} aria-label={`Email ${profile.shortName}`}><Mail size={18} /></a>
          <span><MapPin size={16} aria-hidden="true" /> {profile.location}</span>
        </div>
      </div>

      <div className="hero-visual hero-enter hero-enter-visual">
        <div className="systems-visual-shell">
          <Suspense fallback={<div className="systems-scene-loading" aria-hidden="true" />}>
            <HeroSystemsScene />
          </Suspense>
          <p className="sr-only">Decorative three-dimensional visualization of connected AI, API, database, and cloud systems.</p>
          <div className="systems-caption" aria-hidden="true">
            <span>01 · AI orchestration</span>
            <span>02 · API services</span>
            <span>03 · Durable data</span>
          </div>
          <div className="engineer-card">
            <picture>
              <source srcSet="/profile.webp" type="image/webp" />
              <img src="/profile.png" alt="" width="413" height="531" loading="lazy" decoding="async" />
            </picture>
            <span><strong>Charlie James</strong>Philippines · Working globally</span>
          </div>
        </div>
      </div>
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
