import { useEffect, useRef, useState } from 'react'
import { getVoiceLevel } from '../../lib/voiceActivity'

// The CSS orb paints immediately and stays as the fallback. A three.js
// particle sphere replaces its core once the orb is on screen and the browser
// is idle, and only when motion is welcome and the connection can afford it.
function motionAllowed() {
  // Touch screens keep the lightweight CSS visual. A decorative renderer must
  // not compete with scrolling, media playback, or the visitor's voice session.
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (connection?.saveData) return false
  if (connection?.effectiveType && connection.effectiveType !== '4g') return false
  return true
}

function canUpgrade() {
  if (!motionAllowed()) return false
  try {
    const probe = document.createElement('canvas')
    return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'))
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

export default function VoiceOrb3D() {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas || typeof IntersectionObserver === 'undefined') return undefined

    let orb = null
    let disposed = false
    let onScreen = false
    let cancelIdle = null
    let requested = false

    const sync = () => {
      if (!orb) return
      if (onScreen && document.visibilityState === 'visible' && motionAllowed()) orb.start()
      else orb.stop()
    }

    const upgrade = () => {
      if (requested || !canUpgrade()) return
      requested = true
      cancelIdle = scheduleIdle(() => {
        if (disposed || !onScreen || !motionAllowed()) { requested = false; return }
        import('../../lib/voiceOrbWebgl')
          .then(({ createVoiceOrb }) => {
            if (disposed) return
            if (!onScreen || !motionAllowed()) { requested = false; return }
            orb = createVoiceOrb(canvas, {
              getLevel: getVoiceLevel,
              compact: window.matchMedia('(max-width: 640px)').matches,
              onContextLost: () => { orb = null; setLive(false) },
            })
            if (!orb) return
            orb.resize()
            setLive(true)
            sync()
          })
          .catch(() => { /* the CSS orb simply stays */ })
      })
    }

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      if (onScreen) upgrade()
      sync()
    }, { rootMargin: '200px' })
    observer.observe(root)

    const resizeObserver = new ResizeObserver(() => orb?.resize())
    resizeObserver.observe(canvas)

    const onPointer = (event) => {
      if (!orb) return
      const rect = root.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2
      orb.setPointer(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y)))
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.addEventListener('visibilitychange', sync)
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pointerPreference = window.matchMedia('(hover: hover) and (pointer: fine)')
    const onCapabilityChange = () => { if (onScreen) upgrade(); sync() }
    motionPreference.addEventListener('change', onCapabilityChange)
    pointerPreference.addEventListener('change', onCapabilityChange)

    return () => {
      disposed = true
      cancelIdle?.()
      observer.disconnect()
      resizeObserver.disconnect()
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', sync)
      motionPreference.removeEventListener('change', onCapabilityChange)
      pointerPreference.removeEventListener('change', onCapabilityChange)
      orb?.dispose()
    }
  }, [])

  return (
    <div ref={rootRef} className={`vs-orb ${live ? 'is-3d' : ''}`} aria-hidden="true">
      <span className="vs-orb-glow" />
      <span className="vs-orb-ring" />
      <span className="vs-orb-ring vs-orb-ring-2" />
      <span className="vs-orb-core">
        <i /><i /><i /><i /><i />
      </span>
      <canvas ref={canvasRef} className="vs-orb-canvas" />
    </div>
  )
}
