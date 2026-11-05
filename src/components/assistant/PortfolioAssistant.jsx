import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { prefetchProps } from '../../lib/prefetch'
import './assistant.css'

// The chat panel (answer engine included) only downloads on intent.
const loadPanel = () => import('./AssistantPanel')
const AssistantPanel = lazy(loadPanel)
const warmPanel = prefetchProps('alex-assistant', loadPanel)

const GREETED_KEY = 'alex-assistant-greeted-v1'
const GREETING_DELAY_MS = 2500
const GREETING_VISIBLE_MS = 14000

const storage = {
  get(key) {
    try { return window.localStorage.getItem(key) } catch { return null }
  },
  set(key, value) {
    try { window.localStorage.setItem(key, value) } catch { /* private mode: greeting may show again, harmless */ }
  },
}

// Floating "Alex" assistant: a launcher, a one-time greeting, and a chat panel.
// It never plays audio and never asks for the microphone.
export default function PortfolioAssistant() {
  const [open, setOpen] = useState(false)
  const [greeting, setGreeting] = useState(false)
  const launcherRef = useRef(null)

  // Show the greeting once per browser, a moment after the first visit.
  useEffect(() => {
    if (storage.get(GREETED_KEY)) return undefined
    const show = window.setTimeout(() => {
      // Don't interrupt someone already in a game or the Voice Studio.
      const busy = document.body.classList.contains('game-open') || document.body.classList.contains('voice-studio-in-view')
      if (busy) return
      setGreeting(true)
      storage.set(GREETED_KEY, String(Date.now()))
    }, GREETING_DELAY_MS)
    return () => window.clearTimeout(show)
  }, [])

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
      {greeting && !open && (
        <div className="alex-greeting" role="status">
          <button type="button" className="alex-greeting-body" onClick={openPanel} {...warmPanel}>
            <span className="alex-greeting-name">Alex · Charlie&apos;s AI assistant</span>
            Hey there! <span aria-hidden="true">👋</span> I&apos;m Alex, Charlie&apos;s AI assistant. Want to explore his projects, learn about his AI work, or ask me something?
          </button>
          <button type="button" className="alex-greeting-close" onClick={() => setGreeting(false)} aria-label="Dismiss Alex's greeting">
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}

      {!open && (
        <button
          ref={launcherRef}
          type="button"
          className="alex-launcher"
          onClick={openPanel}
          aria-label="Open Alex, Charlie's portfolio assistant"
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
