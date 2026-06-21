// ============================================================================
// gameStorage.js — localStorage helpers for the dungeon crawler.
// All reads/writes are wrapped so a disabled/full localStorage never crashes.
// ============================================================================

const KEYS = {
  playerName: 'dungeon_player_name',
  keybindings: 'dungeon_keybindings',
  audio: 'dungeon_audio_settings',
  display: 'dungeon_display_settings',
  save: 'dungeon_game_save',
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function remove(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

// --- Player name ----------------------------------------------------------
export function getPlayerName() {
  try {
    return localStorage.getItem(KEYS.playerName) || ''
  } catch {
    return ''
  }
}
export function setPlayerName(name) {
  try {
    localStorage.setItem(KEYS.playerName, name)
  } catch {
    /* ignore */
  }
}

// --- Keybindings ----------------------------------------------------------
// Stored as { action: 'KeyCode' } using KeyboardEvent.code values.
export const DEFAULT_KEYBINDINGS = {
  moveUp: ['KeyW', 'ArrowUp'],
  moveDown: ['KeyS', 'ArrowDown'],
  moveLeft: ['KeyA', 'ArrowLeft'],
  moveRight: ['KeyD', 'ArrowRight'],
  attack: ['Space'],
  interact: ['KeyE'],
  map: ['KeyM'],
  settings: ['Escape'],
}

export const KEYBINDING_LABELS = {
  moveUp: 'Move Up',
  moveDown: 'Move Down',
  moveLeft: 'Move Left',
  moveRight: 'Move Right',
  attack: 'Attack',
  interact: 'Interact',
  map: 'Map',
  settings: 'Settings',
}

export function getKeybindings() {
  const saved = read(KEYS.keybindings, null)
  if (!saved) return structuredCloneSafe(DEFAULT_KEYBINDINGS)
  // Merge with defaults so newly added actions always have a binding.
  const merged = structuredCloneSafe(DEFAULT_KEYBINDINGS)
  for (const action of Object.keys(merged)) {
    if (Array.isArray(saved[action]) && saved[action].length) {
      merged[action] = saved[action]
    }
  }
  return merged
}
export function setKeybindings(bindings) {
  write(KEYS.keybindings, bindings)
}
export function resetKeybindings() {
  remove(KEYS.keybindings)
  return structuredCloneSafe(DEFAULT_KEYBINDINGS)
}

// --- Audio settings -------------------------------------------------------
export const DEFAULT_AUDIO = {
  musicVolume: 0.5,
  sfxVolume: 0.7,
  musicMuted: false,
  sfxMuted: false,
}
export function getAudioSettings() {
  return { ...DEFAULT_AUDIO, ...read(KEYS.audio, {}) }
}
export function setAudioSettings(settings) {
  write(KEYS.audio, settings)
}

// --- Display settings -----------------------------------------------------
export const DEFAULT_DISPLAY = {
  particles: true,
  screenShake: true,
  fpsCounter: false,
}
export function getDisplaySettings() {
  return { ...DEFAULT_DISPLAY, ...read(KEYS.display, {}) }
}
export function setDisplaySettings(settings) {
  write(KEYS.display, settings)
}

// --- Game save (local) ----------------------------------------------------
export function saveGame(data) {
  return write(KEYS.save, { ...data, savedAt: new Date().toISOString() })
}
export function loadGame() {
  return read(KEYS.save, null)
}
export function clearGame() {
  remove(KEYS.save)
}

// structuredClone is available in modern browsers, but guard for safety.
function structuredCloneSafe(obj) {
  try {
    return structuredClone(obj)
  } catch {
    return JSON.parse(JSON.stringify(obj))
  }
}
