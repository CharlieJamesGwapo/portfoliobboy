import { useEffect, useRef, useState } from 'react'

export default function AnimatedStat({ value, numericValue, suffix = '' }) {
  const [display, setDisplay] = useState(value)
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof numericValue !== 'number') return undefined
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion || !('IntersectionObserver' in window)) {
      setDisplay(`${numericValue}${suffix}`)
      return undefined
    }

    let frame = 0
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const startedAt = performance.now()
      const duration = 780
      const animate = (time) => {
        const progress = Math.min(1, (time - startedAt) / duration)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplay(`${Math.round(numericValue * eased)}${suffix}`)
        if (progress < 1) frame = window.requestAnimationFrame(animate)
      }
      frame = window.requestAnimationFrame(animate)
    }, { threshold: 0.45 })

    observer.observe(node)
    return () => {
      observer.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [numericValue, suffix])

  return <strong ref={ref}>{display}</strong>
}
