import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, LockKeyhole } from 'lucide-react'
import PortfolioDialog from './PortfolioDialog'
import ScrollReveal from './ScrollReveal'
import SectionHeading from './SectionHeading'
import SystemDetail from './SystemDetail'
import './ai-systems.css'
import { momentumSystems, momentumEngineeringGroups } from '../data/portfolioData'
import { getSystemLiveActionLabel, momentumSystemFilters, selectSystems } from '../lib/portfolioCollections'

function EngineeringPreview({ system }) {
  const descriptor = system.id === 'voice-runtime'
    ? 'Voice · Events · Booking'
    : system.id === 'gym-analytics'
      ? 'Sync · Model · Insights'
      : 'Agents · Sessions · Evidence'

  return (
    <div className="momentum-engineering-visual" aria-hidden="true">
      <span>ENGINEERING NOTES</span>
      <div><span>INPUT</span><i /><span>CONTROL</span><i /><span>STATE</span></div>
      <p>{descriptor}</p>
    </div>
  )
}

function MomentumCard({ system, onOpen }) {
  return (
    <article key={system.id} className={`momentum-card ${system.image ? 'has-image' : 'is-engineering'}`}>
      {system.image ? (
        <div className="momentum-preview">
          <img src={system.image} alt={system.imageAlt} width="1440" height="900" loading="lazy" decoding="async" />
        </div>
      ) : <EngineeringPreview system={system} />}
      <div className="momentum-card-copy">
        <div className="momentum-card-meta">
          <p className="momentum-card-type">{system.type}</p>
          <span className={`system-status system-status-${system.statusTone}`}>
            {system.statusTone === 'private' && <LockKeyhole size={11} aria-hidden="true" />}
            {system.status}
          </span>
        </div>
        <h3>{system.title}</h3>
        <p className="momentum-summary">{system.summary}</p>
        <details className="momentum-details">
          <summary>Explore engineering scope <span aria-hidden="true">+</span></summary>
          <p>{system.contribution}</p>
          <div className="momentum-stack">{system.stack.map((item) => <span key={item}>{item}</span>)}</div>
        </details>
        <div className="momentum-card-actions">
          <button
            type="button"
            className="momentum-case-study-trigger"
            aria-label={`Open case study: ${system.title}`}
            onClick={(event) => onOpen(system, event)}
          >
            Engineering details
            <ArrowUpRight size={16} aria-hidden="true" />
          </button>
          {system.url ? (
            <a className="momentum-demo-link" href={system.url} target="_blank" rel="noreferrer">
              {getSystemLiveActionLabel(system)}
              <ArrowUpRight size={17} aria-hidden="true" />
              <span className="sr-only"> — {system.title} (opens in a new tab)</span>
            </a>
          ) : (
            <span className="momentum-private-note"><LockKeyhole size={13} aria-hidden="true" /> Private client system</span>
          )}
        </div>
      </div>
    </article>
  )
}

function EngineeringGroup({ group }) {
  return (
    <details className="momentum-index-group">
      <summary>{group.title}<span aria-hidden="true">+</span></summary>
      <p>{group.description}</p>
    </details>
  )
}

export function MomentumShowcase() {
  const [activeFilter, setActiveFilter] = useState(momentumSystemFilters[0])
  const [expanded, setExpanded] = useState(false)
  const [selectedSystem, setSelectedSystem] = useState(null)
  const selectedTriggerRef = useRef(null)
  const sectionRef = useRef(null)
  const selectedScrollYRef = useRef(0)
  const selectedSystemRef = useRef(null)
  const scrollRestoreFrameRef = useRef(null)
  const scrollRestoreTimerRef = useRef(null)
  const scrollRestoreCleanupRef = useRef(null)
  const scrollRestoreTokenRef = useRef(0)

  const cancelPendingScrollRestore = useCallback(() => {
    if (scrollRestoreFrameRef.current !== null) {
      window.cancelAnimationFrame(scrollRestoreFrameRef.current)
      scrollRestoreFrameRef.current = null
    }
    if (scrollRestoreTimerRef.current !== null) {
      window.clearTimeout(scrollRestoreTimerRef.current)
      scrollRestoreTimerRef.current = null
    }
    const cleanup = scrollRestoreCleanupRef.current
    scrollRestoreCleanupRef.current = null
    cleanup?.()
    scrollRestoreTokenRef.current += 1
  }, [])

  useEffect(() => () => {
    cancelPendingScrollRestore()
  }, [cancelPendingScrollRestore])

  const systems = useMemo(
    () => selectSystems(momentumSystems, { category: activeFilter, expanded }),
    [activeFilter, expanded],
  )

  const openDetails = useCallback((system, event) => {
    cancelPendingScrollRestore()
    selectedTriggerRef.current = event.currentTarget
    selectedScrollYRef.current = window.scrollY
    selectedSystemRef.current = system
    setSelectedSystem(system)
  }, [cancelPendingScrollRestore])

  const closeDetails = useCallback(() => {
    if (selectedSystemRef.current === null) return

    selectedSystemRef.current = null
    setSelectedSystem(null)
    const scrollY = selectedScrollYRef.current
    const restoreLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`
    cancelPendingScrollRestore()
    const token = scrollRestoreTokenRef.current
    const restoreScroll = () => {
      if (scrollRestoreTokenRef.current !== token) return
      const currentLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`
      if (currentLocation !== restoreLocation) {
        cancelPendingScrollRestore()
        return
      }
      if (Math.abs(window.scrollY - scrollY) > 1) window.scrollTo({ top: scrollY, behavior: 'auto' })
    }
    const completeScrollRestore = () => {
      if (scrollRestoreTokenRef.current !== token) return
      scrollRestoreTimerRef.current = null
      restoreScroll()
      cancelPendingScrollRestore()
    }
    const intentEvents = [
      ['pointerdown', { capture: true }],
      ['wheel', { capture: true, passive: true }],
      ['touchstart', { capture: true, passive: true }],
      ['keydown', { capture: true }],
      ['click', { capture: true }],
      ['auxclick', { capture: true }],
      ['hashchange', undefined],
      ['popstate', undefined],
    ]
    const cancelForIntent = () => cancelPendingScrollRestore()
    const removeIntentListeners = () => {
      for (const [type, options] of intentEvents) window.removeEventListener(type, cancelForIntent, options)
    }

    scrollRestoreFrameRef.current = window.requestAnimationFrame(() => {
      scrollRestoreFrameRef.current = null
      restoreScroll()
    })
    scrollRestoreTimerRef.current = window.setTimeout(completeScrollRestore, 280)

    // The close action itself can be Escape or a close-button click. Attach
    // intent listeners after that event has finished so it remains an
    // intentional close rather than cancelling its own restoration.
    Promise.resolve().then(() => {
      if (scrollRestoreTokenRef.current !== token) return
      for (const [type, options] of intentEvents) window.addEventListener(type, cancelForIntent, options)
      scrollRestoreCleanupRef.current = removeIntentListeners
    })
  }, [cancelPendingScrollRestore])

  return (
    <section
      id="momentum-work"
      ref={sectionRef}
      className="section section-paper ai-systems-section momentum-showcase-section"
      aria-labelledby="momentum-work-title"
      tabIndex="-1"
    >
      <div className="page-container">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Selected Momentum systems"
            title="The product. The workflow. The engineering behind it."
            description="Selected work across the Momentum ecosystem, with public product links and a closer look at the systems behind them."
            light
          />
        </ScrollReveal>

        <span id="momentum-work-title" className="sr-only">Selected Momentum systems</span>
        <div className="momentum-toolbar">
          <div className="momentum-filters" role="group" aria-label="Filter Momentum systems">
            {momentumSystemFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                aria-pressed={activeFilter === filter}
                className={activeFilter === filter ? 'is-active' : ''}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          <p aria-live="polite" aria-atomic="true">Showing {systems.length} of {momentumSystems.length} systems</p>
        </div>

        <div className="momentum-grid">
          {systems.map((system) => <MomentumCard key={system.id} system={system} onOpen={openDetails} />)}
        </div>

        {activeFilter === momentumSystemFilters[0] && (
          <div className="momentum-collection-toggle">
            <button type="button" className="momentum-view-toggle" onClick={() => setExpanded((value) => !value)}>
              {expanded ? 'Show featured systems' : 'View all systems'}
            </button>
          </div>
        )}

        <div className="momentum-index">
          <div className="momentum-index-heading">
            <p className="eyebrow">Behind the products</p>
            <h3>A connected engineering practice.</h3>
            <p>Related modules and internal systems span four areas. Public case studies focus on product behavior; client source code stays private.</p>
          </div>
          <div className="momentum-index-groups">
            {momentumEngineeringGroups.map((group) => <EngineeringGroup key={group.title} group={group} />)}
          </div>
        </div>
      </div>

      <PortfolioDialog
        open={Boolean(selectedSystem)}
        title={selectedSystem?.title || 'System details'}
        onClose={closeDetails}
        returnFocusRef={selectedTriggerRef}
        fallbackFocusRef={sectionRef}
      >
        {selectedSystem && <SystemDetail system={selectedSystem} />}
      </PortfolioDialog>
    </section>
  )
}

export default MomentumShowcase
