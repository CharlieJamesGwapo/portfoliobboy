import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, Pause, Play, RotateCcw, Volume1, Volume2, VolumeX } from 'lucide-react'

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const whole = Math.floor(seconds)
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

const BAR_PITCH_PX = 4 // bar plus gap

// Max-pool the measured peaks down to `count` bars, so a narrow phone player
// still shows the real loudness shape instead of overflowing.
const resample = (peaks, count) => {
  if (!count || peaks.length <= count) return peaks
  const size = peaks.length / count
  return Array.from({ length: count }, (_, i) => {
    let max = 0
    for (let j = Math.floor(i * size); j < Math.floor((i + 1) * size); j += 1) max = Math.max(max, peaks[j] ?? 0)
    return max
  })
}

// Custom player. The <audio> element is the single source of truth: every
// piece of UI state below is read back from its events, never assumed.
export default function AccentAudioPlayer({ src, title, peaks = [], knownDuration = null }) {
  const audioRef = useRef(null)
  const waveRef = useRef(null)
  const [barCount, setBarCount] = useState(0)

  useEffect(() => {
    const element = waveRef.current
    if (!element || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(([entry]) => setBarCount(Math.max(16, Math.floor(entry.contentRect.width / BAR_PITCH_PX))))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const bars = resample(peaks, barCount)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(knownDuration ?? 0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [status, setStatus] = useState('idle') // idle | loading | ready | ended | error
  const [attempt, setAttempt] = useState(0)

  // A new recording resets everything that described the previous one.
  useEffect(() => {
    setPlaying(false)
    setCurrent(0)
    setDuration(knownDuration ?? 0)
    setStatus('idle')
    setAttempt(0)
  }, [src, knownDuration])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume, src, attempt])

  const toggle = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    if (!audio.paused) {
      audio.pause()
      return
    }
    try {
      if (audio.ended) audio.currentTime = 0
      setStatus((value) => (value === 'ready' || value === 'ended' ? 'ready' : 'loading'))
      await audio.play()
    } catch (error) {
      // NotAllowedError means the browser blocked playback, not a broken file.
      if (error?.name !== 'AbortError' && error?.name !== 'NotAllowedError') setStatus('error')
    }
  }, [])

  const seek = (value) => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(audio.duration)) return
    audio.currentTime = Math.min(audio.duration, Math.max(0, value))
    setCurrent(audio.currentTime)
  }

  const retry = () => {
    setStatus('idle')
    setAttempt((value) => value + 1)
  }

  const progress = duration > 0 ? current / duration : 0
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2
  const audioSrc = attempt ? `${src}${src.includes('?') ? '&' : '?'}retry=${attempt}` : src

  return (
    <div className={`accent-player ${playing ? 'is-playing' : ''} ${status === 'ended' ? 'is-ended' : ''}`}>
      <audio
        key={audioSrc}
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        muted={muted}
        onLoadedMetadata={(event) => { setDuration(event.currentTarget.duration); setStatus((value) => (value === 'error' ? value : 'ready')) }}
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

      <button
        type="button"
        className="accent-play"
        onClick={toggle}
        disabled={status === 'error'}
        aria-label={`${playing ? 'Pause' : status === 'ended' ? 'Replay' : 'Play'} ${title}`}
      >
        {playing ? <Pause size={20} aria-hidden="true" /> : status === 'ended' ? <RotateCcw size={19} aria-hidden="true" /> : <Play size={20} aria-hidden="true" />}
      </button>

      <span className="accent-time" aria-hidden="true">
        {formatTime(current)} <span>/</span> {formatTime(duration)}
      </span>

      <div className="accent-wave" ref={waveRef}>
        <div className="accent-wave-bars" aria-hidden="true">
          {bars.map((peak, index) => (
            <i
              key={index}
              className={(index + 0.5) / bars.length <= progress ? 'is-played' : ''}
              style={{ height: `${Math.max(8, peak * 100)}%` }}
            />
          ))}
        </div>
        {/* A native range input sits over the waveform: it gives mouse, touch,
            and keyboard seeking (arrow keys, Home/End) with no custom handlers. */}
        <input
          type="range"
          className="accent-seek"
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

      <div className="accent-volume">
        <button
          type="button"
          className="accent-icon-button"
          onClick={() => { if (audioRef.current) audioRef.current.muted = !audioRef.current.muted }}
          aria-label={muted ? 'Unmute' : 'Mute'}
          aria-pressed={muted}
        >
          <VolumeIcon size={18} aria-hidden="true" />
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={muted ? 0 : volume}
          onChange={(event) => {
            const audio = audioRef.current
            if (!audio) return
            audio.volume = Number(event.target.value)
            audio.muted = audio.volume === 0
          }}
          aria-label="Volume"
        />
      </div>

      <p className="accent-player-status" role="status" aria-live="polite">
        {status === 'error' ? (
          <span className="accent-player-error">
            <AlertCircle size={15} aria-hidden="true" /> This recording could not load.
            <button type="button" onClick={retry}>Try again</button>
            <a href={src} target="_blank" rel="noreferrer">Open the file</a>
          </span>
        ) : status === 'loading' ? 'Loading audio…' : status === 'ended' ? 'Finished. Press replay to listen again.' : ''}
      </p>
    </div>
  )
}
