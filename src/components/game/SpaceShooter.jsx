import { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import AudioManager from './AudioManager'
import { getAvatar, makeSprite, setUnlock } from '../../lib/avatar'
import { BLASTER_SKILLS, SKILL_INFO, PROJECTS, OWNER } from '../../data/gameData'
import { submitScore } from '../../lib/supabase'
import { getPlayerName } from '../../lib/gameStorage'
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
// 3D background (Part 6): spiral-disc galaxy + 3 planets
// ---------------------------------------------------------------------------
function Galaxy({ boss }) {
  const ref = useRef()
  const COUNT = 2000
  const { positions, baseColor } = useMemo(() => {
    const arr = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      const r = Math.pow(Math.random(), 0.6) * 12
      const angle = Math.random() * Math.PI * 2 + r * 0.35
      arr[i * 3 + 0] = Math.cos(angle) * r + (Math.random() - 0.5) * 1.2
      arr[i * 3 + 1] = (Math.random() - 0.5) * 1.4 // small y-jitter -> disc
      arr[i * 3 + 2] = Math.sin(angle) * r + (Math.random() - 0.5) * 1.2
    }
    return { positions: arr, baseColor: new THREE.Color('#9bb8ff') }
  }, [])

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.04
  })

  return (
    <points ref={ref} rotation={[0.5, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        sizeAttenuation
        color={boss ? '#ff4d4d' : baseColor}
        transparent
        opacity={0.9}
      />
    </points>
  )
}

function Planet({ color, position, scale, speed }) {
  const ref = useRef()
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * speed
  })
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
    </mesh>
  )
}

function BackgroundScene({ boss }) {
  return (
    <Canvas camera={{ position: [0, 2.5, 9], fov: 60 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.35} />
      <pointLight position={[8, 6, 8]} intensity={1.1} color="#ffffff" />
      <Galaxy boss={boss} />
      <Planet color="#5b6cff" position={[-6, 1.5, -4]} scale={1.4} speed={0.15} />
      <Planet color="#ff8c5b" position={[6, -1, -7]} scale={2.2} speed={0.08} />
      <Planet color="#3ad6a0" position={[3, 3, -11]} scale={3.2} speed={0.05} />
    </Canvas>
  )
}

// ---------------------------------------------------------------------------
// Game constants
// ---------------------------------------------------------------------------
const FIRE_INTERVAL = 0.3
const BULLET_SPEED = 720
const START_LIVES = 3
const BOSS_HP = 30
const BOSS_WIN_TARGET = 3
const KILLS_PER_WAVE = 8

function rand(a, b) {
  return a + Math.random() * (b - a)
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function SpaceShooter({ onExit, onContact, onOpenSettings, paused }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const lastTsRef = useRef(0)
  const pausedRef = useRef(paused)
  const spriteRef = useRef(null)
  const hudPushRef = useRef(0)

  const [phase, setPhase] = useState('intro') // intro | playing | win | over
  const [hud, setHud] = useState({ score: 0, lives: START_LIVES, wave: 1 })
  const [skillCard, setSkillCard] = useState(null) // {name, desc}
  const [projectCard, setProjectCard] = useState(null) // PROJECTS entry
  const [refreshSignal, setRefreshSignal] = useState(0)
  const [nameInput, setNameInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [finalScore, setFinalScore] = useState(0)

  // Mutable world state lives in a single ref so the rAF loop never re-renders.
  const world = useRef(null)

  const makeWorld = useCallback(() => {
    const cw = window.innerWidth
    const ch = window.innerHeight
    return {
      w: cw,
      h: ch,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      ship: { x: cw / 2, y: ch - 90, w: 60, h: 60 },
      targetX: cw / 2,
      bullets: [],
      enemies: [],
      particles: [],
      fireT: 0,
      spawnT: 0,
      score: 0,
      lives: START_LIVES,
      wave: 1,
      waveKills: 0,
      bossActive: false,
      boss: null,
      bossesDefeated: 0,
      projectIndex: 0,
      elapsed: 0,
      blocked: false, // true while a project card pauses the action
    }
  }, [])

  // build the avatar ship sprite once
  useEffect(() => {
    spriteRef.current = makeSprite(getAvatar(), 64, { bubble: false })
  }, [])

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  // -------------------------------------------------------------------------
  // canvas sizing
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
      world.current.ship.y = window.innerHeight - 90
    }
  }, [])

  useEffect(() => {
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [resize])

  // -------------------------------------------------------------------------
  // pointer / touch control
  // -------------------------------------------------------------------------
  useEffect(() => {
    const onMove = (clientX) => {
      if (world.current) world.current.targetX = clientX
    }
    const mm = (e) => onMove(e.clientX)
    const tm = (e) => {
      if (e.touches && e.touches[0]) onMove(e.touches[0].clientX)
    }
    window.addEventListener('mousemove', mm)
    window.addEventListener('touchmove', tm, { passive: true })
    window.addEventListener('touchstart', tm, { passive: true })
    return () => {
      window.removeEventListener('mousemove', mm)
      window.removeEventListener('touchmove', tm)
      window.removeEventListener('touchstart', tm)
    }
  }, [])

  // -------------------------------------------------------------------------
  // helpers used in the loop
  // -------------------------------------------------------------------------
  const burst = useCallback((w, x, y, color) => {
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI * 2
      const s = rand(60, 320)
      w.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: rand(0.4, 0.9),
        max: 0.9,
        color,
      })
    }
  }, [])

  const spawnEnemy = useCallback((w) => {
    const fast = w.wave >= 4
    const speed = fast ? rand(110, 170) : rand(55, 95)
    const size = fast ? rand(34, 46) : rand(40, 54)
    w.enemies.push({
      x: rand(40, w.w - 40),
      y: -40,
      vy: speed,
      r: size / 2,
      label: pick(BLASTER_SKILLS),
      boss: false,
      hp: 1,
    })
  }, [])

  const spawnBoss = useCallback((w) => {
    const proj = PROJECTS[w.projectIndex % PROJECTS.length]
    w.bossActive = true
    w.boss = {
      x: w.w / 2,
      y: 120,
      r: 70,
      vx: rand(80, 140),
      hp: BOSS_HP,
      maxHp: BOSS_HP,
      project: proj,
      label: proj.title,
    }
    try {
      AudioManager.playMusic('boss')
      AudioManager.playSFX('bossRoar')
    } catch {}
  }, [])

  // -------------------------------------------------------------------------
  // game loop
  // -------------------------------------------------------------------------
  const step = useCallback(
    (dt, w) => {
      // ship follows pointer
      const half = w.ship.w / 2
      w.ship.x += (w.targetX - w.ship.x) * Math.min(1, dt * 12)
      w.ship.x = Math.max(half, Math.min(w.w - half, w.ship.x))

      if (w.blocked) return // project card open -> freeze action only

      w.elapsed += dt

      // auto fire
      w.fireT -= dt
      if (w.fireT <= 0) {
        w.fireT = FIRE_INTERVAL
        w.bullets.push({ x: w.ship.x, y: w.ship.y - half, vy: -BULLET_SPEED })
        try {
          AudioManager.playSFX('shoot')
        } catch {}
      }

      // bullets
      for (let i = w.bullets.length - 1; i >= 0; i--) {
        const b = w.bullets[i]
        b.y += b.vy * dt
        if (b.y < -20) w.bullets.splice(i, 1)
      }

      // spawning
      if (w.bossActive) {
        const b = w.boss
        b.x += b.vx * dt
        if (b.x < b.r || b.x > w.w - b.r) b.vx *= -1
        b.x = Math.max(b.r, Math.min(w.w - b.r, b.x))
      } else {
        w.spawnT -= dt
        const interval = w.wave >= 4 ? rand(0.5, 0.9) : rand(0.9, 1.5)
        if (w.spawnT <= 0) {
          w.spawnT = interval
          spawnEnemy(w)
        }
      }

      // enemy movement + bottom collision
      for (let i = w.enemies.length - 1; i >= 0; i--) {
        const e = w.enemies[i]
        e.y += e.vy * dt
        if (e.y - e.r > w.h) {
          w.enemies.splice(i, 1)
          w.lives -= 1
          try {
            AudioManager.playSFX('hit')
          } catch {}
          if (w.lives <= 0) {
            endGame(w, false)
            return
          }
        }
      }

      // bullet vs enemy
      for (let bi = w.bullets.length - 1; bi >= 0; bi--) {
        const b = w.bullets[bi]
        let hit = false
        for (let ei = w.enemies.length - 1; ei >= 0; ei--) {
          const e = w.enemies[ei]
          const dx = b.x - e.x
          const dy = b.y - e.y
          if (dx * dx + dy * dy <= e.r * e.r) {
            w.enemies.splice(ei, 1)
            burst(w, e.x, e.y, '#5bd6ff')
            w.score += 100
            w.waveKills += 1
            try {
              AudioManager.playSFX('explosion')
            } catch {}
            const desc = SKILL_INFO[e.label] || 'A technology in the stack.'
            popSkillCard({ name: e.label, desc })
            hit = true
            break
          }
        }
        if (!hit && w.boss) {
          const e = w.boss
          const dx = b.x - e.x
          const dy = b.y - e.y
          if (dx * dx + dy * dy <= e.r * e.r) {
            e.hp -= 1
            burst(w, b.x, b.y, '#ffae5b')
            w.score += 50
            try {
              AudioManager.playSFX('explosion')
            } catch {}
            if (e.hp <= 0) {
              burst(w, e.x, e.y, '#ff5b5b')
              try {
                AudioManager.playSFX('enemyDeath')
              } catch {}
              w.bossesDefeated += 1
              w.score += 1500
              w.bossActive = false
              w.boss = null
              w.projectIndex += 1
              w.blocked = true
              openProjectCard(e.project)
              if (w.bossesDefeated >= BOSS_WIN_TARGET) {
                endGame(w, true)
                return
              }
            }
            hit = true
          }
        }
        if (hit) w.bullets.splice(bi, 1)
      }

      // particles
      for (let i = w.particles.length - 1; i >= 0; i--) {
        const p = w.particles[i]
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.vx *= 0.94
        p.vy *= 0.94
        p.life -= dt
        if (p.life <= 0) w.particles.splice(i, 1)
      }

      // wave progression
      if (!w.bossActive && w.waveKills >= KILLS_PER_WAVE) {
        w.waveKills = 0
        w.wave += 1
        if (w.wave === 7) {
          try {
            setUnlock('astronaut')
          } catch {}
        }
        if (w.wave >= 7) {
          // clear remaining trash and spawn a boss
          w.enemies = []
          spawnBoss(w)
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burst, spawnEnemy, spawnBoss]
  )

  // -------------------------------------------------------------------------
  // rendering
  // -------------------------------------------------------------------------
  const draw = useCallback((w) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(w.dpr, 0, 0, w.dpr, 0, 0)
    ctx.clearRect(0, 0, w.w, w.h)

    // bullets
    ctx.save()
    ctx.shadowBlur = 12
    ctx.shadowColor = '#7df9ff'
    ctx.fillStyle = '#bff7ff'
    for (const b of w.bullets) ctx.fillRect(b.x - 2.5, b.y - 12, 5, 14)
    ctx.restore()

    // enemies (bugs)
    for (const e of w.enemies) {
      ctx.save()
      ctx.translate(e.x, e.y)
      ctx.fillStyle = '#ff6b9d'
      ctx.strokeStyle = '#3a0d20'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(0, 0, e.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      // little bug legs
      ctx.strokeStyle = '#ffd1e1'
      ctx.beginPath()
      ctx.moveTo(-e.r, -e.r * 0.5)
      ctx.lineTo(-e.r - 8, -e.r)
      ctx.moveTo(e.r, -e.r * 0.5)
      ctx.lineTo(e.r + 8, -e.r)
      ctx.stroke()
      // eyes
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(-e.r * 0.35, -e.r * 0.15, e.r * 0.18, 0, Math.PI * 2)
      ctx.arc(e.r * 0.35, -e.r * 0.15, e.r * 0.18, 0, Math.PI * 2)
      ctx.fill()
      // label
      ctx.font = 'bold 12px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#fff'
      ctx.shadowBlur = 4
      ctx.shadowColor = '#000'
      ctx.fillText(e.label, 0, e.r + 16)
      ctx.restore()
    }

    // boss
    if (w.boss) {
      const e = w.boss
      ctx.save()
      ctx.translate(e.x, e.y)
      const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, e.r)
      grad.addColorStop(0, '#ff8a8a')
      grad.addColorStop(1, '#7a0000')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(0, 0, e.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.lineWidth = 3
      ctx.strokeStyle = '#ffce5b'
      ctx.stroke()
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(-e.r * 0.3, -e.r * 0.1, e.r * 0.16, 0, Math.PI * 2)
      ctx.arc(e.r * 0.3, -e.r * 0.1, e.r * 0.16, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#300'
      ctx.beginPath()
      ctx.arc(-e.r * 0.3, -e.r * 0.1, e.r * 0.07, 0, Math.PI * 2)
      ctx.arc(e.r * 0.3, -e.r * 0.1, e.r * 0.07, 0, Math.PI * 2)
      ctx.fill()
      // HP bar
      const bw = e.r * 2.2
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(-bw / 2, -e.r - 24, bw, 8)
      ctx.fillStyle = '#ff3b3b'
      ctx.fillRect(-bw / 2, -e.r - 24, bw * (e.hp / e.maxHp), 8)
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1
      ctx.strokeRect(-bw / 2, -e.r - 24, bw, 8)
      // label
      ctx.font = 'bold 14px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#ffd866'
      ctx.shadowBlur = 6
      ctx.shadowColor = '#000'
      ctx.fillText(e.label, 0, e.r + 22)
      ctx.restore()
    }

    // particles
    for (const p of w.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max)
      ctx.fillStyle = p.color
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4)
    }
    ctx.globalAlpha = 1

    // ship
    const s = w.ship
    if (spriteRef.current) {
      ctx.drawImage(spriteRef.current, s.x - s.w / 2, s.y - s.h / 2, s.w, s.h)
    } else {
      ctx.save()
      ctx.fillStyle = '#5bd6ff'
      ctx.beginPath()
      ctx.moveTo(s.x, s.y - s.h / 2)
      ctx.lineTo(s.x - s.w / 2, s.y + s.h / 2)
      ctx.lineTo(s.x + s.w / 2, s.y + s.h / 2)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
    // thruster glow
    ctx.save()
    ctx.globalAlpha = 0.6
    ctx.fillStyle = '#7df9ff'
    ctx.beginPath()
    ctx.ellipse(s.x, s.y + s.h / 2, 8, 14 + Math.random() * 6, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }, [])

  // -------------------------------------------------------------------------
  // skill card auto-close (state, doesn't pause)
  // -------------------------------------------------------------------------
  const skillTimerRef = useRef(0)
  const popSkillCard = useCallback((card) => {
    setSkillCard(card)
    window.clearTimeout(skillTimerRef.current)
    skillTimerRef.current = window.setTimeout(() => setSkillCard(null), 2000)
  }, [])

  const openProjectCard = useCallback((proj) => {
    setProjectCard(proj)
  }, [])

  const dismissProjectCard = useCallback(() => {
    setProjectCard(null)
    if (world.current) {
      world.current.blocked = false
      if (phase === 'playing') {
        try {
          AudioManager.playMusic('arcade')
        } catch {}
      }
    }
  }, [phase])

  // -------------------------------------------------------------------------
  // end game
  // -------------------------------------------------------------------------
  const endGame = useCallback((w, won) => {
    setFinalScore(w.score)
    setPhase(won ? 'win' : 'over')
    setNameInput(getPlayerName() || '')
    setSubmitted(false)
    try {
      AudioManager.stopMusic()
      if (won) {
        AudioManager.playMusic('victory')
        AudioManager.playSFX('victory')
      } else {
        AudioManager.playSFX('hit')
      }
    } catch {}
  }, [])

  // -------------------------------------------------------------------------
  // rAF driver — runs only during 'playing'
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
      if (dt > 0.05) dt = 0.05 // clamp tab-switch spikes

      if (!pausedRef.current) {
        step(dt, w)
      }
      draw(w)

      // push HUD snapshot ~10/sec
      hudPushRef.current += dt
      if (hudPushRef.current >= 0.1) {
        hudPushRef.current = 0
        setHud((prev) => {
          if (prev.score === w.score && prev.lives === w.lives && prev.wave === w.wave) {
            return prev
          }
          return { score: w.score, lives: w.lives, wave: w.wave }
        })
      }
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [phase, makeWorld, resize, step, draw])

  // music + cleanup
  useEffect(() => {
    return () => {
      try {
        AudioManager.stopMusic()
      } catch {}
      window.clearTimeout(skillTimerRef.current)
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
    setHud({ score: 0, lives: START_LIVES, wave: 1 })
    setSkillCard(null)
    setProjectCard(null)
    setPhase('playing')
  }, [makeWorld])

  const handleSubmit = useCallback(
    async (bossDefeated) => {
      if (submitted) return
      const name = (nameInput || getPlayerName() || 'Anonymous').slice(0, 24)
      const secs = world.current ? Math.round(world.current.elapsed) : 0
      try {
        await submitScore({
          player_name: name,
          score: finalScore,
          time_seconds: secs,
          boss_defeated: bossDefeated,
          game: 'blaster',
        })
      } catch {}
      setSubmitted(true)
      setRefreshSignal((n) => n + 1)
    },
    [submitted, nameInput, finalScore]
  )

  const isBossWave = hud.wave >= 7

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
                  'radial-gradient(ellipse at 50% 30%, #1a1f4a 0%, #0a0c1f 55%, #05060f 100%)',
              }}
            />
          }
        >
          <BackgroundScene boss={isBossWave} />
        </SceneBoundary>
      </div>

      {/* gameplay canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />

      {/* ---------- HUD ---------- */}
      {phase === 'playing' && (
        <>
          <div className="absolute top-3 left-3 z-20 flex items-center gap-3">
            <button
              onClick={onExit}
              className="z-40 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur text-sm font-semibold border border-white/20"
            >
              ← Exit
            </button>
            <div className="px-3 py-2 rounded-lg bg-black/40 backdrop-blur border border-white/10">
              <span className="text-xs text-cyan-300">SCORE</span>
              <div className="font-mono font-bold text-lg leading-none">{hud.score}</div>
            </div>
          </div>

          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-lg bg-black/40 backdrop-blur border border-white/10 text-center">
            <span className="text-xs text-pink-300">WAVE</span>
            <div className="font-mono font-bold text-lg leading-none">
              {hud.wave}
              {isBossWave && <span className="ml-2 text-red-400">BOSS</span>}
            </div>
          </div>

          <div className="absolute top-3 right-3 z-20 flex items-center gap-3">
            <div className="px-3 py-2 rounded-lg bg-black/40 backdrop-blur border border-white/10 flex gap-1 text-lg">
              {Array.from({ length: START_LIVES }).map((_, i) => (
                <span key={i} className={i < hud.lives ? 'opacity-100' : 'opacity-25'}>
                  ❤️
                </span>
              ))}
            </div>
            <button
              onClick={onOpenSettings}
              aria-label="Settings"
              className="z-40 w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-lg"
            >
              ⚙
            </button>
          </div>
        </>
      )}

      {/* ---------- skill card popup (non-blocking) ---------- */}
      {skillCard && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-pulse">
          <div className="px-4 py-3 rounded-xl bg-cyan-500/20 backdrop-blur border border-cyan-300/40 shadow-lg max-w-xs text-center">
            <div className="font-bold text-cyan-200">{skillCard.name}</div>
            <div className="text-xs text-white/80 mt-1">{skillCard.desc}</div>
          </div>
        </div>
      )}

      {/* ---------- project card popup (blocks action) ---------- */}
      {projectCard && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-indigo-900/90 to-slate-900/95 border border-cyan-400/40 p-6 shadow-2xl">
            <div className="text-xs uppercase tracking-wider text-cyan-300">
              {projectCard.type} — Boss Defeated!
            </div>
            <h3 className="text-2xl font-extrabold mt-1">{projectCard.title}</h3>
            <p className="text-sm text-white/80 mt-3">{projectCard.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {projectCard.technologies.map((t) => (
                <span
                  key={t}
                  className="px-2 py-1 rounded-md bg-white/10 border border-white/15 text-xs"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-6">
              {projectCard.liveUrl ? (
                <a
                  href={projectCard.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-sm"
                >
                  Visit Project →
                </a>
              ) : (
                <span className="px-4 py-2 rounded-lg bg-white/10 border border-white/15 text-sm text-white/70">
                  🔒 Private / NDA
                </span>
              )}
              <button
                onClick={dismissProjectCard}
                className="px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 font-semibold text-sm ml-auto"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- intro ---------- */}
      {phase === 'intro' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center p-6">
          <button
            onClick={onExit}
            className="absolute top-3 left-3 z-40 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur text-sm font-semibold border border-white/20"
          >
            ← Exit
          </button>
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="absolute top-3 right-3 z-40 w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-lg"
          >
            ⚙
          </button>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-300 to-pink-400 bg-clip-text text-transparent">
            BUG BLASTER
          </h1>
          <p className="mt-4 max-w-md text-white/80">
            Shoot down the bugs, survive the waves, and defeat the project bosses to unlock{' '}
            {OWNER.name}&apos;s full skill set.
          </p>
          <p className="mt-2 text-sm text-white/60">
            Move your mouse or finger to steer. Your ship auto-fires.
          </p>
          <button
            onClick={startGame}
            className="mt-8 px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-lg shadow-lg"
          >
            ▶ START
          </button>
        </div>
      )}

      {/* ---------- win ---------- */}
      {phase === 'win' && (
        <EndScreen
          title="ALL SKILLS UNLOCKED"
          subtitle="You blasted every bug and defeated all the bosses!"
          accent="from-emerald-300 to-cyan-400"
          score={finalScore}
          nameInput={nameInput}
          setNameInput={setNameInput}
          submitted={submitted}
          onSubmit={() => handleSubmit(true)}
          refreshSignal={refreshSignal}
          onExit={onExit}
          onContact={onContact}
          onOpenSettings={onOpenSettings}
          retry={null}
        />
      )}

      {/* ---------- game over ---------- */}
      {phase === 'over' && (
        <EndScreen
          title="YOU GOT HACKED"
          subtitle="The bugs broke through. Patch up and try again."
          accent="from-pink-400 to-red-500"
          score={finalScore}
          nameInput={nameInput}
          setNameInput={setNameInput}
          submitted={submitted}
          onSubmit={() => handleSubmit(false)}
          refreshSignal={refreshSignal}
          onExit={onExit}
          onContact={onContact}
          onOpenSettings={onOpenSettings}
          retry={startGame}
        />
      )}

      {/* paused overlay */}
      {paused && phase === 'playing' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-3xl font-black tracking-widest">PAUSED</div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// shared end screen
// ---------------------------------------------------------------------------
function EndScreen({
  title,
  subtitle,
  accent,
  score,
  nameInput,
  setNameInput,
  submitted,
  onSubmit,
  refreshSignal,
  onExit,
  onContact,
  onOpenSettings,
  retry,
}) {
  return (
    <div className="absolute inset-0 z-30 overflow-y-auto bg-black/80 backdrop-blur-sm p-6">
      <button
        onClick={onExit}
        className="absolute top-3 left-3 z-40 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur text-sm font-semibold border border-white/20"
      >
        ← Exit
      </button>
      <button
        onClick={onOpenSettings}
        aria-label="Settings"
        className="absolute top-3 right-3 z-40 w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-lg"
      >
        ⚙
      </button>

      <div className="max-w-lg mx-auto text-center pt-12">
        <h1
          className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${accent} bg-clip-text text-transparent`}
        >
          {title}
        </h1>
        <p className="mt-3 text-white/75">{subtitle}</p>
        <div className="mt-6 inline-block px-6 py-3 rounded-xl bg-white/10 border border-white/15">
          <span className="text-xs text-white/60">FINAL SCORE</span>
          <div className="font-mono font-black text-3xl">{score}</div>
        </div>

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
            onClick={onSubmit}
            disabled={submitted}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold disabled:opacity-50"
          >
            {submitted ? 'Submitted ✓' : 'Submit Score'}
          </button>
        </div>

        {/* actions */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {retry && (
            <button
              onClick={retry}
              className="px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-400 font-bold"
            >
              ↻ Retry
            </button>
          )}
          <button
            onClick={onContact}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold"
          >
            Contact Charlie
          </button>
          <button
            onClick={onExit}
            className="px-6 py-3 rounded-xl bg-white/15 hover:bg-white/25 font-bold"
          >
            View Portfolio
          </button>
        </div>

        {/* leaderboard */}
        <div className="mt-8 text-left">
          <Leaderboard limit={10} game="blaster" refreshSignal={refreshSignal} highlightName={nameInput} />
        </div>
      </div>
    </div>
  )
}
