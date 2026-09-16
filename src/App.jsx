import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Skills from './components/Skills'
import Education from './components/Education'
import Contact from './components/Contact'
import Footer from './components/Footer'

const getScrollBehavior = () => (
  typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth'
)

function App() {
  const [showTop, setShowTop] = useState(false)
  const scrollFrame = useRef(null)
  const progressRef = useRef(null)
  const showTopRef = useRef(false)

  useEffect(() => {
    // Measure document height on resize, then keep scroll handlers to one frame.
    let maxScroll = 0
    const measure = () => {
      maxScroll = document.documentElement.scrollHeight - window.innerHeight
    }

    const updateScrollState = () => {
      scrollFrame.current = null
      const y = window.scrollY
      const nextShowTop = y > 640

      if (nextShowTop !== showTopRef.current) {
        showTopRef.current = nextShowTop
        setShowTop(nextShowTop)
      }

      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, y / maxScroll)) : 0
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${progress.toFixed(4)})`
      }
    }

    const scheduleScrollUpdate = () => {
      if (scrollFrame.current !== null) return
      scrollFrame.current = window.requestAnimationFrame(updateScrollState)
    }

    const onResize = () => {
      measure()
      scheduleScrollUpdate()
    }

    measure()
    updateScrollState()
    window.addEventListener('scroll', scheduleScrollUpdate, { passive: true })
    window.addEventListener('resize', onResize)

    const resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(document.documentElement)

    return () => {
      if (scrollFrame.current !== null) window.cancelAnimationFrame(scrollFrame.current)
      window.removeEventListener('scroll', scheduleScrollUpdate)
      window.removeEventListener('resize', onResize)
      resizeObserver.disconnect()
    }
  }, [])

  // React mounts after the browser's first hash lookup. Repeat the lookup after
  // render and after layout settles so shared section links land correctly.
  useEffect(() => {
    const targetId = window.location.hash.slice(1)
    if (!targetId) return undefined

    const target = document.getElementById(targetId)
    if (!target) return undefined

    const jump = () => target.scrollIntoView({ block: 'start', behavior: 'auto' })
    jump()
    const frame = window.requestAnimationFrame(jump)
    const settle = window.setTimeout(jump, 400)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(settle)
    }
  }, [])

  const handleSkip = (event) => {
    const target = document.getElementById('main-content')
    if (!target) return
    event.preventDefault()
    target.focus({ preventScroll: true })
    target.scrollIntoView({ block: 'start', behavior: getScrollBehavior() })
  }

  return (
    <div className="site-shell">
      <a href="#main-content" className="skip-link" onClick={handleSkip}>Skip to content</a>
      <div ref={progressRef} className="scroll-progress" aria-hidden="true" />
      <Navbar />
      <main id="main-content" tabIndex="-1">
        <Hero />
        <Projects />
        <Experience />
        <Skills />
        <Education />
        <Contact />
      </main>
      <Footer />

      <button
        type="button"
        className={`back-to-top ${showTop ? 'is-visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: getScrollBehavior() })}
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
      >
        <ArrowUp size={18} aria-hidden="true" />
      </button>
    </div>
  )
}

export default App
