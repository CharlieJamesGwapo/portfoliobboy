import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Gamepad2, Loader2, Play, Sparkles } from 'lucide-react'
import { interactiveGames } from '../data/portfolioData'
import ScrollReveal from './ScrollReveal'
import SectionHeading from './SectionHeading'

const ArcadeLobby = lazy(() => import('./game/ArcadeLobby'))

export default function InteractiveLab() {
  const [open, setOpen] = useState(false)
  const launchButton = useRef(null)
  const returnFocus = useRef(null)

  const launch = useCallback(() => {
    returnFocus.current = document.activeElement
    setOpen(true)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    window.setTimeout(() => returnFocus.current?.focus?.(), 0)
  }, [])

  useEffect(() => {
    window.addEventListener('portfolio:open-games', launch)
    return () => window.removeEventListener('portfolio:open-games', launch)
  }, [launch])

  return (
    <section id="lab" className="section section-light lab-section">
      <div className="page-container">
        <ScrollReveal variant="left">
          <SectionHeading
            eyebrow="06 · Interactive lab"
            title="Creative code, kept behind an intentional door."
            description="Eight playable experiments that explore interaction, realtime state, canvas rendering, controls, and game logic—loaded only when you choose to enter."
            light
          />
        </ScrollReveal>

        <div className="lab-layout">
          <ScrollReveal variant="scale">
            <div className="lab-launch-card">
              <div className="lab-launch-icon"><Gamepad2 size={28} aria-hidden="true" /></div>
              <p className="eyebrow">Developer playground · 8 games</p>
              <h3>Charlie’s Arcade</h3>
              <p>Optional, keyboard-aware, and separated from the professional portfolio so it never slows the initial experience.</p>
              <button ref={launchButton} type="button" className="button button-dark" onClick={launch}>
                <Play size={17} aria-hidden="true" /> Enter interactive lab
              </button>
              <span className="lab-load-note"><Sparkles size={14} aria-hidden="true" /> Game code and 3D assets load on demand</span>
            </div>
          </ScrollReveal>

          <div className="lab-game-list" aria-label="Available games">
            {interactiveGames.map((game, index) => (
              <ScrollReveal key={game.id} delay={(index % 4) * 45} variant="up">
                <button type="button" className="lab-game-row" onClick={launch}>
                  <span aria-hidden="true">{game.emoji}</span>
                  <span><strong>{game.title}</strong><small>{game.tagline}</small></span>
                  <Play size={15} aria-hidden="true" />
                </button>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {open && (
        <Suspense fallback={<div className="arcade-loading" role="status"><Loader2 className="spin" size={22} /> Loading the interactive lab…</div>}>
          <ArcadeLobby onClose={close} />
        </Suspense>
      )}
    </section>
  )
}
