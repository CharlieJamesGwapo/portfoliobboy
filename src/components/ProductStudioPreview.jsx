import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ChevronDown, ChevronRight, Layers3 } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import HeroSystemsScene from './HeroSystemsScene'
import { oneRidePreview } from '../data/productPreviewData'
import { selectedCaseStudies } from '../data/selectedCaseStudies'
import IndependentProducts from './IndependentProducts'
import ProjectCollection from './ProjectCollection'
import './studio-preview.css'
import './selected-work.css'

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

function CaseStudyMedia({ study }) {
  const [failed, setFailed] = useState(false)
  return (
    <figure className={`case-study-media ${study.media === 'oneride' ? 'is-mobile-app' : ''}`}>
      <div className="case-study-image">
        {study.media === 'oneride' ? <StaticOneRideScreenshot /> : failed ? (
          <div className="case-study-image-fallback" role="status"><strong>Website preview unavailable.</strong><span>Use the public product link to explore the work.</span></div>
        ) : <img src={study.image} alt={study.imageAlt} width="960" height="600" loading="lazy" decoding="async" onError={() => setFailed(true)} />}
      </div>
      <figcaption>{study.caption}</figcaption>
    </figure>
  )
}

function SelectedCaseStudy({ study, index }) {
  return (
    <article id={`case-${study.id}`} className="selected-case-study" aria-labelledby={`case-${study.id}-title`}>
      <CaseStudyMedia study={study} />
      <div className="case-study-copy">
        <p className="case-study-index"><span>{String(index + 1).padStart(2, '0')}</span>{study.category}</p>
        <h3 id={`case-${study.id}-title`}>{study.title}</h3>
        <p className="case-study-overview">{study.overview}</p>
        <p className="case-study-role">{study.role}</p>
        <div className="case-study-contribution"><h4>My contribution</h4><p>{study.contribution}</p></div>
        <div className="case-study-result"><h4>Delivered</h4><p>{study.delivered}</p></div>
        <div className="case-study-actions">
          <a href={`/projects/${study.id}`}>Full project case study <ArrowUpRight size={16} aria-hidden="true" /></a>
          {study.links.map(link => <a key={link.id} href={link.href} target="_blank" rel="noreferrer">{link.label}<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>)}
        </div>
        <p className="case-study-proof">{study.proof}</p>
        <details className="case-study-engineering">
          <summary>Read engineering case study<span className="sr-only"> — {study.title}</span><ChevronDown size={17} aria-hidden="true" /></summary>
          <dl>
            <div><dt>The problem</dt><dd>{study.problem}</dd></div>
            <div><dt>Engineering approach</dt><dd>{study.approach}</dd></div>
            <div><dt>Technical scope</dt><dd><ul>{study.scope.map(item => <li key={item}>{item}</li>)}</ul></dd></div>
          </dl>
          <div className="case-study-stack" aria-label="Technologies">{study.stack.map(item => <span key={item}>{item}</span>)}</div>
        </details>
      </div>
    </article>
  )
}

export default function ProductStudioPreview() {
  return (
    <section id="product-studio-preview" className="section product-studio-section" aria-labelledby="product-studio-title">
      <div className="page-container">
        <ScrollReveal>
          <div className="studio-heading selected-work-heading">
            <div><p className="eyebrow">Selected client work · ownership &amp; delivery</p><h2 id="product-studio-title">Client work.<br />A closer look.</h2></div>
            <p>Three evidence-backed client studies showing what I built, how the systems work, and what was delivered. Then explore the full archive.</p>
          </div>
        </ScrollReveal>
        <div className="selected-case-list">
          {selectedCaseStudies.map((study, index) => <ScrollReveal key={study.id}><SelectedCaseStudy study={study} index={index} /></ScrollReveal>)}
        </div>
        <IndependentProducts />
        <ProjectCollection><SystemsViewDisclosure /></ProjectCollection>
      </div>
    </section>
  )
}
