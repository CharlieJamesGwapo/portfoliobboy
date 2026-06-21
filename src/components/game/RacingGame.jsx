import { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import AudioManager from './AudioManager'
import { getAvatar, makeSprite } from '../../lib/avatar'
import { SKILLS, OWNER } from '../../data/gameData'
import { getPlayerName } from '../../lib/gameStorage'
import { submitScore } from '../../lib/supabase'
import Leaderboard from './Leaderboard'

// ---------------------------------------------------------------------------
// WebGL boundary — never let a 3D failure crash the game
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
// 3D background — infinite night starfield scrolling downward (parallax)
// ---------------------------------------------------------------------------
function Starfield() {
  const ref = useRef()
  const COUNT = 1400
  const SPREAD_X = 60
  const SPREAD_Y = 40
  const { positions, speeds } = useMemo(() => {
    const arr = new Float32Array(COUNT * 3)
    const spd = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * SPREAD_X
      arr[i * 3 + 1] = (Math.random() - 0.5) * SPREAD_Y
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20
      spd[i] = 2 + Math.random() * 8 // parallax: closer stars fall faster
    }
    return { positions: arr, speeds: spd }
  }, [])

  useFrame((_, dt) => {
    const geo = ref.current
    if (!geo) return
    const attr = geo.attributes.position
    const a = attr.array
    const top = SPREAD_Y / 2
    for (let i = 0; i < COUNT; i++) {
      a[i * 3 + 1] -= speeds[i] * dt
      if (a[i * 3 + 1] < -top) {
        a[i * 3 + 1] = top
        a[i * 3 + 0] = (Math.random() - 0.5) * SPREAD_X
      }
    }
    attr.needsUpdate = true
  })

  return (
    <points>
      <bufferGeometry ref={ref}>
        <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.12} sizeAttenuation color="#bcd0ff" transparent opacity={0.9} />
    </points>
  )
}

function Background3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none bg-[#05060f]">
      <SceneBoundary
        fallback={
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(circle at 50% 30%, #15203f 0%, #05060f 70%)' }}
          />
        }
      >
        <Canvas camera={{ position: [0, 0, 18], fov: 70 }} dpr={[1, 1.5]}>
          <Starfield />
        </Canvas>
      </SceneBoundary>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Track geometry (world coordinates)
// ---------------------------------------------------------------------------
const WORLD = {
  cx: 1100,
  cy: 700,
  outerRX: 820,
  outerRY: 520,
  innerRX: 480,
  innerRY: 250,
}
// Centerline radii (mid of the road) — used for waypoints + finish line.
const MID_RX = (WORLD.outerRX + WORLD.innerRX) / 2
const MID_RY = (WORLD.outerRY + WORLD.innerRY) / 2

// Is a point on the road (between inner and outer ellipse)?
function onRoad(x, y) {
  const dx = x - WORLD.cx
  const dy = y - WORLD.cy
  const outer = (dx * dx) / (WORLD.outerRX * WORLD.outerRX) + (dy * dy) / (WORLD.outerRY * WORLD.outerRY)
  const inner = (dx * dx) / (WORLD.innerRX * WORLD.innerRX) + (dy * dy) / (WORLD.innerRY * WORLD.innerRY)
  return outer <= 1 && inner >= 1
}

// Waypoints around the oval (clockwise) for AI + finish positioning.
function buildWaypoints(n) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    pts.push({ x: WORLD.cx + Math.cos(a) * MID_RX, y: WORLD.cy + Math.sin(a) * MID_RY })
  }
  return pts
}

const LAPS_TO_WIN = 3
const TOP_SPEED = 360
const AI_TOP_SPEED = 318
const ACCEL = 320
const REVERSE_SPEED = -150
const STEER_RATE = 2.6
const GRASS_DRAG = 4.2
const ROAD_DRAG = 1.2
const BOOST_MS = 3000

function RacingGame({ onExit, onContact, onOpenSettings, paused }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const lastTsRef = useRef(0)
  const pausedRef = useRef(paused)
  pausedRef.current = paused

  const [phase, setPhase] = useState('start') // start | countdown | racing | win | gameover
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  const [hud, setHud] = useState({ lap: 0, timeMs: 0, speed: 0, boost: false })
  const [collected, setCollected] = useState([]) // skill names collected
  const [countdown, setCountdown] = useState(3)

  // results
  const [bestLapMs, setBestLapMs] = useState(0)
  const [totalMs, setTotalMs] = useState(0)

  // leaderboard / submit
  const [name, setName] = useState(getPlayerName() || '')
  const [submitted, setSubmitted] = useState(false)
  const [refreshSignal, setRefreshSignal] = useState(0)

  // best lap persisted
  const [storedBest, setStoredBest] = useState(() => {
    const v = Number(localStorage.getItem('arcade_best_racing'))
    return v > 0 ? v : 0
  })

  // sprite
  const spriteRef = useRef(null)
  useEffect(() => {
    spriteRef.current = makeSprite(getAvatar(), 64, { bubble: false })
  }, [])

  const waypoints = useMemo(() => buildWaypoints(48), [])

  // ---- world state in refs ----
  const worldRef = useRef(null)
  const keysRef = useRef({})
  const touchRef = useRef({ left: false, right: false, gas: false, brake: false })

  const resetWorld = useCallback(() => {
    // Start on the road at the finish line (rightmost point of centerline),
    // heading "up" along the track (clockwise => negative y here means moving up).
    const startX = WORLD.cx + MID_RX
    const startY = WORLD.cy
    const makeKart = (offset, color) => ({
      x: startX,
      y: startY + offset,
      heading: -Math.PI / 2, // facing up (toward decreasing y)
      vel: 0,
      color,
      lap: 0,
      finished: false,
      wp: 0,
      prevSide: 1,
    })

    // skill badges scattered on the road
    const badges = []
    const usable = SKILLS.slice()
    let attempts = 0
    while (badges.length < SKILLS.length && attempts < 2000) {
      attempts++
      const a = Math.random() * Math.PI * 2
      const t = 0.18 + Math.random() * 0.64 // interpolate inner->outer
      const rx = WORLD.innerRX + (WORLD.outerRX - WORLD.innerRX) * t
      const ry = WORLD.innerRY + (WORLD.outerRY - WORLD.innerRY) * t
      const x = WORLD.cx + Math.cos(a) * rx
      const y = WORLD.cy + Math.sin(a) * ry
      // avoid spawning right on the finish line band
      if (Math.abs(y - WORLD.cy) < 70 && x > WORLD.cx) continue
      if (!onRoad(x, y)) continue
      badges.push({ x, y, name: usable[badges.length], taken: false })
    }

    worldRef.current = {
      player: { x: startX, y: startY, heading: -Math.PI / 2, vel: 0, lap: 0, prevSide: 1 },
      ai: [makeKart(-44, '#ef4444'), makeKart(44, '#f97316')],
      badges,
      cam: { x: startX, y: startY },
      startMs: 0,
      timeMs: 0,
      lapStartMs: 0,
      best: 0,
      laps: 0,
      boostUntil: 0,
      collectedSet: new Set(),
    }
    setCollected([])
    setHud({ lap: 0, timeMs: 0, speed: 0, boost: false })
  }, [])

  // ---- input ----
  useEffect(() => {
    const down = (e) => {
      keysRef.current[e.key.toLowerCase()] = true
    }
    const up = (e) => {
      keysRef.current[e.key.toLowerCase()] = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  // ---- finish-line crossing detection ----
  // Finish line is the vertical segment at x ~ cx (on the right half, x > cx),
  // crossing from y < cy to y >= cy (clockwise direction) counts a lap.
  function crossedFinish(prevX, prevY, x, y) {
    if (x <= WORLD.cx) return false
    // crossed the horizontal centerline going downward (clockwise on right side)
    return prevY < WORLD.cy && y >= WORLD.cy
  }

  // ---- main loop ----
  useEffect(() => {
    const cvs = canvasRef.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')

    const resize = () => {
      cvs.width = cvs.clientWidth
      cvs.height = cvs.clientHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const step = (ts) => {
      rafRef.current = requestAnimationFrame(step)
      const w = worldRef.current
      if (!w) {
        lastTsRef.current = ts
        return
      }
      let dt = (ts - lastTsRef.current) / 1000
      lastTsRef.current = ts
      if (dt > 0.05) dt = 0.05

      const racing = phaseRef.current === 'racing'
      if (!pausedRef.current && racing) {
        update(dt, ts)
      }
      render(ctx, cvs)
    }

    const update = (dt, ts) => {
      const w = worldRef.current
      const p = w.player
      const k = keysRef.current
      const t = touchRef.current

      w.timeMs += dt * 1000

      // steering
      const steerL = k['arrowleft'] || k['a'] || t.left
      const steerR = k['arrowright'] || k['d'] || t.right
      const gas = k['arrowup'] || k['w'] || t.gas
      const brake = k['arrowdown'] || k['s'] || t.brake

      if (steerL) p.heading -= STEER_RATE * dt
      if (steerR) p.heading += STEER_RATE * dt

      const boosting = ts < w.boostUntil
      const maxSpeed = boosting ? TOP_SPEED * 1.45 : TOP_SPEED
      if (gas) p.vel += ACCEL * dt
      else if (brake) p.vel -= ACCEL * 1.1 * dt
      else p.vel *= 1 - 1.4 * dt // coast

      if (p.vel > maxSpeed) p.vel = maxSpeed
      if (p.vel < REVERSE_SPEED) p.vel = REVERSE_SPEED

      const prevX = p.x
      const prevY = p.y
      const nx = p.x + Math.cos(p.heading) * p.vel * dt
      const ny = p.y + Math.sin(p.heading) * p.vel * dt

      // off-road friction
      const off = !onRoad(nx, ny)
      p.x = nx
      p.y = ny
      const drag = off ? GRASS_DRAG : ROAD_DRAG
      p.vel *= 1 - drag * dt
      if (off && Math.abs(p.vel) > TOP_SPEED * 0.45) p.vel *= 0.965 // grass cap

      // collectibles
      for (const b of w.badges) {
        if (b.taken) continue
        if (Math.hypot(p.x - b.x, p.y - b.y) < 34) {
          b.taken = true
          w.collectedSet.add(b.name)
          setCollected(Array.from(w.collectedSet))
          AudioManager.playSFX('powerup')
          if (w.collectedSet.size === SKILLS.length) {
            w.boostUntil = ts + BOOST_MS
            AudioManager.playSFX('clear')
          }
        }
      }

      // lap detection (player)
      if (crossedFinish(prevX, prevY, p.x, p.y)) {
        const lapTime = w.timeMs - w.lapStartMs
        if (w.laps > 0 || lapTime > 1500) {
          // record completed lap
          if (w.best === 0 || lapTime < w.best) w.best = lapTime
        }
        w.lapStartMs = w.timeMs
        w.laps += 1
        if (w.laps >= LAPS_TO_WIN) {
          finishRace('win')
          return
        }
      }

      // AI movement
      for (const ai of w.ai) {
        if (ai.finished) continue
        const target = waypoints[ai.wp]
        const ang = Math.atan2(target.y - ai.y, target.x - ai.x)
        // steer toward heading
        let diff = ang - ai.heading
        while (diff > Math.PI) diff -= Math.PI * 2
        while (diff < -Math.PI) diff += Math.PI * 2
        ai.heading += Math.max(-STEER_RATE * dt, Math.min(STEER_RATE * dt, diff)) + (Math.random() - 0.5) * 0.04
        ai.vel += ACCEL * dt
        if (ai.vel > AI_TOP_SPEED) ai.vel = AI_TOP_SPEED
        const aprevY = ai.y
        const apx = ai.x
        ai.x += Math.cos(ai.heading) * ai.vel * dt
        ai.y += Math.sin(ai.heading) * ai.vel * dt
        if (Math.hypot(ai.x - target.x, ai.y - target.y) < 70) {
          ai.wp = (ai.wp + 1) % waypoints.length
        }
        // AI lap detection
        if (crossedFinish(apx, aprevY, ai.x, ai.y)) {
          ai.lap += 1
          if (ai.lap >= LAPS_TO_WIN) ai.finished = true
        }
      }

      // both AI finished before player => game over
      if (w.ai.every((a) => a.finished)) {
        finishRace('gameover')
        return
      }

      // camera follows player
      w.cam.x += (p.x - w.cam.x) * Math.min(1, dt * 6)
      w.cam.y += (p.y - w.cam.y) * Math.min(1, dt * 6)

      // HUD throttle
      setHud({
        lap: Math.min(w.laps + 1, LAPS_TO_WIN),
        timeMs: w.timeMs,
        speed: Math.abs(p.vel) / (TOP_SPEED * 1.45),
        boost: boosting,
      })
    }

    const finishRace = (result) => {
      const w = worldRef.current
      cancelLoopWork()
      const best = w.best > 0 ? w.best : w.timeMs / LAPS_TO_WIN
      setBestLapMs(best)
      setTotalMs(w.timeMs)
      if (result === 'win') {
        setPhase('win')
        if (best > 0 && (storedBest === 0 || best < storedBest)) {
          localStorage.setItem('arcade_best_racing', String(Math.round(best)))
          setStoredBest(Math.round(best))
        }
        AudioManager.playSFX('victory')
        AudioManager.playMusic('victory')
      } else {
        setPhase('gameover')
        AudioManager.playSFX('hit')
      }
    }
    const cancelLoopWork = () => {}

    // ---- render ----
    const render = (ctx, cvs) => {
      const w = worldRef.current
      const W = cvs.width
      const H = cvs.height
      ctx.clearRect(0, 0, W, H)

      if (!w) return
      const offX = W / 2 - w.cam.x
      const offY = H / 2 - w.cam.y

      // grass
      ctx.fillStyle = '#0c2415'
      ctx.fillRect(0, 0, W, H)
      // subtle grass texture stripes
      ctx.fillStyle = 'rgba(255,255,255,0.015)'
      for (let gy = 0; gy < H; gy += 48) ctx.fillRect(0, gy, W, 24)

      ctx.save()
      ctx.translate(offX, offY)

      // road = outer ellipse minus inner ellipse
      ctx.fillStyle = '#2b2f38'
      ctx.beginPath()
      ctx.ellipse(WORLD.cx, WORLD.cy, WORLD.outerRX, WORLD.outerRY, 0, 0, Math.PI * 2)
      ctx.ellipse(WORLD.cx, WORLD.cy, WORLD.innerRX, WORLD.innerRY, 0, 0, Math.PI * 2, true)
      ctx.fill('evenodd')

      // dashed white borders
      ctx.setLineDash([26, 22])
      ctx.lineWidth = 5
      ctx.strokeStyle = '#f8fafc'
      ctx.beginPath()
      ctx.ellipse(WORLD.cx, WORLD.cy, WORLD.outerRX, WORLD.outerRY, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(WORLD.cx, WORLD.cy, WORLD.innerRX, WORLD.innerRY, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])

      // start/finish line (checkered) across the road on the right side
      const fx = WORLD.cx + MID_RX
      const sq = 12
      for (let r = 0; r < 2; r++) {
        for (let yy = -((WORLD.outerRX - WORLD.innerRX) / 2); yy < (WORLD.outerRX - WORLD.innerRX) / 2; yy += sq) {
          // draw a checker column straddling the road thickness at x=fx
        }
      }
      // simpler: a checker band centered on finish point spanning road width
      const halfBand = (WORLD.outerRX - WORLD.innerRX) / 2 + 6
      for (let i = 0; i * sq < halfBand * 2; i++) {
        const yy = WORLD.cy - halfBand + i * sq
        ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#111827'
        ctx.fillRect(fx - 10, yy, 20, sq)
        ctx.fillStyle = i % 2 === 0 ? '#111827' : '#ffffff'
        ctx.fillRect(fx + 10, yy, 20, sq)
      }

      // badges
      for (const b of w.badges) {
        if (b.taken) continue
        ctx.save()
        ctx.translate(b.x, b.y)
        ctx.fillStyle = '#facc15'
        ctx.strokeStyle = '#1f2937'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(0, 0, 14, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = '#1f2937'
        ctx.font = 'bold 9px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(b.name.slice(0, 4), 0, 0)
        ctx.restore()
      }

      // AI karts
      for (const ai of w.ai) {
        drawKart(ctx, ai.x, ai.y, ai.heading, ai.color, null)
      }
      // player kart
      drawKart(ctx, w.player.x, w.player.y, w.player.heading, '#38bdf8', spriteRef.current)

      ctx.restore()
    }

    const drawKart = (ctx, x, y, heading, color, sprite) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(heading + Math.PI / 2) // sprite faces "up" by default
      if (sprite) {
        ctx.drawImage(sprite, -28, -28, 56, 56)
      } else {
        ctx.fillStyle = color
        ctx.strokeStyle = '#0b0f1a'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.rect(-16, -22, 32, 44)
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = '#0b0f1a'
        ctx.fillRect(-14, -22, 28, 8) // windshield-ish
      }
      ctx.restore()
    }

    lastTsRef.current = performance.now()
    rafRef.current = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waypoints, storedBest])

  // music lifecycle
  useEffect(() => {
    return () => {
      AudioManager.stopMusic()
    }
  }, [])

  // ---- start / countdown ----
  const beginRace = useCallback(() => {
    AudioManager.init()
    AudioManager.playSFX('rev')
    AudioManager.playMusic('arcade')
    resetWorld()
    setSubmitted(false)
    setPhase('countdown')
    setCountdown(3)
    let n = 3
    const tick = () => {
      n -= 1
      if (n <= 0) {
        setCountdown(0)
        setTimeout(() => setPhase('racing'), 600)
      } else {
        setCountdown(n)
        setTimeout(tick, 800)
      }
    }
    setTimeout(tick, 800)
  }, [resetWorld])

  const handleSubmit = useCallback(async () => {
    if (submitted) return
    const player_name = (name || getPlayerName() || 'Anonymous').trim()
    setSubmitted(true)
    await submitScore({
      player_name,
      score: Math.round(bestLapMs),
      time_seconds: Math.round(totalMs / 1000),
      boss_defeated: false,
      game: 'racing',
    })
    setRefreshSignal((s) => s + 1)
  }, [submitted, name, bestLapMs, totalMs])

  const fmt = (ms) => {
    const s = ms / 1000
    const m = Math.floor(s / 60)
    const sec = (s % 60).toFixed(2).padStart(5, '0')
    return `${m}:${sec}`
  }

  // touch helpers
  const bindTouch = (key) => ({
    onPointerDown: (e) => {
      e.preventDefault()
      touchRef.current[key] = true
    },
    onPointerUp: (e) => {
      e.preventDefault()
      touchRef.current[key] = false
    },
    onPointerLeave: () => {
      touchRef.current[key] = false
    },
    onPointerCancel: () => {
      touchRef.current[key] = false
    },
  })

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-black select-none">
      <Background3D />

      {/* gameplay canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10 h-full w-full" />

      {/* top controls */}
      <button
        onClick={onExit}
        className="absolute left-3 top-3 z-40 rounded-lg bg-black/60 px-3 py-2 font-bold text-white ring-1 ring-white/20 hover:bg-black/80"
      >
        ✕ Exit
      </button>
      <button
        onClick={onOpenSettings}
        className="absolute right-3 top-3 z-40 rounded-lg bg-black/60 px-3 py-2 text-xl text-white ring-1 ring-white/20 hover:bg-black/80"
        aria-label="Settings"
      >
        ⚙
      </button>

      {/* HUD */}
      {(phase === 'racing' || phase === 'countdown') && (
        <div className="pointer-events-none absolute inset-0 z-20">
          {/* lap counter */}
          <div className="absolute left-3 top-16 rounded-lg bg-black/55 px-3 py-1.5 font-mono text-lg font-bold text-cyan-300 ring-1 ring-white/15">
            Lap {hud.lap}/{LAPS_TO_WIN}
          </div>
          {/* timer */}
          <div className="absolute right-3 top-16 rounded-lg bg-black/55 px-3 py-1.5 font-mono text-lg font-bold text-yellow-300 ring-1 ring-white/15">
            ⏱ {fmt(hud.timeMs)}
          </div>

          {/* speed bar */}
          <div className="absolute bottom-4 left-3 w-40">
            <div className="mb-1 font-mono text-xs text-white/80">SPEED {hud.boost ? '🔥' : ''}</div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className={`h-full ${hud.boost ? 'bg-orange-400' : 'bg-cyan-400'}`}
                style={{ width: `${Math.min(100, hud.speed * 100)}%` }}
              />
            </div>
          </div>

          {/* collected skills sidebar */}
          <div className="absolute right-3 top-28 w-36 rounded-lg bg-black/45 p-2 ring-1 ring-white/10">
            <div className="mb-1 font-mono text-[10px] uppercase text-emerald-300">
              Skills {collected.length}/{SKILLS.length}
            </div>
            <div className="flex flex-wrap gap-1">
              {collected.map((s) => (
                <span key={s} className="rounded bg-emerald-500/25 px-1.5 py-0.5 text-[9px] font-bold text-emerald-200">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* mini oval map */}
          <MiniMap worldRef={worldRef} />
        </div>
      )}

      {/* mobile controls */}
      {phase === 'racing' && (
        <div className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-between p-4 md:hidden">
          <div className="flex gap-3">
            <button
              {...bindTouch('left')}
              className="h-20 w-20 touch-none rounded-full bg-white/15 text-3xl font-bold text-white ring-2 ring-white/30 active:bg-white/30"
            >
              ◀
            </button>
            <button
              {...bindTouch('right')}
              className="h-20 w-20 touch-none rounded-full bg-white/15 text-3xl font-bold text-white ring-2 ring-white/30 active:bg-white/30"
            >
              ▶
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <button
              {...bindTouch('gas')}
              className="h-20 w-24 touch-none rounded-2xl bg-green-500/30 text-lg font-bold text-green-100 ring-2 ring-green-300/40 active:bg-green-500/50"
            >
              GAS
            </button>
            <button
              {...bindTouch('brake')}
              className="h-16 w-24 touch-none rounded-2xl bg-red-500/30 text-base font-bold text-red-100 ring-2 ring-red-300/40 active:bg-red-500/50"
            >
              BRAKE
            </button>
          </div>
        </div>
      )}

      {/* countdown overlay */}
      {phase === 'countdown' && (
        <div className="pointer-events-none absolute inset-0 z-[120] flex items-center justify-center">
          <div className="text-8xl font-black text-white drop-shadow-[0_0_20px_rgba(56,189,248,0.8)]">
            {countdown > 0 ? countdown : 'GO!'}
          </div>
        </div>
      )}

      {/* START overlay */}
      {phase === 'start' && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
          <div className="max-w-md rounded-2xl bg-[#0b1024]/90 p-6 text-center ring-1 ring-cyan-400/30">
            <h1 className="mb-2 text-4xl font-black text-cyan-300">🏎️ Pixel Racer</h1>
            <p className="mb-4 text-sm text-white/70">
              Top-down kart racing. Complete {LAPS_TO_WIN} laps before the CPUs. Collect all skill badges for a speed
              boost!
            </p>
            <ul className="mb-5 text-left text-xs text-white/60">
              <li>↑/W accelerate · ↓/S brake · ←→/AD steer</li>
              <li>Mobile: on-screen steer + GAS/BRAKE</li>
            </ul>
            {storedBest > 0 && (
              <p className="mb-3 font-mono text-sm text-yellow-300">Best lap: {fmt(storedBest)}</p>
            )}
            <button
              onClick={beginRace}
              className="rounded-xl bg-cyan-500 px-8 py-3 text-lg font-bold text-black hover:bg-cyan-400"
            >
              ▶ Start Race
            </button>
          </div>
        </div>
      )}

      {/* WIN overlay */}
      {phase === 'win' && (
        <ResultScreen
          title="🏁 RACE COMPLETE"
          accent="text-emerald-300"
          totalMs={totalMs}
          bestLapMs={bestLapMs}
          fmt={fmt}
          collected={collected}
          name={name}
          setName={setName}
          submitted={submitted}
          onSubmit={handleSubmit}
          refreshSignal={refreshSignal}
          onExit={onExit}
          onContact={onContact}
          showRetry={false}
          onRetry={beginRace}
        />
      )}

      {/* GAME OVER overlay */}
      {phase === 'gameover' && (
        <ResultScreen
          title="💀 DEFEATED"
          accent="text-red-400"
          totalMs={totalMs}
          bestLapMs={bestLapMs}
          fmt={fmt}
          collected={collected}
          name={name}
          setName={setName}
          submitted={true}
          onSubmit={() => {}}
          refreshSignal={refreshSignal}
          onExit={onExit}
          onContact={onContact}
          showRetry={true}
          onRetry={beginRace}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mini oval map (bottom-right)
// ---------------------------------------------------------------------------
function MiniMap({ worldRef }) {
  const ref = useRef(null)
  useEffect(() => {
    let id
    const draw = () => {
      id = requestAnimationFrame(draw)
      const cvs = ref.current
      const w = worldRef.current
      if (!cvs || !w) return
      const ctx = cvs.getContext('2d')
      const W = cvs.width
      const H = cvs.height
      ctx.clearRect(0, 0, W, H)
      const sx = W / (WORLD.outerRX * 2.3)
      const sy = H / (WORLD.outerRY * 2.3)
      const toX = (x) => W / 2 + (x - WORLD.cx) * sx
      const toY = (y) => H / 2 + (y - WORLD.cy) * sy
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.ellipse(W / 2, H / 2, WORLD.outerRX * sx, WORLD.outerRY * sy, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(W / 2, H / 2, WORLD.innerRX * sx, WORLD.innerRY * sy, 0, 0, Math.PI * 2)
      ctx.stroke()
      const dot = (x, y, c) => {
        ctx.fillStyle = c
        ctx.beginPath()
        ctx.arc(toX(x), toY(y), 3.5, 0, Math.PI * 2)
        ctx.fill()
      }
      w.ai.forEach((a) => dot(a.x, a.y, a.color))
      dot(w.player.x, w.player.y, '#38bdf8')
    }
    id = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(id)
  }, [worldRef])
  return (
    <canvas
      ref={ref}
      width={150}
      height={100}
      className="absolute bottom-4 right-3 rounded-lg bg-black/55 ring-1 ring-white/15"
    />
  )
}

// ---------------------------------------------------------------------------
// Win / Game over result screen
// ---------------------------------------------------------------------------
function ResultScreen({
  title,
  accent,
  totalMs,
  bestLapMs,
  fmt,
  collected,
  name,
  setName,
  submitted,
  onSubmit,
  refreshSignal,
  onExit,
  onContact,
  showRetry,
  onRetry,
}) {
  return (
    <div className="absolute inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/80 p-4">
      <div className="my-6 w-full max-w-lg rounded-2xl bg-[#0b1024]/95 p-6 ring-1 ring-white/15">
        <h2 className={`mb-2 text-center text-4xl font-black ${accent}`}>{title}</h2>
        <div className="mb-4 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-xs text-white/50">Total Time</div>
            <div className="font-mono text-xl font-bold text-white">{fmt(totalMs)}</div>
          </div>
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-xs text-white/50">Best Lap</div>
            <div className="font-mono text-xl font-bold text-yellow-300">{fmt(bestLapMs)}</div>
          </div>
        </div>

        {collected.length > 0 && (
          <div className="mb-4">
            <div className="mb-1 text-xs uppercase text-emerald-300">Skills Unlocked</div>
            <div className="flex flex-wrap gap-1.5">
              {collected.map((s) => (
                <span
                  key={s}
                  className="rounded-md bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-200 ring-1 ring-emerald-400/30"
                >
                  ✦ {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {!submitted && (
          <div className="mb-4 flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={24}
              className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-white outline-none ring-1 ring-white/20 focus:ring-cyan-400"
            />
            <button
              onClick={onSubmit}
              className="rounded-lg bg-cyan-500 px-4 py-2 font-bold text-black hover:bg-cyan-400"
            >
              Submit
            </button>
          </div>
        )}

        <div className="mb-4">
          <Leaderboard limit={5} game="racing" refreshSignal={refreshSignal} highlightName={name} />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {showRetry && (
            <button
              onClick={onRetry}
              className="rounded-lg bg-yellow-400 px-4 py-2 font-bold text-black hover:bg-yellow-300"
            >
              🔁 Retry
            </button>
          )}
          <button
            onClick={onExit}
            className="rounded-lg bg-white/15 px-4 py-2 font-bold text-white ring-1 ring-white/25 hover:bg-white/25"
          >
            🏠 Lobby
          </button>
          <button
            onClick={onContact}
            className="rounded-lg bg-purple-500/80 px-4 py-2 font-bold text-white hover:bg-purple-500"
          >
            📬 Contact {OWNER.name.split(' ')[0]}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RacingGame
