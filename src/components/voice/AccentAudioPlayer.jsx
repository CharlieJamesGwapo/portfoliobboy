import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, Loader2, Pause, Play, RotateCcw, Volume1, Volume2, VolumeX } from 'lucide-react'

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const whole = Math.floor(seconds)
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

const BAR_PITCH_PX = 5 // bar width plus gap
const RING_RADIUS = 34
const RING_LENGTH = 2 * Math.PI * RING_RADIUS

// Max-pool the measured peaks down to however many bars fit, so a narrow
// phone player still shows the recording's real loudness shape.
const resample = (peaks, count) => {
  if (!count || peaks.length <= count) return peaks
  const size = peaks.length / count
  return Array.from({ length: count }, (_, i) => {
    let max = 0
    for (let j = Math.floor(i * size); j < Math.floor((i + 1) * size); j += 1) max = Math.max(max, peaks[j] ?? 0)
    return max
  })
}

// Pre-recorded sample player. The <audio> element is the single source of
// truth: every piece of UI state is read back from its events, never assumed.
export default function AccentAudioPlayer({ src, title, peaks = [], knownDuration = null }) {
  const audioRef = useRef(null)
  const waveRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(knownDuration ?? 0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [status, setStatus] = useState('idle') // idle | loading | ready | ended | error
  const [attempt, setAttempt] = useState(0)
  const [barCount, setBarCount] = useState(0)

  // A new recording stops the previous one and resets everything about it.
  useEffect(() => {
    setPlaying(false)
    setCurrent(0)
    setDuration(knownDuration ?? 0)
    setStatus('idle')
    setAttempt(0)
    const audio = audioRef.current
    return () => audio?.pause()
  }, [src, knownDuration])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume, src, attempt])

  useEffect(() => {
    const element = waveRef.current
    if (!element || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(([entry]) => setBarCount(Math.max(16, Math.floor(entry.contentRect.width / BAR_PITCH_PX))))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const toggle = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    if (!audio.paused) {
      audio.pause()
      return
    }
    try {
      if (audio.ended) audio.currentTime = 0
      if (audio.readyState < 3) setStatus('loading')
      await audio.play()
    } catch (error) {
      // AbortError: a newer load replaced this one. NotAllowedError: the
      // browser blocked playback. Neither means the file is broken.
      if (error?.name !== 'AbortError' && error?.name !== 'NotAllowedError') setStatus('error')
      else setStatus((value) => (value === 'loading' ? 'idle' : value))
    }
  }, [])

  const seek = (value) => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(audio.duration)) return
    audio.currentTime = Math.min(audio.duration, Math.max(0, value))
    setCurrent(audio.currentTime)
    if (status === 'ended') setStatus('ready')
  }

  const retry = () => {
    setStatus('idle')
    setAttempt((value) => value + 1)
  }

  const bars = resample(peaks, barCount)
  const progress = duration > 0 ? Math.min(1, current / duration) : 0
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2
  const audioSrc = attempt ? `${src}${src.includes('?') ? '&' : '?'}retry=${attempt}` : src
  const ended = status === 'ended'
  const label = `${playing ? 'Pause' : ended ? 'Replay' : 'Play'} ${title}`

  return (
    <div className={`vs-player ${playing ? 'is-playing' : ''} ${ended ? 'is-ended' : ''} ${status === 'error' ? 'is-error' : ''}`}>
      <audio
        key={audioSrc}
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        muted={muted}
        onLoadedMetadata={(event) => { setDuration(event.currentTarget.duration); setStatus((value) => (value === 'error' ? value : value === 'loading' ? value : 'ready')) }}
        onDurationChange={(event) => Number.isFinite(event.currentTarget.duration) && setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPlaying={() => setStatus('ready')}
        onWaiting={() => setStatus('loading')}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setStatus('ended') }}
        onVolumeChange={(event) => { setVolume(event.currentTarget.volume); setMuted(event.currentTarget.muted) }}
        onError={() => { setPlaying(false); setStatus('error') }}
      />

      <button type="button" className="vs-play" onClick={toggle} disabled={status === 'error'} aria-label={label}>
        <svg className="vs-play-ring" viewBox="0 0 76 76" aria-hidden="true">
          <circle className="vs-play-track" cx="38" cy="38" r={RING_RADIUS} />
          <circle className="vs-play-progress" cx="38" cy="38" r={RING_RADIUS} strokeDasharray={RING_LENGTH} strokeDashoffset={RING_LENGTH * (1 - progress)} />
        </svg>
        <span className="vs-play-face">
          {status === 'loading' ? <Loader2 className="spin" size={24} aria-hidden="true" />
            : playing ? <Pause size={24} aria-hidden="true" />
              : ended ? <RotateCcw size={22} aria-hidden="true" />
                : <Play size={24} aria-hidden="true" />}
        </span>
      </button>

      <div className="vs-track">
        <div className="vs-wave" ref={waveRef}>
          <div className="vs-wave-bars" aria-hidden="true">
            {bars.map((peak, index) => (
              <i key={index} className={(index + 0.5) / bars.length <= progress ? 'is-played' : ''} style={{ '--h': `${Math.max(10, peak * 100)}%` }} />
            ))}
          </div>
          <span className="vs-playhead" style={{ left: `${progress * 100}%` }} aria-hidden="true" />
          {/* A native range input over the waveform gives mouse, touch, and
              keyboard seeking (arrows, Home/End) with no custom handlers. */}
          <input
            type="range"
            className="vs-seek"
            min="0"
            max={duration || 0}
            step="0.1"
            value={Math.min(current, duration || 0)}
            onChange={(event) => seek(Number(event.target.value))}
            disabled={!duration || status === 'error'}
            aria-label={`Seek ${title}`}
            aria-valuetext={`${formatTime(current)} of ${formatTime(duration)}`}
          />
        </div>
        <div className="vs-track-meta">
          <span className="vs-time"><strong>{formatTime(current)}</strong> / {formatTime(duration)}</span>
          <div className="vs-volume">
            <button
              type="button"
              className="vs-icon-button"
              onClick={() => { if (audioRef.current) audioRef.current.muted = !audioRef.current.muted }}
              aria-label={muted ? 'Unmute' : 'Mute'}
              aria-pressed={muted}
            >
              <VolumeIcon size={17} aria-hidden="true" />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              style={{ '--fill': `${(muted ? 0 : volume) * 100}%` }}
              onChange={(event) => {
                const audio = audioRef.current
                if (!audio) return
                audio.volume = Number(event.target.value)
                audio.muted = audio.volume === 0
              }}
              aria-label="Volume"
            />
          </div>
        </div>
      </div>

      <p className="vs-player-status" role="status" aria-live="polite">
        {status === 'error' ? (
          <span className="vs-player-error">
            <AlertCircle size={15} aria-hidden="true" /> This preview couldn&apos;t load.
            <button type="button" onClick={retry}>Try again</button>
          </span>
        ) : status === 'loading' ? 'Loading preview…' : ended ? 'Preview finished.' : ''}
      </p>
    </div>
  )
}
