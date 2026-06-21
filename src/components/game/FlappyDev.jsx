import { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import AudioManager from './AudioManager'
import { getAvatar, makeSprite } from '../../lib/avatar'
import { PROJECTS, OWNER } from '../../data/gameData'
import { submitScore } from '../../lib/supabase'
import { getPlayerName } from '../../lib/gameStorage'
import Leaderboard from './Leaderboard'

// ---------------------------------------------------------------------------
// WebGL boundary — a 3D failure must never crash the game
// ---------------------------------------------------------------------------
class SceneBoundary extends Component {
  constructor(p) {
    super(p)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {}
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

// ---------------------------------------------------------------------------
// 3D background — slow horizontal parallax night city skyline
// ---------------------------------------------------------------------------
function SkylineLayer({ z, count, baseHeight, color, windowColor, speed, spread }) {
  const groupRef = useRef()
  const buildings = useMemo(() => {
    const arr = []
    let x = -spread / 2
    for (let i = 0; i < count; i++) {
      const w = 1.4 + Math.random() * 1.8
      const h = baseHeight + Math.random() * baseHeight * 1.4
      const gap = 0.4 + Math.random() * 0.9
      const windows = []
      const cols = Math.max(1, Math.floor(w / 0.6))
      const rows = Math.max(1, Math.floor(h / 0.8))
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (Math.random() > 0.55) continue
          windows.push([
            -w / 2 + 0.3 + c * (w / cols),
            -h / 2 + 0.4 + r * (h / rows),
          ])
        }
      }
      arr.push({ x: x + w / 2, w, h, windows })
      x += w + gap
    }
    return arr
  }, [count, baseHeight, spread])

  const totalWidth = useMemo(() => {
    const last = buildings[buildings.length - 1]
    return last ? last.x + last.w / 2 + spread / 2 : spread
  }, [buildings, spread])

  useFrame((_, dt) => {
    const g = groupRef.current
    if (!g) return
    g.position.x -= dt * speed
    if (g.position.x < -totalWidth) g.position.x += totalWidth
  })

  return (
    <group ref={groupRef} position={[0, -4, z]}>
      {buildings.map((b, i) => (
        <group key={i} position={[b.x - spread / 2, b.h / 2, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[b.w, b.h, 0.6]} />
            <meshStandardMaterial color={color} roughness={0.9} metalness={0.1} />
          </mesh>
          {b.windows.map((wp, wi) => (
            <mesh key={wi} position={[wp[0], wp[1], 0.32]}>
              <boxGeometry args={[0.18, 0.28, 0.05]} />
              <meshStandardMaterial
                color={windowColor}
                emissive={windowColor}
                emissiveIntensity={1.4}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function BackgroundScene() {
  return (
    <Canvas camera={{ position: [0, 1, 14], fov: 60 }} dpr={[1, 1.5]}>
      <fog attach="fog" args={['#05060f', 14, 40]} />
      <ambientLight intensity={0.25} color="#5b6cff" />
      <pointLight position={[0, 8, 6]} intensity={0.6} color="#8aa0ff" />
      <SkylineLayer z={-18} count={22} baseHeight={6} color="#0a0e26" windowColor="#3a4cff" speed={0.4} spread={70} />
      <SkylineLayer z={-10} count={16} baseHeight={8} color="#10163a" windowColor="#5be0ff" speed={0.9} spread={60} />
      <SkylineLayer z={-4} count={12} baseHeight={10} color="#161d4a" windowColor="#7df9d0" speed={1.6} spread={50} />
    </Canvas>
  )
}

// ---------------------------------------------------------------------------
// Game constants
// ---------------------------------------------------------------------------
const GRAVITY = 1900
const FLAP_V = -560
const PIPE_W = 84
const BASE_GAP = 210
const BASE_SPEED = 190
const SPEED_STEP = 18 // +px/s every 10 pipes
const PIPE_SPACING = 320 // horizontal distance between pipe pairs
const PLAYER_R = 24
const FLOOR_H = 60
const GATE_EVERY = 15
const BEST_KEY = 'arcade_best_flappy'
const COLLECTIBLES = ['</>', '🐍', '⚡']

function readBest() {
  try {
    return parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0
  } catch {
    return 0
  }
}
function writeBest(v) {
  try {
    localStorage.setItem(BEST_KEY, String(v))
  } catch {}
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function FlappyDev({ onExit, onContact, onOpenSettings, paused }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const lastTsRef = useRef(0)
  const pausedRef = useRef(paused)
  const spriteRef = useRef(null)
  const hudPushRef = useRef(0)
  const world = useRef(null)

  const [phase, setPhase] = useState('intro') // intro | playing | over
  const [hud, setHud] = useState({ score: 0 })
  const [best, setBest] = useState(readBest())
  const [projectCard, setProjectCard] = useState(null)
  const [refreshSignal, setRefreshSignal] = useState(0)
  const [nameInput, setNameInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [finalScore, setFinalScore] = useState(0)

  // build avatar sprite once
  useEffect(() => {
    spriteRef.current = makeSprite(getAvatar(), 64, { bubble: false })
  }, [])

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  // -------------------------------------------------------------------------
  // world factory
  // -------------------------------------------------------------------------
  const makeWorld = useCallback(() => {
    const cw = window.innerWidth
    const ch = window.innerHeight
    const w = {
      w: cw,
      h: ch,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      bird: { x: Math.max(90, cw * 0.28), y: ch / 2, vy: 0 },
      pipes: [],
      collectibles: [],
      pipeCount: 0, // total pairs created (for gate / collectible cadence)
      passed: 0, // pairs passed
      speed: BASE_SPEED,
      score: 0,
      elapsed: 0,
      dead: false,
      shake: 0,
      projectIndex: 0,
      blocked: false, // project card open -> freeze physics
      nextX: cw + 120,
    }
    // seed initial pipes
    for (let i = 0; i < 4; i++) addPipe(w)
    return w
  }, [])

  const addPipe = useCallback((w) => {
    w.pipeCount += 1
    const idx = w.pipeCount
    const gate = idx % GATE_EVERY === 0
    const gap = Math.max(150, BASE_GAP - Math.floor(w.passed / 10) * 8)
    const margin = 70
    const top = margin + Math.random() * (w.h - FLOOR_H - gap - margin * 2)
    const pipe = {
      x: w.nextX,
      top, // bottom edge of top pipe
      bottom: top + gap, // top edge of bottom pipe
      gap,
      gate,
      passed: false,
      project: gate ? PROJECTS[w.projectIndex % PROJECTS.length] : null,
    }
    if (gate) w.projectIndex += 1
    w.pipes.push(pipe)

    // sometimes float a collectible in the gap (not on gates)
    if (!gate && Math.random() > 0.45) {
      w.collectibles.push({
        x: w.nextX + PIPE_W / 2,
        y: top + gap / 2 + (Math.random() - 0.5) * (gap * 0.4),
        sym: COLLECTIBLES[Math.floor(Math.random() * COLLECTIBLES.length)],
        taken: false,
        bob: Math.random() * Math.PI * 2,
      })
    }
    w.nextX += PIPE_SPACING
  }, [])

  // -------------------------------------------------------------------------
  // sizing
  // -------------------------------------------------------------------------
  const resize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.floor(window.innerWidth * dpr)
    canvas.height = Math.floor(window.innerHeight * dpr)
    canvas.style.width = window.innerWidth + 'px'
    canvas.style.height = window.innerHeight + 'px'
    if (world.current) {
      world.current.w = window.innerWidth
      world.current.h = window.innerHeight
      world.current.dpr = dpr
    }
  }, [])

  useEffect(() => {
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [resize])

  // -------------------------------------------------------------------------
  // flap input (pointer anywhere + spacebar)
  // -------------------------------------------------------------------------
  const flap = useCallback(() => {
    const w = world.current
    if (!w || w.dead || w.blocked || pausedRef.current) return
    w.bird.vy = FLAP_V
    try {
      AudioManager.playSFX('flap')
    } catch {}
  }, [])

  useEffect(() => {
    if (phase !== 'playing') return
    const onPointer = () => flap()
    const onKey = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        flap()
      }
    }
    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [phase, flap])

  // -------------------------------------------------------------------------
  // project card auto-close (2s)
  // -------------------------------------------------------------------------
  const cardTimerRef = useRef(0)
  const openProjectCard = useCallback((proj) => {
    setProjectCard(proj)
    window.clearTimeout(cardTimerRef.current)
    cardTimerRef.current = window.setTimeout(() => {
      setProjectCard(null)
      if (world.current) world.current.blocked = false
    }, 2000)
  }, [])

  // -------------------------------------------------------------------------
  // end game
  // -------------------------------------------------------------------------
  const endGame = useCallback((w) => {
    if (w.dead) return
    w.dead = true
    w.shake = 0.35
    setFinalScore(w.score)
    setBest((prev) => {
      const next = Math.max(prev, w.score)
      writeBest(next)
      return next
    })
    setNameInput(getPlayerName() || '')
    setSubmitted(false)
    try {
      AudioManager.playSFX('hit')
    } catch {}
    // small delay so the shake is visible before the overlay
    window.setTimeout(() => setPhase('over'), 450)
    try {
      AudioManager.stopMusic()
    } catch {}
  }, [])

  // -------------------------------------------------------------------------
  // physics step
  // -------------------------------------------------------------------------
  const step = useCallback(
    (dt, w) => {
      if (w.shake > 0) w.shake = Math.max(0, w.shake - dt)
      if (w.dead || w.blocked) return

      w.elapsed += dt
      const b = w.bird
      b.vy += GRAVITY * dt
      b.y += b.vy * dt

      // ceiling / floor
      if (b.y - PLAYER_R < 0) {
        b.y = PLAYER_R
        b.vy = 0
      }
      if (b.y + PLAYER_R > w.h - FLOOR_H) {
        endGame(w)
        return
      }

      // scroll pipes
      for (let i = w.pipes.length - 1; i >= 0; i--) {
        const p = w.pipes[i]
        p.x -= w.speed * dt
        // pass detection
        if (!p.passed && p.x + PIPE_W < b.x - PLAYER_R) {
          p.passed = true
          w.passed += 1
          w.score += 1
          // speed up every 10 pipes
          w.speed = BASE_SPEED + Math.floor(w.passed / 10) * SPEED_STEP
          if (p.gate && p.project) {
            w.blocked = true
            openProjectCard(p.project)
            try {
              AudioManager.playSFX('clear')
            } catch {}
          }
        }
        if (p.x + PIPE_W < -40) w.pipes.splice(i, 1)
      }

      // keep the stream populated
      while (w.pipes.length < 5) addPipe(w)
      // recompute nextX relative to last pipe so spacing stays constant
      const last = w.pipes[w.pipes.length - 1]
      if (last) w.nextX = last.x + PIPE_SPACING

      // collision with pipes (only non-gate pipes are solid; gates are pass-through reward)
      for (const p of w.pipes) {
        if (p.gate) continue
        const withinX = b.x + PLAYER_R > p.x && b.x - PLAYER_R < p.x + PIPE_W
        if (!withinX) continue
        if (b.y - PLAYER_R < p.top || b.y + PLAYER_R > p.bottom) {
          endGame(w)
          return
        }
      }

      // collectibles
      for (let i = w.collectibles.length - 1; i >= 0; i--) {
        const c = w.collectibles[i]
        c.x -= w.speed * dt
        c.bob += dt * 4
        if (!c.taken) {
          const dx = c.x - b.x
          const dy = c.y - b.y
          if (dx * dx + dy * dy < (PLAYER_R + 18) * (PLAYER_R + 18)) {
            c.taken = true
            w.score += 5
            try {
              AudioManager.playSFX('powerup')
            } catch {}
          }
        }
        if (c.x < -40 || c.taken) w.collectibles.splice(i, 1)
      }
    },
    [endGame, addPipe, openProjectCard]
  )

  // -------------------------------------------------------------------------
  // draw
  // -------------------------------------------------------------------------
  const draw = useCallback((w) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const sx = w.shake > 0 ? (Math.random() - 0.5) * 16 * (w.shake / 0.35) : 0
    const sy = w.shake > 0 ? (Math.random() - 0.5) * 16 * (w.shake / 0.35) : 0

    ctx.setTransform(w.dpr, 0, 0, w.dpr, sx * w.dpr, sy * w.dpr)
    ctx.clearRect(-20, -20, w.w + 40, w.h + 40)

    // pipes
    for (const p of w.pipes) {
      drawPipe(ctx, p, w.h)
    }

    // floor
    ctx.fillStyle = '#0a1330'
    ctx.fillRect(0, w.h - FLOOR_H, w.w, FLOOR_H)
    ctx.strokeStyle = 'rgba(91,224,255,0.4)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, w.h - FLOOR_H)
    ctx.lineTo(w.w, w.h - FLOOR_H)
    ctx.stroke()
    ctx.font = '14px monospace'
    ctx.fillStyle = 'rgba(125,249,208,0.25)'
    ctx.textAlign = 'left'
    for (let x = (-(w.elapsed * w.speed) % 60); x < w.w; x += 60) {
      ctx.fillText('//', x, w.h - FLOOR_H / 2 + 5)
    }

    // collectibles
    for (const c of w.collectibles) {
      if (c.taken) continue
      const yy = c.y + Math.sin(c.bob) * 6
      ctx.save()
      ctx.shadowBlur = 14
      ctx.shadowColor = '#ffd866'
      ctx.font = 'bold 30px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#ffe9a8'
      ctx.fillText(c.sym, c.x, yy)
      ctx.restore()
    }

    // bird (avatar)
    const b = w.bird
    ctx.save()
    ctx.translate(b.x, b.y)
    const tilt = Math.max(-0.5, Math.min(0.9, b.vy / 700))
    ctx.rotate(tilt)
    const sprite = spriteRef.current
    const sz = PLAYER_R * 2.4
    if (sprite) {
      ctx.drawImage(sprite, -sz / 2, -sz / 2, sz, sz)
    } else {
      ctx.fillStyle = '#5bd6ff'
      ctx.beginPath()
      ctx.arc(0, 0, PLAYER_R, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#0a1330'
      ctx.beginPath()
      ctx.arc(6, -6, 5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }, [])

  // -------------------------------------------------------------------------
  // rAF driver
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (phase !== 'playing') return
    if (!world.current) world.current = makeWorld()
    resize()
    lastTsRef.current = performance.now()

    const loop = (ts) => {
      rafRef.current = requestAnimationFrame(loop)
      const w = world.current
      if (!w) return
      let dt = (ts - lastTsRef.current) / 1000
      lastTsRef.current = ts
      if (dt > 0.05) dt = 0.05

      if (!pausedRef.current) step(dt, w)
      draw(w)

      hudPushRef.current += dt
      if (hudPushRef.current >= 0.1) {
        hudPushRef.current = 0
        setHud((prev) => (prev.score === w.score ? prev : { score: w.score }))
      }
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [phase, makeWorld, resize, step, draw])

  // cleanup
  useEffect(() => {
    return () => {
      try {
        AudioManager.stopMusic()
      } catch {}
      window.clearTimeout(cardTimerRef.current)
    }
  }, [])

  // -------------------------------------------------------------------------
  // controls
  // -------------------------------------------------------------------------
  const startGame = useCallback(() => {
    try {
      AudioManager.init()
      AudioManager.playMusic('arcade')
    } catch {}
    world.current = makeWorld()
    setHud({ score: 0 })
    setProjectCard(null)
    setPhase('playing')
  }, [makeWorld])

  const handleSubmit = useCallback(async () => {
    if (submitted) return
    const name = (nameInput || getPlayerName() || 'Anonymous').slice(0, 24)
    const secs = world.current ? Math.round(world.current.elapsed) : 0
    try {
      await submitScore({
        player_name: name,
        score: finalScore,
        time_seconds: secs,
        boss_defeated: false,
        game: 'flappy',
      })
    } catch {}
    setSubmitted(true)
    setRefreshSignal((n) => n + 1)
  }, [submitted, nameInput, finalScore])

  // -------------------------------------------------------------------------
  // render
  // -------------------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-black text-white select-none">
      {/* 3D background */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[#05060f]">
        <SceneBoundary
          fallback={
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 80%, #131a45 0%, #0a0c1f 55%, #05060f 100%)',
              }}
            />
          }
        >
          <BackgroundScene />
        </SceneBoundary>
      </div>

      {/* gameplay canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />

      {/* ---------- HUD ---------- */}
      {phase === 'playing' && (
        <>
          <div className="absolute top-3 left-3 z-40 flex items-center gap-3">
            <button
              onClick={onExit}
              aria-label="Exit"
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-lg font-bold"
            >
              ✕
            </button>
            <div className="px-3 py-2 rounded-lg bg-black/40 backdrop-blur border border-white/10">
              <span className="text-[10px] text-emerald-300">BEST</span>
              <div className="font-mono font-bold text-base leading-none">{best}</div>
            </div>
          </div>

          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
            <div className="font-mono font-black text-5xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {hud.score}
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="absolute top-3 right-3 z-40 w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-lg"
          >
            ⚙
          </button>
        </>
      )}

      {/* ---------- project gate card (auto-closes 2s) ---------- */}
      {projectCard && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-none">
          <div className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-amber-900/90 to-slate-900/95 border border-amber-400/60 p-5 shadow-2xl animate-pulse">
            <div className="text-[11px] uppercase tracking-widest text-amber-300">
              🏆 Project Gate — {projectCard.type}
            </div>
            <h3 className="text-xl font-extrabold mt-1 text-amber-100">{projectCard.title}</h3>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {projectCard.technologies.slice(0, 6).map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md bg-amber-400/15 border border-amber-300/30 text-[11px]"
                >
                  {t}
                </span>
              ))}
            </div>
            {projectCard.liveUrl ? (
              <a
                href={projectCard.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-4 px-3 py-1.5 rounded-lg bg-amber-400 text-slate-900 font-bold text-sm pointer-events-auto"
              >
                Visit →
              </a>
            ) : (
              <span className="inline-block mt-4 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs text-white/70">
                🔒 Private / NDA
              </span>
            )}
          </div>
        </div>
      )}

      {/* ---------- intro ---------- */}
      {phase === 'intro' && (
        <div className="absolute inset-0 z-[120] flex flex-col items-center justify-center text-center p-6">
          <button
            onClick={onExit}
            aria-label="Exit"
            className="absolute top-3 left-3 z-40 w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-lg font-bold"
          >
            ✕
          </button>
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="absolute top-3 right-3 z-40 w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-lg"
          >
            ⚙
          </button>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-emerald-300 to-cyan-400 bg-clip-text text-transparent">
            FLAPPY DEV
          </h1>
          <p className="mt-4 max-w-md text-white/80">
            Fly {OWNER.name} through the <span className="font-mono text-emerald-300">{'{ }'}</span>{' '}
            brackets, grab tech tokens, and pass the golden project gates.
          </p>
          <p className="mt-2 text-sm text-white/60">Tap anywhere or press SPACE to flap.</p>
          {best > 0 && <p className="mt-2 text-sm text-amber-300 font-mono">Best: {best}</p>}
          <button
            onClick={startGame}
            className="mt-8 px-10 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-lg shadow-lg"
          >
            ▶ TAP TO FLAP
          </button>
        </div>
      )}

      {/* ---------- game over ---------- */}
      {phase === 'over' && (
        <div className="absolute inset-0 z-[120] overflow-y-auto bg-black/80 backdrop-blur-sm p-6">
          <button
            onClick={onExit}
            aria-label="Exit"
            className="absolute top-3 left-3 z-40 w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-lg font-bold"
          >
            ✕
          </button>
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="absolute top-3 right-3 z-40 w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-lg"
          >
            ⚙
          </button>

          <div className="max-w-lg mx-auto text-center pt-12">
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent">
              GAME OVER · Score: {finalScore}
            </h1>
            <p className="mt-3 text-white/75">
              You crashed into the brackets. Best: <span className="font-mono text-amber-300">{best}</span>
            </p>

            {/* score submission */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2">
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your name"
                maxLength={24}
                disabled={submitted}
                className="px-3 py-2 rounded-lg bg-black/40 border border-white/20 text-center w-48 disabled:opacity-50"
              />
              <button
                onClick={handleSubmit}
                disabled={submitted}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold disabled:opacity-50"
              >
                {submitted ? 'Submitted ✓' : 'Submit Score'}
              </button>
            </div>

            {/* actions */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={startGame}
                className="px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-400 font-bold"
              >
                ↻ Retry
              </button>
              <button
                onClick={onExit}
                className="px-6 py-3 rounded-xl bg-white/15 hover:bg-white/25 font-bold"
              >
                🏠 Lobby
              </button>
              <button
                onClick={onContact}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold"
              >
                📬 Contact Charlie
              </button>
            </div>

            {/* leaderboard */}
            <div className="mt-8 text-left">
              <Leaderboard limit={5} game="flappy" refreshSignal={refreshSignal} highlightName={nameInput} />
            </div>
          </div>
        </div>
      )}

      {/* paused overlay */}
      {paused && phase === 'playing' && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-3xl font-black tracking-widest">PAUSED</div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// pipe rendering — curly-bracket styled pipes (gates are gold)
// ---------------------------------------------------------------------------
function drawPipe(ctx, p, h) {
  const x = p.x
  const w = PIPE_W
  const gate = p.gate
  const fill = gate ? '#caa12a' : '#0f3d24'
  const edge = gate ? '#ffe27a' : '#3ad67a'
  const glow = gate ? '#ffd866' : '#5bff9e'

  // top pipe (0 .. p.top) and bottom pipe (p.bottom .. floor)
  const segs = [
    { y0: 0, y1: p.top, mouthAtBottom: true },
    { y0: p.bottom, y1: h - FLOOR_H, mouthAtBottom: false },
  ]

  for (const s of segs) {
    const ph = s.y1 - s.y0
    if (ph <= 0) continue
    ctx.save()

    // body
    const grad = ctx.createLinearGradient(x, 0, x + w, 0)
    grad.addColorStop(0, fill)
    grad.addColorStop(0.5, gate ? '#e6c450' : '#1a6b40')
    grad.addColorStop(1, fill)
    ctx.fillStyle = grad
    ctx.fillRect(x, s.y0, w, ph)

    // edges
    ctx.strokeStyle = edge
    ctx.lineWidth = 3
    ctx.strokeRect(x + 1.5, s.y0, w - 3, ph)

    // mouth rim near the gap
    const rimY = s.mouthAtBottom ? s.y1 - 22 : s.y0
    ctx.fillStyle = edge
    ctx.fillRect(x - 6, rimY, w + 12, 22)

    // curly bracket glyph drawn on the pipe body
    ctx.fillStyle = glow
    ctx.shadowBlur = 10
    ctx.shadowColor = glow
    ctx.font = `bold ${Math.min(64, w * 0.9)}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const glyph = s.mouthAtBottom ? '{' : '}'
    const cy = Math.max(s.y0 + 40, Math.min(s.y1 - 40, (s.y0 + s.y1) / 2))
    ctx.fillText(glyph, x + w / 2, cy)

    if (gate) {
      ctx.shadowBlur = 0
      ctx.fillStyle = '#2a1d00'
      ctx.font = 'bold 11px system-ui, sans-serif'
      ctx.save()
      ctx.translate(x + w / 2, cy + 50)
      ctx.fillText('PROJECT', 0, 0)
      ctx.restore()
    }

    ctx.restore()
  }
}
