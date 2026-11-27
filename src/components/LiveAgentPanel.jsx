import { lazy, Suspense, useState } from 'react'
import { Loader2, Mic } from 'lucide-react'
import { prefetchProps } from '../lib/prefetch'
import './voice-demo.css'

// Public agent ID (safe in the browser; it is not an API key). Unset means the
// live agent is unavailable and the panel renders nothing.
//
// Usage limits are NOT enforced here. They must be set on the agent itself
// (maximum conversation duration, concurrency and daily call limits, and an
// allowed-origins list), which the provider enforces server-side. Do not set
// this variable until those limits are configured.
export const AGENT_ID = (import.meta.env.VITE_ELEVENLABS_AGENT_ID ?? '').trim()
export const hasLiveAgent = AGENT_ID.length > 0

// The session closes browser audio at this deadline. A matching provider-side
// maximum is a separate safeguard for calls made outside this website.
export const LIVE_SESSION_LIMIT_SECONDS = 60

const loadSession = () => import('./LiveAgentSession')
export const LiveAgentSession = lazy(loadSession)
export const warmSession = prefetchProps('live-agent-session', loadSession)

const LiveAgentPanel = () => {
  const [open, setOpen] = useState(false)
  if (!hasLiveAgent) return null

  return (
    <div id="live-agent" className={`live-agent${open ? ' is-open' : ''}`} aria-labelledby="live-agent-title">
      <div className="live-agent-copy">
        <p className="live-agent-kicker"><span className="live-agent-dot" aria-hidden="true" /> Bboy AI Voice Studio · Live</p>
        <h3 id="live-agent-title">Talk to My AI.</h3>
        <p>
          Ask Alex about my full-stack projects, AI agents, automations, or working together.
        </p>
        <p className="live-agent-guidance">Conversations are limited to 1 minute. Say “goodbye” to end your call at any time.</p>
      </div>
      <div className="live-agent-action">
        {open ? (
          <Suspense fallback={<p className="live-agent-status" role="status"><Loader2 className="spin" size={16} aria-hidden="true" /> Loading the voice assistant…</p>}>
            <LiveAgentSession agentId={AGENT_ID} limitSeconds={LIVE_SESSION_LIMIT_SECONDS} onClose={() => setOpen(false)} />
          </Suspense>
        ) : (
          <button type="button" className="button button-primary" onClick={() => setOpen(true)} {...warmSession}>
            <Mic size={17} aria-hidden="true" /> Start a live conversation
          </button>
        )}
        <p className="live-agent-disclosure">You're speaking with an AI, not a person. Audio is processed by a third-party voice provider while the conversation is open.</p>
      </div>
    </div>
  )
}

export default LiveAgentPanel
