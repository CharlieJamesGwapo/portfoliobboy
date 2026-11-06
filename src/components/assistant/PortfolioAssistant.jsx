import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { prefetchProps } from '../../lib/prefetch'
import './assistant.css'

// The chat panel (answer engine included) only downloads on intent.
const loadPanel = () => import('./AssistantPanel')
const AssistantPanel = lazy(loadPanel)
const warmPanel = prefetchProps('alex-assistant', loadPanel)

const GREETED_KEY = 'alex-assistant-greeted-v1'
const GREETING_DELAY_MS = 1200
const GREETING_VISIBLE_MS = 14000

const storage = {
  get(key) {
    try { return window.localStorage.getItem(key) } catch { return null }
  },
  set(key, value) {
    try { window.localStorage.setItem(key, value) } catch { /* private mode: greeting may show again, harmless */ }
  },
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

// Floating "Alex" assistant: a launcher, a one-time greeting, and a chat panel.
// It never plays audio and never asks for the microphone.
export default function PortfolioAssistant() {
  const [open, setOpen] = useState(false)
  const [greeting, setGreeting] = useState(false)
  const pastHero = usePastHero()
  const busy = useBusy()
  const launcherRef = useRef(null)

  // Greet once per browser, shortly after the visitor scrolls past the hero,
  // so neither the bubble nor the launcher ever covers the hero content. If
  // they are in a game or the Voice Studio, wait until they leave it.
  useEffect(() => {
    if (!pastHero || busy || storage.get(GREETED_KEY)) return undefined
    const show = window.setTimeout(() => {
      setGreeting(true)
      storage.set(GREETED_KEY, String(Date.now()))
    }, GREETING_DELAY_MS)
    return () => window.clearTimeout(show)
  }, [pastHero, busy])

  // Entering the studio or a game mid-greeting puts it away.
  useEffect(() => {
    if (busy) setGreeting(false)
  }, [busy])

  useEffect(() => {
    if (!greeting) return undefined
    const hide = window.setTimeout(() => setGreeting(false), GREETING_VISIBLE_MS)
    return () => window.clearTimeout(hide)
  }, [greeting])

  useEffect(() => {
    document.body.classList.toggle('assistant-open', open)
    return () => document.body.classList.remove('assistant-open')
  }, [open])

  const openPanel = useCallback(() => {
    setGreeting(false)
    storage.set(GREETED_KEY, String(Date.now()))
    setOpen(true)
  }, [])

  const closePanel = useCallback(() => {
    setOpen(false)
    window.setTimeout(() => launcherRef.current?.focus(), 0)
  }, [])

  return (
    <div className="alex-root">
      {greeting && !open && pastHero && (
        <div className="alex-greeting" role="status">
          <button type="button" className="alex-greeting-body" onClick={openPanel} {...warmPanel}>
            <span className="alex-greeting-name">Alex · AI Portfolio Assistant</span>
            Hey there! <span aria-hidden="true">👋</span> I&apos;m Alex, Charlie&apos;s AI assistant. Want to explore his projects, learn about his AI work, or ask me something?
          </button>
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
          onClick={openPanel}
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
          <AssistantPanel onClose={closePanel} />
        </Suspense>
      )}
    </div>
  )
}
