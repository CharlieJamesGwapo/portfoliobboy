import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUp, Loader2, Music2 } from 'lucide-react'
import { prefetchProps } from './lib/prefetch'
import CommandPalette from './components/CommandPalette'
import UpdateBanner from './components/UpdateBanner'
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

const loadMusicPlayer = () => import('./components/MusicPlayer')
const MusicPlayer = lazy(loadMusicPlayer)
const warmMusicPlayer = prefetchProps('music', loadMusicPlayer)

function App() {
  const [showTop, setShowTop] = useState(false)
  const [musicOpen, setMusicOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
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

  // Deep links (/#projects, /#contact — the URLs the nav itself produces and
  // people share) did nothing on a cold load: the browser looks for the anchor
  // while the document is still just an empty #root, finds nothing, and never
  // retries once React has rendered. Re-running the jump after mount fixes
  // that, and repeating it once more after layout settles absorbs the shift
  // from the font swap and the images resolving.
  useEffect(() => {
    const hash = window.location.hash
    if (hash.length < 2) return undefined

    let target
    try {
      target = document.querySelector(hash)
    } catch {
      return undefined // a hash that isn't a valid selector, e.g. "#!/foo"
    }
    if (!target) return undefined

    // 'instant' overrides the smooth scroll-behavior on <html>: a page-length
    // smooth scroll on arrival is disorienting, and it fights the second pass.
    const jump = () => target.scrollIntoView({ block: 'start', behavior: 'instant' })
    jump()
    const frame = window.requestAnimationFrame(jump)
    const settle = window.setTimeout(jump, 400)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(settle)
    }
  }, [])

  const closePalette = useCallback(() => setPaletteOpen(false), [])

  useEffect(() => {
    const openPalette = () => setPaletteOpen(true)

    const onKeyDown = (event) => {
      // ⌘K on macOS, Ctrl+K elsewhere. Both are claimed by the browser's
      // address bar in some configurations, so `/` is offered as a second
      // opener — but only when the visitor is not already typing somewhere.
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
      const target = event.target
      const typing = target instanceof HTMLElement
        && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

      if (isShortcut) {
        event.preventDefault()
        setPaletteOpen((value) => !value)
        return
      }
      if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault()
        setPaletteOpen(true)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('portfolio:open-palette', openPalette)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('portfolio:open-palette', openPalette)
    }
  }, [])

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

      <CommandPalette open={paletteOpen} onClose={closePalette} />
      <UpdateBanner />

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
          {...warmMusicPlayer}
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
