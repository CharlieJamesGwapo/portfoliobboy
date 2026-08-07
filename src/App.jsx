import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ArrowUp, Loader2, Music2 } from 'lucide-react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Education from './components/Education'
import InteractiveLab from './components/InteractiveLab'
import Contact from './components/Contact'
import Footer from './components/Footer'

const MusicPlayer = lazy(() => import('./components/MusicPlayer'))

function App() {
  const [showTop, setShowTop] = useState(false)
  const [musicOpen, setMusicOpen] = useState(false)
  const scrollFrame = useRef(null)
  const musicButtonRef = useRef(null)
  const progressRef = useRef(null)
  const showTopRef = useRef(false)

  useEffect(() => {
    // scrollHeight is a layout-forcing read, so it is measured once per resize
    // rather than on every scroll frame.
    let maxScroll = 0
    const measure = () => {
      maxScroll = document.documentElement.scrollHeight - window.innerHeight
    }

    const updateScrollState = () => {
      scrollFrame.current = null
      const y = window.scrollY

      // Only re-render when the boolean actually flips. Previously every scroll
      // frame called setState with the same value.
      const nextShowTop = y > 640
      if (nextShowTop !== showTopRef.current) {
        showTopRef.current = nextShowTop
        setShowTop(nextShowTop)
      }

      // Write the transform straight onto the progress bar. Setting a custom
      // property on :root invalidates style for every element that inherits it,
      // which on a page this tall meant a full-document recalc each frame.
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

    // The page grows as lazy sections and images settle; re-measure when it does.
    const resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(document.documentElement)

    return () => {
      if (scrollFrame.current !== null) window.cancelAnimationFrame(scrollFrame.current)
      window.removeEventListener('scroll', scheduleScrollUpdate)
      window.removeEventListener('resize', onResize)
      resizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    const openMusic = () => setMusicOpen(true)
    window.addEventListener('portfolio:open-music', openMusic)
    document.body.classList.toggle('music-open', musicOpen)
    return () => {
      window.removeEventListener('portfolio:open-music', openMusic)
      document.body.classList.remove('music-open')
    }
  }, [musicOpen])

  return (
    <div className="site-shell">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div ref={progressRef} className="scroll-progress" aria-hidden="true" />
      <Navbar />
      <main id="main-content">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <InteractiveLab />
        <Contact />
      </main>
      <Footer />

      <button
        type="button"
        className={`back-to-top ${showTop ? 'is-visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
      >
        <ArrowUp size={18} aria-hidden="true" />
      </button>

      {!musicOpen && (
        <button
          ref={musicButtonRef}
          type="button"
          className="music-launcher"
          onClick={() => setMusicOpen(true)}
          aria-label="Open optional music player"
        >
          <Music2 size={17} aria-hidden="true" />
          <span>Music</span>
        </button>
      )}

      {musicOpen && (
        <Suspense fallback={<div className="music-loading" role="status"><Loader2 className="spin" size={17} /> Loading music controls…</div>}>
          <MusicPlayer onClose={() => {
            setMusicOpen(false)
            window.setTimeout(() => musicButtonRef.current?.focus(), 0)
          }} />
        </Suspense>
      )}
    </div>
  )
}

export default App
