// ============================================================================
// HeroSystemsScene — decorative "connected systems" visual for the hero.
//
// This used to be a Three.js scene. Three.js + @react-three/fiber cost ~808 kB
// (214 kB gzip) on the critical path for a purely decorative graphic, which
// dominated the landing page's load time. It is now a hand-written 2D canvas
// renderer with a pseudo-3D projection: same visual language, ~3 kB, no
// dependencies, and it runs on devices with no WebGL at all.
//
// Cost controls:
//   - paused when off-screen (IntersectionObserver) or the tab is hidden
//   - never animates under prefers-reduced-motion (draws one static frame)
//   - DPR capped at 1.5 (1 on small screens) so it stays cheap on phones
//   - fewer nodes/signals on small screens
// ============================================================================
import { useEffect, useRef } from 'react'

// Node layout in a normalised -1..1 space. z drives the depth projection.
const NODES = [
  { x: -0.86, y: 0.26, z: 0.00 },
  { x: -0.50, y: 0.60, z: -0.20 },
  { x: -0.30, y: 0.08, z: 0.30 },
  { x: 0.00, y: 0.38, z: 0.00 },
  { x: 0.35, y: 0.66, z: -0.18 },
  { x: 0.55, y: 0.15, z: 0.25 },
  { x: 0.90, y: 0.36, z: -0.03 },
  { x: -0.63, y: -0.36, z: 0.15 },
  { x: -0.05, y: -0.40, z: -0.15 },
  { x: 0.55, y: -0.35, z: 0.05 },
  { x: 0.00, y: 0.00, z: 0.10 }, // index 10 = the accent "core" node
]

const EDGES = [
  [0, 1], [0, 2], [1, 3], [2, 3], [2, 7], [2, 8], [3, 4], [3, 5],
  [3, 10], [4, 6], [5, 6], [5, 9], [7, 8], [8, 9], [8, 10],
]

const CORE = 10
const MINT = '103, 224, 193'
const CORAL = '255, 156, 119'

export default function HeroSystemsScene() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    let width = 0
    let height = 0
    let frame = null
    let onScreen = true
    let running = false
    let last = 0
    let time = 0
    // Pointer parallax, in -1..1. Eased toward the target each frame.
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }

    const compact = () => window.innerWidth < 768
    const signalCount = () => (compact() ? 7 : 12)

    const signals = EDGES.map((edge, index) => ({
      edge,
      speed: 0.09 + (index % 4) * 0.02,
      offset: (index / EDGES.length) % 1,
    }))

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const dpr = Math.min(window.devicePixelRatio || 1, compact() ? 1 : 1.5)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    // Project a normalised node into canvas space with a simple perspective
    // divide plus a slow rotation around Y, so the graph reads as 3D.
    const project = (node) => {
      const spin = time * 0.12
      const yaw = Math.sin(spin) * 0.28 + pointer.x * 0.45
      const pitch = -0.1 + pointer.y * 0.22

      const cosY = Math.cos(yaw)
      const sinY = Math.sin(yaw)
      let x = node.x * cosY - node.z * sinY
      let z = node.x * sinY + node.z * cosY

      const cosX = Math.cos(pitch)
      const sinX = Math.sin(pitch)
      let y = node.y * cosX - z * sinX
      z = node.y * sinX + z * cosX

      const scale = 2.6 / (2.6 - z * 0.85)
      const radius = Math.min(width, height) * 0.38
      return {
        x: width / 2 + x * radius * scale,
        y: height / 2 - y * radius * scale,
        scale,
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      const points = NODES.map(project)

      // Edges
      ctx.lineWidth = 1
      EDGES.forEach(([a, b]) => {
        const p = points[a]
        const q = points[b]
        const depth = (p.scale + q.scale) / 2
        ctx.strokeStyle = `rgba(${MINT}, ${(0.1 + (depth - 0.8) * 0.34).toFixed(3)})`
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(q.x, q.y)
        ctx.stroke()
      })

      // Travelling signal pulses along the edges
      const count = signalCount()
      for (let i = 0; i < count; i += 1) {
        const signal = signals[i % signals.length]
        const p = points[signal.edge[0]]
        const q = points[signal.edge[1]]
        const t = (time * signal.speed + signal.offset) % 1
        const x = p.x + (q.x - p.x) * t
        const y = p.y + (q.y - p.y) * t
        ctx.fillStyle = 'rgba(245, 242, 233, 0.9)'
        ctx.beginPath()
        ctx.arc(x, y, 2.1, 0, Math.PI * 2)
        ctx.fill()
      }

      // Nodes, painted back-to-front so nearer ones overlap correctly
      NODES.map((node, index) => ({ index, point: points[index] }))
        .sort((a, b) => a.point.scale - b.point.scale)
        .forEach(({ index, point }) => {
          const isCore = index === CORE
          const rgb = isCore ? CORAL : MINT
          const base = (isCore ? 7.5 : 4.4) * point.scale
          const pulse = 1 + Math.sin(time * 1.4 + index) * 0.07

          const glow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, base * 5)
          glow.addColorStop(0, `rgba(${rgb}, 0.34)`)
          glow.addColorStop(1, `rgba(${rgb}, 0)`)
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(point.x, point.y, base * 5, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = isCore ? '#ffb494' : '#8ff0d8'
          ctx.beginPath()
          ctx.arc(point.x, point.y, base * pulse, 0, Math.PI * 2)
          ctx.fill()
        })
    }

    const tick = (now) => {
      frame = null
      const delta = last ? Math.min((now - last) / 1000, 0.05) : 0.016
      last = now
      time += delta
      pointer.x += (pointer.tx - pointer.x) * Math.min(1, delta * 3)
      pointer.y += (pointer.ty - pointer.y) * Math.min(1, delta * 3)
      draw()
      if (running) frame = requestAnimationFrame(tick)
    }

    const shouldRun = () => onScreen && !document.hidden && !reduceMotion.matches

    const sync = () => {
      const next = shouldRun()
      if (next === running) return
      running = next
      if (running) {
        last = 0
        frame = requestAnimationFrame(tick)
      } else if (frame !== null) {
        cancelAnimationFrame(frame)
        frame = null
      }
    }

    const onPointerMove = (event) => {
      const rect = canvas.getBoundingClientRect()
      pointer.tx = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.ty = ((event.clientY - rect.top) / rect.height) * 2 - 1
    }

    const onPointerLeave = () => {
      pointer.tx = 0
      pointer.ty = 0
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting
        sync()
      },
      { rootMargin: '120px' },
    )
    observer.observe(canvas)

    const resizeObserver = new ResizeObserver(() => {
      resize()
      if (!running) draw()
    })
    resizeObserver.observe(canvas)

    resize()
    draw() // always paint one frame, even when motion is off
    sync()

    document.addEventListener('visibilitychange', sync)
    reduceMotion.addEventListener('change', sync)
    // Parallax is a pointer-only nicety; skip the listener on touch devices.
    const hasPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (hasPointer) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      canvas.addEventListener('pointerleave', onPointerLeave)
    }

    return () => {
      observer.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', sync)
      reduceMotion.removeEventListener('change', sync)
      if (hasPointer) {
        window.removeEventListener('pointermove', onPointerMove)
        canvas.removeEventListener('pointerleave', onPointerLeave)
      }
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="systems-scene">
      <div className="systems-fallback" aria-hidden="true">
        <span /><span /><span /><span /><span />
      </div>
      <canvas ref={canvasRef} className="systems-canvas" aria-hidden="true" />
    </div>
  )
}
