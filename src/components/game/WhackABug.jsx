import { useState, useEffect, useRef, useCallback, useMemo, Component } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import AudioManager from './AudioManager'
import Leaderboard from './Leaderboard'
import { getAvatar, makeSprite } from '../../lib/avatar'
import { SKILLS, PROJECTS, OWNER } from '../../data/gameData'
import { getPlayerName } from '../../lib/gameStorage'
import { submitScore } from '../../lib/supabase'

const ROUND_SECONDS = 60
const BOSS_SCORE = 100
const GOLDEN_INTERVAL = 15000 // ms

const SKILL_LIST = Array.isArray(SKILLS) && SKILLS.length ? SKILLS : ['JavaScript', 'React', 'Node', 'CSS', 'Python']

function rand(min, max) {
  return min + Math.random() * (max - min)
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ---------- 3D background ----------
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

function makeWordTexture(word, color) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, 256, 128)
    ctx.font = 'bold 72px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 12
    ctx.strokeStyle = 'rgba(0,0,0,0.85)'
    ctx.strokeText(word, 128, 64)
    ctx.fillStyle = color
    ctx.fillText(word, 128, 64)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function ComicWord({ word, color, position, scale, speed, phase }) {
  const ref = useRef()
  const baseY = position[1]
  const tex = useMemo(() => makeWordTexture(word, color), [word, color])
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime
      ref.current.position.y = baseY + Math.sin(t * speed + phase) * 0.8
      ref.current.material.rotation = Math.sin(t * speed * 0.5 + phase) * 0.12
    }
  })
  return (
    <sprite ref={ref} position={position} scale={[scale, scale * 0.5, 1]}>
      <spriteMaterial map={tex} transparent depthWrite={false} />
    </sprite>
  )
}

const COMIC_WORDS = [
  { word: 'POW', color: '#fbbf24', position: [-4, 2, 0], scale: 3, speed: 0.9, phase: 0 },
  { word: 'BAM', color: '#f472b6', position: [4, 1, -2], scale: 2.4, speed: 1.2, phase: 1.5 },
  { word: 'ZAP', color: '#22d3ee', position: [-3, -2, -1], scale: 2, speed: 1.5, phase: 3 },
  { word: 'WHACK', color: '#a78bfa', position: [3, -2.5, 0], scale: 3.4, speed: 0.7, phase: 2 },
  { word: 'POW', color: '#4ade80', position: [0, 3, -3], scale: 1.8, speed: 1.1, phase: 4.2 },
]

function Background() {
  const fallback = (
    <div
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ background: 'radial-gradient(circle at 50% 40%, #11183a 0%, #05060f 70%)' }}
    />
  )
  return (
    <SceneBoundary fallback={fallback}>
      <div className="absolute inset-0 z-0 pointer-events-none bg-[#05060f]">
        <Canvas camera={{ position: [0, 0, 9], fov: 60 }}>
          {COMIC_WORDS.map((w, i) => (
            <ComicWord key={i} {...w} />
          ))}
        </Canvas>
      </div>
    </SceneBoundary>
  )
}

// ---------- avatar badge ----------
function AvatarBadge() {
  const ref = useRef(null)
  useEffect(() => {
    try {
      const cfg = getAvatar()
      if (!cfg || !ref.current) return
      const sprite = makeSprite(cfg, 48)
      if (!sprite) return
      const ctx = ref.current.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, 48, 48)
      ctx.drawImage(sprite, 0, 0, 48, 48)
    } catch (e) {
      /* guard null */
    }
  }, [])
  return <canvas ref={ref} width={48} height={48} className="w-12 h-12 rounded-lg bg-black/40 border border-white/20" />
}

// ---------- main component ----------
let BUG_ID = 0

export default function WhackABug({ onExit, onContact, onOpenSettings, paused }) {
  const [started, setStarted] = useState(false)
  const [ended, setEnded] = useState(false)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => {
    const v = parseInt(localStorage.getItem('arcade_best_whack') || '0', 10)
    return isNaN(v) ? 0 : v
  })
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [whacked, setWhacked] = useState(0)
  const [missed, setMissed] = useState(0)
  const [skillsWhacked, setSkillsWhacked] = useState([])

  // bugs keyed by hole index 0..8 -> { id, skill, golden, squished }
  const [bugs, setBugs] = useState({})
  // boss: { hits, max } occupying a 2x2 block, anchor cell index
  const [boss, setBoss] = useState(null)

  const [toast, setToast] = useState(null) // { id, text }
  const [projectPopup, setProjectPopup] = useState(null)

  const [nameInput, setNameInput] = useState(() => getPlayerName() || '')
  const [submitted, setSubmitted] = useState(false)
  const [refreshSignal, setRefreshSignal] = useState(0)

  const pausedRef = useRef(paused)
  const endedRef = useRef(false)
  const projIdxRef = useRef(0)
  const bossSpawnedRef = useRef(false)
  const bugTimersRef = useRef({}) // hole -> timeout id

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  // music lifecycle
  useEffect(() => {
    return () => {
      try {
        AudioManager.stopMusic()
      } catch (e) {}
      Object.values(bugTimersRef.current).forEach((t) => clearTimeout(t))
    }
  }, [])

  // persist best
  useEffect(() => {
    if (score > best) {
      setBest(score)
      try {
        localStorage.setItem('arcade_best_whack', String(score))
      } catch (e) {}
    }
  }, [score, best])

  const showToast = useCallback((text) => {
    const id = ++BUG_ID
    setToast({ id, text })
    setTimeout(() => setToast((t) => (t && t.id === id ? null : t)), 1000)
  }, [])

  // retreat a bug unhit -> counts as missed (only if it was never squished)
  const retreatBug = useCallback((hole) => {
    setBugs((prev) => {
      const b = prev[hole]
      if (!b) return prev
      const next = { ...prev }
      delete next[hole]
      if (!b.squished && !b.golden) {
        setMissed((m) => m + 1)
      }
      return next
    })
    delete bugTimersRef.current[hole]
  }, [])

  // ---------- spawn loop ----------
  useEffect(() => {
    if (!started || ended) return
    let stop = false
    const tick = () => {
      if (stop) return
      const delay = rand(550, 950)
      const id = setTimeout(() => {
        if (!pausedRef.current && !endedRef.current) {
          spawnBug()
        }
        tick()
      }, delay)
      bugTimersRef.current.__spawn = id
    }
    tick()
    return () => {
      stop = true
      clearTimeout(bugTimersRef.current.__spawn)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, ended])

  const spawnBug = useCallback(() => {
    setBugs((prev) => {
      // collect cells occupied by boss
      const blocked = new Set()
      if (boss) {
        const a = boss.anchor
        const r = Math.floor(a / 3)
        const c = a % 3
        ;[
          [r, c],
          [r, c + 1],
          [r + 1, c],
          [r + 1, c + 1],
        ].forEach(([rr, cc]) => blocked.add(rr * 3 + cc))
      }
      const free = []
      for (let i = 0; i < 9; i++) {
        if (!prev[i] && !blocked.has(i)) free.push(i)
      }
      if (free.length === 0) return prev
      const hole = pick(free)
      const skill = pick(SKILL_LIST)
      const id = ++BUG_ID
      const next = { ...prev, [hole]: { id, skill, golden: false, squished: false } }
      const life = rand(800, 1200)
      bugTimersRef.current[hole] = setTimeout(() => retreatBug(hole), life)
      return next
    })
  }, [boss, retreatBug])

  // ---------- golden bug loop ----------
  useEffect(() => {
    if (!started || ended) return
    const iv = setInterval(() => {
      if (pausedRef.current || endedRef.current) return
      setBugs((prev) => {
        const blocked = new Set()
        if (boss) {
          const a = boss.anchor
          const r = Math.floor(a / 3)
          const c = a % 3
          ;[a, r * 3 + c + 1, (r + 1) * 3 + c, (r + 1) * 3 + c + 1].forEach((x) => blocked.add(x))
        }
        const free = []
        for (let i = 0; i < 9; i++) if (!prev[i] && !blocked.has(i)) free.push(i)
        if (free.length === 0) return prev
        const hole = pick(free)
        const id = ++BUG_ID
        const next = { ...prev, [hole]: { id, skill: 'GOLD', golden: true, squished: false } }
        if (bugTimersRef.current[hole]) clearTimeout(bugTimersRef.current[hole])
        bugTimersRef.current[hole] = setTimeout(() => retreatBug(hole), 500)
        return next
      })
    }, GOLDEN_INTERVAL)
    return () => clearInterval(iv)
  }, [started, ended, boss, retreatBug])

  // ---------- boss spawn when score reaches threshold ----------
  useEffect(() => {
    if (!started || ended) return
    if (score >= BOSS_SCORE && !bossSpawnedRef.current && !boss) {
      bossSpawnedRef.current = true
      // anchors that allow a 2x2 block: rows 0-1, cols 0-1
      const anchors = [0, 1, 3, 4]
      const anchor = pick(anchors)
      setBoss({ anchor, hits: 0, max: 3, id: ++BUG_ID })
      try {
        AudioManager.playSFX('powerup')
      } catch (e) {}
    }
  }, [score, started, ended, boss])

  // ---------- countdown ----------
  useEffect(() => {
    if (!started || ended) return
    const iv = setInterval(() => {
      if (pausedRef.current) return
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(iv)
          endRound()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, ended])

  const endRound = useCallback(() => {
    if (endedRef.current) return
    endedRef.current = true
    setEnded(true)
    setBugs({})
    setBoss(null)
    Object.values(bugTimersRef.current).forEach((t) => clearTimeout(t))
    bugTimersRef.current = {}
    try {
      AudioManager.playSFX('victory')
    } catch (e) {}
    try {
      AudioManager.stopMusic()
    } catch (e) {}
  }, [])

  // ---------- whack a normal/golden bug ----------
  const whackBug = useCallback(
    (hole) => {
      if (pausedRef.current || ended) return
      const b = bugs[hole]
      if (!b || b.squished) return

      if (bugTimersRef.current[hole]) {
        clearTimeout(bugTimersRef.current[hole])
        delete bugTimersRef.current[hole]
      }

      if (b.golden) {
        setScore((s) => s + 50)
        try {
          AudioManager.playSFX('clear')
        } catch (e) {}
        if (PROJECTS && PROJECTS.length) {
          const proj = PROJECTS[projIdxRef.current % PROJECTS.length]
          projIdxRef.current += 1
          setProjectPopup(proj)
        }
        setBugs((prev) => {
          const next = { ...prev }
          delete next[hole]
          return next
        })
        return
      }

      // normal bug
      setBugs((prev) => {
        const cur = prev[hole]
        if (!cur) return prev
        return { ...prev, [hole]: { ...cur, squished: true } }
      })
      setScore((s) => s + 10)
      setWhacked((w) => w + 1)
      setSkillsWhacked((arr) => (arr.includes(b.skill) ? arr : [...arr, b.skill]))
      showToast(`Bug squashed! Skill: ${b.skill}`)
      try {
        AudioManager.playSFX('squash')
      } catch (e) {}
      // remove after squish animation
      setTimeout(() => {
        setBugs((prev) => {
          const next = { ...prev }
          delete next[hole]
          return next
        })
      }, 220)
    },
    [bugs, ended, showToast]
  )

  // ---------- hit the boss ----------
  const hitBoss = useCallback(() => {
    if (pausedRef.current || ended || !boss) return
    try {
      AudioManager.playSFX('hit')
    } catch (e) {}
    setBoss((prev) => {
      if (!prev) return prev
      const hits = prev.hits + 1
      if (hits >= prev.max) {
        setScore((s) => s + 100)
        try {
          AudioManager.playSFX('powerup')
        } catch (e) {}
        return null
      }
      return { ...prev, hits }
    })
  }, [boss, ended])

  // ---------- start ----------
  const start = useCallback(() => {
    try {
      AudioManager.init()
    } catch (e) {}
    try {
      AudioManager.playMusic('arcade')
    } catch (e) {}
    setStarted(true)
  }, [])

  // ---------- play again ----------
  const reset = useCallback(() => {
    Object.values(bugTimersRef.current).forEach((t) => clearTimeout(t))
    bugTimersRef.current = {}
    endedRef.current = false
    bossSpawnedRef.current = false
    projIdxRef.current = 0
    setScore(0)
    setTimeLeft(ROUND_SECONDS)
    setWhacked(0)
    setMissed(0)
    setSkillsWhacked([])
    setBugs({})
    setBoss(null)
    setToast(null)
    setProjectPopup(null)
    setSubmitted(false)
    setEnded(false)
    setStarted(true)
    try {
      AudioManager.init()
    } catch (e) {}
    try {
      AudioManager.playMusic('arcade')
    } catch (e) {}
  }, [])

  const accuracy = useMemo(() => {
    const total = whacked + missed
    if (total === 0) return 0
    return Math.round((whacked / total) * 100)
  }, [whacked, missed])

  const handleSubmit = useCallback(async () => {
    const player_name = (nameInput || 'Player').trim().slice(0, 24) || 'Player'
    try {
      await submitScore({ player_name, score, time_seconds: ROUND_SECONDS, boss_defeated: false, game: 'whack' })
    } catch (e) {}
    setSubmitted(true)
    setRefreshSignal((n) => n + 1)
  }, [nameInput, score])

  const ownerFirst = OWNER && OWNER.name ? OWNER.name.split(' ')[0] : 'Charlie'

  // boss block geometry for rendering
  const bossCells = useMemo(() => {
    if (!boss) return null
    const a = boss.anchor
    const r = Math.floor(a / 3)
    const c = a % 3
    return new Set([r * 3 + c, r * 3 + c + 1, (r + 1) * 3 + c, (r + 1) * 3 + c + 1])
  }, [boss])

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-black select-none" style={{ touchAction: 'manipulation' }}>
      <Background />

      {/* top controls */}
      <button
        onClick={onExit}
        className="absolute top-4 left-4 z-40 px-3 py-1.5 rounded-lg bg-black/60 border border-white/20 text-white text-sm font-semibold hover:bg-black/80"
      >
        ✕ Exit
      </button>
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        <AvatarBadge />
        <button
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-lg bg-black/60 border border-white/20 text-white text-lg hover:bg-black/80 flex items-center justify-center"
          aria-label="Settings"
        >
          ⚙
        </button>
      </div>

      {/* HUD */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 text-white text-center pointer-events-none">
        <div className="text-3xl font-black tabular-nums drop-shadow">{score}</div>
        <div className="text-xs text-white/60">Best {best}</div>
        <div className="mt-1 text-lg font-bold tabular-nums">
          ⏱ <span className={timeLeft <= 10 ? 'text-red-400' : 'text-cyan-300'}>{timeLeft}s</span>
        </div>
      </div>

      {/* grid */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-3 pt-32 pb-6">
        <div
          className="grid w-full"
          style={{
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
            gap: 'clamp(8px, 3vw, 20px)',
            width: 'min(94vw, 70vh, 540px)',
            height: 'min(94vw, 70vh, 540px)',
          }}
        >
          {Array.from({ length: 9 }).map((_, hole) => {
            const bug = bugs[hole]
            const isBossCell = bossCells && bossCells.has(hole)
            const isBossAnchor = boss && boss.anchor === hole
            return (
              <div
                key={hole}
                onClick={() => {
                  if (isBossCell) hitBoss()
                  else if (bug) whackBug(hole)
                }}
                className="relative rounded-full flex items-center justify-center cursor-pointer"
                style={{
                  background:
                    'radial-gradient(circle at 50% 35%, #1c1c34 0%, #0a0a18 60%, #060610 100%)',
                  border: '2px solid rgba(255,255,255,0.08)',
                  boxShadow: 'inset 0 8px 18px rgba(0,0,0,0.7)',
                  overflow: 'visible',
                }}
              >
                {/* normal / golden bug */}
                {bug && !isBossCell && (
                  <div
                    className={`select-none flex flex-col items-center justify-center ${
                      bug.squished ? 'wab-squish' : 'wab-pop'
                    }`}
                    style={{ pointerEvents: 'none' }}
                  >
                    <span
                      className="leading-none"
                      style={{ fontSize: 'clamp(28px, 9vw, 56px)', filter: bug.golden ? 'drop-shadow(0 0 8px gold)' : 'none' }}
                    >
                      {bug.golden ? '🐝' : '🐛'}
                    </span>
                    {bug.golden ? (
                      <span className="mt-1 text-[10px] font-black text-yellow-300 drop-shadow">GOLD!</span>
                    ) : (
                      <span
                        className="mt-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] sm:text-[11px] font-bold text-cyan-200 max-w-[90%] truncate"
                        style={{ maxWidth: '95%' }}
                      >
                        {bug.skill}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* boss overlay spanning 2x2 */}
          {boss && (
            <div
              onClick={hitBoss}
              className="absolute z-10 flex flex-col items-center justify-center cursor-pointer wab-pop"
              style={{
                left: `${(boss.anchor % 3) * (100 / 3)}%`,
                top: `${Math.floor(boss.anchor / 3) * (100 / 3)}%`,
                width: `calc(${200 / 3}% )`,
                height: `calc(${200 / 3}% )`,
              }}
            >
              <div
                className="relative rounded-3xl w-[88%] h-[88%] flex flex-col items-center justify-center"
                style={{
                  background: 'radial-gradient(circle at 50% 40%, #4c1d95 0%, #1e1b4b 70%)',
                  border: '3px solid rgba(167,139,250,0.6)',
                  boxShadow: '0 0 30px rgba(167,139,250,0.5)',
                }}
              >
                <span style={{ fontSize: 'clamp(48px, 16vw, 110px)' }} className="leading-none">
                  🪲
                </span>
                <div className="mt-1 text-xs font-black text-fuchsia-200">BOSS BUG</div>
                <div className="mt-1 flex gap-1">
                  {Array.from({ length: boss.max }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-3 h-3 rounded-full ${i < boss.hits ? 'bg-red-500' : 'bg-white/30'}`}
                    />
                  ))}
                </div>
                <div className="text-[10px] text-white/60 mt-1">{boss.max - boss.hits} hits left</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* toast */}
      {toast && (
        <div key={toast.id} className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none wab-toast">
          <div className="bg-green-500 text-black font-bold text-sm px-4 py-2 rounded-full shadow-xl whitespace-nowrap">
            {toast.text}
          </div>
        </div>
      )}

      {/* project popup (from golden bug) */}
      {projectPopup && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-[#0d0d20] border border-yellow-400/40 rounded-2xl p-5 shadow-2xl">
            <div className="text-yellow-300 text-xs font-bold tracking-wide uppercase">Golden bug! Project unlocked</div>
            <div className="text-white text-lg font-bold mt-1">{projectPopup.title}</div>
            <p className="text-white/60 text-xs mt-2 line-clamp-3">{projectPopup.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(projectPopup.technologies || []).map((t) => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                  {t}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4">
              {projectPopup.liveUrl ? (
                <a
                  href={projectPopup.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-yellow-300 hover:text-yellow-200"
                >
                  Visit →
                </a>
              ) : (
                <span className="text-sm text-white/40">Private</span>
              )}
              <button
                onClick={() => setProjectPopup(null)}
                className="text-xs px-3 py-1 rounded-lg bg-white/10 text-white hover:bg-white/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* START overlay */}
      {!started && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center p-4 bg-black/85">
          <div className="max-w-md w-full bg-[#0d0d20] border border-white/15 rounded-2xl p-7 text-center">
            <h1 className="text-3xl font-black text-white">🐛 Whack-A-Bug</h1>
            <p className="text-white/60 text-sm mt-3">
              Squash bugs popping out of the holes before they retreat! Each bug is a skill. Catch the rare
              <span className="text-yellow-300 font-bold"> golden bug 🐝</span> for a project bonus, and beat the
              <span className="text-fuchsia-300 font-bold"> boss bug 🪲</span> at 100 points.
            </p>
            <p className="text-white/40 text-xs mt-3">60 seconds. Tap fast. Best: {best}</p>
            <button
              onClick={start}
              className="mt-6 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-extrabold text-lg hover:opacity-90"
            >
              ▶ Start
            </button>
          </div>
        </div>
      )}

      {/* PAUSED overlay */}
      {started && !ended && paused && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/70 pointer-events-none">
          <div className="text-white text-3xl font-black">⏸ Paused</div>
        </div>
      )}

      {/* END screen */}
      {ended && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 overflow-y-auto">
          <div className="max-w-md w-full bg-[#0d0d20] border border-white/15 rounded-2xl p-6 my-6">
            <h2 className="text-2xl font-extrabold text-white text-center">⏰ TIME UP</h2>
            <div className="text-center mt-2">
              <div className="text-4xl font-black text-cyan-300 tabular-nums">{score}</div>
              <div className="text-white/60 text-sm mt-1">
                Accuracy: <span className="text-white font-bold">{accuracy}%</span> ({whacked} hit / {missed} missed)
              </div>
            </div>

            {skillsWhacked.length > 0 && (
              <div className="mt-4">
                <div className="text-xs text-white/50 mb-1">Skills whacked:</div>
                <div className="flex flex-wrap gap-1.5">
                  {skillsWhacked.map((s) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!submitted ? (
              <div className="mt-4 flex gap-2">
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Your name"
                  maxLength={24}
                  className="flex-1 px-3 py-2 rounded-lg bg-black/50 border border-white/20 text-white text-sm outline-none focus:border-cyan-400"
                />
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-bold text-sm hover:bg-cyan-400"
                >
                  Submit
                </button>
              </div>
            ) : (
              <div className="mt-4 text-center text-green-400 text-sm font-semibold">Score submitted!</div>
            )}

            <div className="mt-4">
              <Leaderboard limit={5} game="whack" refreshSignal={refreshSignal} highlightName={nameInput} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-bold text-sm hover:bg-cyan-400"
              >
                Play Again
              </button>
              <button
                onClick={onExit}
                className="px-4 py-2 rounded-lg bg-white/10 text-white font-semibold text-sm hover:bg-white/20"
              >
                🏠 Lobby
              </button>
              <button
                onClick={onContact}
                className="col-span-2 px-4 py-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-bold text-sm hover:opacity-90"
              >
                📬 Contact {ownerFirst}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes wabPop {
          0% { transform: translateY(60%) scale(0.4); opacity: 0; }
          60% { transform: translateY(-6%) scale(1.05); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .wab-pop { animation: wabPop 0.18s ease-out forwards; }
        @keyframes wabSquish {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.2) translateY(30%); opacity: 0; }
        }
        .wab-squish { animation: wabSquish 0.2s ease-in forwards; }
        @keyframes wabToast {
          0% { transform: translate(-50%, 20px) scale(0.8); opacity: 0; }
          15% { transform: translate(-50%, 0) scale(1); opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translate(-50%, -10px); opacity: 0; }
        }
        .wab-toast { animation: wabToast 1s ease-out forwards; }
      `}</style>
    </div>
  )
}
