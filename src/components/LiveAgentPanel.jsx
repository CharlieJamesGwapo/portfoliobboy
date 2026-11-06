import { lazy, Suspense, useState } from 'react'
import { Loader2, Mic } from 'lucide-react'
import { prefetchProps } from '../lib/prefetch'

// Public agent ID (safe in the browser; it is not an API key). Unset means the
// live agent is unavailable and the panel renders nothing.
//
// Usage limits are NOT enforced here. They must be set on the agent itself
// (maximum conversation duration, concurrency and daily call limits, and an
// allowed-origins list), which the provider enforces server-side. Do not set
// this variable until those limits are configured.
const AGENT_ID = (import.meta.env.VITE_ELEVENLABS_AGENT_ID ?? '').trim()
export const hasLiveAgent = AGENT_ID.length > 0

// Must match (or be below) the agent's server-side maximum duration. The UI
// timer only informs the visitor; the provider is what actually ends the call.
export const LIVE_SESSION_LIMIT_SECONDS = 180

const loadSession = () => import('./LiveAgentSession')
const LiveAgentSession = lazy(loadSession)
const warmSession = prefetchProps('live-agent-session', loadSession)

const LiveAgentPanel = () => {
  const [open, setOpen] = useState(false)
  if (!hasLiveAgent) return null

  return (
    <div id="live-agent" className="live-agent" aria-labelledby="live-agent-title">
      <div className="live-agent-copy">
        <p className="live-agent-kicker"><span className="live-agent-dot" aria-hidden="true" /> Bboy AI Voice Studio · Live</p>
        <h3 id="live-agent-title">Talk to My AI.</h3>
        <p>
          Ask my AI assistant about my full-stack work, AI agents, automations, or how to get in touch.
          Conversations are limited to {Math.round(LIVE_SESSION_LIMIT_SECONDS / 60)} minutes, and your microphone is used only while one is open.
        </p>
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
