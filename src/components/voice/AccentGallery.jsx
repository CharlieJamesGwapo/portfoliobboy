import { useState } from 'react'
import { AudioLines, Check, ChevronDown, Headphones, Plus, User } from 'lucide-react'
import AccentAudioPlayer from './AccentAudioPlayer'
import { upcomingAccents, voiceAccents } from '../../data/voiceAccents'

const ROLE_LABEL = { visitor: 'Visitor', assistant: 'AI Assistant' }

export default function AccentGallery() {
  const [selectedId, setSelectedId] = useState(voiceAccents[0]?.id)
  const selected = voiceAccents.find((accent) => accent.id === selectedId) ?? voiceAccents[0]
  if (!selected) return null

  return (
    <div className="accent-gallery" aria-labelledby="accent-gallery-title">
      <div className="accent-gallery-head">
        <span className="accent-gallery-icon"><Headphones size={24} aria-hidden="true" /></span>
        <div>
          <h3 id="accent-gallery-title">Choose your accent</h3>
          <p>Pick an accent and hear a short, natural conversation.</p>
        </div>
      </div>

      <div className="accent-cards" role="group" aria-label="Choose an English accent">
        {voiceAccents.map((accent) => {
          const active = accent.id === selected.id
          return (
            <button
              key={accent.id}
              type="button"
              aria-pressed={active}
              className={`accent-card ${active ? 'is-active' : ''}`}
              onClick={() => setSelectedId(accent.id)}
            >
              <span className="accent-code" aria-hidden="true">{accent.code}</span>
              <span className="accent-card-copy">
                <strong>{accent.name}</strong>
                <small>{accent.description}</small>
              </span>
              <span className="accent-check" aria-hidden="true">{active && <Check size={14} />}</span>
            </button>
          )
        })}
        {upcomingAccents.length > 0 && (
          <div className="accent-card accent-card-soon" title={upcomingAccents.join(', ')}>
            <Plus size={16} aria-hidden="true" />
            <span className="accent-card-copy">
              <strong>More accents soon</strong>
              <small>{upcomingAccents.join(' · ')}</small>
            </span>
          </div>
        )}
      </div>

      <div className="accent-stage" aria-live="polite">
        <div className="accent-stage-copy">
          <h4>{selected.name}</h4>
          <p>{selected.description}</p>
        </div>
        <AccentAudioPlayer
          src={selected.src}
          title={`${selected.name} sample`}
          peaks={selected.peaks}
          knownDuration={selected.duration}
        />
      </div>

      <details className="accent-transcript">
        <summary>
          <ChevronDown size={16} aria-hidden="true" /> Read the transcript
          <span className="accent-transcript-count">{selected.turns.length} turns</span>
        </summary>
        <ol lang={selected.lang} aria-label={`${selected.name} transcript`}>
          {selected.turns.map((turn, index) => (
            <li key={`${selected.id}-${index}`} className={`turn-${turn.role}`}>
              <span className="turn-role">
                {turn.role === 'visitor' ? <User size={14} aria-hidden="true" /> : <AudioLines size={14} aria-hidden="true" />}
                {ROLE_LABEL[turn.role]}
              </span>
              <p>{turn.text}</p>
            </li>
          ))}
        </ol>
      </details>

      <p className="accent-disclosure">
        Fictional conversation with AI-generated voices: {selected.voice}. Voice technology by ElevenLabs. Not a real customer call; no booking is made.
      </p>
    </div>
  )
}
