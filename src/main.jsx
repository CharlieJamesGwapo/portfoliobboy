import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { registerServiceWorker } from './lib/registerServiceWorker'
import './index.css'

// Entrance animations are opt-in. The stylesheet only hides content behind an
// animation when <html> carries `motion-ready`, so a JS failure, a blocked
// bundle, or a browser without IntersectionObserver renders the full page
// instead of a blank screen.
//
// The visibility check matters just as much: browsers pause CSS animations in
// background tabs, so a page opened via cmd-click or a restored session would
// otherwise sit at opacity 0 until focused. We arm the animations only once
// the tab is actually visible. Runs before render, so there is no flash.
function armEntranceAnimations() {
  if (
    typeof IntersectionObserver === 'undefined' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return
  }

  if (document.visibilityState === 'visible') {
    document.documentElement.classList.add('motion-ready')
    return
  }

  const onVisible = () => {
    if (document.visibilityState !== 'visible') return
    document.removeEventListener('visibilitychange', onVisible)
    document.documentElement.classList.add('motion-ready')
  }
  document.addEventListener('visibilitychange', onVisible)
}

armEntranceAnimations()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Registered after render is queued, and the module itself waits for `load`
// before touching the network — the worker only pays off on a repeat visit,
// so it must not compete with this visit's resources.
registerServiceWorker()
