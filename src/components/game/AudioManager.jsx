// ============================================================================
// AudioManager — public audio API for all arcade games (singleton).
// PRIMARY system: procedural Web Audio synth (synthAudio.js) — zero files,
// works everywhere, no network requests, so NO 416 errors.
// OPTIONAL layer: Howler.js — only loads the tracks listed in AVAILABLE_AUDIO,
// so a file that is not shipped is never requested (no 404s in the console).
// Every call is wrapped in try/catch so audio can never crash a game.
// ============================================================================
import { Howl, Howler } from 'howler'
import { getAudioSettings, setAudioSettings } from '../../lib/gameStorage'
import synth from '../../lib/synthAudio'

const MUSIC_TRACKS = {
  dungeon: '/audio/dungeon_ambient.mp3',
  boss: '/audio/boss_battle.mp3',
  victory: '/audio/victory.mp3',
}

const SFX_FILES = {
  footstep: '/audio/footstep.wav',
  sword: '/audio/sword_swing.wav',
  hit: '/audio/hit.wav',
  enemyDeath: '/audio/enemy_death.wav',
  chest: '/audio/chest_open.wav',
  door: '/audio/door_enter.wav',
}

// Keys (from the two maps above) whose real audio file is shipped. public/audio
// holds only empty placeholders and is excluded from deploys by .vercelignore,
// so this is empty and every sound comes from the synth. Add a key here when
// its file is actually deployed.
const AVAILABLE_AUDIO = new Set([])

class AudioManagerClass {
  constructor() {
    this.howlMusic = {}
    this.howlSfx = {}
    this.currentMusicKey = null
    this.probed = false

    const settings = getAudioSettings()
    this.musicVolume = settings.musicVolume
    this.sfxVolume = settings.sfxVolume
    this.musicMuted = settings.musicMuted
    this.sfxMuted = settings.sfxMuted

    // push initial volumes into the synth
    synth.setMusicVolume(this.musicVolume)
    synth.setSFXVolume(this.sfxVolume)
    synth.setMusicMuted(this.musicMuted)
    synth.setSFXMuted(this.sfxMuted)
  }

  // Called from a user gesture. Ensures the synth AudioContext and loads any
  // shipped audio files once.
  init() {
    try { synth.ensure() } catch { /* noop */ }
    if (this.probed) return
    this.probed = true
    this._loadAssets()
  }

  _loadAssets() {
    try {
      for (const [key, src] of Object.entries(MUSIC_TRACKS)) {
        if (!AVAILABLE_AUDIO.has(key)) continue
        try {
          this.howlMusic[key] = new Howl({ src: [src], loop: key !== 'victory', volume: 0, html5: true, onloaderror: () => { delete this.howlMusic[key] } })
        } catch { /* noop */ }
      }
      for (const [key, src] of Object.entries(SFX_FILES)) {
        if (!AVAILABLE_AUDIO.has(key)) continue
        try {
          this.howlSfx[key] = new Howl({ src: [src], volume: this.sfxVolume, onloaderror: () => { delete this.howlSfx[key] } })
        } catch { /* noop */ }
      }
    } catch { /* noop */ }
  }

  _persist() {
    try {
      setAudioSettings({
        musicVolume: this.musicVolume,
        sfxVolume: this.sfxVolume,
        musicMuted: this.musicMuted,
        sfxMuted: this.sfxMuted,
      })
    } catch { /* noop */ }
  }

  // key: 'dungeon' | 'boss' | 'victory' | 'arcade'
  playMusic(key) {
    try {
      this.init()
      if (this.currentMusicKey === key) return
      this.currentMusicKey = key

      if (key === 'victory') {
        synth.stopMusic()
        this.playSFX('victory')
        return
      }

      // Howler track present? use it; else procedural synth.
      const howl = this.howlMusic[key]
      if (howl) {
        synth.stopMusic()
        for (const [k, h] of Object.entries(this.howlMusic)) {
          if (k !== key) { try { h.stop() } catch { /* noop */ } }
        }
        try {
          howl.volume(this.musicMuted ? 0 : this.musicVolume)
          if (!howl.playing()) howl.play()
        } catch { /* noop */ }
      } else {
        // stop any howl music, use synth
        for (const h of Object.values(this.howlMusic)) { try { h.stop() } catch { /* noop */ } }
        synth.startMusic(key)
      }
    } catch { /* noop */ }
  }

  stopMusic() {
    try {
      synth.stopMusic()
      for (const h of Object.values(this.howlMusic)) { try { h.stop() } catch { /* noop */ } }
      this.currentMusicKey = null
    } catch { /* noop */ }
  }

  playSFX(name) {
    try {
      this.init()
      if (this.sfxMuted) return
      const howl = this.howlSfx[name]
      if (howl) {
        try { howl.volume(this.sfxVolume); howl.play(); return } catch { /* noop */ }
      }
      synth.playSFX(name)
    } catch { /* noop */ }
  }

  setMusicVolume(v) {
    this.musicVolume = clamp01(v)
    synth.setMusicVolume(this.musicVolume)
    try {
      const cur = this.currentMusicKey ? this.howlMusic[this.currentMusicKey] : null
      if (cur && !this.musicMuted) cur.volume(this.musicVolume)
    } catch { /* noop */ }
    this._persist()
  }

  setSFXVolume(v) {
    this.sfxVolume = clamp01(v)
    synth.setSFXVolume(this.sfxVolume)
    this._persist()
  }

  setMusicMuted(muted) {
    this.musicMuted = Boolean(muted)
    synth.setMusicMuted(this.musicMuted)
    try {
      const cur = this.currentMusicKey ? this.howlMusic[this.currentMusicKey] : null
      if (cur) cur.volume(this.musicMuted ? 0 : this.musicVolume)
    } catch { /* noop */ }
    this._persist()
  }

  setSFXMuted(muted) {
    this.sfxMuted = Boolean(muted)
    synth.setSFXMuted(this.sfxMuted)
    this._persist()
  }

  toggleMute() {
    try {
      const next = !(this.musicMuted && this.sfxMuted)
      this.setMusicMuted(next)
      this.setSFXMuted(next)
      try { Howler.mute(next) } catch { /* noop */ }
      return next
    } catch {
      return false
    }
  }

  getSettings() {
    return {
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      musicMuted: this.musicMuted,
      sfxMuted: this.sfxMuted,
    }
  }
}

function clamp01(v) {
  const n = Number(v)
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(1, n))
}

const AudioManager = new AudioManagerClass()
export default AudioManager
