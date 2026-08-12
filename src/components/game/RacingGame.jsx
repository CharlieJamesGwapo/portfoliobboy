// ============================================================================
// RacingGame ("Pixel Racer") — React shell around the 3D circuit engine in
// src/lib/pixelRacer.js.
//
// This replaces the original top-down 2D implementation. The gameplay contract
// is unchanged on purpose — three laps, three AI rivals, skill badges that
// grant a boost, a best-lap time in milliseconds stored under
// `arcade_best_racing`, and a leaderboard entry under game id 'racing' — so the
// lobby's "Best" badge and every existing score keep working.
//
// As with Neon Circuit, this file owns nothing that runs per frame: the engine
// pushes HUD numbers on a 100 ms timer.
// ============================================================================
import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Flag, Gauge, Loader2, Play, RotateCcw, Settings, Sparkles, Trophy } from 'lucide-react'
import AudioManager from './AudioManager'
import Leaderboard from './Leaderboard'
import { SKILLS } from '../../data/gameData'
import { getPlayerName } from '../../lib/gameStorage'
import { submitScore } from '../../lib/supabase'

const BEST_KEY = 'arcade_best_racing'
const LAPS_TO_WIN = 3

const formatMs = (ms) => {
  if (!ms || ms <= 0) return '—'
  const total = ms / 1000
  const minutes = Math.floor(total / 60)
  const seconds = (total % 60).toFixed(2).padStart(5, '0')
  return minutes > 0 ? `${minutes}:${seconds}` : `${seconds}s`
}

function readBestLap() {
  try {
    const value = Number(localStorage.getItem(BEST_KEY))
    return Number.isFinite(value) && value > 0 ? value : 0
  } catch {
    return 0
  }
}

const KEY_MAP = {
  ArrowUp: 'throttle', KeyW: 'throttle',
  ArrowDown: 'brake', KeyS: 'brake',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  Space: 'throttle',
}

const ORDINAL = ['', '1st', '2nd', '3rd', '4th']

export default function RacingGame({ onExit, onContact, onOpenSettings, paused }) {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const countdownRef = useRef(null)

  const [phase, setPhase] = useState('intro') // intro | countdown | racing | finished | unsupported
  const [countdown, setCountdown] = useState(3)
  const [hud, setHud] = useState({ lap: 1, timeMs: 0, bestLapMs: 0, lastLapMs: 0, speed: 0, boost: false, offTrack: false, position: 1, collected: 0, total: SKILLS.length })
  const [result, setResult] = useState(null)
  const [bestLap, setBestLap] = useState(readBestLap)
  const [submitting, setSubmitting] = useState(false)
  const [showBoard, setShowBoard] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  // The engine arrives via a dynamic import. Until it does, starting a race
  // is a silent no-op, so the button must not look ready.
  const [ready, setReady] = useState(false)

  const phaseRef = useRef(phase)
  phaseRef.current = phase

  useEffect(() => {
    try {
      setIsTouch(window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0)
    } catch {
      setIsTouch(false)
    }
  }, [])

  const handleFinish = useCallback((summary) => {
    setResult(summary)
    setPhase('finished')

    if (summary.bestLapMs > 0) {
      setBestLap((current) => {
        if (current !== 0 && summary.bestLapMs >= current) return current
        try { localStorage.setItem(BEST_KEY, String(summary.bestLapMs)) } catch { /* storage disabled */ }
        return summary.bestLapMs
      })
    }

    setSubmitting(true)
    submitScore({
      player_name: getPlayerName() || 'Anonymous',
      // The leaderboard for this game ranks best lap, matching the original.
      score: Math.round(summary.bestLapMs),
      time_seconds: Math.round(summary.totalMs / 1000),
      boss_defeated: summary.position === 1,
      game: 'racing',
    })
      .catch(() => undefined)
      .finally(() => setSubmitting(false))
  }, [])

  // --- engine lifecycle ----------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    let engine = null
    let disposed = false

    import('../../lib/pixelRacer')
      .then(({ createPixelRacer }) => {
        if (disposed) return
        engine = createPixelRacer(canvas, {
          skills: SKILLS,
          onHud: setHud,
          onFinish: handleFinish,
          onLap: () => { try { AudioManager.playSFX('door') } catch { /* noop */ } },
          onPickup: () => { try { AudioManager.playSFX('chest') } catch { /* noop */ } },
        })
        if (!engine) {
          setPhase('unsupported')
          return
        }
        engineRef.current = engine
        engine.resize()
        setReady(true)
      })
      .catch(() => { if (!disposed) setPhase('unsupported') })

    return () => {
      disposed = true
      engineRef.current = null
      engine?.dispose()
    }
  }, [handleFinish])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(() => engineRef.current?.resize())
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) engineRef.current?.pause()
      else if (phaseRef.current === 'racing') engineRef.current?.resume()
    }
    const onBlur = () => engineRef.current?.pause()
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', onBlur)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  useEffect(() => {
    if (paused) engineRef.current?.pause()
    else if (phase === 'racing') engineRef.current?.resume()
  }, [paused, phase])

  // --- input ---------------------------------------------------------------
  useEffect(() => {
    if (phase !== 'racing') return undefined
    const onKeyDown = (event) => {
      const action = KEY_MAP[event.code]
      if (!action) return
      event.preventDefault()
      engineRef.current?.setInput(action, true)
    }
    const onKeyUp = (event) => {
      const action = KEY_MAP[event.code]
      if (!action) return
      event.preventDefault()
      engineRef.current?.setInput(action, false)
    }
    const releaseAll = () => {
      for (const action of ['throttle', 'brake', 'left', 'right']) engineRef.current?.setInput(action, false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', releaseAll)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', releaseAll)
      releaseAll()
    }
  }, [phase])

  // --- countdown -----------------------------------------------------------
  const beginRace = useCallback(() => {
    setResult(null)
    setCountdown(3)
    setPhase('countdown')
    try { AudioManager.init() } catch { /* noop */ }

    // The engine starts immediately so the scene is live behind the numbers,
    // but it is paused until GO — otherwise the AI would be a second up the
    // road before the player could touch the throttle.
    engineRef.current?.start()
    engineRef.current?.pause()

    let remaining = 3
    countdownRef.current = window.setInterval(() => {
      remaining -= 1
      if (remaining <= 0) {
        window.clearInterval(countdownRef.current)
        countdownRef.current = null
        setPhase('racing')
        engineRef.current?.resume()
      }
      setCountdown(remaining)
    }, 900)
  }, [])

  useEffect(() => () => {
    if (countdownRef.current) window.clearInterval(countdownRef.current)
  }, [])

  const touch = (action) => ({
    onPointerDown: (event) => { event.preventDefault(); engineRef.current?.setInput(action, true) },
    onPointerUp: (event) => { event.preventDefault(); engineRef.current?.setInput(action, false) },
    onPointerLeave: () => engineRef.current?.setInput(action, false),
    onPointerCancel: () => engineRef.current?.setInput(action, false),
  })

  const touchButton =
    'pointer-events-auto flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur-sm active:scale-95 active:bg-emerald-400/40 transition-transform select-none'

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-[#05070f]" role="dialog" aria-modal="true" aria-label="Pixel Racer, a 3D circuit racing game">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* top bar */}
      <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 p-4">
        <div className="flex items-center gap-2">
          <button onClick={onExit} className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-white/15 bg-black/60 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white">
            <ArrowLeft size={14} /> Lobby
          </button>
          <button onClick={onOpenSettings} aria-label="Open settings" className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/15 bg-black/60 text-gray-300 hover:bg-white/10 hover:text-white">
            <Settings size={16} />
          </button>
        </div>

        {(phase === 'racing' || phase === 'countdown') && (
          <div className="flex flex-wrap items-center justify-end gap-2 text-xs font-semibold">
            <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white backdrop-blur-sm">
              <span className="flex items-center gap-1 text-emerald-300"><Flag size={13} /> Lap {hud.lap}/{LAPS_TO_WIN}</span>
              <span className="text-white/25">|</span>
              <span className="tabular-nums text-cyan-300">{ORDINAL[hud.position] || '—'}</span>
              <span className="text-white/25">|</span>
              <span className="flex items-center gap-1 tabular-nums text-amber-300"><Gauge size={13} /> {hud.speed}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white backdrop-blur-sm">
              <span className="tabular-nums">{formatMs(hud.timeMs)}</span>
              <span className="text-white/25">|</span>
              <span className="tabular-nums text-gray-400">Best {formatMs(hud.bestLapMs || bestLap)}</span>
              <span className="text-white/25">|</span>
              <span className="flex items-center gap-1 text-emerald-300"><Sparkles size={13} /> {hud.collected}/{hud.total}</span>
            </div>
          </div>
        )}
      </div>

      {phase === 'racing' && hud.offTrack && (
        <div className="pointer-events-none absolute inset-x-0 top-24 z-30 text-center">
          <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-200 ring-1 ring-rose-400/40">Off track — slow down</span>
        </div>
      )}

      {phase === 'racing' && hud.boost && (
        <div className="pointer-events-none absolute inset-x-0 top-24 z-30 text-center">
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-200 ring-1 ring-emerald-400/40">All skills collected — BOOST</span>
        </div>
      )}

      {/* touch controls */}
      {phase === 'racing' && isTouch && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <div className="flex gap-3">
            <button className={`${touchButton} h-16 w-16 text-2xl`} aria-label="Steer left" {...touch('left')}>‹</button>
            <button className={`${touchButton} h-16 w-16 text-2xl`} aria-label="Steer right" {...touch('right')}>›</button>
          </div>
          <div className="flex gap-3">
            <button className={`${touchButton} h-16 w-16 text-[11px] font-bold`} aria-label="Brake" {...touch('brake')}>BRAKE</button>
            <button className={`${touchButton} h-16 w-20 text-[11px] font-bold`} aria-label="Accelerate" {...touch('throttle')}>GAS</button>
          </div>
        </div>
      )}

      {/* countdown */}
      {phase === 'countdown' && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
          <span className="text-7xl font-extrabold text-white drop-shadow-[0_0_25px_rgba(103,224,193,0.8)]">
            {countdown > 0 ? countdown : 'GO'}
          </span>
        </div>
      )}

      {/* intro */}
      {phase === 'intro' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-gray-900 to-gray-950 p-6 text-center shadow-2xl">
            <div className="mb-4 text-4xl">🏎</div>
            <h2 className="mb-2 text-2xl font-extrabold text-white">Pixel Racer</h2>
            <p className="mb-5 text-sm leading-relaxed text-gray-400">
              A 3D circuit race — real track geometry, chase camera, dynamic shadows, and three AI rivals.
              Complete {LAPS_TO_WIN} laps. Collect every skill badge for a speed boost.
            </p>
            <div className="mb-5 grid grid-cols-2 gap-2 text-[11px] text-gray-400">
              <div className="rounded-lg border border-white/10 bg-white/5 p-2"><div className="font-bold text-white">Throttle</div>W or ↑</div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-2"><div className="font-bold text-white">Brake</div>S or ↓</div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-2"><div className="font-bold text-white">Steer</div>A / D or ← →</div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-2"><div className="font-bold text-white">Off track</div>You lose grip</div>
            </div>
            {bestLap > 0 && <p className="mb-4 text-xs font-semibold text-amber-300">Best lap · {formatMs(bestLap)}</p>}
            <button
              onClick={beginRace}
              disabled={!ready}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {ready ? <><Play size={16} /> Start race</> : <><Loader2 size={16} className="animate-spin" /> Loading circuit…</>}
            </button>
          </div>
        </div>
      )}

      {/* finish */}
      {phase === 'finished' && result && (
        <div className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-amber-400/25 bg-gradient-to-br from-gray-900 to-gray-950 p-6 text-center shadow-2xl">
            <div className="mb-3 text-4xl">{result.position === 1 ? '🏆' : '🏁'}</div>
            <h2 className="mb-1 text-2xl font-extrabold text-white">
              {result.position === 1 ? 'Race won' : `Finished ${ORDINAL[result.position]}`}
            </h2>
            <p className="mb-5 text-sm text-gray-400">
              {LAPS_TO_WIN} laps in {formatMs(result.totalMs)} · {result.collected}/{result.total} skills collected
            </p>

            <div className="mb-5 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-base font-extrabold tabular-nums text-cyan-300">{formatMs(result.bestLapMs)}</div>
                <div className="text-[10px] uppercase tracking-wide text-gray-500">Best lap</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-base font-extrabold tabular-nums text-emerald-300">{ORDINAL[result.position]}</div>
                <div className="text-[10px] uppercase tracking-wide text-gray-500">Position</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-base font-extrabold tabular-nums text-amber-300">{formatMs(bestLap)}</div>
                <div className="text-[10px] uppercase tracking-wide text-gray-500">Record</div>
              </div>
            </div>

            {submitting && (
              <p className="mb-3 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Loader2 size={13} className="animate-spin" /> Saving lap…
              </p>
            )}

            <div className="flex flex-col gap-2">
              <button onClick={beginRace} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]">
                <RotateCcw size={16} /> Race again
              </button>
              <div className="flex gap-2">
                <button onClick={() => setShowBoard(true)} className="flex-1 rounded-xl border border-amber-400/30 bg-white/5 px-4 py-2.5 text-xs font-semibold text-amber-200 hover:bg-white/10">
                  <Trophy size={13} className="mr-1 inline" /> Leaderboard
                </button>
                <button onClick={onContact} className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-gray-300 hover:bg-white/10">
                  Hire Charlie
                </button>
              </div>
              <button onClick={onExit} className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-white">Back to lobby</button>
            </div>
          </div>
        </div>
      )}

      {phase === 'unsupported' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-gray-900 p-6 text-center">
            <div className="mb-3 text-3xl">🚫</div>
            <h2 className="mb-2 text-lg font-bold text-white">3D unavailable</h2>
            <p className="mb-5 text-sm text-gray-400">This race needs WebGL, which this browser or device has turned off.</p>
            <button onClick={onExit} className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">Back to lobby</button>
          </div>
        </div>
      )}

      {showBoard && (
        <div className="absolute inset-0 z-[150] flex items-center justify-center bg-black/85 p-4" onClick={() => setShowBoard(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-amber-500/30 bg-gray-950 p-5" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white"><Trophy size={18} className="text-amber-400" /> Pixel Racer · best lap</h3>
              <button onClick={() => setShowBoard(false)} className="text-gray-400 hover:text-white" aria-label="Close leaderboard">✕</button>
            </div>
            <Leaderboard limit={8} game="racing" />
          </div>
        </div>
      )}
    </div>
  )
}
