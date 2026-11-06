import { useEffect, useRef, useState } from 'react'
import { ConversationProvider, useConversation } from '@elevenlabs/react'
import { Mic, MicOff, PhoneOff, RotateCcw } from 'lucide-react'

const STATUS_TEXT = {
  disconnected: 'Conversation ended',
  connecting: 'Connecting…',
  connected: 'Connected',
  error: 'Could not connect',
}

const formatClock = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

// Ask for the microphone ourselves first, so a denial gets a clear message
// instead of a generic connection error. The stream is released immediately;
// the SDK opens its own.
async function checkMicrophone() {
  if (!navigator.mediaDevices?.getUserMedia) return 'This browser does not support microphone access.'
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((track) => track.stop())
    return ''
  } catch (error) {
    if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') return 'Microphone access was blocked. Allow it in your browser settings, then start again.'
    if (error?.name === 'NotFoundError') return 'No microphone was found on this device.'
    return 'The microphone could not be opened.'
  }
}

const Session = ({ onClose, limitSeconds }) => {
  const [error, setError] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [checking, setChecking] = useState(false)
  const conversation = useConversation()
  const { status, isSpeaking, isMuted } = conversation
  const endedForLimit = useRef(false)

  const start = async () => {
    setError('')
    setElapsed(0)
    endedForLimit.current = false
    setChecking(true)
    const micProblem = await checkMicrophone()
    setChecking(false)
    if (micProblem) {
      setError(micProblem)
      return
    }
    conversation.startSession({
      onError: (message) => setError(typeof message === 'string' && message ? message : 'The voice assistant is unavailable right now.'),
    })
  }

  // Start on mount: the visitor already clicked "Start a live conversation".
  // ConversationProvider ends any session when it unmounts (including React
  // StrictMode's simulated unmount in development), so no cleanup is needed.
  useEffect(() => {
    start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const connected = status === 'connected'

  // Session clock. The provider enforces the real limit server-side; ending
  // here as well just stops the visitor's side promptly at the same moment.
  useEffect(() => {
    if (!connected) return undefined
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [connected])

  useEffect(() => {
    if (connected && elapsed >= limitSeconds && !endedForLimit.current) {
      endedForLimit.current = true
      conversation.endSession()
    }
  }, [connected, elapsed, limitSeconds, conversation])

  const label = checking
    ? 'Waiting for microphone permission…'
    : connected
      ? (isSpeaking ? 'Assistant is speaking' : 'Listening… go ahead')
      : endedForLimit.current && status === 'disconnected'
        ? 'Time limit reached. Thanks for trying it!'
        : STATUS_TEXT[status] ?? status

  const finished = !checking && (status === 'disconnected' || status === 'error' || Boolean(error))

  return (
    <div className="live-agent-session">
      <div className="live-agent-meter">
        <div className={`live-agent-orb ${connected ? 'is-live' : ''} ${isSpeaking ? 'is-speaking' : ''}`} aria-hidden="true">
          <span /><span /><span />
        </div>
        {connected && <span className="live-agent-clock" aria-label={`Elapsed ${formatClock(elapsed)} of ${formatClock(limitSeconds)}`}>{formatClock(elapsed)} / {formatClock(limitSeconds)}</span>}
      </div>
      <p className="live-agent-status" role="status" aria-live="polite">{label}</p>
      {error && <p className="live-agent-error" role="alert">{error}</p>}
      <div className="live-agent-controls">
        {connected && (
          <button type="button" className="button button-secondary" onClick={() => conversation.setMuted(!isMuted)} aria-pressed={isMuted}>
            {isMuted ? <MicOff size={16} aria-hidden="true" /> : <Mic size={16} aria-hidden="true" />}
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
        )}
        {finished ? (
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

const LiveAgentSession = ({ agentId, limitSeconds, onClose }) => (
  <ConversationProvider agentId={agentId}>
    <Session onClose={onClose} limitSeconds={limitSeconds} />
  </ConversationProvider>
)

export default LiveAgentSession
