import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { navigation as links, profile } from '../data/portfolioData'

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef(null)
  const toggleRef = useRef(null)
  const scrollFrame = useRef(null)

  useEffect(() => {
    const sections = ['home', ...links.map((link) => link.href.slice(1))]
    const updateNavigation = () => {
      scrollFrame.current = null
      setScrolled(window.scrollY > 20)
      const marker = window.scrollY + 180
      let current = 'home'
      sections.forEach((id) => {
        const section = document.getElementById(id)
        if (section && section.offsetTop <= marker) current = id
      })
      setActive(current)
    }

    const scheduleNavigationUpdate = () => {
      if (scrollFrame.current !== null) return
      scrollFrame.current = window.requestAnimationFrame(updateNavigation)
    }

    updateNavigation()
    window.addEventListener('scroll', scheduleNavigationUpdate, { passive: true })
    window.addEventListener('resize', scheduleNavigationUpdate)
    return () => {
      if (scrollFrame.current !== null) window.cancelAnimationFrame(scrollFrame.current)
      window.removeEventListener('scroll', scheduleNavigationUpdate)
      window.removeEventListener('resize', scheduleNavigationUpdate)
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

        <a className="nav-cta desktop-cta" href={`mailto:${profile.email}`}>Let’s talk</a>

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
