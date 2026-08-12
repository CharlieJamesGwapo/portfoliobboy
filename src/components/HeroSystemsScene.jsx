// ============================================================================
// HeroSystemsScene — the hero's "connected systems" graphic.
//
// Two renderers, one graph, one animation loop:
//
//   1. A 2D canvas (hero2d.js, ~3 kB, no dependencies) paints on the first
//      frame. It is what the hero's LCP measures, it works with WebGL
//      disabled, and on constrained devices it is the whole experience.
//
//   2. A Three.js scene (heroWebgl.js) is dynamically imported during idle
//      time — only once the hero is actually on screen, and only when the
//      device looks like it can spare the GPU. It fades in over the 2D canvas
//      and the 2D renderer is then torn down.
//
// This is why the WebGL upgrade never regresses the load: three.js is not in
// the entry graph, is not preloaded, and is not fetched at all on a phone with
// Data Saver on, a 2G connection, reduced motion, or no working WebGL.
//
// Cost controls that apply to both renderers:
//   - paused off-screen (IntersectionObserver) and in background tabs
//   - one static frame under prefers-reduced-motion, then no loop at all
//   - device pixel ratio capped (lower on small screens)
//   - fewer nodes and signals on small screens
//   - pointer parallax only on real pointer devices
// ============================================================================
import { useEffect, useRef } from 'react'
import { buildHeroGraph } from '../lib/heroGraph'
import { createHero2D } from '../lib/hero2d'

const CROSSFADE_SECONDS = 0.8

// A cheap, self-contained probe. Deliberately conservative: when in doubt we
// keep the 2D canvas, because a janky WebGL hero is worse than a smooth 2D one.
function canUpgradeToWebGL() {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (media.matches) return false

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (connection?.saveData) return false
  // Anything below 4g stays on the 2D canvas. three.js is ~170 kB gzipped and
  // this is a decorative upgrade — it is never worth a slow connection.
  if (connection?.effectiveType && connection.effectiveType !== '4g') return false

  // Both hints are Chromium-only; when absent we assume a capable device
  // rather than blocking Safari and Firefox out of the upgrade entirely.
  if (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory < 4) return false
  if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency < 4) return false

  // Probe in a throwaway canvas so a refused context costs nothing, and
  // immediately release it — browsers cap live WebGL contexts per page.
  try {
    const probe = document.createElement('canvas')
    const gl = probe.getContext('webgl2', { failIfMajorPerformanceCaveat: true })
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

const scheduleIdle = (callback) => {
  if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(callback, { timeout: 2500 })
    return () => window.cancelIdleCallback(handle)
  }
  const handle = window.setTimeout(callback, 1200)
  return () => window.clearTimeout(handle)
}

export default function HeroSystemsScene() {
  const shellRef = useRef(null)
  const canvas2dRef = useRef(null)
  const canvasGlRef = useRef(null)

  useEffect(() => {
    const shell = shellRef.current
    const canvas2d = canvas2dRef.current
    const canvasGl = canvasGlRef.current
    if (!shell || !canvas2d || !canvasGl) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const compact = window.matchMedia('(max-width: 767px)')

    const graph = buildHeroGraph({ count: compact.matches ? 20 : 32 })
    let renderer2d = createHero2D(canvas2d, graph)
    let rendererGl = null

    let disposed = false
    let frame = null
    let running = false
    let onScreen = false
    let last = 0
    let time = 0
    let fade = 0 // 0 = pure 2D, 1 = pure WebGL
    let cancelIdle = null
    let upgradeStarted = false

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }

    const renderOnce = () => {
      renderer2d?.setTime(time)
      renderer2d?.setPointer(pointer.x, pointer.y)
      renderer2d?.render()
      rendererGl?.setTime(time)
      rendererGl?.setPointer(pointer.x, pointer.y)
      rendererGl?.render()
    }

    const tick = (now) => {
      frame = null
      const delta = last ? Math.min((now - last) / 1000, 0.05) : 0.016
      last = now
      time += delta

      const ease = Math.min(1, delta * 3)
      pointer.x += (pointer.tx - pointer.x) * ease
      pointer.y += (pointer.ty - pointer.y) * ease

      if (rendererGl && fade < 1) {
        fade = Math.min(1, fade + delta / CROSSFADE_SECONDS)
        // smoothstep keeps the dissolve from having a visible start and stop
        const eased = fade * fade * (3 - 2 * fade)
        rendererGl.setOpacity(eased)
        canvas2d.style.opacity = String(1 - eased)
        if (fade >= 1) {
          // The 2D canvas has finished handing over. Drop its backing store and
          // take it out of the compositor entirely.
          canvas2d.style.display = 'none'
          renderer2d?.dispose()
          renderer2d = null
        }
      }

      renderOnce()
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

    // --- the WebGL upgrade ---------------------------------------------------
    const fallBackTo2D = () => {
      if (!rendererGl) return
      rendererGl.dispose()
      rendererGl = null
      canvasGl.style.display = 'none'
      fade = 0
      // Bring the 2D canvas back if the handover had already started.
      canvas2d.style.display = ''
      canvas2d.style.opacity = '1'
      if (!renderer2d) {
        renderer2d = createHero2D(canvas2d, graph)
        renderer2d?.resize()
      }
      renderOnce()
    }

    const startUpgrade = () => {
      if (upgradeStarted || disposed || !canUpgradeToWebGL()) return
      upgradeStarted = true

      cancelIdle = scheduleIdle(() => {
        cancelIdle = null
        if (disposed) return
        import('../lib/heroWebgl')
          .then(({ createHeroWebGL }) => {
            if (disposed) return

            // Unhide *before* constructing the renderer. A display:none canvas
            // measures 0×0, so the renderer's initial sizing pass would bail
            // and leave the drawing buffer at the 300×150 default, stretched
            // across the frame by the CSS.
            canvasGl.style.display = ''

            const created = createHeroWebGL(canvasGl, graph, {
              maxPixelRatio: compact.matches ? 1.25 : 1.6,
              onContextLost: fallBackTo2D,
            })
            if (!created) {
              canvasGl.style.display = 'none'
              return
            }

            rendererGl = created
            rendererGl.resize()
            rendererGl.setOpacity(0)
            rendererGl.setPointer(pointer.x, pointer.y)
            sync()
            // Draw the first WebGL frame straight away so the dissolve starts
            // from a real image rather than from an empty canvas.
            renderOnce()
          })
          .catch(() => {
            // A failed chunk fetch simply means the hero stays 2D.
          })
      })
    }

    // --- observers and input -------------------------------------------------
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting
        sync()
        if (onScreen) startUpgrade()
      },
      { rootMargin: '120px' },
    )
    observer.observe(shell)

    const resizeObserver = new ResizeObserver(() => {
      renderer2d?.resize()
      rendererGl?.resize()
      if (!running) renderOnce()
    })
    resizeObserver.observe(shell)

    const onPointerMove = (event) => {
      const rect = shell.getBoundingClientRect()
      pointer.tx = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.ty = ((event.clientY - rect.top) / rect.height) * 2 - 1
    }
    const onPointerLeave = () => {
      pointer.tx = 0
      pointer.ty = 0
    }

    const hasPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (hasPointer) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      shell.addEventListener('pointerleave', onPointerLeave)
    }

    document.addEventListener('visibilitychange', sync)
    reduceMotion.addEventListener('change', sync)

    // Always paint one frame, even when motion is off and the loop never runs.
    renderOnce()
    sync()

    return () => {
      disposed = true
      cancelIdle?.()
      observer.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', sync)
      reduceMotion.removeEventListener('change', sync)
      if (hasPointer) {
        window.removeEventListener('pointermove', onPointerMove)
        shell.removeEventListener('pointerleave', onPointerLeave)
      }
      if (frame !== null) cancelAnimationFrame(frame)
      renderer2d?.dispose()
      rendererGl?.dispose()
    }
  }, [])

  return (
    <div ref={shellRef} className="systems-scene">
      {/* Pure-CSS dots: what a visitor sees if the JS bundle never arrives. */}
      <div className="systems-fallback" aria-hidden="true">
        <span /><span /><span /><span /><span />
      </div>
      <canvas ref={canvas2dRef} className="systems-canvas" aria-hidden="true" />
      <canvas ref={canvasGlRef} className="systems-canvas systems-canvas-gl" aria-hidden="true" style={{ display: 'none' }} />
    </div>
  )
}
