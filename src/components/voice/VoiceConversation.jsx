import { useEffect, useId, useRef, useState } from 'react'
import { buildVoiceEnquiry, VOICE_TRANSCRIPT_LIMIT, voiceStarters } from '../../lib/voiceConversation'
import './voice-conversation.css'
import BriefActions from '../assistant/BriefActions'
import AlexBooking from '../assistant/AlexBooking'

const EMPTY_ITEMS = []

// Evidence links come from the public portfolio catalogue. Keep the presentation
// boundary safe if a future caller accidentally passes an external URL.
function isPublicProjectLink(href) {
  return typeof href === 'string' && /^\/(?![\/\\])[^\\]*$/.test(href)
}

export default function VoiceConversation({
  messages = EMPTY_ITEMS,
  projects = EMPTY_ITEMS,
  connected = false,
  textMode = false,
  onAskLocal,
  draft = null,
  onAsk,
  onPrepareDraft,
  onDraftChange,
  onReviewEnquiry,
  onOpenProject,
  onBookCall,
  onSchedule,
  surface = 'voice_home',
}) {
  const id = useId()
  const [question, setQuestion] = useState('')
  const canAsk = connected || textMode
  const transcriptRef = useRef(null)
  const followsTranscript = useRef(true)
  const publicProjects = projects.filter(project => isPublicProjectLink(project.href)).slice(0, 3)
  const canPrepare = Boolean(buildVoiceEnquiry(messages, publicProjects))
  const subject = draft?.subject ?? ''
  const message = draft?.message ?? ''
  const canReview = subject.trim().length >= 3 && subject.length <= 120
    && message.trim().length >= 10 && message.length <= 4500

  useEffect(() => {
    const log = transcriptRef.current
    // Move only the log's own scrollbar. Never scroll the page or take focus
    // away from a visitor who is reading earlier messages or editing a draft.
    if (log && followsTranscript.current) log.scrollTop = log.scrollHeight
  }, [messages])

  const rememberTranscriptPosition = event => {
    const log = event.currentTarget
    followsTranscript.current = log.scrollHeight - log.scrollTop - log.clientHeight <= 48
  }

  return (
    <div className="voice-workspace">
      <section className="voice-workspace-section" aria-labelledby={`${id}-starters`}>
        <div className="voice-workspace-heading">
          <h3 id={`${id}-starters`}>Start with a question</h3>
          <span className="voice-workspace-eyebrow">Your next move</span>
        </div>
        <div className="voice-workspace-starters">
          {voiceStarters.map(starter => (
            <button
              key={starter.id}
              type="button"
              disabled={!canAsk}
              onClick={() => { if (canAsk) onAsk?.(starter.prompt) }}
            >
              {starter.label}<span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
        {!canAsk && <p className="voice-workspace-note">Start a voice conversation to ask a question.</p>}
      </section>

      {textMode && <form className="voice-workspace-text-form" onSubmit={event => {
        event.preventDefault()
        if (question.trim() && onAskLocal?.(question) !== false) setQuestion('')
      }}>
        <label htmlFor={`${id}-text`}>Ask Alex in text</label>
        <p className="voice-workspace-note">Answers use this portfolio’s published information. Your microphone stays off.</p>
        <input id={`${id}-text`} value={question} onChange={event => setQuestion(event.target.value)} maxLength={1000} autoComplete="off" />
        <button type="submit" disabled={!question.trim()}>Send text question</button>
      </form>}

      <section className="voice-workspace-section" aria-labelledby={`${id}-transcript`}>
        <div className="voice-workspace-heading">
          <h3 id={`${id}-transcript`}>Conversation transcript</h3>
          <span className="voice-workspace-eyebrow">{textMode ? 'Local text answers' : connected ? 'Live transcript' : 'Transcript'}</span>
        </div>
        <div
          ref={transcriptRef}
          className="voice-workspace-transcript"
          role="log"
          aria-labelledby={`${id}-transcript`}
          aria-live="polite"
          aria-relevant="additions text"
          aria-atomic="false"
          tabIndex={0}
          onScroll={rememberTranscriptPosition}
        >
          {messages.length ? messages.map(item => (
            <div key={item.id} className={`voice-workspace-message${item.source === 'user' ? ' is-user' : ''}`}>
              <span className="voice-workspace-speaker">{item.source === 'user' ? 'You' : 'Alex'}</span>
              <p>{item.text}</p>
            </div>
          )) : (
            <p className="voice-workspace-empty">{textMode ? 'Type a question or choose one above. Alex’s local answers will appear here.' : 'Your words and Alex’s replies will appear here. Speak naturally, or choose a question above.'}</p>
          )}
        </div>
        <p className="voice-workspace-note">Shows the latest {VOICE_TRANSCRIPT_LIMIT} messages. This page keeps the transcript and draft only while this panel is open. Avoid sharing sensitive information.</p>
      </section>

      {publicProjects.length > 0 && (
        <section className="voice-workspace-section" aria-labelledby={`${id}-projects`}>
          <div className="voice-workspace-heading">
            <h3 id={`${id}-projects`}>Relevant work</h3>
            <span className="voice-workspace-eyebrow">Public evidence</span>
          </div>
          <div className="voice-workspace-projects">
            {publicProjects.map(project => (
              <article className="voice-workspace-project" key={project.href}>
                <div className="voice-workspace-heading">
                  <h4>{project.title}</h4>
                  {project.status && <span className="voice-workspace-project-status">{project.status}</span>}
                </div>
                {project.contribution && <p>{project.contribution}</p>}
                {project.reason && <p className="voice-workspace-project-reason">{project.reason}</p>}
                <a href={project.href} target="_blank" rel="noopener noreferrer" onClick={onOpenProject}>
                  View case study<span aria-hidden="true">↗</span>
                  <span className="voice-workspace-link-note">Opens a new tab · ends the call</span>
                </a>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="voice-workspace-section voice-workspace-enquiry" aria-labelledby={`${id}-enquiry`}>
        <div className="voice-workspace-heading">
          <h3 id={`${id}-enquiry`}>Turn the conversation into an enquiry</h3>
        </div>
        <p className="voice-workspace-note">Prepare an editable draft from what you shared. This ends the call. Nothing is sent until you submit the contact form.</p>
        <button type="button" className="voice-workspace-prepare" disabled={!canPrepare} onClick={onPrepareDraft}>
          {draft ? 'Replace draft from conversation' : 'Prepare enquiry draft'}
        </button>
        {!canPrepare && <p className="voice-workspace-note">Share what you need first so there is something to draft.</p>}
        {draft && (
          <div className="voice-workspace-draft">
            <label htmlFor={`${id}-subject`}>Voice enquiry subject</label>
            <input
              id={`${id}-subject`}
              type="text"
              value={subject}
              maxLength={120}
              autoComplete="off"
              onChange={event => onDraftChange?.({ ...draft, subject: event.target.value })}
            />
            <label htmlFor={`${id}-message`}>Voice enquiry draft</label>
            <textarea
              id={`${id}-message`}
              value={message}
              maxLength={4500}
              rows={7}
              aria-describedby={`${id}-draft-note`}
              onChange={event => onDraftChange?.({ ...draft, message: event.target.value })}
            />
            <p id={`${id}-draft-note`} className="voice-workspace-note">Review and edit the details. Your draft stays as you edit it; “Replace draft” overwrites these fields.</p>
            <BriefActions subject={subject} message={message} onSave={onSchedule} surface={surface} />
            <p className="voice-workspace-note">Saving or copying the brief ends any voice call.</p>
            <button type="button" className="voice-workspace-review" disabled={!canReview} onClick={onReviewEnquiry}>Review in contact form<span aria-hidden="true">→</span></button>
          </div>
        )}
      </section>
      <section className="voice-workspace-booking" aria-label="Call booking">
        <p className="voice-workspace-note">Opening booking ends any voice call.</p>
        <AlexBooking brief={draft} onRequest={onBookCall} onSchedule={onSchedule} surface={surface} />
      </section>
    </div>
  )
}
