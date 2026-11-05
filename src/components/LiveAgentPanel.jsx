import { lazy, Suspense, useState } from 'react'
import { Loader2, Mic } from 'lucide-react'
import { prefetchProps } from '../lib/prefetch'

// Public ElevenLabs agent ID (safe to ship to the browser; it is not the API
// key). When unset, the panel renders nothing, so the site works unchanged.
const AGENT_ID = (import.meta.env.VITE_ELEVENLABS_AGENT_ID ?? '').trim()

// The SDK (and its audio/WebRTC client) only downloads on intent: hover, focus,
// or touch on the start button warms it; the click mounts the session.
const loadSession = () => import('./LiveAgentSession')
const LiveAgentSession = lazy(loadSession)
const warmSession = prefetchProps('elevenlabs-live-agent', loadSession)

const LiveAgentPanel = () => {
  const [open, setOpen] = useState(false)
  if (!AGENT_ID) return null

  return (
    <div className="live-agent" aria-labelledby="live-agent-title">
      <div className="live-agent-copy">
        <p className="live-agent-kicker"><span className="live-agent-dot" aria-hidden="true" /> Live AI voice agent</p>
        <h3 id="live-agent-title">Talk to it yourself, right in the browser.</h3>
        <p>
          A real-time voice agent built on ElevenLabs. Ask it about services, availability, or pricing.
          It uses your microphone only while the conversation is open.
        </p>
      </div>
      <div className="live-agent-action">
        {open ? (
          <Suspense fallback={<p className="live-agent-status" role="status"><Loader2 className="spin" size={16} aria-hidden="true" /> Loading the voice agent…</p>}>
            <LiveAgentSession agentId={AGENT_ID} onClose={() => setOpen(false)} />
          </Suspense>
        ) : (
          <button type="button" className="button button-primary" onClick={() => setOpen(true)} {...warmSession}>
            <Mic size={17} aria-hidden="true" /> Start a live conversation
          </button>
        )}
        <p className="live-agent-disclosure">You'll be speaking with an AI, not a person. Audio is processed by ElevenLabs.</p>
      </div>
    </div>
  )
}

export default LiveAgentPanel
