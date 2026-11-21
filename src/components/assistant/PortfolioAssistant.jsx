import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { CalendarClock, MessageCircle, Mic, Pause, Volume2, X } from 'lucide-react'
import { prefetchProps } from '../../lib/prefetch'
import { revealSection } from '../../lib/sectionNavigation'
import { hasLiveAgent, warmSession } from '../LiveAgentPanel'
import './assistant.css'

// The chat panel (answer engine included) only downloads on intent.
const loadPanel = () => import('./AssistantPanel')
const AssistantPanel = lazy(loadPanel)
const warmPanel = prefetchProps('alex-assistant', loadPanel)

const GREETING_DELAY_MS = 1200
// On wide screens the welcome arrives on the hero itself, in the bottom-right
// corner, where it clears the hero copy and calls to action.
const HERO_GREETING_DELAY_MS = 3000
const GREETING_VISIBLE_MS = 20000
const WIDE_QUERY = '(min-width: 1100px)'

// Once per page load: every visit and every refresh is welcomed, but moving
// between routes inside the app is not a new visit.
let welcomedThisLoad = false

// Optional recorded welcome (src/assets/audio/welcome/welcome.mp3). The glob
// resolves to nothing until the file exists, and the button stays hidden.
const welcomeClips = import.meta.glob('../../assets/audio/welcome/*.mp3', { eager: true, query: '?url', import: 'default' })
const WELCOME_CLIP = Object.values(welcomeClips)[0] ?? null

function useWideScreen() {
  const read = () => typeof window !== 'undefined' && window.matchMedia(WIDE_QUERY).matches
  const [wide, setWide] = useState(read)
  useEffect(() => {
    const query = window.matchMedia(WIDE_QUERY)
    const update = () => setWide(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return wide
}

// A one-click spoken welcome. Browsers block sound before the visitor
// interacts, so it can never start by itself; the click is the permission.
function useWelcomeClip() {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const toggle = useCallback(() => {
    if (!WELCOME_CLIP) return
    if (!audioRef.current) {
      audioRef.current = new Audio(WELCOME_CLIP)
      audioRef.current.addEventListener('ended', () => setPlaying(false))
      audioRef.current.addEventListener('pause', () => setPlaying(false))
      audioRef.current.addEventListener('play', () => setPlaying(true))
    }
    const audio = audioRef.current
    if (audio.paused) {
      audio.currentTime = 0
      audio.play().catch(() => setPlaying(false))
    } else {
      audio.pause()
    }
  }, [])
  const stop = useCallback(() => audioRef.current?.pause(), [])
  useEffect(() => stop, [stop])
  return { playing, toggle, stop }
}

// True once the home hero (#home) is mostly scrolled away, or immediately on
// pages that have no hero (/projects, /lab, case studies).
function usePastHero() {
  const [past, setPast] = useState(false)
  useEffect(() => {
    let frame = null
    const check = () => {
      frame = null
      const hero = document.getElementById('home')
      setPast(!hero || hero.getBoundingClientRect().bottom < window.innerHeight * 0.5)
    }
    const schedule = () => { if (frame === null) frame = window.requestAnimationFrame(check) }
    check()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    window.addEventListener('popstate', schedule)
    window.addEventListener('portfolio:route-change', schedule)
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('popstate', schedule)
      window.removeEventListener('portfolio:route-change', schedule)
    }
  }, [])
  return past
}

// True while the visitor is in a game or the Voice Studio (both set a body
// class), so Alex never talks over them.
function useBusy() {
  const read = () => typeof document !== 'undefined'
    && (document.body.classList.contains('game-open') || document.body.classList.contains('voice-studio-in-view'))
  const [busy, setBusy] = useState(read)
  useEffect(() => {
    if (typeof MutationObserver === 'undefined') return undefined
    const observer = new MutationObserver(() => setBusy(read()))
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    setBusy(read())
    return () => observer.disconnect()
  }, [])
  return busy
}

// Floating "Alex" assistant: a launcher, a one-time welcome, and a chat panel.
// Audio and the microphone are only ever used after the visitor chooses
// "Talk to Alex": browsers block sound that plays before any interaction,
// and an unprompted voice is the fastest way to lose a visitor.
export default function PortfolioAssistant() {
  const [open, setOpen] = useState(false)
  const [voice, setVoice] = useState(false)
  const [greeting, setGreeting] = useState(false)
  const pastHero = usePastHero()
  const wide = useWideScreen()
  const busy = useBusy()
  const launcherRef = useRef(null)
  const clip = useWelcomeClip()
  // Phones have no spare room on the hero, so there Alex waits until it is
  // scrolled away. Wide screens welcome on arrival, from the corner.
  const canGreet = pastHero || wide
  const onHero = !pastHero

  // Welcome every visit. If the visitor is in a game or the Voice Studio,
  // wait until they leave it.
  useEffect(() => {
    if (!canGreet || busy || welcomedThisLoad) return undefined
    const show = window.setTimeout(() => {
      welcomedThisLoad = true
      setGreeting(true)
    }, pastHero ? GREETING_DELAY_MS : HERO_GREETING_DELAY_MS)
    return () => window.clearTimeout(show)
  }, [canGreet, pastHero, busy])

  // Entering the studio or a game mid-greeting puts it away.
  useEffect(() => {
    if (busy) setGreeting(false)
  }, [busy])

  useEffect(() => {
    // Never pull the bubble away while its welcome is still speaking.
    if (!greeting || clip.playing) return undefined
    const hide = window.setTimeout(() => setGreeting(false), GREETING_VISIBLE_MS)
    return () => window.clearTimeout(hide)
  }, [greeting, clip.playing])

  useEffect(() => {
    if (!greeting) clip.stop()
  }, [greeting, clip])

  useEffect(() => {
    document.body.classList.toggle('assistant-open', open)
    return () => document.body.classList.remove('assistant-open')
  }, [open])

  const openPanel = useCallback((withVoice = false) => {
    setGreeting(false)
    setVoice(withVoice === true)
    setOpen(true)
  }, [])

  const bookCall = useCallback(() => {
    setGreeting(false)
    const target = document.getElementById('book-a-call')
    if (!target) return
    // Same as an in-page link: reveal first, then jump. A smooth scroll down
    // the whole page would pass through sections still waiting to animate in.
    revealSection(target)
    target.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [])

  const closePanel = useCallback(() => {
    setOpen(false)
    window.setTimeout(() => launcherRef.current?.focus(), 0)
  }, [])

  return (
    <div className="alex-root">
      {greeting && !open && canGreet && (
        <div className={`alex-greeting ${onHero ? 'is-on-hero' : ''}`} role="status">
          <div className="alex-greeting-body">
            <span className="alex-greeting-name">Alex · AI Portfolio Assistant</span>
            Welcome to Charlie James Abejo&apos;s portfolio! <span aria-hidden="true">👋</span> I&apos;m Alex, his AI assistant. Want a quick tour, or have a question?
            <span className="alex-greeting-actions">
              {WELCOME_CLIP && (
                <button type="button" className={hasLiveAgent ? '' : 'is-primary'} onClick={clip.toggle} aria-pressed={clip.playing}>
                  {clip.playing ? <Pause size={14} aria-hidden="true" /> : <Volume2 size={14} aria-hidden="true" />}
                  {clip.playing ? 'Pause' : 'Hear welcome'}
                </button>
              )}
              {hasLiveAgent && (
                <button type="button" className="is-primary" onClick={() => openPanel(true)} {...warmSession}>
                  <Mic size={14} aria-hidden="true" /> Talk to Alex
                </button>
              )}
              <button type="button" className={hasLiveAgent || WELCOME_CLIP ? '' : 'is-primary'} onClick={() => openPanel()} {...warmPanel}>
                <MessageCircle size={14} aria-hidden="true" /> Chat
              </button>
              <button type="button" onClick={bookCall}>
                <CalendarClock size={14} aria-hidden="true" /> Book a call
              </button>
            </span>
          </div>
          <button type="button" className="alex-greeting-close" onClick={() => setGreeting(false)} aria-label="Dismiss Alex's greeting">
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}

      {!open && pastHero && (
        <button
          ref={launcherRef}
          type="button"
          className="alex-launcher"
          onClick={() => openPanel()}
          aria-label="Open Alex, AI Portfolio Assistant"
          aria-haspopup="dialog"
          {...warmPanel}
        >
          <span className="alex-launcher-orb" aria-hidden="true"><MessageCircle size={20} /></span>
          <span className="alex-launcher-label">Ask Alex</span>
        </button>
      )}

      {open && (
        <Suspense fallback={<div className="alex-panel alex-panel-loading" role="status">Opening Alex…</div>}>
          <AssistantPanel onClose={closePanel} startWithVoice={voice} />
        </Suspense>
      )}
    </div>
  )
}
