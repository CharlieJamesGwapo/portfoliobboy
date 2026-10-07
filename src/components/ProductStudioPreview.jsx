import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ChevronRight, ExternalLink, Layers3, Smartphone } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import HeroSystemsScene from './HeroSystemsScene'
import { featuredProjects, momentumSystems } from '../data/portfolioData'
import {
  liveProjectCards,
  liveProjectLinks,
  oneRidePreview,
  secondaryProjectLinks,
} from '../data/productPreviewData'
import './studio-preview.css'

const oneRideProject = featuredProjects.find((project) => project.id === oneRidePreview.projectId)

const sourceProjectById = {
  hasti: momentumSystems.find((system) => system.id === 'hasti'),
  gymfactories: momentumSystems.find((system) => system.id === 'gymfactories'),
  zalio: momentumSystems.find((system) => system.id === 'zalio'),
}

const oneRideAppLink = liveProjectLinks.find((link) => link.id === 'oneride-app')
const oneRideSiteLink = liveProjectLinks.find((link) => link.id === 'oneride-site')

export function OneRidePhonePreview() {
  const [selectedIndex, setSelectedIndex] = useState(1)
  const [displaySrc, setDisplaySrc] = useState(oneRidePreview.screenshots[1].src)
  const [failedSourceIds, setFailedSourceIds] = useState([])
  const [tiltEnabled, setTiltEnabled] = useState(false)
  const phoneRef = useRef(null)
  const failedSourceIdsRef = useRef(new Set())
  const pointerFrame = useRef(null)
  const pointerPosition = useRef(null)

  const selectedScreen = selectedIndex === null ? null : oneRidePreview.screenshots[selectedIndex]
  const displayScreen = oneRidePreview.screenshots.find((screen) => screen.src === displaySrc) || selectedScreen

  const resetPointerTilt = () => {
    pointerPosition.current = null
    if (pointerFrame.current !== null) {
      window.cancelAnimationFrame(pointerFrame.current)
      pointerFrame.current = null
    }
    if (!phoneRef.current) return
    phoneRef.current.style.setProperty('--phone-rotate-x', '2deg')
    phoneRef.current.style.setProperty('--phone-rotate-y', '-9deg')
  }

  const applyPointerTilt = () => {
    pointerFrame.current = null
    if (!tiltEnabled || !phoneRef.current || !pointerPosition.current) return
    const bounds = phoneRef.current.getBoundingClientRect()
    const x = (pointerPosition.current.clientX - bounds.left) / bounds.width - 0.5
    const y = (pointerPosition.current.clientY - bounds.top) / bounds.height - 0.5
    phoneRef.current.style.setProperty('--phone-rotate-x', `${(-y * 5).toFixed(2)}deg`)
    phoneRef.current.style.setProperty('--phone-rotate-y', `${(x * 7 - 9).toFixed(2)}deg`)
  }

  const handlePointerMove = (event) => {
    if (!tiltEnabled || !phoneRef.current) return
    pointerPosition.current = { clientX: event.clientX, clientY: event.clientY }
    if (pointerFrame.current !== null) return
    pointerFrame.current = window.requestAnimationFrame(applyPointerTilt)
  }

  const handleScreenSelection = (index) => {
    const screen = oneRidePreview.screenshots[index]
    failedSourceIdsRef.current = new Set()
    setFailedSourceIds([])
    setSelectedIndex(index)
    setDisplaySrc(screen.src)
  }

  const handleImageError = () => {
    const currentSource = oneRidePreview.screenshots.find((screen) => screen.src === displaySrc)
    if (!currentSource) return

    const nextFailedSourceIds = new Set(failedSourceIdsRef.current)
    nextFailedSourceIds.add(currentSource.id)
    failedSourceIdsRef.current = nextFailedSourceIds
    setFailedSourceIds([...nextFailedSourceIds])

    const nextScreen = oneRidePreview.screenshots.find((screen) => !nextFailedSourceIds.has(screen.id))
    if (!nextScreen) {
      setSelectedIndex(null)
      setDisplaySrc(null)
      return
    }

    setSelectedIndex(oneRidePreview.screenshots.indexOf(nextScreen))
    setDisplaySrc(nextScreen.src)
  }

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection

    const syncTiltCapability = () => {
      const nextTiltEnabled = finePointer.matches && !reducedMotion.matches && !connection?.saveData
      setTiltEnabled(nextTiltEnabled)
      if (!nextTiltEnabled) resetPointerTilt()
    }

    syncTiltCapability()
    finePointer.addEventListener?.('change', syncTiltCapability)
    reducedMotion.addEventListener?.('change', syncTiltCapability)
    connection?.addEventListener?.('change', syncTiltCapability)
    return () => {
      finePointer.removeEventListener?.('change', syncTiltCapability)
      reducedMotion.removeEventListener?.('change', syncTiltCapability)
      connection?.removeEventListener?.('change', syncTiltCapability)
      resetPointerTilt()
    }
  }, [])

  return (
    <div className="studio-phone-column" data-testid="oneride-preview">
      <p className="studio-preview-label">App preview · official store screenshots</p>
      <div className="studio-phone-stage">
        <div
          ref={phoneRef}
          className="studio-phone"
          data-testid="oneride-phone"
          data-tilt-enabled={String(tiltEnabled)}
          onPointerMove={handlePointerMove}
          onPointerLeave={resetPointerTilt}
        >
          <div className="studio-phone-edge studio-phone-edge-back" aria-hidden="true" />
          <div className="studio-phone-bezel">
            <div className="studio-phone-speaker" aria-hidden="true" />
            {displaySrc ? (
              <img
                key={displaySrc}
                data-testid="oneride-screen"
                className="studio-phone-screen"
                src={displaySrc}
                alt={displayScreen.alt}
                width="600"
                height="1067"
                loading="eager"
                decoding="async"
                onError={handleImageError}
              />
            ) : (
              <div className="studio-phone-empty" role="status">
                <strong>Official preview unavailable.</strong>
                <span>Open the store listing for the live app imagery.</span>
                <a href={oneRidePreview.sourceUrl} target="_blank" rel="noreferrer">Open official app listing <ArrowUpRight size={14} aria-hidden="true" /></a>
              </div>
            )}
            <div className="studio-phone-home-indicator" aria-hidden="true" />
          </div>
          <div className="studio-phone-edge studio-phone-edge-side" aria-hidden="true" />
        </div>
      </div>

      {failedSourceIds.length > 0 && displaySrc && (
        <p className="studio-media-status" role="status">
          Preview image unavailable — showing another verified official screenshot.
        </p>
      )}

      <div className="studio-screen-controls" aria-label="Choose an official OneRide screenshot">
        {oneRidePreview.screenshots.map((screen, index) => (
          <button
            key={screen.id}
            type="button"
            aria-label={`Show OneRide screenshot ${index + 1}: ${screen.label}`}
            aria-pressed={selectedIndex === index}
            className={selectedIndex === index ? 'is-selected' : ''}
            onClick={() => handleScreenSelection(index)}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            {screen.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function StaticOneRideScreenshot() {
  const [displaySrc, setDisplaySrc] = useState(oneRidePreview.screenshots[1].src)
  const [failedSourceIds, setFailedSourceIds] = useState([])
  const failedSourceIdsRef = useRef(new Set())
  const displayScreen = oneRidePreview.screenshots.find((screen) => screen.src === displaySrc)

  const handleImageError = () => {
    const nextFailedSourceIds = new Set(failedSourceIdsRef.current)
    if (displayScreen) nextFailedSourceIds.add(displayScreen.id)
    failedSourceIdsRef.current = nextFailedSourceIds
    setFailedSourceIds([...nextFailedSourceIds])
    const nextScreen = oneRidePreview.screenshots.find((screen) => !nextFailedSourceIds.has(screen.id))
    setDisplaySrc(nextScreen?.src || null)
  }

  if (!displaySrc) {
    return (
      <div className="studio-static-phone-empty" role="status">
        <strong>Official preview unavailable.</strong>
        <span>Open the store listing for the live app imagery.</span>
        <a href={oneRidePreview.sourceUrl} target="_blank" rel="noreferrer">Open official app listing <ArrowUpRight size={14} aria-hidden="true" /></a>
      </div>
    )
  }

  return (
    <img
      src={displaySrc}
      alt={displayScreen.alt}
      width="600"
      height="1067"
      loading="lazy"
      decoding="async"
      onError={handleImageError}
      data-failed-screenshot-count={failedSourceIds.length}
    />
  )
}

function LiveProjectCard({ card }) {
  const sourceProject = sourceProjectById[card.id]
  const description = sourceProject?.summary || card.summary

  return (
    <article className="studio-live-card">
      <div className="studio-live-card-media">
        <img src={card.image} alt={card.imageAlt} width="960" height="600" loading="lazy" decoding="async" />
        <span className="studio-live-card-index" aria-hidden="true">{card.id === 'hasti' ? '02' : card.id === 'gymfactories' ? '03' : '04'}</span>
      </div>
      <div className="studio-live-card-copy">
        <p className="studio-card-eyebrow">{card.eyebrow}</p>
        <h3>{card.title}</h3>
        <p>{description}</p>
        <a className="studio-inline-link" href={card.link.href} target="_blank" rel="noreferrer">
          {card.link.label}
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
    </article>
  )
}

function SystemsViewDisclosure() {
  const [open, setOpen] = useState(false)

  return (
    <details
      className="systems-view-disclosure"
      data-testid="systems-view-disclosure"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        <span><Layers3 size={16} aria-hidden="true" /> Systems view</span>
        <ChevronRight size={16} aria-hidden="true" />
      </summary>
      {open && (
        <div className="systems-view-panel">
          <div className="systems-visual-shell">
            <HeroSystemsScene />
          </div>
          <p className="sr-only">Alternative connected-systems visualization of AI, API, database, and cloud services.</p>
        </div>
      )}
    </details>
  )
}

export default function ProductStudioPreview() {
  return (
    <section id="product-studio-preview" className="section product-studio-section" aria-labelledby="product-studio-title">
      <div className="page-container">
        <ScrollReveal variant="up">
          <div className="studio-heading">
            <div>
              <p className="eyebrow">Live projects · public proof</p>
              <h2 id="product-studio-title">Live product work</h2>
            </div>
            <p>
              A compact look at products you can open now: one official Android app, public product sites, and focused
              workflows. The full case-study archive remains below.
            </p>
          </div>
        </ScrollReveal>

        <div className="studio-layout">
          <ScrollReveal variant="left">
            <article className="studio-feature-card">
              <div className="studio-feature-copy">
                <p className="studio-card-eyebrow">01 · {oneRideProject?.eyebrow || 'Mobile product'}</p>
                <h3>{oneRideProject?.title || 'OneRide Balingasag'}</h3>
                <p>{oneRideProject?.overview}</p>
                <div className="studio-feature-meta">
                  <span><Smartphone size={15} aria-hidden="true" /> Android app</span>
                  <span>Official store imagery</span>
                </div>
                <div className="studio-action-row">
                  <a className="button button-dark" href={oneRideAppLink.href} target="_blank" rel="noreferrer">
                    {oneRideAppLink.label} <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                  <a className="studio-secondary-action" href={oneRideSiteLink.href} target="_blank" rel="noreferrer">
                    {oneRideSiteLink.label} <ExternalLink size={15} aria-hidden="true" />
                  </a>
                </div>
                <p className="studio-source-note">
                  App preview · official store screenshots · <a href={oneRidePreview.sourceUrl} target="_blank" rel="noreferrer">source listing</a>
                </p>
              </div>
              <div className="studio-static-phone" aria-label="OneRide official store screenshot preview">
                <p className="studio-preview-label">A closer look above</p>
                <StaticOneRideScreenshot />
                <a href="#home" className="studio-inline-link">See the interactive app preview <ChevronRight size={15} aria-hidden="true" /></a>
              </div>
            </article>
          </ScrollReveal>

          <div className="studio-live-list" aria-label="Other live product previews">
            {liveProjectCards.map((card, index) => (
              <ScrollReveal key={card.id} variant="right" delay={index * 55}>
                <LiveProjectCard card={card} />
              </ScrollReveal>
            ))}
          </div>
        </div>

        <ScrollReveal variant="up" delay={90}>
          <div className="studio-secondary">
            <div>
              <p className="studio-card-eyebrow">Secondary collection</p>
              <h3>More public builds, one click away.</h3>
            </div>
            <div className="studio-secondary-links">
              {secondaryProjectLinks.map((link) => (
                <a key={link.id} href={link.href} target="_blank" rel="noreferrer">
                  {link.label} <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              ))}
              <a href="#projects">Open full project archive <ChevronRight size={15} aria-hidden="true" /></a>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade" delay={120}>
          <SystemsViewDisclosure />
        </ScrollReveal>
      </div>
    </section>
  )
}
