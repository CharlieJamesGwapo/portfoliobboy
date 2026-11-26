import { Suspense, useEffect, useRef, useState } from 'react'
import { ArrowUpRight, AudioLines, Loader2, Mic, Send, Sparkles, X } from 'lucide-react'
import { answerQuestion, answerSuggestion, suggestedQuestions } from '../../lib/assistantAnswers'
import { assessRole, briefQuestions, buildProjectBrief, recommendProjects } from '../../lib/assistantWorkflows'
import { stageAssistantEnquiry } from '../../lib/contactIntent'
import { navigatePortfolio } from '../../lib/portfolioRoute'
import { AGENT_ID, LIVE_SESSION_LIMIT_SECONDS, LiveAgentSession, hasLiveAgent, warmSession } from '../LiveAgentPanel'
import WorkflowResults from './WorkflowResults'
import BriefReview from './BriefReview'
import { trackPortfolioEvent } from '../../lib/portfolioAnalytics'

const MODES = [
  { id: 'general', label: 'General questions', field: 'Ask Alex a question', hint: 'Ask about Charlie’s projects, skills, experience, or contact details.', placeholder: 'Ask about projects, skills, contact…' },
  { id: 'projects', label: 'Find projects', field: 'Describe your project', hint: 'Describe what you need. I’ll find related case studies and show Charlie’s contribution.', placeholder: 'What should your project do?' },
  { id: 'role', label: 'Check role fit', field: 'Paste job requirements', hint: 'Paste requirements, one per line. I’ll show documented skills and what needs confirmation.', placeholder: 'React\nPython\n5 years of experience…' },
  { id: 'brief', label: 'Prepare a brief', field: 'Your answer', placeholder: 'Share a few details, or say “To discuss”…' },
]

const WELCOME = {
  role: 'alex',
  text: "Welcome to Charlie James Abejo's portfolio! 👋 I'm Alex, his portfolio assistant. I can find relevant projects, compare role requirements, or help you prepare a project brief.",
}

const prefersReducedMotion = () => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false }
}

let nextId = 1

export default function AssistantPanel({ onClose, startWithVoice = false, isOpen = true }) {
  const [messages, setMessages] = useState([{ id: 0, ...WELCOME }])
  // The live call runs inside the panel, so "Talk to Alex" starts talking
  // straight away; the agent's opening line is the spoken welcome.
  const [voiceOpen, setVoiceOpen] = useState(startWithVoice && hasLiveAgent)
  const [mode, setMode] = useState('general')
  const [drafts, setDrafts] = useState({})
  const [briefAnswers, setBriefAnswers] = useState({})
  const [briefStep, setBriefStep] = useState(0)
  const [briefReview, setBriefReview] = useState(null)
  const [typing, setTyping] = useState(false)
  const [asked, setAsked] = useState(() => new Set())
  const listRef = useRef(null)
  const inputRef = useRef(null)
  const panelRef = useRef(null)
  const timerRef = useRef(null)
  const chipsRef = useRef(null)
  const activeMode = MODES.find(item => item.id === mode)
  const draft = drafts[mode] || ''
  const reviewingBrief = mode === 'brief' && briefReview !== null
  const setDraft = value => setDrafts(current => ({ ...current, [mode]: value }))

  useEffect(() => {
    // Retain local text work while hidden, but end microphone use immediately.
    setVoiceOpen(isOpen && startWithVoice && hasLiveAgent)
  }, [isOpen, startWithVoice])

  useEffect(() => {
    if (!isOpen) return undefined
    const onKey = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [messages, typing, briefReview !== null, mode])

  useEffect(() => {
    if (!isOpen || voiceOpen) return
    if (reviewingBrief) document.getElementById('alex-brief')?.focus({ preventScroll: true })
    else inputRef.current?.focus({ preventScroll: true })
  }, [isOpen, voiceOpen, mode, reviewingBrief, typing])

  const reply = (question, answer) => {
    setMessages((current) => [...current, { id: nextId++, role: 'visitor', text: question }])
    setTyping(true)
    window.clearTimeout(timerRef.current)
    // A short pause reads as a reply rather than a page change. Answers are
    // local, so this is presentation only; reduced motion skips it.
    timerRef.current = window.setTimeout(() => {
      setTyping(false)
      setMessages((current) => [...current, { id: nextId++, role: 'alex', ...answer }])
    }, prefersReducedMotion() ? 0 : 450)
  }

  const ask = (event) => {
    event.preventDefault()
    const question = draft.trim()
    if (!question || typing) return
    setDraft('')
    if (mode === 'projects') reply(question, recommendProjects(question))
    else if (mode === 'role') reply(question, assessRole(question))
    else if (mode === 'brief') {
      const answers = { ...briefAnswers, [briefQuestions[briefStep].key]: question }
      setBriefAnswers(answers)
      if (briefStep < briefQuestions.length - 1) {
        setBriefStep(briefStep + 1)
        reply(question, { text: briefQuestions[briefStep + 1].question })
      } else {
        setBriefReview(buildProjectBrief(answers).message)
        reply(question, { text: 'Your brief is ready to review. Edit it below before opening the contact form.' })
      }
    } else {
      const recommendation = /\b(recommend|i need|we need|i want|we want)\b/i.test(question) ? recommendProjects(question) : null
      reply(question, recommendation?.projects.length ? recommendation : answerQuestion(question))
    }
  }

  const startEnquiry = enquiry => {
    stageAssistantEnquiry(enquiry.subject, enquiry.message)
    trackPortfolioEvent('portfolio_enquiry_reviewed', { surface: 'text_guide' })
    navigatePortfolio('/#contact')
    onClose(false)
  }

  const restartBrief = () => {
    setBriefAnswers({})
    setBriefStep(0)
    setBriefReview(null)
    setDrafts(current => ({ ...current, brief: '' }))
  }

  const askSuggestion = (suggestion) => {
    if (typing) return
    setAsked((current) => new Set(current).add(suggestion.id))
    // The chip row scrolls sideways; start it over so the next chip is not cut off.
    chipsRef.current?.scrollTo({ left: 0 })
    reply(suggestion.label, answerSuggestion(suggestion.id))
  }

  // In-page links close the panel on small screens so the section is visible.
  const onAction = (action) => {
    if (action.external) return
    if (window.matchMedia('(max-width: 640px)').matches) onClose(false)
  }

  const remaining = suggestedQuestions.filter((item) => !asked.has(item.id))

  return (
    <section ref={panelRef} className={`alex-panel${voiceOpen ? ' has-voice' : ''}`} role="dialog" aria-modal="false" aria-labelledby="alex-title" aria-describedby="alex-note">
      <header className="alex-head">
        <span className="alex-avatar" aria-hidden="true"><AudioLines size={18} /></span>
        <div className="alex-head-copy">
          <h2 id="alex-title">Alex</h2>
          <p><span className="alex-online" aria-hidden="true" /> Portfolio assistant · instant answers</p>
        </div>
        <button type="button" className="alex-icon-button" onClick={onClose} aria-label="Close Alex">
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className={`alex-voice ${voiceOpen ? 'is-live' : ''}`}>
        {hasLiveAgent ? (
          voiceOpen && isOpen ? (
            <>
            <button type="button" className="alex-voice-button alex-voice-back" onClick={() => setVoiceOpen(false)}>Close voice and return to text</button>
            <Suspense fallback={<p className="live-agent-status" role="status"><Loader2 className="spin" size={16} aria-hidden="true" /> Starting voice…</p>}>
              <LiveAgentSession agentId={AGENT_ID} limitSeconds={LIVE_SESSION_LIMIT_SECONDS} surface="voice_panel" onClose={() => setVoiceOpen(false)} onEnquiry={() => onClose(false)} />
            </Suspense>
            </>
          ) : (
            <>
              <button type="button" className="alex-voice-button" onClick={() => setVoiceOpen(true)} {...warmSession}>
                <Mic size={16} aria-hidden="true" /> Talk to Alex
              </button>
              <span className="alex-soon">Live voice · up to {Math.round(LIVE_SESSION_LIMIT_SECONDS / 60)} min</span>
            </>
          )
        ) : (
          <>
            <button type="button" className="alex-voice-button" disabled aria-describedby="alex-voice-note">
              <Mic size={16} aria-hidden="true" /> Talk to Alex
            </button>
            <span id="alex-voice-note" className="alex-soon">Voice coming soon</span>
          </>
        )}
      </div>

      {!voiceOpen && <>
      <div className="alex-modes" role="group" aria-label="How Alex can help">
        {MODES.map(item => (
          <button key={item.id} type="button" aria-pressed={mode === item.id} onClick={() => setMode(item.id)} disabled={typing}>
            {item.label}
          </button>
        ))}
      </div>
      <p className="alex-mode-help" id="alex-mode-help" aria-live="polite">
        {mode === 'brief' ? (reviewingBrief ? 'Review your draft below. Nothing is sent until you submit the contact form.' : `Step ${briefStep + 1} of 4 · ${briefQuestions[briefStep].question}`) : activeMode.hint}
      </p>

      <ol ref={listRef} className="alex-messages" aria-live="polite" aria-label="Conversation with Alex">
        {messages.map((message) => (
          <li key={message.id} className={`alex-msg alex-msg-${message.role}${message.projects || message.requirements ? ' alex-msg-workflow' : ''}`}>
            <p>{message.text}</p>
            <WorkflowResults result={message} onEnquiry={startEnquiry} onNavigate={() => onAction({})} />
            {message.actions?.length > 0 && (
              <div className="alex-actions">
                {message.actions.map((action) => (
                  <a
                    key={action.label}
                    href={action.href}
                    onClick={() => onAction(action)}
                    {...(action.external && !/^(mailto|tel):/.test(action.href) ? { target: '_blank', rel: 'noreferrer' } : {})}
                  >
                    {action.label}
                    {action.external && <ArrowUpRight size={13} aria-hidden="true" />}
                  </a>
                ))}
              </div>
            )}
          </li>
        ))}
        {typing && (
          <li className="alex-msg alex-msg-alex alex-typing" aria-label="Alex is typing">
            <span /><span /><span />
          </li>
        )}
        {reviewingBrief && !typing && (
          <li className="alex-msg alex-msg-alex alex-msg-workflow">
            <BriefReview value={briefReview} onChange={setBriefReview} onUse={() => startEnquiry({ ...buildProjectBrief(briefAnswers), message: briefReview.trim() })} onRestart={restartBrief} />
          </li>
        )}
      </ol>

      {mode === 'general' && remaining.length > 0 && (
        <div ref={chipsRef} className="alex-suggestions" role="group" aria-label="Suggested questions">
          {remaining.map((suggestion) => (
            <button key={suggestion.id} type="button" onClick={() => askSuggestion(suggestion)} disabled={typing}>
              <Sparkles size={12} aria-hidden="true" /> {suggestion.label}
            </button>
          ))}
        </div>
      )}

      {!reviewingBrief && <form className="alex-input" onSubmit={ask}>
        <label htmlFor="alex-question" className="sr-only">{activeMode.field}</label>
        {mode === 'general' ? <input
          ref={inputRef}
          id="alex-question"
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={activeMode.placeholder}
          autoComplete="off"
          maxLength={200}
        /> : <textarea
          ref={inputRef}
          id="alex-question"
          value={draft}
          onChange={event => setDraft(event.target.value)}
          placeholder={activeMode.placeholder}
          aria-describedby="alex-mode-help"
          rows={mode === 'role' ? 3 : 2}
          maxLength={mode === 'role' ? 4000 : 1000}
          onKeyDown={event => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
              event.preventDefault()
              event.currentTarget.form.requestSubmit()
            }
          }}
        />}
        <button type="submit" className="alex-send" disabled={!draft.trim() || typing} aria-label="Send question">
          <Send size={16} aria-hidden="true" />
        </button>
      </form>}
      </>}
      <p id="alex-note" className="alex-note">
        {hasLiveAgent
          ? 'Chat answers come instantly from this portfolio. Voice is a live AI that uses your microphone only during a call.'
          : <>Local portfolio guide. Your input stays in this page until you choose to submit the contact form.</>}
      </p>
    </section>
  )
}
