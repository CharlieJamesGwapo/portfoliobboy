import { useState } from 'react'
import { AudioLines, ChevronDown, Clock3, Sparkles, User } from 'lucide-react'
import AccentAudioPlayer from './AccentAudioPlayer'
import { voiceAccents } from '../../data/voiceAccents'

const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds)) return ''
  const whole = Math.floor(seconds) // whole seconds, matching the player's clock
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

export default function AccentGallery() {
  const [selectedId, setSelectedId] = useState(voiceAccents[0]?.id)
  const selected = voiceAccents.find((accent) => accent.id === selectedId) ?? voiceAccents[0]
  if (!selected) return null

  return (
    <div className="vs-studio" aria-labelledby="vs-studio-title">
      <div className="vs-studio-bar">
        <div>
          <h3 id="vs-studio-title">Voice preview demo</h3>
          <p>Pre-recorded accent previews. Pick one and press play.</p>
        </div>
        <span className="vs-pill"><Sparkles size={13} aria-hidden="true" /> {voiceAccents.length} accents</span>
      </div>

      <div className="vs-accents" role="group" aria-label="Choose an English accent">
        {voiceAccents.map((accent) => {
          const active = accent.id === selected.id
          return (
            <button
              key={accent.id}
              type="button"
              aria-pressed={active}
              className={`vs-accent ${active ? 'is-active' : ''}`}
              onClick={() => setSelectedId(accent.id)}
            >
              <span className="vs-accent-code" aria-hidden="true">{accent.code}</span>
              <span className="vs-accent-name">{accent.name.replace(' English', '')}<span className="vs-accent-suffix"> English</span></span>
            </button>
          )
        })}
      </div>

      <div className="vs-stage">
        <div className="vs-stage-head" aria-live="polite">
          <div>
            <p className="vs-stage-kicker">{selected.code} · {selected.name}</p>
            <h4>{selected.description}</h4>
          </div>
          <dl className="vs-stage-meta">
            <div><dt className="sr-only">Length</dt><dd><Clock3 size={13} aria-hidden="true" /> {formatDuration(selected.duration)}</dd></div>
            <div><dt className="sr-only">Voices</dt><dd><AudioLines size={13} aria-hidden="true" /> {selected.voice}</dd></div>
          </dl>
        </div>

        <AccentAudioPlayer
          src={selected.src}
          title={`${selected.name} preview`}
          peaks={selected.peaks}
          knownDuration={selected.duration}
        />
      </div>

      <details className="vs-transcript">
        <summary>
          <span>Read the conversation</span>
          <span className="vs-transcript-count">{selected.turns.length} lines</span>
          <ChevronDown size={18} aria-hidden="true" />
        </summary>
        <ol lang={selected.lang} aria-label={`${selected.name} conversation transcript`}>
          {selected.turns.map((turn, index) => (
            <li key={`${selected.id}-${index}`} className={`vs-turn vs-turn-${turn.role}`}>
              <span className="vs-turn-avatar" aria-hidden="true">
                {turn.role === 'visitor' ? <User size={14} /> : <AudioLines size={14} />}
              </span>
              <div className="vs-turn-bubble">
                <span className="vs-turn-role">{turn.role === 'visitor' ? 'Visitor' : 'AI Assistant'}</span>
                <p>{turn.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </details>

      <p className="vs-disclosure">
        Sample conversations performed by AI voices ({selected.voice}). Fictional scenarios; no real customers or bookings.
      </p>
    </div>
  )
}
