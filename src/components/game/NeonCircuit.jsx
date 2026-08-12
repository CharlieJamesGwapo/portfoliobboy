// ============================================================================
// NeonCircuit — React shell around the 3D engine in src/lib/neonCircuit.js.
//
// The split is deliberate. This file owns everything React is good at (HUD,
// overlays, focus, score submission) and nothing that runs per frame. The
// engine owns the render loop and pushes HUD numbers out on a 100 ms timer, so
// a 60 fps game causes about 10 re-renders a second instead of 60 — and none
// of them touch the canvas.
// ============================================================================
import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Gauge, Heart, Loader2, Play, RotateCcw, Settings, Sparkles, Trophy } from 'lucide-react'
import AudioManager from './AudioManager'
import Leaderboard from './Leaderboard'
import { submitScore } from '../../lib/supabase'
import { getPlayerName } from '../../lib/gameStorage'

const BEST_KEY = 'arcade_best_neon'

function readBest() {
  try {
    const raw = localStorage.getItem(BEST_KEY)
    const value = Number(raw)
    return Number.isFinite(value) && value > 0 ? value : 0
  } catch {
    return 0
  }
}

function writeBest(score) {
  try {
    localStorage.setItem(BEST_KEY, String(score))
  } catch {
    /* storage disabled or full — the run still counted, it just isn't kept */
  }
}

const KEY_MAP = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  Space: 'jump',
  ArrowUp: 'jump',
  KeyW: 'jump',
  ArrowDown: 'brake',
  KeyS: 'brake',
  ShiftLeft: 'brake',
}

export default function NeonCircuit({ onExit, onContact, onOpenSettings, paused }) {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const shellRef = useRef(null)

  const [phase, setPhase] = useState('intro') // intro | playing | over | unsupported
  const [hud, setHud] = useState({ score: 0, speed: 0, lives: 3, orbs: 0 })
  const [result, setResult] = useState(null)
  const [best, setBest] = useState(readBest)
  const [submitting, setSubmitting] = useState(false)
  const [showBoard, setShowBoard] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  // The engine arrives via a dynamic import. Until it does, starting a run
  // is a silent no-op, so the button must not look ready.
  const [ready, setReady] = useState(false)

  // Kept in a ref as well: the engine's callbacks fire outside React's render
  // cycle and must not close over a stale `phase`.
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  useEffect(() => {
    try {
      setIsTouch(window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0)
    } catch {
      setIsTouch(false)
    }
  }, [])

  const handleGameOver = useCallback((summary) => {
    setResult(summary)
    setPhase('over')
    setBest((current) => {
      if (summary.score <= current) return current
      writeBest(summary.score)
      return summary.score
    })

    setSubmitting(true)
    submitScore({
      player_name: getPlayerName() || 'Anonymous',
      score: summary.score,
      boss_defeated: false,
      time_seconds: 0,
      game: 'neon',
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

    // The engine chunk pulls in three.js. Importing it here rather than at the
    // top keeps the arcade lobby's own chunk small, and the download has
    // usually already happened via the hero's WebGL upgrade.
    import('../../lib/neonCircuit')
      .then(({ createNeonCircuit }) => {
        if (disposed) return
        engine = createNeonCircuit(canvas, {
          onHud: setHud,
          onGameOver: handleGameOver,
          onPickup: () => { try { AudioManager.playSFX('chest') } catch { /* noop */ } },
          onCrash: () => { try { AudioManager.playSFX('hit') } catch { /* noop */ } },
        })
        if (!engine) {
          setPhase('unsupported')
          return
        }
        engineRef.current = engine
        engine.resize()
        setReady(true)
      })
      .catch(() => {
        if (!disposed) setPhase('unsupported')
      })

    return () => {
      disposed = true
      engineRef.current = null
      engine?.dispose()
    }
  }, [handleGameOver])

  // Resize with the element, not the window: the arcade is a full-screen
  // overlay, but on mobile the visual viewport changes when the URL bar
  // collapses without firing a window resize.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(() => engineRef.current?.resize())
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  // Pause whenever the player cannot see or act on the game.
  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return undefined
    if (paused && phase === 'playing') engine.pause()

    const onVisibility = () => {
      if (document.hidden) engineRef.current?.pause()
      else if (phaseRef.current === 'playing') engineRef.current?.resume()
    }
    const onBlur = () => engineRef.current?.pause()

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', onBlur)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', onBlur)
    }
  }, [paused, phase])

  useEffect(() => {
    if (!paused && phase === 'playing') engineRef.current?.resume()
  }, [paused, phase])

  // --- input ---------------------------------------------------------------
  useEffect(() => {
    if (phase !== 'playing') return undefined

    const onKeyDown = (event) => {
      const action = KEY_MAP[event.code]
      if (!action) return
      // Space and the arrows scroll the page behind the overlay otherwise.
      event.preventDefault()
      engineRef.current?.setInput(action, true)
    }
    const onKeyUp = (event) => {
      const action = KEY_MAP[event.code]
      if (!action) return
      event.preventDefault()
      engineRef.current?.setInput(action, false)
    }
    // Releasing every key on blur stops the craft sticking at full lock when
    // the player alt-tabs mid-turn.
    const releaseAll = () => {
      for (const action of ['left', 'right', 'jump', 'brake']) engineRef.current?.setInput(action, false)
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

  const startRun = useCallback(() => {
    setResult(null)
    setPhase('playing')
    engineRef.current?.start()
    try { AudioManager.init() } catch { /* noop */ }
  }, [])

  const touch = (action) => ({
    onPointerDown: (event) => {
      event.preventDefault()
      engineRef.current?.setInput(action, true)
    },
    onPointerUp: (event) => {
      event.preventDefault()
      engineRef.current?.setInput(action, false)
    },
    onPointerLeave: () => engineRef.current?.setInput(action, false),
    onPointerCancel: () => engineRef.current?.setInput(action, false),
  })

  const touchButton =
    'pointer-events-auto flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur-sm active:scale-95 active:bg-cyan-400/40 transition-transform select-none'

  return (
    <div ref={shellRef} className="fixed inset-0 z-[100] overflow-hidden bg-[#05060f]" role="dialog" aria-modal="true" aria-label="Neon Circuit, a 3D racing game">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* --- top bar --- */}
      <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onExit}
            className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-white/15 bg-black/60 px-3 py-1.5 text-xs font-semibold text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={14} /> Lobby
          </button>
          <button
            onClick={onOpenSettings}
            aria-label="Open settings"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/15 bg-black/60 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Settings size={16} />
          </button>
        </div>

        {phase === 'playing' && (
          <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm">
            <span className="tabular-nums text-cyan-300">{hud.score.toLocaleString()}</span>
            <span className="text-white/25">|</span>
            <span className="flex items-center gap-1 text-emerald-300"><Sparkles size={13} /> {hud.orbs}</span>
            <span className="text-white/25">|</span>
            <span className="flex items-center gap-1 tabular-nums text-amber-300"><Gauge size={13} /> {hud.speed}</span>
            <span className="text-white/25">|</span>
            <span className="flex items-center gap-1 text-rose-300">
              <Heart size={13} /> {hud.lives}
            </span>
          </div>
        )}
      </div>

      {/* --- touch controls --- */}
      {phase === 'playing' && isTouch && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <div className="flex gap-3">
            <button className={`${touchButton} h-16 w-16 text-2xl`} aria-label="Steer left" {...touch('left')}>‹</button>
            <button className={`${touchButton} h-16 w-16 text-2xl`} aria-label="Steer right" {...touch('right')}>›</button>
          </div>
          <div className="flex gap-3">
            <button className={`${touchButton} h-16 w-16 text-[11px] font-bold`} aria-label="Brake" {...touch('brake')}>BRAKE</button>
            <button className={`${touchButton} h-16 w-20 text-[11px] font-bold`} aria-label="Jump" {...touch('jump')}>JUMP</button>
          </div>
        </div>
      )}

      {/* --- intro --- */}
      {phase === 'intro' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-gray-900 to-gray-950 p-6 text-center shadow-2xl">
            <div className="mb-4 text-4xl">🏁</div>
            <h2 className="mb-2 text-2xl font-extrabold text-white">Neon Circuit</h2>
            <p className="mb-5 text-sm leading-relaxed text-gray-400">
              A real-time 3D racer — chase camera, dynamic shadows, instanced geometry.
              Dodge the red blocks, grab the mint orbs, survive as the track accelerates.
            </p>
            <div className="mb-5 grid grid-cols-2 gap-2 text-[11px] text-gray-400">
              <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                <div className="font-bold text-white">Steer</div>A / D or ← →
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                <div className="font-bold text-white">Jump</div>Space or W
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                <div className="font-bold text-white">Brake</div>S or Shift
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                <div className="font-bold text-white">Orbs</div>+{50} points each
              </div>
            </div>
            {best > 0 && (
              <p className="mb-4 text-xs font-semibold text-amber-300">Personal best · {best.toLocaleString()}</p>
            )}
            <button
              onClick={startRun}
              disabled={!ready}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {ready ? <><Play size={16} /> Start race</> : <><Loader2 size={16} className="animate-spin" /> Loading track…</>}
            </button>
            <p className="mt-3 text-[11px] text-gray-600">Tall blocks must be steered around — only low ones can be jumped.</p>
          </div>
        </div>
      )}

      {/* --- game over --- */}
      {phase === 'over' && result && (
        <div className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-amber-400/25 bg-gradient-to-br from-gray-900 to-gray-950 p-6 text-center shadow-2xl">
            <div className="mb-3 text-4xl">{result.score >= best && result.score > 0 ? '🏆' : '💥'}</div>
            <h2 className="mb-1 text-2xl font-extrabold text-white">
              {result.score >= best && result.score > 0 ? 'New personal best' : 'Run complete'}
            </h2>
            <p className="mb-5 text-sm text-gray-400">You held the circuit for {result.distance.toLocaleString()} metres.</p>

            <div className="mb-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-lg font-extrabold tabular-nums text-cyan-300">{result.score.toLocaleString()}</div>
                <div className="text-[10px] uppercase tracking-wide text-gray-500">Score</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-lg font-extrabold tabular-nums text-emerald-300">{result.orbs}</div>
                <div className="text-[10px] uppercase tracking-wide text-gray-500">Orbs</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-lg font-extrabold tabular-nums text-amber-300">{best.toLocaleString()}</div>
                <div className="text-[10px] uppercase tracking-wide text-gray-500">Best</div>
              </div>
            </div>

            {submitting && (
              <p className="mb-3 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Loader2 size={13} className="animate-spin" /> Saving score…
              </p>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={startRun}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
              >
                <RotateCcw size={16} /> Race again
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBoard(true)}
                  className="flex-1 rounded-xl border border-amber-400/30 bg-white/5 px-4 py-2.5 text-xs font-semibold text-amber-200 transition-colors hover:bg-white/10"
                >
                  <Trophy size={13} className="mr-1 inline" /> Leaderboard
                </button>
                <button
                  onClick={onContact}
                  className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-gray-300 transition-colors hover:bg-white/10"
                >
                  Hire Charlie
                </button>
              </div>
              <button onClick={onExit} className="px-4 py-2 text-xs font-semibold text-gray-500 transition-colors hover:text-white">
                Back to lobby
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- no WebGL --- */}
      {phase === 'unsupported' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-gray-900 p-6 text-center">
            <div className="mb-3 text-3xl">🚫</div>
            <h2 className="mb-2 text-lg font-bold text-white">3D unavailable</h2>
            <p className="mb-5 text-sm text-gray-400">
              This game needs WebGL, which this browser or device has turned off. The other seven games in the
              arcade run on 2D canvas and will work fine.
            </p>
            <button onClick={onExit} className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
              Back to lobby
            </button>
          </div>
        </div>
      )}

      {showBoard && (
        <div className="absolute inset-0 z-[150] flex items-center justify-center bg-black/85 p-4" onClick={() => setShowBoard(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-amber-500/30 bg-gray-950 p-5" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white"><Trophy size={18} className="text-amber-400" /> Neon Circuit</h3>
              <button onClick={() => setShowBoard(false)} className="text-gray-400 hover:text-white" aria-label="Close leaderboard">✕</button>
            </div>
            <Leaderboard limit={8} game="neon" />
          </div>
        </div>
      )}
    </div>
  )
}
