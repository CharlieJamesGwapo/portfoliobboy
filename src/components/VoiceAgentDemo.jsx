import { useEffect, useRef } from 'react'
import { ArrowUpRight, Mic, PhoneCall } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import AccentGallery from './voice/AccentGallery'
import LiveAgentPanel, { hasLiveAgent } from './LiveAgentPanel'
import './voice/voice-studio.css'
import { liveLinks, voiceCallFlow } from '../data/portfolioData'
import './voice-demo.css'

const FALLBACK_URL = 'https://hasti.com.au/'

// "Alex (LiveKit SIP)" -> "Alex": the short form is used in the text route
// ("Alex → Twilio SIP trunk") that screen readers and phones read instead of the arrow.
const shortName = (name) => String(name ?? '').replace(/\s*\(.*?\)\s*/g, ' ').trim()

// The ladder is a 7-track grid: a time column plus six half-width tracks, so a
// lifeline sits on the line between two half-tracks (line 3, 5 or 7) and an
// arrow can run exactly from one lifeline to another.
const lifelineLine = (index) => 2 * index + 3
const messageColumns = (from, to) => {
  if (from === to) return [2 * from + 2, 2 * from + 4]
  return [lifelineLine(Math.min(from, to)), lifelineLine(Math.max(from, to))]
}

// While the studio is on screen, the site's floating Music and back-to-top
// buttons step aside so they never sit on top of the player controls.
const useHideFloatingControls = (ref) => {
  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(
      ([entry]) => document.body.classList.toggle('voice-studio-in-view', entry.isIntersecting),
      { rootMargin: '-15% 0px -15% 0px' },
    )
    observer.observe(element)
    return () => {
      observer.disconnect()
      document.body.classList.remove('voice-studio-in-view')
    }
  }, [ref])
}

const VoiceAgentDemo = () => {
  const sectionRef = useRef(null)
  useHideFloatingControls(sectionRef)
  const demo = (Array.isArray(liveLinks) ? liveLinks : []).find((item) => item.kind === 'AI voice demo')
  const demoUrl = demo?.url ?? FALLBACK_URL
  const flow = voiceCallFlow
  const parties = Array.isArray(flow?.parties) ? flow.parties : []
  const steps = Array.isArray(flow?.steps) ? flow.steps.filter((step) => parties[step.from] && parties[step.to]) : []
  const stats = Array.isArray(flow?.stats) ? flow.stats : []

  return (
    <section ref={sectionRef} id="voice-demo" className="section voice-demo-section voice-studio" aria-labelledby="voice-demo-title">
      <div className="page-container">
        <ScrollReveal>
          <header className="vs-hero">
            <div className="vs-hero-copy">
              <p className="vs-eyebrow"><span aria-hidden="true" /> Bboy AI Voice Studio</p>
              <h2 id="voice-demo-title">Experience AI that sounds more human.</h2>
              <p className="vs-lede">
                Explore eight English accents, listen to natural conversations, and discover how intelligent voice experiences are built.
              </p>
              <ul className="vs-facts" aria-label="About these previews">
                <li><strong>8</strong> English Accents</li>
                <li>Natural AI Conversations</li>
                <li>Interactive Voice Experience</li>
              </ul>
            </div>

            <div className="vs-orb" aria-hidden="true">
              <span className="vs-orb-glow" />
              <span className="vs-orb-ring" />
              <span className="vs-orb-ring vs-orb-ring-2" />
              <span className="vs-orb-core">
                <i /><i /><i /><i /><i />
              </span>
            </div>
          </header>
        </ScrollReveal>

        <ScrollReveal><AccentGallery /></ScrollReveal>

        <ScrollReveal>
          {hasLiveAgent ? <LiveAgentPanel /> : (
            <aside className="vs-live" aria-labelledby="vs-live-title">
              <div className="vs-live-copy">
                <p className="vs-live-status"><span aria-hidden="true" /> Live agent · coming soon</p>
                <h3 id="vs-live-title">Talk to My AI</h3>
                <p>
                  A real-time version you can speak with is being set up with usage limits. Until then, the previews above
                  are pre-recorded, and you can try Alex, the live voice agent I built for Hasti.
                </p>
              </div>
              <div className="vs-live-actions">
                <button type="button" className="button vs-live-disabled" disabled aria-describedby="vs-live-title">
                  <Mic size={17} aria-hidden="true" /> Talk to My AI
                </button>
                <a className="button button-primary" href={demoUrl} target="_blank" rel="noreferrer">
                  <PhoneCall size={17} aria-hidden="true" />
                  Talk to Alex on Hasti
                  <ArrowUpRight size={16} aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </aside>
          )}
        </ScrollReveal>

        {steps.length > 0 && (
          <ScrollReveal className="vc-reveal" delay={60}>
            <details className="voice-engineering">
              <summary>Explore the voice engineering <span aria-hidden="true">+</span></summary>
              <figure className="vc-figure">
                <figcaption className="vc-title">
                  <h3 id="vc-title">{flow.title ?? 'Anatomy of a call'}</h3>
                </figcaption>

                <div className="vc-ladder">
                  <div className="vc-parties" aria-hidden="true">
                    {parties.map((party, index) => (
                      <span key={party} style={{ gridColumn: `${2 * index + 2} / ${2 * index + 4}` }}>{party}</span>
                    ))}
                  </div>

                  <ol className="vc-steps" aria-labelledby="vc-title">
                    {steps.map((step, index) => {
                      const [start, end] = messageColumns(step.from, step.to)
                      const direction = step.from === step.to ? 'self' : step.from < step.to ? 'right' : 'left'
                      return (
                        <li key={`${step.t}-${step.label}-${index}`} className="vc-step" style={{ '--vc-i': index }}>
                          <span className="vc-time">{step.t}</span>
                          <div className={`vc-msg vc-msg-${direction}`} style={{ gridColumn: `${start} / ${end}` }}>
                            <span className="vc-label">{step.label}</span>
                            <span className="vc-arrow" aria-hidden="true" />
                            <span className="vc-route">
                              <span className="vc-route-text">{shortName(parties[step.from])} → {shortName(parties[step.to])}</span>
                            </span>
                            <span className="vc-detail">{step.detail}</span>
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                </div>

                {stats.length > 0 && (
                  <ul className="vc-stats" aria-label="Call statistics">
                    {stats.map((stat) => (
                      <li key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></li>
                    ))}
                  </ul>
                )}

                {flow.note && <p className="vc-note">{flow.note}</p>}
              </figure>
            </details>
          </ScrollReveal>
        )}
      </div>
    </section>
  )
}

export default VoiceAgentDemo
