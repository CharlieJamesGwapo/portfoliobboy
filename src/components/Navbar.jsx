import { useEffect, useRef, useState } from 'react'
import { Menu, Search, X } from 'lucide-react'
import { navigation as links, profile } from '../data/portfolioData'

const openPalette = () => window.dispatchEvent(new CustomEvent('portfolio:open-palette'))

// Apple keyboards label the key ⌘; everywhere else it is Ctrl. Reading the
// platform lets the hint match the key the visitor actually has to press.
const isApplePlatform = () =>
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef(null)
  const toggleRef = useRef(null)
  const scrollFrame = useRef(null)

  useEffect(() => {
    const ids = ['home', ...links.map((link) => link.href.slice(1))]

    // Section offsets are cached. Reading `offsetTop` forces a synchronous
    // layout, and doing that for every section on every scroll frame was the
    // most expensive thing happening during a scroll. Offsets only change when
    // the page is re-laid out, so that is when we re-measure.
    let offsets = []
    const measure = () => {
      offsets = ids
        .map((id) => {
          const section = document.getElementById(id)
          return section ? { id, top: section.offsetTop } : null
        })
        .filter(Boolean)
        .sort((a, b) => a.top - b.top) // the early-out below relies on this order
    }

    // Cheap refs avoid re-rendering the whole navbar on frames where nothing
    // actually changed.
    let lastScrolled = null
    let lastActive = null

    const updateNavigation = () => {
      scrollFrame.current = null
      const y = window.scrollY

      const nextScrolled = y > 20
      if (nextScrolled !== lastScrolled) {
        lastScrolled = nextScrolled
        setScrolled(nextScrolled)
      }

      const marker = y + 180
      let current = 'home'
      for (let i = 0; i < offsets.length; i += 1) {
        if (offsets[i].top <= marker) current = offsets[i].id
        else break
      }
      if (current !== lastActive) {
        lastActive = current
        setActive(current)
      }
    }

    const scheduleNavigationUpdate = () => {
      if (scrollFrame.current !== null) return
      scrollFrame.current = window.requestAnimationFrame(updateNavigation)
    }

    const onResize = () => {
      measure()
      scheduleNavigationUpdate()
    }

    measure()
    updateNavigation()
    window.addEventListener('scroll', scheduleNavigationUpdate, { passive: true })
    window.addEventListener('resize', onResize)

    // Sections grow as images and lazy content settle, which moves the offsets.
    const resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(document.documentElement)

    return () => {
      if (scrollFrame.current !== null) window.cancelAnimationFrame(scrollFrame.current)
      window.removeEventListener('scroll', scheduleNavigationUpdate)
      window.removeEventListener('resize', onResize)
      resizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle('menu-open', open)
    const main = document.getElementById('main-content')
    const footer = document.querySelector('.footer')
    main?.toggleAttribute('inert', open)
    footer?.toggleAttribute('inert', open)

    const focusTimer = open
      ? window.setTimeout(() => menuRef.current?.querySelector('a')?.focus(), 80)
      : null

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && open) {
        setOpen(false)
        window.setTimeout(() => toggleRef.current?.focus(), 0)
      }

      if (event.key === 'Tab' && open) {
        const focusable = [toggleRef.current, ...Array.from(menuRef.current?.querySelectorAll('a, button') || [])]
          .filter(Boolean)
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      if (focusTimer) window.clearTimeout(focusTimer)
      document.body.classList.remove('menu-open')
      main?.removeAttribute('inert')
      footer?.removeAttribute('inert')
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const closeMenu = () => setOpen(false)

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="nav-inner">
        <a href="#home" className="wordmark" onClick={() => { setActive('home'); closeMenu() }} aria-label={`${profile.shortName}, home`}>
          <span className="wordmark-mark" aria-hidden="true">CA</span>
          <span>{profile.shortName}</span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setActive(link.href.slice(1))}
              className={active === link.href.slice(1) ? 'active' : ''}
              aria-current={active === link.href.slice(1) ? 'location' : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className="nav-search"
            onClick={openPalette}
            aria-label="Open command palette to search sections and actions"
          >
            <Search size={15} aria-hidden="true" />
            <span>Search</span>
            <kbd aria-hidden="true">{isApplePlatform() ? '⌘' : 'Ctrl'} K</kbd>
          </button>
          <a className="nav-cta desktop-cta" href={`mailto:${profile.email}`}>Let’s talk</a>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div ref={menuRef} id="mobile-navigation" className={`mobile-menu ${open ? 'is-open' : ''}`}>
        <nav aria-label="Mobile navigation">
          {links.map((link, index) => (
            <a key={link.href} href={link.href} onClick={() => { setActive(link.href.slice(1)); closeMenu() }} style={{ '--menu-index': index }}>
              <span>0{index + 1}</span>
              {link.label}
            </a>
          ))}
          <div className="mobile-menu-actions">
            <a className="mobile-contact" href={`mailto:${profile.email}`} onClick={closeMenu}>Start a conversation</a>
            <button
              type="button"
              className="mobile-music"
              onClick={() => {
                closeMenu()
                openPalette()
              }}
            >
              Search sections and actions
            </button>
            <button
              type="button"
              className="mobile-music"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('portfolio:open-music'))
                closeMenu()
              }}
            >
              Open music player
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
