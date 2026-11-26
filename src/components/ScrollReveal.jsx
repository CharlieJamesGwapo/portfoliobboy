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
      // A tall case study must reveal even when only its first edge fits.
      { threshold: 0, rootMargin: '0px 0px -32px' },
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
  as: Element = 'div',
}) => {
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Anything the observer can't handle reveals immediately rather than
    // staying invisible — content is never allowed to depend on an animation.
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      element.classList.add('is-visible')
      return
    }

    const observer = getObserver()
    observer.observe(element)
    return () => observer.unobserve(element)
  }, [])

  return (
    <Element
      ref={ref}
      className={`reveal reveal-${variant} ${className}`}
      style={{
        '--reveal-delay': `${delay}ms`,
        '--reveal-duration': `${duration}ms`,
      }}
    >
      {children}
    </Element>
  )
}

export default ScrollReveal
