import { useRef, useState } from 'react'
import { ArrowUpRight, Headphones } from 'lucide-react'
import { voiceSamples } from '../data/voiceSamples'

export default function VoiceSamplePlayer() {
  const [selectedId, setSelectedId] = useState(voiceSamples[0].id)
  const selected = voiceSamples.find((sample) => sample.id === selectedId) || voiceSamples[0]
  const [failed, setFailed] = useState(false)
  const audioRef = useRef(null)

  const selectSample = (sample) => {
    if (sample.id === selected.id) return
    audioRef.current?.pause()
    setFailed(false)
    setSelectedId(sample.id)
  }

  return (
    <div className="voice-listen-card" aria-labelledby="voice-listen-title">
      <div className="voice-listen-heading">
        <span className="voice-listen-icon"><Headphones size={26} aria-hidden="true" /></span>
        <div>
          <p className="eyebrow">Press play. No callback needed.</p>
          <h3 id="voice-listen-title">A friendly voice. An easy conversation.</h3>
        </div>
        <span className="voice-sample-label">Illustrative synthetic audio</span>
      </div>
      {voiceSamples.length > 1 && <div className="voice-sample-options" role="group" aria-label="Choose an English accent">
        {voiceSamples.map((sample) => (
          <button type="button" key={sample.id} aria-pressed={selected.id === sample.id} onClick={() => selectSample(sample)}>
            <span aria-hidden="true">{sample.region}</span>{sample.title}
          </button>
        ))}
      </div>}
      <div className="voice-sample-body">
        <div aria-live="polite">
          <h4>{selected.title}</h4>
          <p>{selected.description}</p>
        </div>
        <audio key={selected.id} ref={audioRef} src={selected.src} controls preload="metadata" aria-label={`${selected.title} synthetic voice sample`} aria-describedby="voice-sample-disclosure" onError={() => setFailed(true)}>
          Your browser does not support audio playback. Read the sample transcript below.
        </audio>
      </div>
      {failed && <p className="voice-audio-error" role="status">Audio could not load. Read the transcript below or reload the page to try again.</p>}
      <details className="voice-transcript-disclosure">
        <summary>Read sample transcript</summary>
        <ol className="voice-transcript" lang={selected.lang} aria-label="Sample transcript">
          {selected.dialogue.map((turn, index) => (
            <li key={`${selected.id}-${index}`} data-speaker={turn.speaker}>
              <strong lang="en">{turn.speaker}</strong><p>{turn.text}</p>
            </li>
          ))}
        </ol>
      </details>
      <div className="voice-languages-note">
        <div><strong>US and Australian English.</strong><p>Two receptionist demos. Choose an accent and press play.</p></div>
        <a href="#contact">Discuss your voice experience <ArrowUpRight size={16} aria-hidden="true" /></a>
      </div>
      <p className="voice-sample-disclosure" id="voice-sample-disclosure">Scripted samples with AI-generated voices. These are not recordings of Alex or real calls. Use “Talk to Alex” above to try the live agent.</p>
    </div>
  )
}
