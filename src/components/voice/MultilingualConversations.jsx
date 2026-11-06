import { ArrowRight, AudioLines, ChevronDown, Clock3, Languages, User } from 'lucide-react'
import AccentAudioPlayer from './AccentAudioPlayer'
import { voiceConversations } from '../../data/voiceConversations'

const STATUS = {
  ready: null,
  preview: { label: 'Recording soon', tone: 'soon' },
  planned: { label: 'Planned', tone: 'planned' },
}

// A fixed, muted silhouette for cards without audio yet (decorative only).
const PENDING_WAVE = Array.from({ length: 28 }, (_, index) => `${6 + ((index * 7) % 20)}px`)

const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds)) return ''
  const whole = Math.floor(seconds)
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

// A line can switch language mid-sentence, so each phrase carries its own
// `lang`; screen readers then pronounce English and Spanish/Filipino correctly.
const Line = ({ parts }) => (
  <p>
    {parts.map(([lang, text], index) => (
      <span key={index} lang={lang}>{index > 0 ? ' ' : ''}{text}</span>
    ))}
  </p>
)

function ConversationCard({ conversation }) {
  const status = STATUS[conversation.status] ?? null
  const ready = conversation.status === 'ready' && conversation.src
  const titleId = `vs-ml-${conversation.id}-title`

  return (
    <article className={`vs-ml-card ${ready ? '' : 'is-pending'}`} aria-labelledby={titleId}>
      <div className="vs-ml-card-head">
        <p className="vs-ml-langs">
          <span className="sr-only">Languages: {conversation.languages.map((language) => language.label).join(' to ')}</span>
          {conversation.languages.map((language, index) => (
            <span key={language.code} className="vs-ml-lang-wrap">
              {index > 0 && <ArrowRight size={12} aria-hidden="true" className="vs-ml-arrow" />}
              <span className="vs-ml-lang" title={language.label} aria-hidden="true">{language.code}</span>
            </span>
          ))}
        </p>
        {status && <span className={`vs-ml-status vs-ml-status-${status.tone}`}>{status.label}</span>}
        {ready && Number.isFinite(conversation.duration) && (
          <span className="vs-ml-length"><Clock3 size={12} aria-hidden="true" /> {formatDuration(conversation.duration)}</span>
        )}
      </div>

      <h4 id={titleId}>{conversation.name}</h4>
      <p className="vs-ml-scenario">{conversation.title}</p>
      <p className="vs-ml-description">{conversation.description}</p>

      {ready ? (
        <AccentAudioPlayer
          src={conversation.src}
          title={`${conversation.name} conversation`}
          peaks={conversation.peaks}
          knownDuration={conversation.duration}
        />
      ) : (
        <div className="vs-ml-pending">
          <span className="vs-ml-pending-wave" aria-hidden="true">
            {PENDING_WAVE.map((height, index) => <i key={index} style={{ height }} />)}
          </span>
          <p>
            {conversation.status === 'planned'
              ? 'Script drafted. The recording is planned.'
              : 'Script ready. The recording will be added soon.'}
          </p>
        </div>
      )}

      <details className="vs-transcript vs-ml-transcript">
        <summary>
          <span>{ready ? 'Read the transcript' : 'Read the script'}</span>
          <span className="vs-transcript-count">{conversation.turns.length} lines</span>
          <ChevronDown size={18} aria-hidden="true" />
        </summary>
        <ol aria-label={`${conversation.name} ${ready ? 'conversation transcript' : 'script'}`}>
          {conversation.turns.map((turn, index) => (
            <li key={`${conversation.id}-${index}`} className={`vs-turn vs-turn-${turn.role}`}>
              <span className="vs-turn-avatar" aria-hidden="true">
                {turn.role === 'visitor' ? <User size={14} /> : <AudioLines size={14} />}
              </span>
              <div className="vs-turn-bubble">
                <span className="vs-turn-role">{turn.role === 'visitor' ? 'Caller' : 'AI Receptionist'}</span>
                <Line parts={turn.parts} />
              </div>
            </li>
          ))}
        </ol>
      </details>
    </article>
  )
}

export default function MultilingualConversations() {
  if (voiceConversations.length === 0) return null
  const anyPending = voiceConversations.some((conversation) => conversation.status !== 'ready')

  return (
    <section className="vs-studio vs-ml" aria-labelledby="vs-ml-title">
      <div className="vs-studio-bar">
        <div>
          <h3 id="vs-ml-title">Multilingual Conversations</h3>
          <p>One conversation. Multiple languages. Natural communication.</p>
        </div>
        <span className="vs-pill"><Languages size={13} aria-hidden="true" /> AI receptionist</span>
      </div>

      <div className="vs-ml-grid">
        {voiceConversations.map((conversation) => (
          <ConversationCard key={conversation.id} conversation={conversation} />
        ))}
      </div>

      <p className="vs-disclosure">
        These demonstrations feature AI-generated voices and fictional conversations.
        {anyPending && ' Cards marked “Recording soon” or “Planned” show the script only; no audio is played.'}
      </p>
    </section>
  )
}
