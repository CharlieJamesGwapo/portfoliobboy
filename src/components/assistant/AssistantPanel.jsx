import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, AudioLines, Mic, Send, Sparkles, X } from 'lucide-react'
import { answerQuestion, answerSuggestion, suggestedQuestions } from '../../lib/assistantAnswers'
import { hasLiveAgent } from '../LiveAgentPanel'

const WELCOME = {
  role: 'alex',
  text: "Hey there! 👋 I'm Alex, Charlie's AI assistant. Want to explore his projects, learn about his AI work, or ask me something?",
}

const prefersReducedMotion = () => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false }
}

let nextId = 1

export default function AssistantPanel({ onClose }) {
  const [messages, setMessages] = useState([{ id: 0, ...WELCOME }])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const [asked, setAsked] = useState(() => new Set())
  const listRef = useRef(null)
  const inputRef = useRef(null)
  const panelRef = useRef(null)
  const timerRef = useRef(null)
  const chipsRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
    const onKey = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.clearTimeout(timerRef.current)
    }
  }, [onClose])

  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [messages, typing])

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
    reply(question, answerQuestion(question))
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
    if (window.matchMedia('(max-width: 640px)').matches) onClose()
  }

  const remaining = suggestedQuestions.filter((item) => !asked.has(item.id))

  return (
    <section ref={panelRef} className="alex-panel" role="dialog" aria-modal="false" aria-labelledby="alex-title" aria-describedby="alex-note">
      <header className="alex-head">
        <span className="alex-avatar" aria-hidden="true"><AudioLines size={18} /></span>
        <div className="alex-head-copy">
          <h2 id="alex-title">Alex</h2>
          <p><span className="alex-online" aria-hidden="true" /> AI Portfolio Assistant</p>
        </div>
        <button type="button" className="alex-icon-button" onClick={onClose} aria-label="Close Alex">
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="alex-voice">
        {hasLiveAgent ? (
          <a className="alex-voice-button" href="/#live-agent" onClick={onClose}>
            <Mic size={16} aria-hidden="true" /> Talk to Alex
          </a>
        ) : (
          <>
            <button type="button" className="alex-voice-button" disabled aria-describedby="alex-voice-note">
              <Mic size={16} aria-hidden="true" /> Talk to Alex
            </button>
            <span id="alex-voice-note" className="alex-soon">Voice coming soon</span>
          </>
        )}
      </div>

      <ol ref={listRef} className="alex-messages" aria-live="polite" aria-label="Conversation with Alex">
        {messages.map((message) => (
          <li key={message.id} className={`alex-msg alex-msg-${message.role}`}>
            <p>{message.text}</p>
            {message.actions?.length > 0 && (
              <div className="alex-actions">
                {message.actions.map((action) => (
                  <a
                    key={action.label}
                    href={action.href}
                    onClick={() => onAction(action)}
                    {...(action.external && !action.href.startsWith('mailto:') ? { target: '_blank', rel: 'noreferrer' } : {})}
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
      </ol>

      {remaining.length > 0 && (
        <div ref={chipsRef} className="alex-suggestions" role="group" aria-label="Suggested questions">
          {remaining.map((suggestion) => (
            <button key={suggestion.id} type="button" onClick={() => askSuggestion(suggestion)} disabled={typing}>
              <Sparkles size={12} aria-hidden="true" /> {suggestion.label}
            </button>
          ))}
        </div>
      )}

      <form className="alex-input" onSubmit={ask}>
        <label htmlFor="alex-question" className="sr-only">Ask Alex a question</label>
        <input
          ref={inputRef}
          id="alex-question"
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about projects, skills, contact…"
          autoComplete="off"
          maxLength={200}
        />
        <button type="submit" className="alex-send" disabled={!draft.trim() || typing} aria-label="Send question">
          <Send size={16} aria-hidden="true" />
        </button>
      </form>
      <p id="alex-note" className="alex-note">Instant answers from Charlie&apos;s portfolio. No AI model or data collection.</p>
    </section>
  )
}
