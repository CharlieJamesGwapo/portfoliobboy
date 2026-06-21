// ============================================================================
// synthAudio.js — procedural 8-bit game audio via the Web Audio API.
// Zero asset files required. Every call is wrapped so audio can never crash the
// game. Used as the PRIMARY sound system (Howler is an optional layer on top).
// ============================================================================

// Note frequencies (Hz)
const NOTE = {
  C3: 130.81, D3: 146.83, Eb3: 155.56, E3: 164.81, F3: 174.61, G3: 196.0, Ab3: 207.65, Bb3: 233.08,
  C4: 261.63, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, G4: 392.0, Ab4: 415.3, Bb4: 466.16,
  C5: 523.25,
}

// C minor pentatonic-ish patterns for procedural music.
const DUNGEON_PATTERN = [NOTE.C3, NOTE.Eb3, NOTE.G3, NOTE.Bb3, NOTE.G3, NOTE.Eb3, NOTE.F3, NOTE.G3]
const BOSS_PATTERN = [NOTE.C3, NOTE.C3, NOTE.Eb3, NOTE.C3, NOTE.G3, NOTE.F3, NOTE.Eb3, NOTE.D3]
const ARCADE_PATTERN = [NOTE.C4, NOTE.E4, NOTE.G4, NOTE.E4, NOTE.A3 || NOTE.Ab3, NOTE.C4, NOTE.E4, NOTE.G4]

function makeDistortionCurve(amount = 30) {
  const n = 256
  const curve = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1
    curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x))
  }
  return curve
}

class SynthAudio {
  constructor() {
    this.ctx = null
    this.masterGain = null
    this.musicGain = null
    this.sfxGain = null
    this.musicVolume = 0.5
    this.sfxVolume = 0.7
    this.musicMuted = false
    this.sfxMuted = false

    // music scheduler state
    this._schedulerId = 0
    this._nextNoteTime = 0
    this._step = 0
    this._pattern = DUNGEON_PATTERN
    this._bpm = 120
    this._musicType = null
    this._distorted = false
    this._noiseBuffer = null
  }

  // Must be called from a user gesture to satisfy autoplay policies.
  ensure() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext
        if (!AC) return false
        this.ctx = new AC()
        this.masterGain = this.ctx.createGain()
        this.masterGain.gain.value = 1
        this.masterGain.connect(this.ctx.destination)

        this.musicGain = this.ctx.createGain()
        this.musicGain.gain.value = this.musicMuted ? 0 : this.musicVolume * 0.5
        this.musicGain.connect(this.masterGain)

        this.sfxGain = this.ctx.createGain()
        this.sfxGain.gain.value = this.sfxMuted ? 0 : this.sfxVolume
        this.sfxGain.connect(this.masterGain)

        // pre-build a noise buffer for SFX
        const len = Math.floor(this.ctx.sampleRate * 0.5)
        this._noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
        const data = this._noiseBuffer.getChannelData(0)
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
      }
      if (this.ctx.state === 'suspended') this.ctx.resume()
      return true
    } catch {
      return false
    }
  }

  get available() {
    return Boolean(this.ctx)
  }

  // --- low-level helpers --------------------------------------------------
  _tone({ freq, type = 'square', start = 0, dur = 0.1, gain = 0.3, sweepTo = null, dest = null }) {
    try {
      const ctx = this.ctx
      const t0 = ctx.currentTime + start
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, t0)
      if (sweepTo != null) osc.frequency.exponentialRampToValueAtTime(Math.max(1, sweepTo), t0 + dur)
      g.gain.setValueAtTime(0.0001, t0)
      g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
      osc.connect(g)
      g.connect(dest || this.sfxGain)
      osc.start(t0)
      osc.stop(t0 + dur + 0.02)
    } catch { /* noop */ }
  }

  _noise({ start = 0, dur = 0.1, gain = 0.4 }) {
    try {
      const ctx = this.ctx
      const t0 = ctx.currentTime + start
      const src = ctx.createBufferSource()
      src.buffer = this._noiseBuffer
      const g = ctx.createGain()
      g.gain.setValueAtTime(gain, t0)
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
      const filter = ctx.createBiquadFilter()
      filter.type = 'highpass'
      filter.frequency.value = 800
      src.connect(filter)
      filter.connect(g)
      g.connect(this.sfxGain)
      src.start(t0)
      src.stop(t0 + dur + 0.02)
    } catch { /* noop */ }
  }

  // --- SFX ----------------------------------------------------------------
  playSFX(name) {
    if (!this.ensure() || this.sfxMuted) return
    try {
      switch (name) {
        case 'footstep':
          this._tone({ freq: 80, type: 'square', dur: 0.05, gain: 0.18 })
          break
        case 'sword':
          this._tone({ freq: 440, type: 'sawtooth', dur: 0.15, gain: 0.25, sweepTo: 220 })
          break
        case 'hit':
          this._noise({ dur: 0.1, gain: 0.35 })
          break
        case 'enemyDeath':
          this._tone({ freq: NOTE.C4, type: 'square', start: 0, dur: 0.05, gain: 0.25 })
          this._tone({ freq: NOTE.E4, type: 'square', start: 0.05, dur: 0.05, gain: 0.25 })
          this._tone({ freq: NOTE.G4, type: 'square', start: 0.1, dur: 0.06, gain: 0.25 })
          break
        case 'chestOpen':
        case 'chest':
          this._tone({ freq: NOTE.C4, type: 'sine', dur: 0.3, gain: 0.2 })
          this._tone({ freq: NOTE.E4, type: 'sine', dur: 0.3, gain: 0.2 })
          this._tone({ freq: NOTE.G4, type: 'sine', dur: 0.3, gain: 0.2 })
          break
        case 'doorEnter':
        case 'door':
          this._tone({ freq: 60, type: 'sine', dur: 0.2, gain: 0.3 })
          break
        case 'bossRoar': {
          // deep rumble with distortion
          try {
            const ctx = this.ctx
            const t0 = ctx.currentTime
            const osc = ctx.createOscillator()
            const g = ctx.createGain()
            const shaper = ctx.createWaveShaper()
            shaper.curve = makeDistortionCurve(50)
            osc.type = 'sawtooth'
            osc.frequency.setValueAtTime(40, t0)
            osc.frequency.linearRampToValueAtTime(30, t0 + 0.5)
            g.gain.setValueAtTime(0.0001, t0)
            g.gain.exponentialRampToValueAtTime(0.5, t0 + 0.05)
            g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5)
            osc.connect(shaper)
            shaper.connect(g)
            g.connect(this.sfxGain)
            osc.start(t0)
            osc.stop(t0 + 0.55)
          } catch { /* noop */ }
          break
        }
        case 'victory':
          this._tone({ freq: NOTE.C4, type: 'square', start: 0, dur: 0.1, gain: 0.25 })
          this._tone({ freq: NOTE.E4, type: 'square', start: 0.1, dur: 0.1, gain: 0.25 })
          this._tone({ freq: NOTE.G4, type: 'square', start: 0.2, dur: 0.1, gain: 0.25 })
          this._tone({ freq: NOTE.C5, type: 'square', start: 0.3, dur: 0.22, gain: 0.28 })
          break
        // arcade-friendly aliases used by the new games
        case 'shoot':
          this._tone({ freq: 660, type: 'square', dur: 0.08, gain: 0.14, sweepTo: 990 })
          break
        case 'explosion':
          this._noise({ dur: 0.22, gain: 0.4 })
          this._tone({ freq: 120, type: 'sawtooth', dur: 0.22, gain: 0.25, sweepTo: 40 })
          break
        case 'powerup':
          this._tone({ freq: NOTE.E4, type: 'square', start: 0, dur: 0.06, gain: 0.22 })
          this._tone({ freq: NOTE.G4, type: 'square', start: 0.06, dur: 0.06, gain: 0.22 })
          this._tone({ freq: NOTE.C5, type: 'square', start: 0.12, dur: 0.1, gain: 0.24 })
          break
        case 'type':
          this._tone({ freq: 320 + Math.random() * 120, type: 'square', dur: 0.03, gain: 0.08 })
          break
        case 'error':
          this._tone({ freq: 160, type: 'sawtooth', dur: 0.12, gain: 0.2, sweepTo: 90 })
          break
        case 'place':
          this._tone({ freq: 300, type: 'square', dur: 0.06, gain: 0.16 })
          break
        case 'clear':
          this._tone({ freq: NOTE.G4, type: 'square', start: 0, dur: 0.07, gain: 0.22 })
          this._tone({ freq: NOTE.C5, type: 'square', start: 0.07, dur: 0.1, gain: 0.24 })
          break
        case 'flap':
          this._tone({ freq: 240, type: 'square', dur: 0.09, gain: 0.16, sweepTo: 460 })
          break
        case 'squash':
          this._noise({ dur: 0.08, gain: 0.3 })
          this._tone({ freq: 220, type: 'sawtooth', dur: 0.1, gain: 0.22, sweepTo: 70 })
          break
        case 'rev':
          this._tone({ freq: 60, type: 'sawtooth', dur: 0.22, gain: 0.18, sweepTo: 170 })
          break
        default:
          this._tone({ freq: 440, type: 'square', dur: 0.08, gain: 0.15 })
      }
    } catch { /* noop */ }
  }

  // --- procedural music ---------------------------------------------------
  startMusic(type = 'dungeon') {
    if (!this.ensure()) return
    if (this._musicType === type && this._schedulerId) return
    this.stopMusic()
    this._musicType = type
    if (type === 'boss') {
      this._pattern = BOSS_PATTERN
      this._bpm = 160
      this._distorted = true
    } else if (type === 'arcade') {
      this._pattern = ARCADE_PATTERN
      this._bpm = 140
      this._distorted = false
    } else {
      this._pattern = DUNGEON_PATTERN
      this._bpm = 120
      this._distorted = false
    }
    this._step = 0
    this._nextNoteTime = this.ctx.currentTime + 0.1

    const lookahead = 0.1
    const tick = () => {
      try {
        while (this._nextNoteTime < this.ctx.currentTime + lookahead) {
          this._scheduleNote(this._nextNoteTime)
          const secondsPerBeat = 60.0 / this._bpm
          this._nextNoteTime += secondsPerBeat / 2 // eighth notes
          this._step++
        }
      } catch { /* noop */ }
    }
    this._schedulerId = window.setInterval(tick, 25)
  }

  _scheduleNote(time) {
    try {
      const ctx = this.ctx
      const idx = this._step % this._pattern.length
      const freq = this._pattern[idx]
      const dur = this._distorted ? 0.16 : 0.18

      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = this._distorted ? 'sawtooth' : 'triangle'
      osc.frequency.setValueAtTime(freq, time)
      g.gain.setValueAtTime(0.0001, time)
      g.gain.exponentialRampToValueAtTime(0.22, time + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, time + dur)

      let node = osc
      if (this._distorted) {
        const shaper = ctx.createWaveShaper()
        shaper.curve = makeDistortionCurve(20)
        osc.connect(shaper)
        node = shaper
      }
      node.connect(g)
      g.connect(this.musicGain)
      osc.start(time)
      osc.stop(time + dur + 0.02)

      // bass note every 4 steps
      if (idx % 4 === 0) {
        const bass = ctx.createOscillator()
        const bg = ctx.createGain()
        bass.type = 'square'
        bass.frequency.setValueAtTime(freq / 2, time)
        bg.gain.setValueAtTime(0.0001, time)
        bg.gain.exponentialRampToValueAtTime(0.16, time + 0.02)
        bg.gain.exponentialRampToValueAtTime(0.0001, time + dur * 1.5)
        bass.connect(bg)
        bg.connect(this.musicGain)
        bass.start(time)
        bass.stop(time + dur * 1.5 + 0.02)
      }
    } catch { /* noop */ }
  }

  stopMusic() {
    try {
      if (this._schedulerId) {
        window.clearInterval(this._schedulerId)
        this._schedulerId = 0
      }
      this._musicType = null
    } catch { /* noop */ }
  }

  // --- volume / mute ------------------------------------------------------
  setMusicVolume(v) {
    this.musicVolume = clamp01(v)
    try {
      if (this.musicGain && !this.musicMuted) this.musicGain.gain.value = this.musicVolume * 0.5
    } catch { /* noop */ }
  }
  setSFXVolume(v) {
    this.sfxVolume = clamp01(v)
    try {
      if (this.sfxGain && !this.sfxMuted) this.sfxGain.gain.value = this.sfxVolume
    } catch { /* noop */ }
  }
  setMusicMuted(m) {
    this.musicMuted = Boolean(m)
    try {
      if (this.musicGain) this.musicGain.gain.value = this.musicMuted ? 0 : this.musicVolume * 0.5
    } catch { /* noop */ }
  }
  setSFXMuted(m) {
    this.sfxMuted = Boolean(m)
    try {
      if (this.sfxGain) this.sfxGain.gain.value = this.sfxMuted ? 0 : this.sfxVolume
    } catch { /* noop */ }
  }
}

function clamp01(v) {
  const n = Number(v)
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(1, n))
}

const synthAudio = new SynthAudio()
export default synthAudio
