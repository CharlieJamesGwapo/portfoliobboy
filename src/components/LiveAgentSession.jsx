import { useEffect, useState } from 'react'
import { ConversationProvider, useConversation } from '@elevenlabs/react'
import { Mic, MicOff, PhoneOff, RotateCcw } from 'lucide-react'

const STATUS_TEXT = {
  disconnected: 'Conversation ended',
  connecting: 'Connecting… allow microphone access when asked',
  connected: 'Connected',
  error: 'Could not connect',
}

const Session = ({ onClose }) => {
  const [error, setError] = useState('')
  const conversation = useConversation()
  const { status, isSpeaking, isMuted } = conversation

  const start = () => {
    setError('')
    conversation.startSession({
      onError: (message) => setError(typeof message === 'string' ? message : 'The voice agent is unavailable right now.'),
    })
  }

  // Start on mount: the visitor already clicked "Start a live conversation".
  // No cleanup here: ConversationProvider ends any session when it unmounts,
  // including React StrictMode's simulated unmount in development, after which
  // this effect runs again and opens the one session that stays.
  useEffect(() => {
    start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const connected = status === 'connected'
  const label = connected ? (isSpeaking ? 'Agent is speaking' : 'Listening… go ahead') : STATUS_TEXT[status] ?? status

  return (
    <div className="live-agent-session">
      <div className={`live-agent-orb ${connected ? 'is-live' : ''} ${isSpeaking ? 'is-speaking' : ''}`} aria-hidden="true">
        <span /><span /><span />
      </div>
      <p className="live-agent-status" role="status" aria-live="polite">{label}</p>
      {error && <p className="live-agent-error" role="alert">{error} Check microphone permission and try again.</p>}
      <div className="live-agent-controls">
        {connected && (
          <button type="button" className="button button-secondary" onClick={() => conversation.setMuted(!isMuted)} aria-pressed={isMuted}>
            {isMuted ? <MicOff size={16} aria-hidden="true" /> : <Mic size={16} aria-hidden="true" />}
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
        )}
        {(status === 'disconnected' || status === 'error') ? (
          <>
            <button type="button" className="button button-primary" onClick={start}><RotateCcw size={16} aria-hidden="true" /> Start again</button>
            <button type="button" className="button button-secondary" onClick={onClose}>Close</button>
          </>
        ) : (
          <button type="button" className="button button-secondary live-agent-end" onClick={() => { conversation.endSession(); onClose() }}>
            <PhoneOff size={16} aria-hidden="true" /> End conversation
          </button>
        )}
      </div>
    </div>
  )
}

const LiveAgentSession = ({ agentId, onClose }) => (
  <ConversationProvider agentId={agentId}>
    <Session onClose={onClose} />
  </ConversationProvider>
)

export default LiveAgentSession
