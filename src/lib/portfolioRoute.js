import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

const routeSnapshot = () => typeof window === 'undefined'
  ? { pathname: '/', search: '', hash: '' }
  : { pathname: window.location.pathname.replace(/\/$/, '') || '/', search: window.location.search, hash: window.location.hash }

const prefersReducedMotion = () => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return true }
}

function commitRoute(href) {
  window.history.pushState({}, '', href)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

// Page changes cross-fade with the View Transitions API where the browser has
// it. The route must be committed synchronously inside the callback (hence
// flushSync), or the browser would snapshot the old page as the "new" one.
// Unsupported browsers and reduced-motion visitors get the instant swap.
export function navigatePortfolio(href) {
  if (typeof document.startViewTransition !== 'function' || prefersReducedMotion()) {
    commitRoute(href)
    return
  }
  document.startViewTransition(() => flushSync(() => commitRoute(href)))
}

// This small static portfolio needs path navigation, not a routing dependency.
// Preserve browser behavior for downloads, external URLs and modified clicks.
export function usePortfolioRoute() {
  const [route, setRoute] = useState(routeSnapshot)
  useEffect(() => {
    const sync = () => setRoute(routeSnapshot())
    const onClick = event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null
      if (!anchor || anchor.hasAttribute('download') || anchor.target && anchor.target !== '_self') return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin || !/^\/(?:projects(?:\/[^/]+)?|lab)?\/?$/.test(url.pathname)) return
      if (url.pathname === window.location.pathname && url.search === window.location.search) return
      event.preventDefault()
      navigatePortfolio(url.pathname + url.search + url.hash)
      window.dispatchEvent(new Event('portfolio:route-change'))
    }
    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)
    document.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('hashchange', sync)
      document.removeEventListener('click', onClick)
    }
  }, [])
  return route
}
