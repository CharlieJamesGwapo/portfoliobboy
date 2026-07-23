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

  useEffect(() => {
    const updateScrollState = () => {
      scrollFrame.current = null
      setShowTop(window.scrollY > 640)
      const height = document.documentElement.scrollHeight - window.innerHeight
      const progress = height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0
      document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(4))
    }

    const scheduleScrollUpdate = () => {
      if (scrollFrame.current !== null) return
      scrollFrame.current = window.requestAnimationFrame(updateScrollState)
    }

    updateScrollState()
    window.addEventListener('scroll', scheduleScrollUpdate, { passive: true })
    window.addEventListener('resize', scheduleScrollUpdate)
    return () => {
      if (scrollFrame.current !== null) window.cancelAnimationFrame(scrollFrame.current)
      window.removeEventListener('scroll', scheduleScrollUpdate)
      window.removeEventListener('resize', scheduleScrollUpdate)
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
      <div className="scroll-progress" aria-hidden="true" />
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
