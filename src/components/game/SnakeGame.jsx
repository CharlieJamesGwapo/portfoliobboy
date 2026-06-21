// ============================================================================
// Code Snake — classic snake on a 20x20 grid, Canvas2D over a Three.js
// Matrix-rain background. Eat skill badges to grow; golden project items pop
// a project card. Wrap-around walls. Death on self-collision.
// ============================================================================
import { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { X, Settings, Home, Mail, ExternalLink, Trophy } from 'lucide-react'

import AudioManager from './AudioManager'
import Leaderboard from './Leaderboard'
import { getAvatar, makeSprite } from '../../lib/avatar'
import { SKILLS, PROJECTS, OWNER } from '../../data/gameData'
import { getPlayerName } from '../../lib/gameStorage'
import { submitScore } from '../../lib/supabase'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const GRID = 20
const START_INTERVAL = 160
const MIN_INTERVAL = 70
const SPECIAL_TTL = 8000 // ms a golden project item stays
const BEST_KEY = 'arcade_best_snake'

const BADGE_COLORS = [
  '#06b6d4', '#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b',
  '#ec4899', '#ef4444', '#14b8a6', '#a855f7', '#10b981',
]

function readBest() {
  try {
    const v = parseInt(localStorage.getItem(BEST_KEY) || '0', 10)
    return Number.isFinite(v) ? v : 0
  } catch { return 0 }
}
function writeBest(n) {
  try { localStorage.setItem(BEST_KEY, String(n)) } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// WebGL error boundary
// ---------------------------------------------------------------------------
class SceneBoundary extends Component {
  constructor(p) { super(p); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() {}
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

// ---------------------------------------------------------------------------
// Matrix rain — Points drifting downward, recycling to the top
// ---------------------------------------------------------------------------
function MatrixRain() {
  const COUNT = 700
  const pointsRef = useRef(null)
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const speeds = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 60
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30
      speeds[i] = 4 + Math.random() * 10
    }
    return { positions, speeds }
  }, [])

  useFrame((_, delta) => {
    const pts = pointsRef.current
    if (!pts) return
    const arr = pts.geometry.attributes.position.array
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] -= speeds[i] * delta
      if (arr[i * 3 + 1] < -30) {
        arr[i * 3 + 1] = 30
        arr[i * 3 + 0] = (Math.random() - 0.5) * 60
      }
    }
    pts.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.35} color="#22ff66" sizeAttenuation transparent opacity={0.8} />
    </points>
  )
}

function Background() {
  return (
    <SceneBoundary
      fallback={
        <div
          className="absolute inset-0 z-0"
          style={{ background: 'radial-gradient(circle at 50% 40%, #0a2417 0%, #05060f 70%)' }}
        />
      }
    >
      <div className="absolute inset-0 z-0 pointer-events-none bg-[#05060f]">
        <Canvas camera={{ position: [0, 0, 28], fov: 60 }} dpr={[1, 1.5]}>
          <MatrixRain />
        </Canvas>
      </div>
    </SceneBoundary>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function SnakeGame({ onExit, onContact, onOpenSettings, paused }) {
  const canvasRef = useRef(null)
  const spriteRef = useRef(null)

  // ---- world state lives in refs (avoids re-render churn on every tick) ----
  const worldRef = useRef(null)
  if (worldRef.current === null) {
    worldRef.current = {
      snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      grow: 0,
      food: null,        // { x, y, name, color }
      special: null,     // { x, y, project, expiresAt }
      eats: 0,
      interval: START_INTERVAL,
    }
  }

  const [score, setScore] = useState(0)
  const [best, setBest] = useState(readBest())
  const [collected, setCollected] = useState(() => new Set())
  const [toast, setToast] = useState(null)            // string
  const [projectCard, setProjectCard] = useState(null) // PROJECT obj
  const [gameOver, setGameOver] = useState(false)

  // leaderboard / submit
  const [name, setName] = useState(() => getPlayerName() || '')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [refreshSignal, setRefreshSignal] = useState(0)

  const startRef = useRef(Date.now())
  const toastTimer = useRef(null)
  const collectedRef = useRef(collected)
  collectedRef.current = collected
  const pausedRef = useRef(paused)
  pausedRef.current = paused || projectCard !== null || gameOver

  // ---- avatar sprite for the head ----
  useEffect(() => {
    spriteRef.current = makeSprite(getAvatar(), 64, { bubble: false })
  }, [])

  // ---- audio lifecycle ----
  useEffect(() => {
    AudioManager.init()
    AudioManager.playMusic('arcade')
    return () => { AudioManager.stopMusic() }
  }, [])

  // ------------------------------------------------------------------------
  // Food / special spawning helpers
  // ------------------------------------------------------------------------
  const occupied = useCallback((x, y) => {
    const w = worldRef.current
    if (w.snake.some((s) => s.x === x && s.y === y)) return true
    if (w.food && w.food.x === x && w.food.y === y) return true
    if (w.special && w.special.x === x && w.special.y === y) return true
    return false
  }, [])

  const freeCell = useCallback(() => {
    let x, y, guard = 0
    do {
      x = Math.floor(Math.random() * GRID)
      y = Math.floor(Math.random() * GRID)
      guard++
    } while (occupied(x, y) && guard < 500)
    return { x, y }
  }, [occupied])

  const spawnFood = useCallback(() => {
    const w = worldRef.current
    const idx = Math.floor(Math.random() * SKILLS.length)
    const { x, y } = freeCell()
    w.food = { x, y, name: SKILLS[idx], color: BADGE_COLORS[idx % BADGE_COLORS.length] }
  }, [freeCell])

  const spawnSpecial = useCallback(() => {
    const w = worldRef.current
    const project = PROJECTS[Math.floor(Math.random() * PROJECTS.length)]
    const { x, y } = freeCell()
    w.special = { x, y, project, expiresAt: Date.now() + SPECIAL_TTL }
  }, [freeCell])

  // spawn first food once
  useEffect(() => {
    if (!worldRef.current.food) spawnFood()
  }, [spawnFood])

  const showToast = useCallback((msg) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 1200)
  }, [])

  // ------------------------------------------------------------------------
  // Game tick
  // ------------------------------------------------------------------------
  const tick = useCallback(() => {
    const w = worldRef.current

    // apply queued direction (block 180° reversal)
    if (w.nextDir.x !== -w.dir.x || w.nextDir.y !== -w.dir.y) {
      w.dir = w.nextDir
    }

    const head = w.snake[0]
    let nx = head.x + w.dir.x
    let ny = head.y + w.dir.y
    // wrap-around
    nx = (nx + GRID) % GRID
    ny = (ny + GRID) % GRID

    // self-collision → death (ignore tail tip if not growing, since it moves)
    const willGrow = w.grow > 0
    const bodyToCheck = willGrow ? w.snake : w.snake.slice(0, w.snake.length - 1)
    if (bodyToCheck.some((s) => s.x === nx && s.y === ny)) {
      AudioManager.playSFX('hit')
      const finalScore = scoreRef.current
      if (finalScore > readBest()) { writeBest(finalScore); setBest(finalScore) }
      setGameOver(true)
      return
    }

    const newHead = { x: nx, y: ny }
    w.snake.unshift(newHead)

    // expire special silently
    if (w.special && Date.now() > w.special.expiresAt) w.special = null

    // eat normal food?
    if (w.food && nx === w.food.x && ny === w.food.y) {
      const skillName = w.food.name
      w.grow += 1
      w.eats += 1
      setScore((s) => s + 10)
      setCollected((prev) => {
        if (prev.has(skillName)) return prev
        const next = new Set(prev)
        next.add(skillName)
        return next
      })
      showToast(`Skill: ${skillName} collected!`)
      AudioManager.playSFX('powerup')

      // speed up every 5 eats
      if (w.eats % 5 === 0) {
        w.interval = Math.max(MIN_INTERVAL, w.interval - 12)
        spawnSpecial()
      }
      spawnFood()
    } else if (w.special && nx === w.special.x && ny === w.special.y) {
      // eat golden project item
      setScore((s) => s + 50)
      setProjectCard(w.special.project)
      AudioManager.playSFX('clear')
      w.special = null
      w.grow += 1
    }

    // shrink tail unless growing
    if (w.grow > 0) w.grow -= 1
    else w.snake.pop()
  }, [showToast, spawnFood, spawnSpecial])

  // keep a live ref of score for death handler
  const scoreRef = useRef(0)
  scoreRef.current = score

  // ------------------------------------------------------------------------
  // tick driver (accumulator over rAF, honors paused + variable interval)
  // ------------------------------------------------------------------------
  useEffect(() => {
    let raf
    let last = performance.now()
    let acc = 0
    const loop = (now) => {
      const dt = now - last
      last = now
      if (!pausedRef.current) {
        acc += dt
        const interval = worldRef.current.interval
        while (acc >= interval) {
          acc -= interval
          if (pausedRef.current) break
          tick()
        }
      } else {
        acc = 0
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [tick])

  // ------------------------------------------------------------------------
  // Rendering (Canvas2D) — separate rAF so it always paints, even when paused
  // ------------------------------------------------------------------------
  const sizeRef = useRef({ cell: 20, board: 400, ox: 0, oy: 0 })

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const avail = Math.min(window.innerWidth, window.innerHeight) - 40
      const board = Math.max(200, Math.floor(avail / GRID) * GRID)
      const cell = board / GRID
      canvas.width = board * dpr
      canvas.height = board * dpr
      canvas.style.width = `${board}px`
      canvas.style.height = `${board}px`
      const ctx = canvas.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sizeRef.current = { cell, board, ox: 0, oy: 0 }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    let raf
    const draw = () => {
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        const { cell, board } = sizeRef.current
        const w = worldRef.current

        // board background + grid
        ctx.clearRect(0, 0, board, board)
        ctx.fillStyle = 'rgba(5,8,18,0.78)'
        ctx.fillRect(0, 0, board, board)
        ctx.strokeStyle = 'rgba(34,255,102,0.08)'
        ctx.lineWidth = 1
        for (let i = 1; i < GRID; i++) {
          ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, board); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(0, i * cell); ctx.lineTo(board, i * cell); ctx.stroke()
        }
        ctx.strokeStyle = 'rgba(34,255,102,0.35)'
        ctx.lineWidth = 2
        ctx.strokeRect(1, 1, board - 2, board - 2)

        // food badge
        if (w.food) {
          const fx = w.food.x * cell
          const fy = w.food.y * cell
          ctx.fillStyle = w.food.color
          roundRect(ctx, fx + 2, fy + 2, cell - 4, cell - 4, 5)
          ctx.fill()
          ctx.fillStyle = '#0b0f1a'
          ctx.font = `bold ${Math.max(6, Math.floor(cell * 0.28))}px monospace`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          const label = w.food.name.length > 6 ? w.food.name.slice(0, 6) : w.food.name
          ctx.fillText(label, fx + cell / 2, fy + cell / 2)
        }

        // special golden project
        if (w.special) {
          const remain = Math.max(0, w.special.expiresAt - Date.now())
          const sx = w.special.x * cell
          const sy = w.special.y * cell
          const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 150)
          ctx.save()
          ctx.shadowColor = '#fbbf24'
          ctx.shadowBlur = 8 + pulse * 8
          ctx.fillStyle = '#fbbf24'
          roundRect(ctx, sx + 2, sy + 2, cell - 4, cell - 4, 6)
          ctx.fill()
          ctx.restore()
          ctx.fillStyle = '#7c2d12'
          ctx.font = `bold ${Math.max(8, Math.floor(cell * 0.5))}px serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('★', sx + cell / 2, sy + cell / 2 + 1)
          // ttl bar
          ctx.fillStyle = 'rgba(251,191,36,0.5)'
          ctx.fillRect(sx + 2, sy + cell - 5, (cell - 4) * (remain / SPECIAL_TTL), 3)
        }

        // snake body
        for (let i = w.snake.length - 1; i >= 1; i--) {
          const seg = w.snake[i]
          const t = i / w.snake.length
          ctx.fillStyle = i % 2 === 0 ? '#06b6d4' : '#22c55e'
          ctx.globalAlpha = 0.55 + 0.45 * (1 - t)
          roundRect(ctx, seg.x * cell + 1.5, seg.y * cell + 1.5, cell - 3, cell - 3, 5)
          ctx.fill()
        }
        ctx.globalAlpha = 1

        // head = avatar sprite
        const head = w.snake[0]
        const hx = head.x * cell
        const hy = head.y * cell
        const sprite = spriteRef.current
        if (sprite) {
          ctx.drawImage(sprite, hx, hy, cell, cell)
        } else {
          ctx.fillStyle = '#a7f3d0'
          roundRect(ctx, hx + 1, hy + 1, cell - 2, cell - 2, 5)
          ctx.fill()
        }
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  // ------------------------------------------------------------------------
  // Input — keyboard (no ESC handler here) + swipe
  // ------------------------------------------------------------------------
  const setDir = useCallback((x, y) => {
    const w = worldRef.current
    // ignore direct 180° reversal relative to current committed dir
    if (x === -w.dir.x && y === -w.dir.y) return
    w.nextDir = { x, y }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': setDir(0, -1); break
        case 'ArrowDown': case 's': case 'S': setDir(0, 1); break
        case 'ArrowLeft': case 'a': case 'A': setDir(-1, 0); break
        case 'ArrowRight': case 'd': case 'D': setDir(1, 0); break
        default: return
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setDir])

  // swipe
  const touchStart = useRef(null)
  const onTouchStart = (e) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchMove = (e) => {
    if (!touchStart.current) return
    const t = e.touches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return
    if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0)
    else setDir(0, dy > 0 ? 1 : -1)
    touchStart.current = null
  }

  // ------------------------------------------------------------------------
  // Submit score
  // ------------------------------------------------------------------------
  const handleSubmit = useCallback(async () => {
    const player = (name || '').trim() || 'Anonymous'
    setSubmitting(true)
    const elapsed = Math.max(0, Math.floor((Date.now() - startRef.current) / 1000))
    try {
      await submitScore({
        player_name: player,
        score: scoreRef.current,
        time_seconds: elapsed,
        boss_defeated: false,
        game: 'snake',
      })
    } catch { /* never throw */ }
    setSubmitting(false)
    setSubmitted(true)
    setRefreshSignal((n) => n + 1)
  }, [name])

  const elapsedSeconds = () => Math.max(0, Math.floor((Date.now() - startRef.current) / 1000))

  // ------------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------------
  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden bg-black"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
    >
      <Background />

      {/* gameplay canvas */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <canvas ref={canvasRef} className="rounded-lg shadow-[0_0_40px_rgba(34,255,102,0.15)]" />
      </div>

      {/* HUD */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-3">
        <button
          onClick={onExit}
          className="grid place-items-center w-9 h-9 rounded-lg bg-black/60 border border-white/15 text-white hover:bg-white/10 z-40"
          aria-label="Exit to lobby"
        >
          <X size={18} />
        </button>
        <div className="px-3 py-1.5 rounded-lg bg-black/55 border border-emerald-400/30 text-emerald-300 font-mono text-sm leading-tight">
          <div>Score <span className="text-white font-bold">{score}</span></div>
          <div className="text-[11px] text-emerald-400/70">Best {best}</div>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-20 flex items-center gap-3">
        <div className="px-3 py-1.5 rounded-lg bg-black/55 border border-cyan-400/30 text-cyan-300 font-mono text-xs">
          Skills {collected.size}/{SKILLS.length}
        </div>
        <button
          onClick={onOpenSettings}
          className="grid place-items-center w-9 h-9 rounded-lg bg-black/60 border border-white/15 text-white hover:bg-white/10 z-40"
          aria-label="Open settings"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* collected skill badges along the left side */}
      <div className="absolute left-3 top-24 z-20 hidden sm:flex flex-col gap-1 max-h-[60vh] overflow-hidden pointer-events-none">
        {[...collected].slice(0, 14).map((s) => (
          <span key={s} className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-[10px] font-mono">
            {s}
          </span>
        ))}
      </div>

      {/* toast */}
      {toast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[120] px-4 py-2 rounded-lg bg-emerald-500/90 text-black font-bold text-sm shadow-lg animate-pulse">
          {toast}
        </div>
      )}

      {/* mobile hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 text-[11px] text-white/40 font-mono pointer-events-none">
        WASD / arrows · swipe on mobile · walls wrap
      </div>

      {/* project card popup */}
      {projectCard && (
        <div className="absolute inset-0 z-[130] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-amber-950/90 to-zinc-900 border border-amber-400/40 p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-mono mb-1">
              <Trophy size={14} /> PROJECT UNLOCKED · +50
            </div>
            <h3 className="text-xl font-bold text-white">{projectCard.title}</h3>
            <p className="text-amber-200/80 text-xs mb-2">{projectCard.type}</p>
            {projectCard.description && (
              <p className="text-zinc-300 text-sm mb-3">{projectCard.description}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {(projectCard.technologies || []).map((t) => (
                <span key={t} className="px-2 py-0.5 rounded bg-amber-400/15 border border-amber-400/30 text-amber-200 text-[11px]">
                  {t}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between gap-3">
              {projectCard.liveUrl ? (
                <a
                  href={projectCard.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-400 text-black font-bold text-sm hover:bg-amber-300"
                >
                  <ExternalLink size={15} /> Visit
                </a>
              ) : (
                <span className="px-3 py-2 rounded-lg bg-zinc-700 text-zinc-300 text-sm font-mono">Private / NDA</span>
              )}
              <button
                onClick={() => setProjectCard(null)}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* paused overlay */}
      {paused && !gameOver && !projectCard && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/60">
          <div className="text-3xl font-bold text-white font-mono tracking-widest">PAUSED</div>
        </div>
      )}

      {/* GAME OVER */}
      {gameOver && (
        <div className="absolute inset-0 z-[140] flex items-center justify-center bg-black/85 p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-zinc-900 to-black border border-emerald-400/30 p-6 shadow-2xl my-auto">
            <h2 className="text-3xl font-extrabold text-center text-red-400 mb-1 font-mono">GAME OVER</h2>
            <p className="text-center text-white text-lg">Score: <span className="font-bold text-emerald-300">{score}</span></p>
            <p className="text-center text-cyan-300 text-sm mb-4">
              Skills Collected: {collected.size}/{SKILLS.length}
            </p>

            {!submitted ? (
              <div className="flex gap-2 mb-4">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={24}
                  placeholder="Your name"
                  className="flex-1 px-3 py-2 rounded-lg bg-black/60 border border-white/20 text-white text-sm focus:outline-none focus:border-emerald-400"
                />
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 disabled:opacity-50"
                >
                  {submitting ? '…' : 'Submit'}
                </button>
              </div>
            ) : (
              <p className="text-center text-emerald-300 text-sm mb-4">Score submitted! 🎉</p>
            )}

            <div className="mb-5 rounded-xl bg-black/40 border border-white/10 p-3">
              <Leaderboard
                limit={5}
                game="snake"
                refreshSignal={refreshSignal}
                highlightName={(name || '').trim()}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={onExit}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/20"
              >
                <Home size={16} /> 🏠 Lobby
              </button>
              <button
                onClick={onContact}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-cyan-500 text-black font-bold text-sm hover:bg-cyan-400"
              >
                <Mail size={16} /> 📬 Contact {OWNER?.name?.split(' ')[0] || 'Charlie'}
              </button>
            </div>
            <p className="text-center text-[10px] text-white/30 mt-3 font-mono">time {elapsedSeconds()}s</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// canvas helper
// ---------------------------------------------------------------------------
function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}
