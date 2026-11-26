import { useEffect, useRef, useState } from 'react'
import { ConversationProvider, useConversation } from '@elevenlabs/react'
import { Mic, MicOff, PhoneOff, RotateCcw } from 'lucide-react'
import rawAudioProcessor from '@elevenlabs/client/worklets/rawAudioProcessor.js?url'
import audioConcatProcessor from '@elevenlabs/client/worklets/audioConcatProcessor.js?url'
import { createVoiceSessionStarter } from '../lib/voiceSessionStart'
import { isVoiceFarewell } from '../lib/voiceFarewell'

// The SDK otherwise loads its audio worklets from blob: URLs, which the site's
// CSP (script-src 'self') rightly refuses. Served as same-origin build assets
// they load under the existing policy.
const WORKLET_PATHS = { rawAudioProcessor, audioConcatProcessor }

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
  const [checking, setChecking] = useState(true)
  const conversation = useConversation()
  const { status, isSpeaking, isMuted, endSession } = conversation
  const endedForLimit = useRef(false)
  const endedForGoodbye = useRef(false)
  const heardAssistant = useRef(false)
  const starter = useRef(null)
  if (!starter.current) starter.current = createVoiceSessionStarter(checkMicrophone)

  const start = async () => {
    setError('')
    setElapsed(0)
    endedForLimit.current = false
    endedForGoodbye.current = false
    heardAssistant.current = false
    setChecking(true)
    const result = await starter.current.start((isCurrent) => {
      setChecking(false)
      return conversation.startSession({
        // The agent's WebRTC room disconnects before its first response.
        // WebSocket carries both audio directions over the supported API host.
        connectionType: 'websocket',
        workletPaths: WORKLET_PATHS,
        onMessage: ({ source, message }) => {
          if (!isCurrent() || source !== 'user' || !isVoiceFarewell(message)) return
          endedForGoodbye.current = true
          starter.current.cancel()
          conversation.endSession()
        },
        onModeChange: ({ mode }) => {
          if (isCurrent() && mode === 'speaking') heardAssistant.current = true
        },
        onDisconnect: (details) => {
          if (!isCurrent() || details.reason === 'user' || endedForLimit.current) return
          console.warn('[voice] disconnected:', details)
          if (details.reason === 'error') {
            setError('The voice connection was interrupted. Please start again, or use the chat.')
          } else if (!heardAssistant.current) {
            setError('The voice assistant ended before it could respond. Please start again, or use the chat.')
          }
        },
        // Provider diagnostics stay in the console; visitors see plain copy.
        onError: (message) => {
          if (!isCurrent()) return
          console.warn('[voice]', message)
          setError('The voice assistant is unavailable right now. Please try again, or use the chat.')
        },
      })
    })
    if (result.status === 'cancelled') return
    setChecking(false)
    if (result.status === 'denied') setError(result.message)
    if (result.status === 'error') {
      console.warn('[voice] connection failed:', result.error?.message)
      setError('The voice assistant is unavailable right now. Please try again, or use the chat.')
    }
  }

  // Start on mount: the visitor already clicked "Start a live conversation".
  // Provider teardown ends existing connections; the gate also cancels a
  // microphone prompt which has not resolved yet (including StrictMode replay).
  useEffect(() => {
    start()
    return () => starter.current.cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const connected = status === 'connected'

  // Stop this browser's call at the displayed limit. Provider-side usage caps
  // are configured separately; the browser cannot enforce an account quota.
  useEffect(() => {
    if (!connected) return undefined
    const startedAt = performance.now()
    const finishForLimit = () => {
      if (endedForLimit.current || endedForGoodbye.current) return
      endedForLimit.current = true
      setElapsed(limitSeconds)
      starter.current.cancel()
      endSession()
    }
    const timer = window.setInterval(() => {
      const seconds = Math.floor((performance.now() - startedAt) / 1000)
      setElapsed(Math.min(seconds, limitSeconds))
      if (seconds >= limitSeconds) finishForLimit()
    }, 1000)
    const deadline = window.setTimeout(finishForLimit, limitSeconds * 1000)
    return () => {
      window.clearInterval(timer)
      window.clearTimeout(deadline)
    }
  }, [connected, limitSeconds, endSession])

  const label = checking
    ? 'Waiting for microphone permission…'
    : error
      ? STATUS_TEXT.error
      : connected
        ? (isMuted ? 'Microphone muted' : isSpeaking ? 'Assistant is speaking' : 'Listening… go ahead')
        : endedForGoodbye.current && status === 'disconnected'
          ? 'Conversation ended. Thanks for stopping by!'
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
        <span className="live-agent-session-name">Alex · Voice assistant</span>
        {!finished && <div className="live-agent-clock" role="timer" aria-label={`${formatClock(Math.max(0, limitSeconds - elapsed))} remaining`}><span>Time left</span><strong>{formatClock(Math.max(0, limitSeconds - elapsed))}</strong></div>}
      </div>
      {connected && <progress className="live-agent-progress" max={limitSeconds} value={elapsed} aria-label="Conversation time used" />}
      <p className="live-agent-status" role="status" aria-live="polite">{label}</p>
      {!finished && <p className="live-agent-hint">{isMuted ? 'Unmute when you’re ready to speak.' : 'Say “goodbye” or select End conversation to finish.'}</p>}
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
          <button type="button" className="button button-secondary live-agent-end" onClick={() => { starter.current.cancel(); conversation.endSession(); onClose() }}>
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
