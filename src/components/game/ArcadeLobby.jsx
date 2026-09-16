// ============================================================================
// ArcadeLobby — full-screen entry hub for all 8 arcade games. Three.js starfield
// background, game cards (with per-game best scores), an Avatar button, a global
// Leaderboard modal (top 5 per game in tabs), and a shared SettingsPanel for the
// non-dungeon games. ESC backs out: game → lobby, lobby → portfolio.
// ============================================================================
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { X, Play, Loader2, Trophy } from 'lucide-react'
import { Background3D } from './Starfield3D'
import AudioManager from './AudioManager'
import SettingsPanel from './SettingsPanel'
import Leaderboard from './Leaderboard'
import { getAvatar, makeSprite, getPlayerName } from '../../lib/avatar'
import { getKeybindings, getAudioSettings, getDisplaySettings } from '../../lib/gameStorage'
import { OWNER } from '../../data/gameData'
import { interactiveGames as GAMES } from '../../data/portfolioData'

const GameOverlay = lazy(() => import('./GameOverlay'))
const AvatarCustomizer = lazy(() => import('./AvatarCustomizer'))
const SpaceShooter = lazy(() => import('./SpaceShooter'))
const CodeRacer = lazy(() => import('./CodeRacer'))
const BlockBlast = lazy(() => import('./BlockBlast'))
const RacingGame = lazy(() => import('./RacingGame'))
const FlappyDev = lazy(() => import('./FlappyDev'))
const SnakeGame = lazy(() => import('./SnakeGame'))
const WhackABug = lazy(() => import('./WhackABug'))
const NeonCircuit = lazy(() => import('./NeonCircuit'))

const NEW_GAME_IDS = ['blaster', 'racer', 'blockblast', 'racing', 'flappy', 'snake', 'whack', 'neon']

function readBest(g) {
  if (!g.bestKey) return null
  try {
    const raw = localStorage.getItem(g.bestKey)
    if (raw == null || raw === '') return null
    const n = Number(raw)
    if (Number.isNaN(n)) return null
    return g.bestKind === 'lapMs' ? `${(n / 1000).toFixed(1)}s` : n.toLocaleString()
  } catch {
    return null
  }
}

function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black text-cyan-300 gap-3">
      <Loader2 size={22} className="animate-spin" />
      <span className="font-semibold">Loading…</span>
    </div>
  )
}

function AvatarBadge({ size = 40 }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const sprite = makeSprite(getAvatar(), size, { bubble: true })
    const ctx = c.getContext('2d')
    ctx.clearRect(0, 0, size, size)
    if (sprite) try { ctx.drawImage(sprite, 0, 0, size, size) } catch { /* noop */ }
  })
  return <canvas ref={ref} width={size} height={size} className="rounded-lg" style={{ imageRendering: 'pixelated' }} />
}

function LeaderboardModal({ onClose }) {
  const [tab, setTab] = useState('dungeon')
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[88vh] overflow-hidden flex flex-col bg-gradient-to-br from-gray-900 to-gray-950 border border-amber-500/30 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><Trophy size={18} className="text-amber-400" /> Leaderboards</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="flex gap-1 px-3 py-2 overflow-x-auto border-b border-white/10">
          {GAMES.map((g) => (
            <button
              key={g.id}
              onClick={() => setTab(g.id)}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${tab === g.id ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {g.emoji} {g.title.split(' ')[0]}
            </button>
          ))}
        </div>
        <div className="p-5 overflow-y-auto">
          <Leaderboard limit={5} game={tab} />
        </div>
      </div>
    </div>
  )
}

export default function ArcadeLobby({ onClose }) {
  const exitRef = useRef(null)
  const lobbyRef = useRef(null)
  const [activeGame, setActiveGame] = useState(null)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [lbOpen, setLbOpen] = useState(false)

  const [keybindings, setKeybindings] = useState(() => getKeybindings())
  const [audioSettings, setAudioSettings] = useState(() => getAudioSettings())
  const [displaySettings, setDisplaySettings] = useState(() => getDisplaySettings())

  const isNewGame = NEW_GAME_IDS.includes(activeGame)

  useEffect(() => {
    return () => { try { AudioManager.stopMusic() } catch { /* noop */ } }
  }, [])

  // Mark the body so the floating MusicPlayer hides while the arcade is open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.classList.add('game-open')
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => exitRef.current?.focus(), 80)
    return () => {
      window.clearTimeout(timer)
      document.body.classList.remove('game-open')
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    if (activeGame) return undefined
    const trapFocus = (event) => {
      if (event.key !== 'Tab' || !lobbyRef.current) return
      const focusable = Array.from(lobbyRef.current.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'))
        .filter((element) => element.offsetParent !== null)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', trapFocus)
    return () => window.removeEventListener('keydown', trapFocus)
  }, [activeGame])

  // ESC handling — game → lobby, modals close, lobby → portfolio.
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Escape') return
      if (avatarOpen) { setAvatarOpen(false); return }
      if (lbOpen) { setLbOpen(false); return }
      if (settingsOpen) { setSettingsOpen(false); return }
      if (activeGame === 'dungeon') return // GameOverlay handles its own ESC
      if (activeGame) { setActiveGame(null); return } // exit any new game to lobby
      onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [avatarOpen, lbOpen, settingsOpen, activeGame, onClose])

  const backToLobby = useCallback(() => setActiveGame(null), [])

  const goContact = useCallback(() => {
    onClose?.()
    setTimeout(() => {
      const el = document.querySelector(OWNER.portfolioContactHref)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 120)
  }, [onClose])

  const launch = (id) => {
    try { AudioManager.init() } catch { /* noop */ }
    setActiveGame(id)
  }

  // --- active game ---------------------------------------------------------
  if (activeGame === 'dungeon') {
    return (
      <Suspense fallback={<Loading />}>
        <GameOverlay onClose={backToLobby} onContact={goContact} onExitAll={onClose} />
      </Suspense>
    )
  }

  if (isNewGame) {
    const p = { onExit: backToLobby, onContact: goContact, onOpenSettings: () => setSettingsOpen(true), paused: settingsOpen }
    return (
      <>
        <Suspense fallback={<Loading />}>
          {activeGame === 'blaster' && <SpaceShooter {...p} />}
          {activeGame === 'racer' && <CodeRacer {...p} />}
          {activeGame === 'blockblast' && <BlockBlast {...p} />}
          {activeGame === 'racing' && <RacingGame {...p} />}
          {activeGame === 'flappy' && <FlappyDev {...p} />}
          {activeGame === 'snake' && <SnakeGame {...p} />}
          {activeGame === 'whack' && <WhackABug {...p} />}
          {activeGame === 'neon' && <NeonCircuit {...p} />}
        </Suspense>
        <SettingsPanel
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          keybindings={keybindings}
          setKeybindings={setKeybindings}
          audioSettings={audioSettings}
          setAudioSettings={setAudioSettings}
          displaySettings={displaySettings}
          setDisplaySettings={setDisplaySettings}
        />
      </>
    )
  }

  // --- lobby ---------------------------------------------------------------
  const playerName = getPlayerName()

  return (
    <div ref={lobbyRef} className="fixed inset-0 z-[100] overflow-hidden bg-black" role="dialog" aria-modal="true" aria-label="Charlie's interactive game arcade">
      <Background3D bossMode={false} />

      {/* top bar */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-4 gap-2">
        <div className="flex items-center gap-2">
          <button
            ref={exitRef}
            onClick={onClose}
            aria-label="Exit arcade and return to portfolio"
            className="min-h-[44px] px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <X size={14} /> Exit Arcade
          </button>
          <button
            onClick={() => setLbOpen(true)}
            className="min-h-[44px] px-3 py-1.5 rounded-lg bg-black/60 border border-amber-500/30 text-amber-200 hover:bg-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trophy size={14} /> 🏆 Leaderboard
          </button>
        </div>
        <button
          onClick={() => setAvatarOpen(true)}
          className="min-h-[44px] px-3 py-1.5 rounded-lg bg-black/60 border border-cyan-500/30 text-cyan-200 hover:bg-white/10 text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <AvatarBadge size={28} />
          <span className="hidden sm:inline">🧑‍💻 My Avatar</span>
        </button>
      </div>

      {/* content */}
      <div className="relative z-20 h-full overflow-y-auto flex flex-col items-center justify-center px-4 py-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-400 mb-2">
            🕹 Charlie's Arcade
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            {playerName ? `Welcome back, ${playerName}.` : 'Nine games. One portfolio. Pick your challenge.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl">
          {GAMES.map((g) => {
            const best = readBest(g)
            return (
              <div
                key={g.id}
                className="group flex flex-col bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:border-white/25 hover:bg-white/[0.07] transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`text-3xl w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br ${g.accent} shadow-lg`}>
                    {g.emoji}
                  </div>
                  {best != null && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Best: {best}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white mb-1">{g.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed flex-1 mb-4">{g.tagline}</p>
                <button
                  onClick={() => launch(g.id)}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r ${g.accent} text-white text-sm font-semibold hover:shadow-lg transition-all group-hover:scale-[1.02]`}
                >
                  <Play size={15} /> Play
                </button>
              </div>
            )
          })}
        </div>

        <p className="mt-8 text-[11px] text-gray-600">Press ESC to exit · ⚙ in-game for settings</p>
      </div>

      {avatarOpen && (
        <Suspense fallback={<Loading />}>
          <AvatarCustomizer onClose={() => setAvatarOpen(false)} />
        </Suspense>
      )}
      {lbOpen && <LeaderboardModal onClose={() => setLbOpen(false)} />}
    </div>
  )
}
