// Which recording is speaking right now, and how loudly.
//
// Players register their <audio> element with its measured peaks (the same
// data that draws their waveform), and the 3D voice orb reads the level each
// frame. Reading peaks at currentTime avoids a Web Audio graph entirely, so
// nothing reroutes the player's output or needs CORS.
let active = null

export function setActiveVoice(audio, peaks, duration) {
  if (!audio || !peaks?.length) return
  active = { audio, peaks, duration }
}

export function clearActiveVoice(audio) {
  if (active && (!audio || active.audio === audio)) active = null
}

// 0..1, or 0 when nothing is playing.
export function getVoiceLevel() {
  if (!active) return 0
  const { audio, peaks } = active
  if (audio.paused || audio.ended) return 0
  const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : active.duration
  if (!duration) return 0
  const position = Math.min(peaks.length - 1, Math.max(0, Math.floor((audio.currentTime / duration) * peaks.length)))
  return peaks[position] ?? 0
}
