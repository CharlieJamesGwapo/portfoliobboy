import { initBotId } from 'botid/client/core'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { registerServiceWorker } from './lib/registerServiceWorker'
import { installHealthReporting } from './lib/healthReporting'
import './index.css'
import './components/studio-polish.css'
// Audit refinements load last so their narrow fixes win ties.
import './components/refinements.css'
// Motion only changes presentation and follows the final layout refinements.
import './components/motion.css'
import './components/accessibility.css'

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
  if (typeof IntersectionObserver === 'undefined') return
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  const syncMotion = () => {
    if (preference.matches) {
      document.documentElement.classList.remove('motion-ready')
      document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'))
    } else if (document.visibilityState === 'visible') {
      document.documentElement.classList.add('motion-ready')
    }
  }
  syncMotion()
  preference.addEventListener('change', syncMotion)
  document.addEventListener('visibilitychange', syncMotion)
}

// Only contact POSTs request the free Basic challenge. Vite development is
// bypassed by the SDK; production failures are handled by the form fallback.
try {
  initBotId({ protect: [{ path: '/api/contact', method: 'POST', advancedOptions: { checkLevel: 'basic' } }] })
} catch {
  // Rendering the form still gives a blocked visitor the direct email option.
  // The server always verifies, including when initialization fails here.
  console.warn('Contact verification could not initialize.')
}

// Telemetry is optional and may never become a prerequisite for rendering.
try { installHealthReporting() } catch { /* Best effort only. */ }

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
