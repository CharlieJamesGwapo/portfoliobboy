// ============================================================================
// GameOverlay — full-screen mount that wires the whole dungeon crawler:
// Three.js scene (3000-star field + nebula + floating wireframe shapes; red
// storm in the boss room) → GameEngine canvas → HUD → MobileControls →
// SettingsPanel / RoomPopup / WinScreen, room-name banner, first-launch
// controls tooltip, and the name prompt.
// ============================================================================
import { useEffect, useRef, useState } from 'react'
import { X, Swords } from 'lucide-react'
import GameEngine from './GameEngine'
import HUD from './HUD'
import MobileControls from './MobileControls'
import SettingsPanel from './SettingsPanel'
import { RoomPopup, OWNER } from './RoomContent'
import WinScreen from './WinScreen'
import AudioManager from './AudioManager'
import { Background3D } from './Starfield3D'
import { setUnlock } from '../../lib/avatar'
import {
  getPlayerName,
  setPlayerName as persistPlayerName,
  getKeybindings,
  getAudioSettings,
  getDisplaySettings,
} from '../../lib/gameStorage'

// --- Name prompt ------------------------------------------------------------
function NamePrompt({ onSubmit }) {
  const [name, setName] = useState('')
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(name.trim() || 'Adventurer')
        }}
        className="w-full max-w-sm bg-gradient-to-br from-gray-900 to-gray-950 border border-cyan-500/30 rounded-2xl shadow-2xl ring-2 ring-cyan-500/20 p-6 text-center"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 mb-3">
          <Swords size={28} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Enter the Dungeon</h2>
        <p className="text-sm text-gray-400 mb-4">Name your hero to begin the crawl.</p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          placeholder="Hero name"
          className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white text-center focus:outline-none focus:border-cyan-400 mb-4"
        />
        <button
          type="submit"
          className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          Begin Adventure
        </button>
      </form>
    </div>
  )
}

const TIP_KEY = 'dungeon_tip_seen'

// --- Overlay ---------------------------------------------------------------
// Props: onClose (exit), optional onContact (jump to contact) & onExitAll (full
// exit to portfolio) used when launched from the Arcade lobby.
export default function GameOverlay({ onClose, onContact, onExitAll }) {
  const engineRef = useRef(null)

  const [playerName, setPlayerNameState] = useState(() => getPlayerName())
  const [needName, setNeedName] = useState(() => !getPlayerName())

  const [keybindings, setKeybindings] = useState(() => getKeybindings())
  const [audioSettings, setAudioSettings] = useState(() => getAudioSettings())
  const [displaySettings, setDisplaySettings] = useState(() => getDisplaySettings())

  const [hudState, setHudState] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [popup, setPopup] = useState(null)
  const [winResult, setWinResult] = useState(null)
  const [roomId, setRoomId] = useState('start')
  const [banner, setBanner] = useState(null)
  const [showTip, setShowTip] = useState(false)
  const bannerTimer = useRef(0)

  const paused = needName || settingsOpen || !!popup || !!winResult

  useEffect(() => {
    AudioManager.setMusicVolume(audioSettings.musicVolume)
    AudioManager.setSFXVolume(audioSettings.sfxVolume)
    AudioManager.setMusicMuted(audioSettings.musicMuted)
    AudioManager.setSFXMuted(audioSettings.sfxMuted)
    return () => {
      try { AudioManager.stopMusic() } catch { /* noop */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // First-launch controls tooltip (3s then fade), shown once ever.
  useEffect(() => {
    if (needName) return
    let seen = false
    try { seen = localStorage.getItem(TIP_KEY) === '1' } catch { /* noop */ }
    if (seen) return
    setShowTip(true)
    try { localStorage.setItem(TIP_KEY, '1') } catch { /* noop */ }
    const t = setTimeout(() => setShowTip(false), 3000)
    return () => clearTimeout(t)
  }, [needName])

  const handleRoomEnter = (id, name) => {
    setRoomId(id)
    setBanner({ name, key: Date.now() + Math.floor(performance.now()) })
    clearTimeout(bannerTimer.current)
    bannerTimer.current = setTimeout(() => setBanner(null), 2200)
  }

  const handleWin = (result) => {
    setWinResult(result)
    if (result?.bossDefeated) {
      try { setUnlock('crown') } catch { /* noop */ }
    }
  }

  const handleToggleSettings = () => {
    if (popup) {
      setPopup(null)
      engineRef.current?.clearPopup()
      return
    }
    if (winResult) return
    setSettingsOpen((v) => !v)
  }

  const closePopup = () => {
    setPopup(null)
    engineRef.current?.clearPopup()
  }

  const handleContact = () => {
    if (onContact) { onContact(); return }
    onClose?.()
    setTimeout(() => {
      const el = document.querySelector(OWNER.portfolioContactHref)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 80)
  }

  const bossMode = roomId === 'boss'

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-black">
      <Background3D bossMode={bossMode} />

      {!needName && (
        <>
          <GameEngine
            ref={engineRef}
            keybindings={keybindings}
            displaySettings={displaySettings}
            paused={paused}
            onState={setHudState}
            onPopup={setPopup}
            onRoomEnter={handleRoomEnter}
            onWin={handleWin}
            onToggleMap={() => {}}
            onToggleSettings={handleToggleSettings}
          />

          <HUD state={hudState} displaySettings={displaySettings} onOpenSettings={() => setSettingsOpen(true)} />

          <MobileControls engineRef={engineRef} />
        </>
      )}

      {/* Exit button */}
      <button
        onClick={onClose}
        className="absolute top-3 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
      >
        <X size={14} /> Exit
      </button>

      {/* First-launch controls tooltip */}
      {showTip && !needName && (
        <div className="absolute bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-opacity duration-500">
          <div className="px-4 py-2 rounded-lg bg-black/75 border border-white/15 text-gray-200 text-xs sm:text-sm font-medium">
            WASD = move · SPACE = attack · E = inspect
          </div>
        </div>
      )}

      {/* Room banner — name only, no spoilers */}
      {banner && (
        <div key={banner.key} className="absolute top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="px-6 py-2 rounded-xl bg-black/70 border border-cyan-500/40 text-cyan-200 text-lg sm:text-2xl font-extrabold tracking-wide shadow-lg animate-[fadeIn_0.3s_ease-out]">
            {banner.name}
          </div>
        </div>
      )}

      {popup && <RoomPopup popup={popup} onClose={closePopup} />}

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

      {winResult && (
        <WinScreen
          result={winResult}
          playerName={playerName}
          onContact={handleContact}
          onViewPortfolio={onExitAll || onClose}
        />
      )}

      {needName && (
        <NamePrompt
          onSubmit={(name) => {
            persistPlayerName(name)
            setPlayerNameState(name)
            setNeedName(false)
            try { AudioManager.init() } catch { /* noop */ }
          }}
        />
      )}
    </div>
  )
}
