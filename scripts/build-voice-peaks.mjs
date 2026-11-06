#!/usr/bin/env node
// Computes real waveform peaks for every voice recording so the player's
// waveform reflects the actual audio rather than a decorative pattern.
//
// Usage: node scripts/build-voice-peaks.mjs
// Requires ffmpeg on PATH. Writes src/data/voicePeaks.json, keyed by the
// recording's filename. Re-run whenever a recording is added or replaced.
import { execFileSync } from 'node:child_process'
import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const AUDIO_DIR = join(ROOT, 'src/assets/audio')
const OUT = join(ROOT, 'src/data/voicePeaks.json')
const BARS = 120
const SAMPLE_RATE = 8000

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name)
  return statSync(path).isDirectory() ? walk(path) : [path]
})

const peaksFor = (file) => {
  // Decode to mono 32-bit float PCM on stdout.
  const pcm = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', String(SAMPLE_RATE), '-f', 'f32le', '-'], { maxBuffer: 512 * 1024 * 1024 })
  const samples = new Float32Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.byteLength / 4))
  const size = Math.max(1, Math.floor(samples.length / BARS))
  const rms = []
  for (let bar = 0; bar < BARS; bar += 1) {
    let sum = 0
    const start = bar * size
    const end = Math.min(samples.length, start + size)
    for (let i = start; i < end; i += 1) sum += samples[i] * samples[i]
    rms.push(Math.sqrt(sum / Math.max(1, end - start)))
  }
  const max = Math.max(...rms, 1e-9)
  return {
    duration: Math.round((samples.length / SAMPLE_RATE) * 100) / 100,
    peaks: rms.map((value) => Math.round((value / max) * 100) / 100),
  }
}

const result = {}
for (const file of walk(AUDIO_DIR).filter((path) => /\.(mp3|m4a|wav|ogg)$/i.test(path)).sort()) {
  const key = relative(AUDIO_DIR, file)
  result[key] = peaksFor(file)
  console.log(`${key}: ${result[key].duration}s`)
}
writeFileSync(OUT, `${JSON.stringify(result, null, 0)}\n`)
console.log(`Wrote ${Object.keys(result).length} entries to ${relative(ROOT, OUT)}`)
