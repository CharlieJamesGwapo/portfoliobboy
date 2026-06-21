// ============================================================================
// MobileControls — touch D-pad (bottom-left) + Attack/Interact (bottom-right).
// Rendered only on touch-capable devices (coarse pointer / touch points),
// regardless of viewport width. Drives the engine via its ref.
// ============================================================================
import { useEffect, useState } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Sword, Hand } from 'lucide-react'

export default function MobileControls({ engineRef }) {
  const [isTouch, setIsTouch] = useState(false)
  useEffect(() => {
    const check = () => {
      try {
        const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches
        setIsTouch(Boolean(coarse) || 'ontouchstart' in window || navigator.maxTouchPoints > 0)
      } catch {
        setIsTouch('ontouchstart' in window)
      }
    }
    check()
    const onTouch = () => setIsTouch(true)
    window.addEventListener('touchstart', onTouch, { once: true, passive: true })
    return () => window.removeEventListener('touchstart', onTouch)
  }, [])

  if (!isTouch) return null

  const press = (dir, down) => (e) => {
    e.preventDefault()
    engineRef.current?.pressDir(dir, down)
  }
  const attack = (e) => {
    e.preventDefault()
    engineRef.current?.pressAttack()
  }
  const interact = (e) => {
    e.preventDefault()
    engineRef.current?.pressInteract()
  }

  const dirBtn =
    'pointer-events-auto flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 border border-white/20 text-white active:bg-cyan-500/40 active:scale-95 transition-all backdrop-blur-sm'

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      {/* D-pad bottom-left */}
      <div className="absolute bottom-6 left-5 grid grid-cols-3 grid-rows-3 gap-1 w-44 h-44">
        <div />
        <button className={dirBtn} onPointerDown={press('up', true)} onPointerUp={press('up', false)} onPointerLeave={press('up', false)} aria-label="Move up">
          <ChevronUp size={26} />
        </button>
        <div />
        <button className={dirBtn} onPointerDown={press('left', true)} onPointerUp={press('left', false)} onPointerLeave={press('left', false)} aria-label="Move left">
          <ChevronLeft size={26} />
        </button>
        <div />
        <button className={dirBtn} onPointerDown={press('right', true)} onPointerUp={press('right', false)} onPointerLeave={press('right', false)} aria-label="Move right">
          <ChevronRight size={26} />
        </button>
        <div />
        <button className={dirBtn} onPointerDown={press('down', true)} onPointerUp={press('down', false)} onPointerLeave={press('down', false)} aria-label="Move down">
          <ChevronDown size={26} />
        </button>
        <div />
      </div>

      {/* Action buttons bottom-right */}
      <div className="absolute bottom-8 right-6 flex flex-col items-center gap-3">
        <button
          onPointerDown={interact}
          className="pointer-events-auto flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/30 border border-amber-400/50 text-amber-100 active:scale-95 active:bg-amber-500/50 transition-all backdrop-blur-sm"
          aria-label="Interact"
        >
          <Hand size={24} />
        </button>
        <button
          onPointerDown={attack}
          className="pointer-events-auto flex items-center justify-center w-20 h-20 rounded-full bg-red-500/30 border border-red-400/50 text-red-100 active:scale-95 active:bg-red-500/50 transition-all backdrop-blur-sm"
          aria-label="Attack"
        >
          <Sword size={30} />
        </button>
      </div>
    </div>
  )
}
