// ============================================================================
// SettingsPanel — opens on ESC or the ⚙ HUD button. Three tabs:
//   CONTROLS — rebind every action, persist to "dungeon_keybindings"
//   AUDIO    — music/sfx volume + mute toggles, persist to "dungeon_audio_settings"
//   DISPLAY  — particles / screen-shake / FPS counter, persist to "dungeon_display_settings"
// ============================================================================
import { useEffect, useState } from 'react'
import { X, Keyboard, Volume2, Monitor, RotateCcw } from 'lucide-react'
import {
  KEYBINDING_LABELS,
  DEFAULT_KEYBINDINGS,
  setKeybindings as persistKeybindings,
  setAudioSettings as persistAudio,
  setDisplaySettings as persistDisplay,
} from '../../lib/gameStorage'
import AudioManager from './AudioManager'

const TABS = [
  { id: 'controls', label: 'Controls', icon: Keyboard },
  { id: 'audio', label: 'Audio', icon: Volume2 },
  { id: 'display', label: 'Display', icon: Monitor },
]

function codeLabel(code) {
  if (!code) return '—'
  if (code.startsWith('Key')) return code.slice(3)
  if (code.startsWith('Digit')) return code.slice(5)
  const map = {
    ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→',
    Space: 'Space', Escape: 'Esc', Enter: 'Enter', ShiftLeft: 'Shift',
    ShiftRight: 'Shift', ControlLeft: 'Ctrl', ControlRight: 'Ctrl',
  }
  return map[code] || code
}

export default function SettingsPanel({
  open,
  onClose,
  keybindings,
  setKeybindings,
  audioSettings,
  setAudioSettings,
  displaySettings,
  setDisplaySettings,
}) {
  const [tab, setTab] = useState('controls')
  const [rebinding, setRebinding] = useState(null) // action id awaiting key

  // capture next key for rebinding
  useEffect(() => {
    if (!rebinding) return
    function onKey(e) {
      e.preventDefault()
      e.stopPropagation()
      if (e.code === 'Escape') { setRebinding(null); return }
      const next = { ...keybindings, [rebinding]: [e.code] }
      setKeybindings(next)
      persistKeybindings(next)
      setRebinding(null)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [rebinding, keybindings, setKeybindings])

  if (!open) return null

  const resetBindings = () => {
    const def = structuredClone(DEFAULT_KEYBINDINGS)
    setKeybindings(def)
    persistKeybindings(def)
  }

  const updateAudio = (patch) => {
    const next = { ...audioSettings, ...patch }
    setAudioSettings(next)
    persistAudio(next)
    if ('musicVolume' in patch) AudioManager.setMusicVolume(patch.musicVolume)
    if ('sfxVolume' in patch) AudioManager.setSFXVolume(patch.sfxVolume)
    if ('musicMuted' in patch) AudioManager.setMusicMuted(patch.musicMuted)
    if ('sfxMuted' in patch) AudioManager.setSFXMuted(patch.sfxMuted)
  }

  const updateDisplay = (patch) => {
    const next = { ...displaySettings, ...patch }
    setDisplaySettings(next)
    persistDisplay(next)
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-gradient-to-br from-gray-900 to-gray-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">Settings</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10" aria-label="Close settings">
            <X size={18} />
          </button>
        </div>

        {/* tabs */}
        <div className="flex border-b border-white/10">
          {TABS.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${
                  tab === t.id ? 'text-cyan-300 border-b-2 border-cyan-400 bg-white/5' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={15} /> {t.label}
              </button>
            )
          })}
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {tab === 'controls' && (
            <div className="space-y-2">
              {Object.keys(KEYBINDING_LABELS).map((action) => (
                <div key={action} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-200">{KEYBINDING_LABELS[action]}</span>
                  <button
                    onClick={() => setRebinding(action)}
                    className={`min-w-[90px] px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                      rebinding === action
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 animate-pulse'
                        : 'bg-white/5 border-white/15 text-white hover:bg-white/10'
                    }`}
                  >
                    {rebinding === action ? 'Press a key…' : (keybindings[action] || []).map(codeLabel).join(' / ')}
                  </button>
                </div>
              ))}
              <button
                onClick={resetBindings}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/15 text-gray-200 hover:bg-white/10 text-sm font-semibold"
              >
                <RotateCcw size={14} /> Reset to Defaults
              </button>
            </div>
          )}

          {tab === 'audio' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm text-gray-200">Music Volume</label>
                  <span className="text-xs text-gray-400 tabular-nums">{Math.round(audioSettings.musicVolume * 100)}%</span>
                </div>
                <input
                  type="range" min="0" max="1" step="0.01"
                  value={audioSettings.musicVolume}
                  onChange={(e) => updateAudio({ musicVolume: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
                <label className="mt-2 flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" checked={audioSettings.musicMuted} onChange={(e) => updateAudio({ musicMuted: e.target.checked })} className="accent-cyan-400" />
                  Mute music
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm text-gray-200">SFX Volume</label>
                  <span className="text-xs text-gray-400 tabular-nums">{Math.round(audioSettings.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range" min="0" max="1" step="0.01"
                  value={audioSettings.sfxVolume}
                  onChange={(e) => updateAudio({ sfxVolume: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
                <label className="mt-2 flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" checked={audioSettings.sfxMuted} onChange={(e) => updateAudio({ sfxMuted: e.target.checked })} className="accent-cyan-400" />
                  Mute SFX
                </label>
              </div>
            </div>
          )}

          {tab === 'display' && (
            <div className="space-y-3">
              {[
                { key: 'particles', label: 'Particles' },
                { key: 'screenShake', label: 'Screen Shake' },
                { key: 'fpsCounter', label: 'FPS Counter' },
              ].map((opt) => (
                <label key={opt.key} className="flex items-center justify-between gap-3 py-1">
                  <span className="text-sm text-gray-200">{opt.label}</span>
                  <button
                    onClick={() => updateDisplay({ [opt.key]: !displaySettings[opt.key] })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${displaySettings[opt.key] ? 'bg-cyan-500' : 'bg-white/15'}`}
                    aria-label={`Toggle ${opt.label}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${displaySettings[opt.key] ? 'translate-x-6' : ''}`} />
                  </button>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-white/10 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
