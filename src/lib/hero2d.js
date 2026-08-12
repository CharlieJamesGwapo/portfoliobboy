// ============================================================================
// hero2d — the immediate-paint hero renderer.
//
// This is a hand-written 2D canvas renderer with a pseudo-3D projection. It
// costs ~3 kB, needs no WebGL, and is on screen within the first frame, so it
// carries the hero's visual weight while the Three.js upgrade (heroWebgl.js)
// is still downloading — and permanently on devices where we decide the WebGL
// scene isn't worth the battery.
//
// It exposes the same controller shape as the WebGL renderer so the component
// can drive either one without branching:
//   { render(), resize(), setPointer(x, y), setTime(t), dispose() }
// ============================================================================
import { HERO_COLORS, rgbString } from './heroGraph'

const MINT = rgbString(HERO_COLORS.mint)
const CORAL = rgbString(HERO_COLORS.coral)

export function createHero2D(canvas, graph) {
  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return null

  const { nodes, edges, core } = graph
  let width = 0
  let height = 0
  let time = 0
  const pointer = { x: 0, y: 0 }

  // Pulses travel along a subset of the edges. Precomputed so the draw loop
  // allocates nothing per frame.
  const signals = edges.map((edge, index) => ({
    edge,
    speed: 0.09 + (index % 5) * 0.018,
    offset: (index * 0.37) % 1,
  }))

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const compact = rect.width < 520
    const dpr = Math.min(window.devicePixelRatio || 1, compact ? 1 : 1.5)
    width = rect.width
    height = rect.height
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  // Perspective divide plus a slow yaw, so the flat graph reads as 3D.
  const project = (node) => {
    const yaw = Math.sin(time * 0.12) * 0.3 + pointer.x * 0.42
    const pitch = -0.08 + pointer.y * 0.2

    const cosY = Math.cos(yaw)
    const sinY = Math.sin(yaw)
    const x = node.x * cosY - node.z * sinY
    let z = node.x * sinY + node.z * cosY

    const cosX = Math.cos(pitch)
    const sinX = Math.sin(pitch)
    const y = node.y * cosX - z * sinX
    z = node.y * sinX + z * cosX

    const scale = 2.6 / (2.6 - z * 0.85)
    const radius = Math.min(width, height) * 0.4
    return { x: width / 2 + x * radius * scale, y: height / 2 - y * radius * scale, scale }
  }

  const points = new Array(nodes.length)
  const order = nodes.map((_, index) => index)

  const render = () => {
    if (!width || !height) return
    ctx.clearRect(0, 0, width, height)
    for (let i = 0; i < nodes.length; i += 1) points[i] = project(nodes[i])

    ctx.lineWidth = 1
    for (let i = 0; i < edges.length; i += 1) {
      const p = points[edges[i][0]]
      const q = points[edges[i][1]]
      const depth = (p.scale + q.scale) / 2
      ctx.strokeStyle = `rgba(${MINT}, ${(0.08 + (depth - 0.8) * 0.3).toFixed(3)})`
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(q.x, q.y)
      ctx.stroke()
    }

    const signalCount = Math.min(signals.length, width < 520 ? 8 : 16)
    ctx.fillStyle = 'rgba(245, 242, 233, 0.9)'
    for (let i = 0; i < signalCount; i += 1) {
      const signal = signals[i]
      const p = points[signal.edge[0]]
      const q = points[signal.edge[1]]
      const t = (time * signal.speed + signal.offset) % 1
      ctx.beginPath()
      ctx.arc(p.x + (q.x - p.x) * t, p.y + (q.y - p.y) * t, 2, 0, Math.PI * 2)
      ctx.fill()
    }

    // Back-to-front so nearer nodes overlap correctly.
    order.sort((a, b) => points[a].scale - points[b].scale)
    for (let i = 0; i < order.length; i += 1) {
      const index = order[i]
      const point = points[index]
      const isCore = index === core
      const rgb = isCore ? CORAL : MINT
      const base = (isCore ? 6.4 : 3.1) * nodes[index].size * point.scale
      const pulse = 1 + Math.sin(time * 1.4 + nodes[index].seed * 6.28) * 0.08

      const glow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, base * 5)
      glow.addColorStop(0, `rgba(${rgb}, 0.32)`)
      glow.addColorStop(1, `rgba(${rgb}, 0)`)
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(point.x, point.y, base * 5, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = isCore ? '#ffb494' : '#8ff0d8'
      ctx.beginPath()
      ctx.arc(point.x, point.y, base * pulse, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  resize()

  return {
    render,
    resize,
    setTime: (value) => { time = value },
    setPointer: (x, y) => { pointer.x = x; pointer.y = y },
    dispose: () => {
      // Releases the backing store on Safari, which otherwise keeps the full
      // DPR-scaled bitmap alive after the WebGL scene has taken over.
      canvas.width = 0
      canvas.height = 0
    },
  }
}
