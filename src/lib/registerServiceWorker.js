// ============================================================================
// Service worker registration.
//
// Registered after `load` so it never competes with the hero's own resources
// for bandwidth on a first visit — the worker's whole value is on the *second*
// visit, so there is nothing to gain from racing the first one.
//
// Production only. In dev, a worker that caches assets fights Vite's HMR and
// produces "why is my change not showing up" bugs that cost far more than the
// offline support is worth locally.
// ============================================================================

// Fires when a newer worker has installed and is waiting. The app uses this to
// offer a refresh rather than swapping the page out from under the visitor.
const UPDATE_EVENT = 'portfolio:sw-update'

export function registerServiceWorker() {
  if (!import.meta.env.PROD) return
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // A worker already waiting means the visitor loaded this page from a
        // cache written by a previous deploy.
        if (registration.waiting && navigator.serviceWorker.controller) {
          announceUpdate(registration)
        }

        registration.addEventListener('updatefound', () => {
          const installing = registration.installing
          if (!installing) return
          installing.addEventListener('statechange', () => {
            // `controller` is null on the very first install; there is no old
            // version to replace, so there is nothing to tell the visitor.
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              announceUpdate(registration)
            }
          })
        })
      })
      .catch(() => {
        // Registration fails on unsupported or locked-down browsers. The site
        // works identically without it, so this is not worth surfacing.
      })

    let reloading = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Guard against the reload loop that happens if two tabs both activate
      // the new worker.
      if (reloading) return
      reloading = true
      window.location.reload()
    })
  })
}

function announceUpdate(registration) {
  window.dispatchEvent(
    new CustomEvent(UPDATE_EVENT, {
      detail: {
        apply: () => registration.waiting?.postMessage('SKIP_WAITING'),
      },
    }),
  )
}

export const SW_UPDATE_EVENT = UPDATE_EVENT
