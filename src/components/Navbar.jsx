import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronRight, Menu, Search, X } from 'lucide-react'
import { profile, resumeUrl } from '../data/portfolioData'
import ThemeToggle from './ThemeToggle'
import './navbar-preview.css'
import './theme.css'
import './homepage-refresh.css'

const openPalette = () => window.dispatchEvent(new CustomEvent('portfolio:open-palette'))

const primaryNavigation = [
  { label: 'Featured work', href: '#product-studio-preview', activeId: 'product-studio-preview' },
  { label: 'Projects', href: '/projects', activeId: 'projects-route', route: true },
  { label: 'AI & Automation', href: '#ai-systems', activeId: 'ai-systems' },
  { label: 'Experience', href: '#experience', activeId: 'experience' },
  { label: 'Contact', href: '#contact', activeId: 'contact' },
]

const moreNavigation = [
  { label: 'About', href: '#about', activeId: 'about' },
  { label: 'Skills', href: '#skills', activeId: 'skills' },
  { label: 'Credentials', href: '#education', activeId: 'education' },
  { label: 'Voice demo', href: '#voice-demo', activeId: 'voice-demo' },
  { label: 'Interactive Lab', href: '/lab', activeId: 'lab-route', route: true },
  { label: 'Resume PDF', href: resumeUrl, activeId: 'resume', download: 'charlie-james-abejo-resume.pdf' },
]

const mobileNavigation = [
  { label: 'Home', href: '/', activeId: 'home', route: true },
  ...primaryNavigation,
  ...moreNavigation,
]

const navigationTargets = [...primaryNavigation, ...moreNavigation]

const normalizedPathname = () => {
  if (typeof window === 'undefined') return '/'
  return window.location.pathname.replace(/\/+$/, '') || '/'
}

const routeActiveId = () => {
  const pathname = normalizedPathname()
  if (pathname === '/projects' || pathname.startsWith('/projects/')) return 'projects-route'
  if (pathname === '/lab') return 'lab-route'
  return null
}

const resolveHref = (href) => {
  if (!href.startsWith('#') || normalizedPathname() === '/') return href
  return `/${href}`
}

// Apple keyboards label the key ⌘; everywhere else it is Ctrl. Reading the
// platform lets the hint match the key the visitor actually has to press.
const isApplePlatform = () =>
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const menuRef = useRef(null)
  const toggleRef = useRef(null)
  const moreRef = useRef(null)
  const moreToggleRef = useRef(null)
  const scrollFrame = useRef(null)

  useEffect(() => {
    const sectionIds = ['home', ...navigationTargets.filter((link) => link.href.startsWith('#')).map((link) => link.href.slice(1))]
    let offsets = []
    const measure = () => {
      offsets = sectionIds
        .map((id) => {
          const section = document.getElementById(id)
          return section?.getClientRects().length
            ? { id, top: section.getBoundingClientRect().top + window.scrollY }
            : null
        })
        .filter(Boolean)
        .sort((a, b) => a.top - b.top)
    }

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

      const routeId = routeActiveId()
      let current = routeId || 'home'
      if (!routeId) {
        const marker = y + 180
        for (let index = 0; index < offsets.length; index += 1) {
          if (offsets[index].top <= marker) current = offsets[index].id
          else break
        }
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

    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(onResize)
    resizeObserver?.observe(document.documentElement)

    return () => {
      if (scrollFrame.current !== null) window.cancelAnimationFrame(scrollFrame.current)
      window.removeEventListener('scroll', scheduleNavigationUpdate)
      window.removeEventListener('resize', onResize)
      resizeObserver?.disconnect()
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
          .filter((element) => element && !element.disabled)
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

  useEffect(() => {
    const closeViewportSpecificDisclosure = () => {
      if (window.innerWidth > 860) {
        setOpen(false)
        return
      }

      const focusInsideMore = moreRef.current?.contains(document.activeElement)
      if (focusInsideMore) window.setTimeout(() => toggleRef.current?.focus(), 0)
      setMoreOpen(false)
    }

    window.addEventListener('resize', closeViewportSpecificDisclosure)
    return () => window.removeEventListener('resize', closeViewportSpecificDisclosure)
  }, [])

  useEffect(() => {
    if (!moreOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMoreOpen(false)
        window.setTimeout(() => moreToggleRef.current?.focus(), 0)
      }
    }

    const onPointerDown = (event) => {
      if (!moreRef.current?.contains(event.target)) setMoreOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [moreOpen])

  const closeMenu = () => setOpen(false)
  const closeMore = () => setMoreOpen(false)
  const handleMoreFocusOut = (event) => {
    if (event.currentTarget.contains(event.relatedTarget)) return
    if (!event.relatedTarget && window.innerWidth <= 860) {
      window.setTimeout(() => toggleRef.current?.focus(), 0)
    }
    closeMore()
  }
  const moreIsActive = moreNavigation.some((link) => active === link.activeId)
  const isHome = normalizedPathname() === '/'

  const renderLink = (link, index, mobile = false) => {
    const isRouteActive = Boolean(link.route && active === link.activeId)
    const isSectionActive = !link.route && active === link.activeId
    const current = isRouteActive ? 'page' : isSectionActive ? 'location' : undefined
    return (
      <a
        key={`${link.activeId}-${link.label}`}
        href={resolveHref(link.href)}
        className={`${isRouteActive || isSectionActive ? 'active' : ''}${link.download ? ' nav-resume-link' : ''}`}
        aria-current={current}
        onClick={() => {
          setActive(link.activeId)
          closeMenu()
          closeMore()
        }}
        style={mobile ? { '--menu-index': index } : undefined}
        {...(link.download ? { download: link.download } : {})}
      >
        {mobile && <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>}
        {link.label}
        {!mobile && <ChevronRight size={13} aria-hidden="true" />}
      </a>
    )
  }

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="nav-inner">
        <a
          href={isHome ? '#home' : '/'}
          className="wordmark"
          onClick={() => { setActive('home'); closeMenu(); closeMore() }}
          aria-label={`${profile.shortName}, home`}
        >
          <span className="wordmark-mark" aria-hidden="true">CA</span>
          <span>{profile.shortName}</span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {primaryNavigation.map((link) => (
            <a
              key={link.activeId}
              href={resolveHref(link.href)}
              onClick={() => { setActive(link.activeId); closeMore() }}
              className={active === link.activeId ? 'active' : ''}
              aria-current={link.route && active === link.activeId ? 'page' : !link.route && active === link.activeId ? 'location' : undefined}
            >
              {link.label}
            </a>
          ))}
          <div ref={moreRef} className={`more-navigation ${moreOpen ? 'is-open' : ''}`} onBlur={handleMoreFocusOut}>
            <button
              ref={moreToggleRef}
              type="button"
              className={`more-toggle ${moreIsActive ? 'is-active' : ''}`}
              aria-expanded={moreOpen}
              aria-controls="more-navigation-menu"
              aria-label="More navigation"
              onClick={() => setMoreOpen((value) => !value)}
              onKeyDown={(event) => {
                if (event.key !== 'ArrowDown') return
                event.preventDefault()
                setMoreOpen(true)
                window.setTimeout(() => moreRef.current?.querySelector('a')?.focus(), 0)
              }}
            >
              More <ChevronDown size={14} aria-hidden="true" />
            </button>
            {moreOpen && (
              <div id="more-navigation-menu" className="more-navigation-menu">
                {moreNavigation.map((link, index) => renderLink(link, index))}
              </div>
            )}
          </div>
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
          <ThemeToggle />
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
          {mobileNavigation.map((link, index) => renderLink(link, index, true))}
          <div className="mobile-menu-actions">
            <a className="mobile-contact" href={`mailto:${profile.email}`} onClick={closeMenu}>Start a conversation</a>
            <ThemeToggle className="mobile-theme-toggle" />
            <button type="button" className="mobile-music" onClick={() => { closeMenu(); openPalette() }}>
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
