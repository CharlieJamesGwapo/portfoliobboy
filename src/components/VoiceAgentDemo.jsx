import { ArrowUpRight, PhoneCall } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import VoiceSamplePlayer from './VoiceSamplePlayer'
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

const VoiceAgentDemo = () => {
  const demo = (Array.isArray(liveLinks) ? liveLinks : []).find((item) => item.kind === 'AI voice demo')
  const demoUrl = demo?.url ?? FALLBACK_URL
  const flow = voiceCallFlow
  const parties = Array.isArray(flow?.parties) ? flow.parties : []
  const steps = Array.isArray(flow?.steps) ? flow.steps.filter((step) => parties[step.from] && parties[step.to]) : []
  const stats = Array.isArray(flow?.stats) ? flow.stats : []

  return (
    <section id="voice-demo" className="section section-dark voice-demo-section" aria-labelledby="voice-demo-title">
      <div className="page-container">
        <ScrollReveal>
          <div className="voice-demo-intro">
            <div>
              <p className="eyebrow">Voice agent demo</p>
              <h2 id="voice-demo-title">Hear the conversation.</h2>
            </div>
            <div className="voice-demo-copy">
              <p>
                Listen to a short US or Australian English sample, or request a callback from the live Alex agent on Hasti.
              </p>
              <a className="button button-primary" href={demoUrl} target="_blank" rel="noreferrer">
                <PhoneCall size={17} aria-hidden="true" />
                {demo?.label ?? 'Talk to Alex'}
                <ArrowUpRight size={17} aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal><VoiceSamplePlayer /></ScrollReveal>

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
