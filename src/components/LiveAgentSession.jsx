import { useEffect, useMemo, useRef, useState } from 'react'
import { ConversationProvider, useConversation } from '@elevenlabs/react'
import { Mic, MicOff, PhoneOff, RotateCcw } from 'lucide-react'
import rawAudioProcessor from '@elevenlabs/client/worklets/rawAudioProcessor.js?url'
import audioConcatProcessor from '@elevenlabs/client/worklets/audioConcatProcessor.js?url'
import { createVoiceSessionStarter } from '../lib/voiceSessionStart'
import { isVoiceFarewell } from '../lib/voiceFarewell'
import { buildVoiceEnquiry, getVoiceProjects, mergeVoiceTranscript, voiceStarters } from '../lib/voiceConversation'
import { stageAssistantEnquiry } from '../lib/contactIntent'
import { navigatePortfolio } from '../lib/portfolioRoute'
import VoiceConversation from './voice/VoiceConversation'
import { answerQuestion } from '../lib/assistantAnswers'
import { buildVoiceEvidenceContext } from '../lib/voiceEvidence'
import { trackPortfolioEvent } from '../lib/portfolioAnalytics'

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

const Session = ({ onClose, onEnquiry, limitSeconds, surface }) => {
  const [error, setError] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [checking, setChecking] = useState(true)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState(null)
  const [starterError, setStarterError] = useState('')
  const [textMode, setTextMode] = useState(false)
  const textNumber = useRef(0)
  const conversation = useConversation()
  const { status, isSpeaking, isMuted, endSession } = conversation
  const endedForLimit = useRef(false)
  const endedForGoodbye = useRef(false)
  const heardAssistant = useRef(false)
  const sessionNumber = useRef(0)
  const starterNumber = useRef(0)
  const activeCheck = useRef(() => false)
  const starter = useRef(null)
  if (!starter.current) starter.current = createVoiceSessionStarter(checkMicrophone)

  const start = async () => {
    setTextMode(false)
    setError('')
    setStarterError('')
    setElapsed(0)
    endedForLimit.current = false
    endedForGoodbye.current = false
    heardAssistant.current = false
    setChecking(true)
    const result = await starter.current.start((isCurrent) => {
      setChecking(false)
      const sessionId = ++sessionNumber.current
      activeCheck.current = isCurrent
      return conversation.startSession({
        // The agent's WebRTC room disconnects before its first response.
        // WebSocket carries both audio directions over the supported API host.
        connectionType: 'websocket',
        workletPaths: WORKLET_PATHS,
        onConnect: () => {
          if (!isCurrent()) return
          trackPortfolioEvent('portfolio_voice_started', { surface })
          try { conversation.sendContextualUpdate(buildVoiceEvidenceContext()) } catch {
            // Public context is optional; keep call controls usable if the
            // transport closes between connection and context delivery.
          }
        },
        onMessage: (event) => {
          if (!isCurrent()) return
          setMessages(previous => mergeVoiceTranscript(previous, event, sessionId))
          if (event.source !== 'user' || !isVoiceFarewell(event.message)) return
          endedForGoodbye.current = true
          starter.current.cancel()
          conversation.endSession()
        },
        onAgentResponseCorrection: (event) => {
          if (!isCurrent()) return
          setMessages(previous => mergeVoiceTranscript(previous, {
            source: 'ai', message: event.corrected_agent_response, event_id: event.event_id,
          }, sessionId))
        },
        onModeChange: ({ mode }) => {
          if (isCurrent() && mode === 'speaking') heardAssistant.current = true
        },
        onDisconnect: (details) => {
          if (!isCurrent()) return
          starter.current.cancel()
          if (details.reason === 'user' || endedForLimit.current) return
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

  const connected = status === 'connected' && !textMode
  const projects = useMemo(() => getVoiceProjects(messages), [messages])

  const stopCall = () => {
    starter.current.cancel()
    setChecking(false)
    endSession()
  }

  const askStarter = (prompt) => {
    const selected = voiceStarters.find(item => item.prompt === prompt)
    if (!selected) return
    if (textMode) {
      if (askLocal(prompt)) trackPortfolioEvent('portfolio_starter_used', { surface: 'text_guide', starter_id: selected.id })
      return
    }
    if (!connected || !activeCheck.current()) return
    try {
      conversation.sendUserMessage(prompt)
      trackPortfolioEvent('portfolio_starter_used', { surface, starter_id: selected.id })
      setStarterError('')
      setMessages(previous => mergeVoiceTranscript(previous, {
        source: 'user', message: prompt, event_id: `starter-${++starterNumber.current}`, local: true,
      }, sessionNumber.current))
    } catch {
      setStarterError('That question could not be sent. Please try speaking it instead.')
    }
  }

  const continueInText = () => {
    stopCall()
    setError('')
    setStarterError('')
    setTextMode(true)
  }

  const askLocal = (value) => {
    const question = typeof value === 'string' ? value.trim().slice(0, 1000) : ''
    if (!textMode || !question) return false
    const id = `text-${++textNumber.current}`
    const answer = answerQuestion(question)
    setMessages(previous => mergeVoiceTranscript(mergeVoiceTranscript(previous, {
      source: 'user', message: question, event_id: id,
    }, 'text'), { source: 'ai', message: answer.text, event_id: id }, 'text'))
    return true
  }

  const openProject = (event) => {
    const projectId = event.currentTarget.getAttribute('href')?.match(/^\/projects\/([a-z0-9-]+)$/)?.[1]
    stopCall()
    if (projectId) trackPortfolioEvent('portfolio_project_opened', { surface: textMode ? 'text_guide' : surface, project_id: projectId })
  }

  const prepareDraft = () => {
    const enquiry = buildVoiceEnquiry(messages, projects)
    if (!enquiry) return
    stopCall()
    setDraft(enquiry)
  }

  const reviewEnquiry = () => {
    const subject = draft?.subject?.trim()
    const message = draft?.message?.trim()
    if (!subject || subject.length > 120 || !message || message.length < 10 || message.length > 4500) return
    stopCall()
    stageAssistantEnquiry(subject, message)
    trackPortfolioEvent('portfolio_enquiry_reviewed', { surface: textMode ? 'text_guide' : surface })
    navigatePortfolio('/#contact')
    onEnquiry?.()
  }

  const bookCall = enquiry => {
    stopCall()
    stageAssistantEnquiry(enquiry.subject, enquiry.message, { preserveSubject: true })
    navigatePortfolio('/#contact')
    onEnquiry?.()
  }

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

  const label = textMode ? 'Text mode · microphone off' : checking
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

  const finished = textMode || (!checking && (status === 'disconnected' || status === 'error' || Boolean(error)))

  return (
    <div className="live-agent-session">
      <div className="live-agent-meter">
        <div className={`live-agent-orb ${connected ? 'is-live' : ''} ${isSpeaking ? 'is-speaking' : ''}`} aria-hidden="true">
          <span /><span /><span />
        </div>
        <span className="live-agent-session-name">Alex · {textMode ? 'Local text guide' : 'Voice assistant'}</span>
        {!finished && <div className="live-agent-clock" role="timer" aria-label={`${formatClock(Math.max(0, limitSeconds - elapsed))} remaining`}><span>Time left</span><strong>{formatClock(Math.max(0, limitSeconds - elapsed))}</strong></div>}
      </div>
      {connected && <progress className="live-agent-progress" max={limitSeconds} value={elapsed} aria-label="Conversation time used" />}
      <p className="live-agent-status" role="status" aria-live="polite">{label}</p>
      {!finished && <p className="live-agent-hint">{isMuted ? 'Unmute when you’re ready to speak.' : 'Say “goodbye” or select End conversation to finish.'}</p>}
      {error && <p className="live-agent-error" role="alert">{error}</p>}
      {starterError && <p className="live-agent-error" role="alert">{starterError}</p>}
      {!textMode && error && <button type="button" className="button button-primary" onClick={continueInText}>Continue in text</button>}
      <div className="live-agent-controls">
        {connected && (
          <button type="button" className="button button-secondary" onClick={() => conversation.setMuted(!isMuted)} aria-pressed={isMuted}>
            {isMuted ? <MicOff size={16} aria-hidden="true" /> : <Mic size={16} aria-hidden="true" />}
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
        )}
        {finished ? (
          <>
            <button type="button" className="button button-primary" onClick={start}><RotateCcw size={16} aria-hidden="true" /> {textMode ? 'Try voice again' : 'Start again'}</button>
            <button type="button" className="button button-secondary" onClick={onClose}>Close</button>
          </>
        ) : (
          <button type="button" className="button button-secondary live-agent-end" onClick={stopCall}>
            <PhoneOff size={16} aria-hidden="true" /> End conversation
          </button>
        )}
      </div>
      <VoiceConversation messages={messages} projects={projects} connected={connected && !checking} textMode={textMode} onAskLocal={askLocal}
        draft={draft} onAsk={askStarter} onPrepareDraft={prepareDraft} onDraftChange={setDraft}
        onReviewEnquiry={reviewEnquiry} onOpenProject={openProject} onBookCall={bookCall} onSchedule={stopCall} surface={textMode ? 'text_guide' : surface} />
    </div>
  )
}

const LiveAgentSession = ({ agentId, limitSeconds, onClose, onEnquiry, surface = 'voice_home' }) => (
  <ConversationProvider agentId={agentId}>
    <Session onClose={onClose} onEnquiry={onEnquiry} limitSeconds={limitSeconds} surface={surface} />
  </ConversationProvider>
)

export default LiveAgentSession
