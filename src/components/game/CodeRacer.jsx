// ============================================================================
// CodeRacer — a typing-race game with a Three.js floating-code-symbols backdrop.
// Type 6 real-world code snippets; each completed round unlocks a "skill".
// ============================================================================
import { Component, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import AudioManager from './AudioManager'
import Leaderboard from './Leaderboard'
import { getAvatar, makeSprite, setUnlock } from '../../lib/avatar'
import { OWNER } from '../../data/gameData'
import { getPlayerName } from '../../lib/gameStorage'
import { submitScore } from '../../lib/supabase'

// ---------------------------------------------------------------------------
// Snippets — 6 authentic patterns, one per round.
// ---------------------------------------------------------------------------
const SNIPPETS = [
  {
    tech: 'Go',
    label: 'POS System — Go HTTP API',
    code: `func (s *Server) handleOrder(w http.ResponseWriter, r *http.Request) {
  var req OrderRequest
  if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
    http.Error(w, "bad request", http.StatusBadRequest)
    return
  }
  order, err := s.store.CreateOrder(r.Context(), req)
  if err != nil {
    http.Error(w, err.Error(), http.StatusInternalServerError)
    return
  }
  w.Header().Set("Content-Type", "application/json")
  json.NewEncoder(w).Encode(order)
}`,
  },
  {
    tech: 'Python',
    label: 'Booking API — FastAPI + Pydantic',
    code: `class Booking(BaseModel):
    guest_name: str
    room_id: int
    nights: int

@router.post("/bookings", response_model=BookingOut)
async def create_booking(payload: Booking, db: AsyncSession = Depends(get_db)):
    room = await db.get(Room, payload.room_id)
    if room is None:
        raise HTTPException(status_code=404, detail="room not found")
    booking = await crud.add_booking(db, payload)
    await db.commit()
    return booking`,
  },
  {
    tech: 'React',
    label: 'Dashboard — React Hooks',
    code: `function useCounter(initial = 0) {
  const [count, setCount] = useState(initial)
  const increment = useCallback(() => setCount((c) => c + 1), [])
  const reset = useCallback(() => setCount(initial), [initial])
  return { count, increment, reset }
}

export default function Widget() {
  const { count, increment, reset } = useCounter()
  useEffect(() => { document.title = "Count: " + count }, [count])
  return <button onClick={increment}>Clicked {count}</button>
}`,
  },
  {
    tech: 'SQL',
    label: 'Analytics — SQL Report Query',
    code: `SELECT
  c.name AS customer,
  COUNT(o.id) AS orders,
  SUM(o.total) AS revenue
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.created_at >= '2026-01-01'
GROUP BY c.id, c.name
HAVING SUM(o.total) > 1000
ORDER BY revenue DESC
LIMIT 20;`,
  },
  {
    tech: 'Docker',
    label: 'Infra — docker-compose.yml',
    code: `services:
  api:
    build: ./api
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgres://app:secret@db:5432/app
    depends_on:
      - db
  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:`,
  },
  {
    tech: '.NET',
    label: 'Billing Service — C# Controller',
    code: `[ApiController]
[Route("api/invoices")]
public class InvoiceController : ControllerBase
{
    private readonly IInvoiceService _service;

    public InvoiceController(IInvoiceService service) => _service = service;

    [HttpGet("{id}")]
    public async Task<ActionResult<Invoice>> Get(int id)
    {
        var invoice = await _service.FindAsync(id);
        if (invoice is null) return NotFound();
        return Ok(invoice);
    }
}`,
  },
]

// ---------------------------------------------------------------------------
// SceneBoundary — keeps a failed WebGL context from crashing the game.
// ---------------------------------------------------------------------------
class SceneBoundary extends Component {
  constructor(p) { super(p); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() {}
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

// ---------------------------------------------------------------------------
// FloatingSymbol — one drifting code glyph rendered as a sprite.
// ---------------------------------------------------------------------------
const GLYPHS = ['</>', '{}', '()', '=>', ';', '=', '[]']

function makeGlyphTexture(glyph) {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, size, size)
  ctx.font = 'bold 56px ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(34,211,238,0.9)'
  ctx.shadowBlur = 18
  ctx.fillStyle = '#7ee7ff'
  ctx.fillText(glyph, size / 2, size / 2)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function FloatingSymbol({ texture, startX, startY, speed, drift, rotSpeed, scale }) {
  const ref = useRef()
  const phase = useRef(Math.random() * Math.PI * 2)

  useFrame((state, delta) => {
    const s = ref.current
    if (!s) return
    const d = Math.min(delta, 0.05)
    s.position.y += speed * d
    phase.current += d
    s.position.x = startX + Math.sin(phase.current * drift) * 0.6
    s.material.rotation += rotSpeed * d
    if (s.position.y > 7) {
      s.position.y = -7
      s.position.x = startX
    }
  })

  return (
    <sprite ref={ref} position={[startX, startY, -2]} scale={[scale, scale, scale]}>
      <spriteMaterial
        map={texture}
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  )
}

function SymbolField() {
  const textures = useMemo(() => GLYPHS.map((g) => makeGlyphTexture(g)), [])
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures])

  const symbols = useMemo(() => {
    const arr = []
    for (let i = 0; i < 18; i++) {
      arr.push({
        id: i,
        texture: textures[i % textures.length],
        startX: (Math.random() - 0.5) * 11,
        startY: (Math.random() - 0.5) * 14,
        speed: 0.5 + Math.random() * 0.8,
        drift: 0.4 + Math.random() * 0.8,
        rotSpeed: (Math.random() - 0.5) * 0.6,
        scale: 0.8 + Math.random() * 0.9,
      })
    }
    return arr
  }, [textures])

  return (
    <>
      {symbols.map((s) => (
        <FloatingSymbol key={s.id} {...s} />
      ))}
    </>
  )
}

function Background() {
  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none bg-[#05060f]"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 40%, rgba(34,211,238,0.10), rgba(5,6,15,0) 60%)',
      }}
    >
      <SceneBoundary fallback={null}>
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]} gl={{ alpha: true }}>
          <SymbolField />
        </Canvas>
      </SceneBoundary>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AvatarBadge — draws the player's avatar into a 48px canvas.
// ---------------------------------------------------------------------------
function AvatarBadge() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      const sprite = makeSprite(getAvatar(), 48)
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, 48, 48)
      if (sprite) ctx.drawImage(sprite, 0, 0, 48, 48)
    } catch {}
  }, [])
  return (
    <canvas
      ref={canvasRef}
      width={48}
      height={48}
      className="w-10 h-10 rounded-lg bg-black/40 border border-cyan-400/30"
    />
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function computeStats(snippet, typed, elapsedMs) {
  let correct = 0
  const n = Math.min(typed.length, snippet.length)
  for (let i = 0; i < n; i++) {
    if (typed[i] === snippet[i]) correct++
  }
  const minutes = elapsedMs > 0 ? elapsedMs / 60000 : 0
  const wpm = minutes > 0 ? Math.max(0, Math.round((correct / 5) / minutes)) : 0
  const acc = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100
  const complete = typed.length === snippet.length && typed === snippet
  return { correct, wpm, acc, complete }
}

// Renders the snippet char-by-char with typed-state coloring.
function CodeDisplay({ snippet, typed }) {
  const chars = []
  for (let i = 0; i < snippet.length; i++) {
    const ch = snippet[i]
    let cls = 'text-slate-500'
    if (i < typed.length) {
      cls = typed[i] === ch ? 'text-emerald-400' : 'text-red-400 bg-red-500/25'
    } else if (i === typed.length) {
      cls = 'text-cyan-200 bg-cyan-400/30 rounded-[2px]'
    }
    const display = ch === '\n' ? '↵\n' : ch
    chars.push(
      <span key={i} className={cls}>
        {display}
      </span>
    )
  }
  return (
    <pre className="whitespace-pre-wrap break-words font-mono text-sm sm:text-base leading-relaxed m-0">
      {chars}
    </pre>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function CodeRacer({ onExit, onContact, onOpenSettings, paused }) {
  const [round, setRound] = useState(0) // 0..5 while playing, 6 = final
  const [typed, setTyped] = useState('')
  const [startTime, setStartTime] = useState(null)
  const [nowTick, setNowTick] = useState(0)
  const [roundDone, setRoundDone] = useState(false)
  const [finished, setFinished] = useState(false)

  const [results, setResults] = useState([]) // { tech, label, wpm, acc } per round
  const [name, setName] = useState(() => getPlayerName() || '')
  const [submitted, setSubmitted] = useState(false)
  const [refreshSignal, setRefreshSignal] = useState(0)

  const textareaRef = useRef(null)
  const pausedAccum = useRef(0) // ms accumulated while paused
  const pauseStart = useRef(null)

  const snippet = SNIPPETS[Math.min(round, SNIPPETS.length - 1)]

  // --- audio lifecycle ---
  useEffect(() => {
    try {
      AudioManager.init()
      AudioManager.playMusic('arcade')
    } catch {}
    return () => {
      try { AudioManager.stopMusic() } catch {}
    }
  }, [])

  // --- pause handling: freeze elapsed time ---
  useEffect(() => {
    if (paused) {
      pauseStart.current = Date.now()
    } else if (pauseStart.current != null) {
      pausedAccum.current += Date.now() - pauseStart.current
      pauseStart.current = null
    }
  }, [paused])

  // --- timer tick ---
  useEffect(() => {
    if (startTime == null || roundDone || finished) return
    const id = setInterval(() => {
      if (!paused) setNowTick(Date.now())
    }, 200)
    return () => clearInterval(id)
  }, [startTime, roundDone, finished, paused])

  const elapsedMs = useMemo(() => {
    if (startTime == null) return 0
    const ref = roundDone ? nowTick : Date.now()
    return Math.max(0, ref - startTime - pausedAccum.current)
  }, [startTime, nowTick, roundDone])

  const stats = useMemo(
    () => computeStats(snippet.code, typed, elapsedMs),
    [snippet.code, typed, elapsedMs]
  )

  // track previous correct count to play type/error SFX
  const prevTypedLen = useRef(0)
  const handleChange = useCallback(
    (e) => {
      if (paused || roundDone || finished) return
      const value = e.target.value
      // start timer on first keystroke
      if (startTime == null && value.length > 0) {
        setStartTime(Date.now())
        pausedAccum.current = 0
      }
      const code = snippet.code
      // SFX only when length grows (a new char was typed)
      if (value.length > prevTypedLen.current) {
        const idx = value.length - 1
        try {
          if (value[idx] === code[idx]) AudioManager.playSFX('type')
          else AudioManager.playSFX('error')
        } catch {}
      }
      prevTypedLen.current = value.length
      setTyped(value)

      // completion check
      if (value.length === code.length && value === code) {
        const finalMs = Math.max(0, Date.now() - (startTime ?? Date.now()) - pausedAccum.current)
        const fs = computeStats(code, value, finalMs)
        setRoundDone(true)
        setNowTick(Date.now())
        try { AudioManager.playSFX('victory') } catch {}
        setResults((r) => {
          const next = [...r]
          next[round] = { tech: snippet.tech, label: snippet.label, wpm: fs.wpm, acc: fs.acc }
          return next
        })
      }
    },
    [paused, roundDone, finished, startTime, snippet, round]
  )

  const goNext = useCallback(() => {
    if (round + 1 >= SNIPPETS.length) {
      // finished all 6 rounds
      try { setUnlock('halo') } catch {}
      setFinished(true)
      return
    }
    setRound((r) => r + 1)
    setTyped('')
    setStartTime(null)
    setNowTick(0)
    pausedAccum.current = 0
    pauseStart.current = null
    prevTypedLen.current = 0
    setRoundDone(false)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }, [round])

  // focus textarea on round change
  useEffect(() => {
    if (!roundDone && !finished) {
      setTimeout(() => textareaRef.current?.focus(), 0)
    }
  }, [round, roundDone, finished])

  const bestWpm = useMemo(() => {
    const vals = results.filter(Boolean).map((r) => r.wpm)
    return vals.length ? Math.max(...vals) : 0
  }, [results])

  const handleSubmit = useCallback(async () => {
    const player = (name || 'Player').trim().slice(0, 24) || 'Player'
    try {
      await submitScore({
        player_name: player,
        score: bestWpm,
        time_seconds: 0,
        boss_defeated: false,
        game: 'racer',
      })
    } catch {}
    setSubmitted(true)
    setRefreshSignal((n) => n + 1)
  }, [name, bestWpm])

  const seconds = Math.floor(elapsedMs / 1000)
  const timeStr = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

  // -------------------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-black text-white font-sans">
      <Background />

      {/* ---------------- HUD ---------------- */}
      <button
        onClick={onExit}
        className="absolute top-3 left-3 z-40 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-sm font-semibold backdrop-blur"
      >
        ← Exit
      </button>

      <button
        onClick={onOpenSettings}
        aria-label="Settings"
        className="absolute top-3 right-3 z-40 w-9 h-9 grid place-items-center rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-lg backdrop-blur"
      >
        ⚙
      </button>

      {/* live stats top-left (below exit) */}
      <div className="absolute top-14 left-3 z-20 flex gap-2 text-xs sm:text-sm">
        <div className="px-2.5 py-1 rounded-md bg-black/50 border border-cyan-400/30 backdrop-blur">
          <span className="text-cyan-300 font-bold">{stats.wpm}</span>
          <span className="text-slate-400"> WPM</span>
        </div>
        <div className="px-2.5 py-1 rounded-md bg-black/50 border border-white/10 backdrop-blur">
          <span className="text-emerald-300 font-mono">{timeStr}</span>
        </div>
        <div className="px-2.5 py-1 rounded-md bg-black/50 border border-white/10 backdrop-blur">
          <span className="text-amber-300 font-bold">{stats.acc}%</span>
          <span className="text-slate-400"> acc</span>
        </div>
      </div>

      {/* round counter top-center */}
      {!finished && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-black/50 border border-white/10 text-sm font-bold backdrop-blur">
          Round {Math.min(round + 1, SNIPPETS.length)}/{SNIPPETS.length}
        </div>
      )}

      {/* avatar badge top-right (left of gear) */}
      <div className="absolute top-3 right-14 z-20">
        <AvatarBadge />
      </div>

      {/* ---------------- Centered panel ---------------- */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-3 pt-24 pb-6 overflow-y-auto">
        {finished ? (
          <FinalScreen
            results={results}
            bestWpm={bestWpm}
            name={name}
            setName={setName}
            submitted={submitted}
            onSubmit={handleSubmit}
            onContact={onContact}
            onExit={onExit}
            refreshSignal={refreshSignal}
          />
        ) : roundDone ? (
          <RoundComplete
            tech={snippet.tech}
            label={snippet.label}
            wpm={results[round]?.wpm ?? stats.wpm}
            acc={results[round]?.acc ?? stats.acc}
            isLast={round + 1 >= SNIPPETS.length}
            onNext={goNext}
          />
        ) : (
          <div className="w-full max-w-3xl">
            <div className="mb-2 text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-200 text-xs sm:text-sm font-semibold">
                {snippet.label}
              </span>
            </div>

            {/* code-to-type display */}
            <div className="rounded-xl border border-white/10 bg-slate-950/80 backdrop-blur p-4 max-h-[42vh] overflow-y-auto shadow-2xl">
              <CodeDisplay snippet={snippet.code} typed={typed} />
            </div>

            {/* typing input — same controlled textarea on desktop + mobile */}
            <textarea
              ref={textareaRef}
              value={typed}
              onChange={handleChange}
              disabled={paused}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              placeholder="Start typing the code above…"
              className="mt-3 w-full h-28 sm:h-32 rounded-xl border border-cyan-400/30 bg-black/60 backdrop-blur p-3 font-mono text-sm text-cyan-100 outline-none focus:border-cyan-400 resize-none"
            />
            <p className="mt-1 text-center text-xs text-slate-500">
              {paused ? 'Paused' : 'Match the snippet exactly. Newlines count.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// RoundComplete card
// ---------------------------------------------------------------------------
function RoundComplete({ tech, label, wpm, acc, isLast, onNext }) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-cyan-400/30 bg-slate-950/90 backdrop-blur p-6 text-center shadow-2xl">
      <div className="text-cyan-300 text-sm font-semibold tracking-wide uppercase">
        Round Complete
      </div>
      <div className="mt-4 flex justify-center gap-6">
        <div>
          <div className="text-4xl font-black text-cyan-300">{wpm}</div>
          <div className="text-xs text-slate-400">WPM</div>
        </div>
        <div>
          <div className="text-4xl font-black text-amber-300">{acc}%</div>
          <div className="text-xs text-slate-400">accuracy</div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-4">
        <div className="text-xs text-emerald-300 font-semibold uppercase tracking-wide">
          Skill Unlocked
        </div>
        <div className="text-2xl font-bold text-white mt-1">{tech}</div>
        <div className="text-xs text-slate-400 mt-0.5">{label}</div>
      </div>

      <button
        onClick={onNext}
        className="mt-6 w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition"
      >
        {isLast ? 'See Results →' : 'Next Round →'}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// FinalScreen
// ---------------------------------------------------------------------------
function FinalScreen({
  results,
  bestWpm,
  name,
  setName,
  submitted,
  onSubmit,
  onContact,
  onExit,
  refreshSignal,
}) {
  return (
    <div className="w-full max-w-2xl rounded-2xl border border-cyan-400/30 bg-slate-950/90 backdrop-blur p-6 shadow-2xl">
      <h2 className="text-center text-2xl sm:text-3xl font-black text-cyan-300">
        Race Complete!
      </h2>
      <p className="text-center text-slate-300 mt-1">
        Best speed: <span className="text-cyan-200 font-bold">{bestWpm} WPM</span>
      </p>

      {/* unlocked tech grid */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {results.filter(Boolean).map((r, i) => (
          <div
            key={i}
            className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-center"
          >
            <div className="text-lg font-bold text-white">{r.tech}</div>
            <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{r.label}</div>
            <div className="text-xs text-cyan-300 mt-1">{r.wpm} WPM · {r.acc}%</div>
          </div>
        ))}
      </div>

      <p className="text-center text-slate-300 mt-5 text-sm">
        <span className="font-semibold text-white">{OWNER.name}</span> built these for real
        clients.
      </p>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button
          onClick={onContact}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition"
        >
          Contact Charlie
        </button>
        <button
          onClick={onExit}
          className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition"
        >
          View Portfolio
        </button>
      </div>

      {/* score submission */}
      <div className="mt-6 border-t border-white/10 pt-5">
        {submitted ? (
          <p className="text-center text-emerald-300 text-sm font-semibold">
            Score submitted!
          </p>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              placeholder="Your name"
              className="px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white outline-none focus:border-cyan-400 text-sm"
            />
            <button
              onClick={onSubmit}
              className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm transition"
            >
              Submit {bestWpm} WPM
            </button>
          </div>
        )}
      </div>

      {/* leaderboard */}
      <div className="mt-6">
        <Leaderboard
          limit={10}
          game="racer"
          metric="score"
          refreshSignal={refreshSignal}
          highlightName={name}
        />
      </div>
    </div>
  )
}
