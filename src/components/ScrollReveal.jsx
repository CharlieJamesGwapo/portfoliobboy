import { useEffect, useRef } from 'react'

let sharedObserver

const getObserver = () => {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          sharedObserver.unobserve(entry.target)
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -48px' },
    )
  }
  return sharedObserver
}

const ScrollReveal = ({
  children,
  className = '',
  delay = 0,
  duration = 640,
  variant = 'up',
}) => {
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.classList.add('is-visible')
      return
    }

    const observer = getObserver()
    observer.observe(element)
    return () => observer.unobserve(element)
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal reveal-${variant} ${className}`}
      style={{
        '--reveal-delay': `${delay}ms`,
        '--reveal-duration': `${duration}ms`,
      }}
    >
      {children}
    </div>
  )
}

export default ScrollReveal
