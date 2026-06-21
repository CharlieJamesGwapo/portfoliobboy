import { useState, useEffect, useRef, useCallback, useMemo, Component } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import AudioManager from './AudioManager'
import Leaderboard from './Leaderboard'
import { getAvatar, makeSprite } from '../../lib/avatar'
import { PROJECTS, SKILLS, OWNER } from '../../data/gameData'
import { getPlayerName } from '../../lib/gameStorage'
import { submitScore } from '../../lib/supabase'

const GRID = 8

// ---------- piece shapes (coordinate arrays, [row, col], no rotation) ----------
const SHAPES = [
  { name: 'single', cells: [[0, 0]], color: 'cyan' },
  { name: 'line2h', cells: [[0, 0], [0, 1]], color: 'blue' },
  { name: 'line3h', cells: [[0, 0], [0, 1], [0, 2]], color: 'blue' },
  { name: 'line4h', cells: [[0, 0], [0, 1], [0, 2], [0, 3]], color: 'purple' },
  { name: 'line2v', cells: [[0, 0], [1, 0]], color: 'green' },
  { name: 'line3v', cells: [[0, 0], [1, 0], [2, 0]], color: 'green' },
  { name: 'line4v', cells: [[0, 0], [1, 0], [2, 0], [3, 0]], color: 'orange' },
  { name: 'square', cells: [[0, 0], [0, 1], [1, 0], [1, 1]], color: 'pink' },
  { name: 'lA', cells: [[0, 0], [1, 0], [2, 0], [2, 1]], color: 'orange' },
  { name: 'lB', cells: [[0, 1], [1, 1], [2, 1], [2, 0]], color: 'orange' },
  { name: 'lC', cells: [[0, 0], [0, 1], [1, 0], [2, 0]], color: 'cyan' },
  { name: 'lD', cells: [[0, 0], [0, 1], [1, 1], [2, 1]], color: 'cyan' },
  { name: 'tShape', cells: [[0, 0], [0, 1], [0, 2], [1, 1]], color: 'purple' },
  { name: 'tDown', cells: [[1, 0], [1, 1], [1, 2], [0, 1]], color: 'purple' },
  { name: 'zShape', cells: [[0, 0], [0, 1], [1, 1], [1, 2]], color: 'pink' },
  { name: 'sShape', cells: [[0, 1], [0, 2], [1, 0], [1, 1]], color: 'pink' },
  { name: 'corner', cells: [[0, 0], [0, 1], [1, 0]], color: 'green' },
  { name: 'big', cells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]], color: 'blue' },
]

const COLOR_GRAD = {
  blue: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
  purple: 'linear-gradient(135deg,#a78bfa,#7c3aed)',
  cyan: 'linear-gradient(135deg,#22d3ee,#0891b2)',
  green: 'linear-gradient(135deg,#4ade80,#16a34a)',
  orange: 'linear-gradient(135deg,#fb923c,#ea580c)',
  pink: 'linear-gradient(135deg,#f472b6,#db2777)',
}

let PIECE_ID = 0
function randomPiece() {
  const s = SHAPES[Math.floor(Math.random() * SHAPES.length)]
  return { id: ++PIECE_ID, name: s.name, cells: s.cells.map((c) => [c[0], c[1]]), color: s.color }
}
function newTray() {
  return [randomPiece(), randomPiece(), randomPiece()]
}
function emptyGrid() {
  return Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => null))
}

// can a piece be placed with its anchor at (r,c)?
function canPlace(grid, piece, r, c) {
  for (const [dr, dc] of piece.cells) {
    const rr = r + dr
    const cc = c + dc
    if (rr < 0 || rr >= GRID || cc < 0 || cc >= GRID) return false
    if (grid[rr][cc]) return false
  }
  return true
}

// does the piece fit ANYWHERE on the grid?
function fitsAnywhere(grid, piece) {
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      if (canPlace(grid, piece, r, c)) return true
    }
  }
  return false
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

function WireMesh() {
  const ref = useRef()
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.z += delta * 0.04
      ref.current.rotation.x = -Math.PI / 3
    }
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 3, 0, 0]}>
      <planeGeometry args={[60, 60, 20, 20]} />
      <meshBasicMaterial wireframe color="#1e3a8a" />
    </mesh>
  )
}

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
        <Canvas camera={{ position: [0, 6, 12], fov: 60 }}>
          <WireMesh />
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
export default function BlockBlast({ onExit, onContact, onOpenSettings, paused }) {
  const [grid, setGrid] = useState(emptyGrid)
  const [tray, setTray] = useState(newTray)
  const [selected, setSelected] = useState(null) // index in tray
  const [hover, setHover] = useState(null) // { r, c }
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => {
    const v = parseInt(localStorage.getItem('blockblast_best') || '0', 10)
    return isNaN(v) ? 0 : v
  })
  const [piecesPlaced, setPiecesPlaced] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [clearing, setClearing] = useState([]) // [{r,c}] flashing cells
  const [particles, setParticles] = useState([]) // [{id,r,c}]
  const [projectPopup, setProjectPopup] = useState(null) // project object
  const [comboBadge, setComboBadge] = useState(null) // { id, skill }

  const [nameInput, setNameInput] = useState(() => getPlayerName() || '')
  const [submitted, setSubmitted] = useState(false)
  const [refreshSignal, setRefreshSignal] = useState(0)

  const startRef = useRef(Date.now())
  const milestoneProjRef = useRef(0)
  const milestoneSkillRef = useRef(0)
  const projIdxRef = useRef(0)

  // music lifecycle
  useEffect(() => {
    try {
      AudioManager.playMusic('arcade')
    } catch (e) {}
    return () => {
      try {
        AudioManager.stopMusic()
      } catch (e) {}
    }
  }, [])

  // first-gesture audio init
  const ensureAudio = useCallback(() => {
    try {
      AudioManager.init()
    } catch (e) {}
  }, [])

  // persist best
  useEffect(() => {
    if (score > best) {
      setBest(score)
      try {
        localStorage.setItem('blockblast_best', String(score))
      } catch (e) {}
    }
  }, [score, best])

  // portfolio milestone tie-ins
  useEffect(() => {
    const projTier = Math.floor(score / 200)
    if (projTier > milestoneProjRef.current && PROJECTS.length) {
      milestoneProjRef.current = projTier
      const proj = PROJECTS[projIdxRef.current % PROJECTS.length]
      projIdxRef.current += 1
      setProjectPopup(proj)
      try {
        AudioManager.playSFX('powerup')
      } catch (e) {}
      const t = setTimeout(() => setProjectPopup(null), 6000)
      return () => clearTimeout(t)
    }
  }, [score])

  useEffect(() => {
    const skillTier = Math.floor(score / 500)
    if (skillTier > milestoneSkillRef.current && SKILLS.length) {
      milestoneSkillRef.current = skillTier
      const skill = SKILLS[Math.floor(Math.random() * SKILLS.length)]
      const id = ++PIECE_ID
      setComboBadge({ id, skill })
      try {
        AudioManager.playSFX('powerup')
      } catch (e) {}
      const t = setTimeout(() => setComboBadge((b) => (b && b.id === id ? null : b)), 2600)
      return () => clearTimeout(t)
    }
  }, [score])

  // check game over whenever tray or grid changes
  useEffect(() => {
    if (gameOver) return
    const alive = tray.filter(Boolean)
    if (alive.length === 0) return
    const anyFit = alive.some((p) => fitsAnywhere(grid, p))
    if (!anyFit) {
      setGameOver(true)
    }
  }, [tray, grid, gameOver])

  const elapsed = () => Math.max(0, Math.round((Date.now() - startRef.current) / 1000))

  const placePiece = useCallback(
    (trayIdx, r, c) => {
      if (paused || gameOver) return
      const piece = tray[trayIdx]
      if (!piece) return
      if (!canPlace(grid, piece, r, c)) {
        try {
          AudioManager.playSFX('error')
        } catch (e) {}
        return
      }
      ensureAudio()

      // place
      const ng = grid.map((row) => row.slice())
      for (const [dr, dc] of piece.cells) {
        ng[r + dr][c + dc] = piece.color
      }
      try {
        AudioManager.playSFX('place')
      } catch (e) {}

      // detect full rows / cols
      const fullRows = []
      const fullCols = []
      for (let i = 0; i < GRID; i++) {
        if (ng[i].every((v) => v)) fullRows.push(i)
      }
      for (let j = 0; j < GRID; j++) {
        let full = true
        for (let i = 0; i < GRID; i++) if (!ng[i][j]) full = false
        if (full) fullCols.push(j)
      }

      const toClear = new Set()
      for (const i of fullRows) for (let j = 0; j < GRID; j++) toClear.add(i + ',' + j)
      for (const j of fullCols) for (let i = 0; i < GRID; i++) toClear.add(i + ',' + j)

      // consume tray piece
      const nt = tray.slice()
      nt[trayIdx] = null

      if (toClear.size > 0) {
        const clearCells = Array.from(toClear).map((k) => {
          const [rr, cc] = k.split(',').map(Number)
          return { r: rr, c: cc }
        })
        setGrid(ng)
        setClearing(clearCells)
        try {
          AudioManager.playSFX('clear')
        } catch (e) {}
        // particle burst
        const burst = clearCells.map((cell, i) => ({ id: PIECE_ID + '_' + i + '_' + Date.now(), r: cell.r, c: cell.c }))
        setParticles(burst)
        setScore((s) => s + toClear.size * 10)

        setTimeout(() => {
          setGrid((g) => {
            const cleared = g.map((row) => row.slice())
            for (const { r: rr, c: cc } of clearCells) cleared[rr][cc] = null
            return cleared
          })
          setClearing([])
        }, 260)
        setTimeout(() => setParticles([]), 600)
      } else {
        setGrid(ng)
      }

      setPiecesPlaced((p) => p + 1)
      setSelected(null)
      setHover(null)

      // refill tray when all placed
      if (nt.every((p) => p === null)) {
        setTray(newTray())
      } else {
        setTray(nt)
      }
    },
    [tray, grid, paused, gameOver, ensureAudio]
  )

  // ----- drag & drop (pointer) -----
  const dragRef = useRef(null) // { trayIdx, x, y }
  const [dragGhost, setDragGhost] = useState(null) // { trayIdx, x, y }
  const boardRef = useRef(null)

  const cellFromPoint = useCallback((clientX, clientY) => {
    const el = boardRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null
    const c = Math.floor((x / rect.width) * GRID)
    const r = Math.floor((y / rect.height) * GRID)
    if (r < 0 || r >= GRID || c < 0 || c >= GRID) return null
    return { r, c }
  }, [])

  const onPiecePointerDown = useCallback(
    (e, trayIdx) => {
      if (paused || gameOver) return
      if (!tray[trayIdx]) return
      ensureAudio()
      setSelected(trayIdx)
      dragRef.current = { trayIdx, moved: false }
      setDragGhost({ trayIdx, x: e.clientX, y: e.clientY })
      try {
        e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId)
      } catch (err) {}
    },
    [tray, paused, gameOver, ensureAudio]
  )

  const onPiecePointerMove = useCallback(
    (e) => {
      if (!dragRef.current) return
      dragRef.current.moved = true
      setDragGhost((g) => (g ? { ...g, x: e.clientX, y: e.clientY } : g))
      const cell = cellFromPoint(e.clientX, e.clientY)
      setHover(cell)
    },
    [cellFromPoint]
  )

  const onPiecePointerUp = useCallback(
    (e) => {
      const d = dragRef.current
      dragRef.current = null
      setDragGhost(null)
      if (!d) return
      const cell = cellFromPoint(e.clientX, e.clientY)
      if (d.moved && cell) {
        placePiece(d.trayIdx, cell.r, cell.c)
      }
      // if not moved, it's a tap-select (selected already set) — keep selection
    },
    [cellFromPoint, placePiece]
  )

  // tap a board cell with a selected piece (baseline flow)
  const onCellClick = useCallback(
    (r, c) => {
      if (paused || gameOver) return
      if (selected == null || !tray[selected]) return
      placePiece(selected, r, c)
    },
    [selected, tray, paused, gameOver, placePiece]
  )

  const onCellEnter = useCallback(
    (r, c) => {
      if (selected != null) setHover({ r, c })
    },
    [selected]
  )

  // preview cells for current selection + hover
  const previewSet = useMemo(() => {
    const set = new Set()
    if (selected == null || !hover || !tray[selected]) return { set, valid: false }
    const piece = tray[selected]
    const valid = canPlace(grid, piece, hover.r, hover.c)
    for (const [dr, dc] of piece.cells) {
      const rr = hover.r + dr
      const cc = hover.c + dc
      if (rr >= 0 && rr < GRID && cc >= 0 && cc < GRID) set.add(rr + ',' + cc)
    }
    return { set, valid }
  }, [selected, hover, tray, grid])

  const clearingSet = useMemo(() => {
    const s = new Set()
    for (const cell of clearing) s.add(cell.r + ',' + cell.c)
    return s
  }, [clearing])

  const reset = useCallback(() => {
    setGrid(emptyGrid())
    setTray(newTray())
    setSelected(null)
    setHover(null)
    setScore(0)
    setPiecesPlaced(0)
    setGameOver(false)
    setClearing([])
    setParticles([])
    setProjectPopup(null)
    setComboBadge(null)
    setSubmitted(false)
    startRef.current = Date.now()
    milestoneProjRef.current = 0
    milestoneSkillRef.current = 0
    projIdxRef.current = 0
  }, [])

  const handleSubmit = useCallback(async () => {
    const player_name = (nameInput || 'Player').trim().slice(0, 24) || 'Player'
    try {
      await submitScore({ player_name, score, time_seconds: elapsed(), boss_defeated: false, game: 'blockblast' })
    } catch (e) {}
    setSubmitted(true)
    setRefreshSignal((n) => n + 1)
  }, [nameInput, score])

  // ---------- render ----------
  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-black select-none" style={{ touchAction: 'none' }}>
      <Background />

      {/* top controls */}
      <button
        onClick={onExit}
        className="absolute top-4 left-4 z-40 px-3 py-1.5 rounded-lg bg-black/60 border border-white/20 text-white text-sm font-semibold hover:bg-black/80"
      >
        ← Exit
      </button>
      <button
        onClick={onOpenSettings}
        className="absolute top-4 right-4 z-40 w-10 h-10 rounded-lg bg-black/60 border border-white/20 text-white text-lg hover:bg-black/80 flex items-center justify-center"
        aria-label="Settings"
      >
        ⚙
      </button>

      {/* HUD */}
      <div className="absolute top-16 left-4 z-20 text-white">
        <div className="text-2xl font-bold tabular-nums drop-shadow">{score}</div>
        <div className="text-xs text-white/60">Best {best}</div>
        <div className="text-xs text-white/60">Pieces {piecesPlaced}</div>
      </div>
      <div className="absolute top-16 right-4 z-20">
        <AvatarBadge />
      </div>

      {/* board + tray */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-3 pt-28 pb-4">
        <div
          ref={boardRef}
          className="grid bg-[#0d0d20]/80 rounded-xl p-1.5 border border-white/10 shadow-2xl"
          style={{
            gridTemplateColumns: `repeat(${GRID}, 1fr)`,
            gridTemplateRows: `repeat(${GRID}, 1fr)`,
            width: 'min(92vw, 60vh, 460px)',
            height: 'min(92vw, 60vh, 460px)',
            gap: '3px',
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const key = r + ',' + c
              const inPreview = previewSet.set.has(key)
              const isClearing = clearingSet.has(key)
              let bg = '#1a1a2e'
              let bgImage = undefined
              if (cell) bgImage = COLOR_GRAD[cell]
              if (isClearing) {
                bg = '#ffffff'
                bgImage = undefined
              }
              return (
                <div
                  key={key}
                  onClick={() => onCellClick(r, c)}
                  onPointerEnter={() => onCellEnter(r, c)}
                  className="rounded-[4px] transition-colors duration-75"
                  style={{
                    background: bgImage || bg,
                    border: cell || isClearing ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.05)',
                    boxShadow:
                      inPreview && !cell
                        ? previewSet.valid
                          ? 'inset 0 0 0 2px rgba(74,222,128,0.9)'
                          : 'inset 0 0 0 2px rgba(248,113,113,0.9)'
                        : 'none',
                  }}
                />
              )
            })
          )}
          {/* particle bursts */}
          {particles.map((p) => (
            <span
              key={p.id}
              className="bb-particle"
              style={{
                gridColumn: p.c + 1,
                gridRow: p.r + 1,
              }}
            />
          ))}
        </div>

        {/* tray */}
        <div className="mt-5 flex items-end justify-center gap-4">
          {tray.map((piece, idx) => (
            <TrayPiece
              key={piece ? piece.id : 'empty-' + idx}
              piece={piece}
              selected={selected === idx}
              onPointerDown={(e) => onPiecePointerDown(e, idx)}
              onPointerMove={onPiecePointerMove}
              onPointerUp={onPiecePointerUp}
              onClick={() => {
                if (paused || gameOver || !piece) return
                ensureAudio()
                setSelected((s) => (s === idx ? null : idx))
              }}
            />
          ))}
        </div>
        <div className="mt-2 text-[11px] text-white/40">Tap a piece, then tap a cell — or drag it onto the board.</div>
      </div>

      {/* drag ghost */}
      {dragGhost && tray[dragGhost.trayIdx] && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: dragGhost.x, top: dragGhost.y, transform: 'translate(-50%,-50%)' }}
        >
          <MiniShape piece={tray[dragGhost.trayIdx]} cellSize={20} />
        </div>
      )}

      {/* project unlock popup */}
      {projectPopup && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 pointer-events-none">
          <div className="pointer-events-auto max-w-sm w-full bg-[#0d0d20] border border-cyan-400/40 rounded-2xl p-5 shadow-2xl">
            <div className="text-cyan-300 text-xs font-bold tracking-wide uppercase">You unlocked a project!</div>
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
                  className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
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

      {/* skill combo badge */}
      {comboBadge && (
        <div key={comboBadge.id} className="absolute top-1/2 left-0 z-40 pointer-events-none bb-combo">
          <div className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-extrabold px-5 py-2 rounded-full shadow-2xl whitespace-nowrap">
            SKILL COMBO! {comboBadge.skill}
          </div>
        </div>
      )}

      {/* game over */}
      {gameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto">
          <div className="max-w-md w-full bg-[#0d0d20] border border-white/15 rounded-2xl p-6 my-6">
            <h2 className="text-2xl font-extrabold text-white text-center">Game Over</h2>
            <div className="text-center mt-2">
              <div className="text-4xl font-black text-cyan-300 tabular-nums">{score}</div>
              <div className="text-white/60 text-sm mt-1">Pieces placed: {piecesPlaced}</div>
            </div>

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
              <Leaderboard limit={5} game="blockblast" refreshSignal={refreshSignal} highlightName={nameInput} />
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
                View Portfolio
              </button>
              <button
                onClick={onContact}
                className="col-span-2 px-4 py-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-bold text-sm hover:opacity-90"
              >
                Contact {OWNER && OWNER.name ? OWNER.name.split(' ')[0] : 'Charlie'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bbCombo {
          0% { transform: translateX(-40%) scale(0.8); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateX(120vw) scale(1.1); opacity: 0; }
        }
        .bb-combo { animation: bbCombo 2.6s ease-in forwards; }
        @keyframes bbParticle {
          0% { transform: scale(0.3); opacity: 0.9; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .bb-particle {
          align-self: center;
          justify-self: center;
          width: 60%;
          height: 60%;
          border-radius: 9999px;
          background: radial-gradient(circle, #fff 0%, rgba(34,211,238,0.6) 60%, transparent 70%);
          animation: bbParticle 0.5s ease-out forwards;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

// ---------- small shape renderer ----------
function shapeBounds(cells) {
  let maxR = 0
  let maxC = 0
  for (const [r, c] of cells) {
    if (r > maxR) maxR = r
    if (c > maxC) maxC = c
  }
  return { rows: maxR + 1, cols: maxC + 1 }
}

function MiniShape({ piece, cellSize = 22 }) {
  if (!piece) return null
  const { rows, cols } = shapeBounds(piece.cells)
  const filled = new Set(piece.cells.map(([r, c]) => r + ',' + c))
  const cellsArr = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cellsArr.push({ r, c, on: filled.has(r + ',' + c) })
    }
  }
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        gap: '3px',
      }}
    >
      {cellsArr.map(({ r, c, on }) => (
        <div
          key={r + ',' + c}
          className="rounded-[4px]"
          style={{
            background: on ? COLOR_GRAD[piece.color] : 'transparent',
            border: on ? '1px solid rgba(255,255,255,0.18)' : 'none',
          }}
        />
      ))}
    </div>
  )
}

function TrayPiece({ piece, selected, onPointerDown, onPointerMove, onPointerUp, onClick }) {
  return (
    <div
      onPointerDown={piece ? onPointerDown : undefined}
      onPointerMove={piece ? onPointerMove : undefined}
      onPointerUp={piece ? onPointerUp : undefined}
      onClick={onClick}
      className={`flex items-center justify-center rounded-xl p-2 transition-all ${
        piece ? 'cursor-grab active:cursor-grabbing' : 'opacity-20'
      } ${selected ? 'bg-cyan-400/20 ring-2 ring-cyan-400 scale-105' : 'bg-white/5'}`}
      style={{ minWidth: 64, minHeight: 64, touchAction: 'none' }}
    >
      {piece ? <MiniShape piece={piece} cellSize={18} /> : <div className="w-10 h-10" />}
    </div>
  )
}
