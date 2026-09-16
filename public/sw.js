/* eslint-env serviceworker */
// ============================================================================
// Service worker — offline support and a second caching tier in front of the
// CDN.
//
// Strategy per resource class, chosen from how each one is versioned:
//
//   /assets/*         content-hashed by the bundler → cache-first, forever.
//                     A changed file gets a new URL, so a stale hit is
//                     impossible and revalidation would be pure latency.
//   fonts             a stable URL that never changes → cache-first.
//   images, audio     stable URLs that could be re-uploaded → stale-while-
//                     revalidate: instant paint, silent refresh behind it.
//   navigations       network-first with a 4 s timeout, falling back to the
//                     cached shell, then to the offline page. HTML must never
//                     be served stale-first: it is what names the current
//                     asset hashes, and a stale copy points at deleted files.
//   /api/*            never touched. A cached contact-form response would be
//                     actively wrong.
//
// Bump CACHE_VERSION to evict everything on the next activation.
// ============================================================================

const CACHE_VERSION = 'v3'
const SHELL_CACHE = `shell-${CACHE_VERSION}`
const ASSET_CACHE = `assets-${CACHE_VERSION}`
const MEDIA_CACHE = `media-${CACHE_VERSION}`
const CACHE_ALLOWLIST = new Set([SHELL_CACHE, ASSET_CACHE, MEDIA_CACHE])

const OFFLINE_URL = '/offline.html'
const NAVIGATION_TIMEOUT = 4000

// Only the pieces needed to render something useful with no network at all.
// Hashed bundles are deliberately absent: their names change every build, so
// listing them here would mean a stale precache list on every deploy.
const SHELL_ASSETS = ['/', OFFLINE_URL, '/manifest.json', '/favicon.png']

const MEDIA_PATTERN = /\.(?:png|jpe?g|webp|avif|gif|svg|ico|mp3|wav|ogg|pdf)$/i
const FONT_PATTERN = /\.(?:woff2?|ttf|otf)$/i

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      // addAll is all-or-nothing: one 404 would abort the whole install and
      // leave the site with no worker. Each entry is fetched independently.
      .then((cache) => Promise.all(SHELL_ASSETS.map((url) => cache.add(url).catch(() => undefined))))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((key) => !CACHE_ALLOWLIST.has(key)).map((key) => caches.delete(key)))
      // Serve navigation preloads where supported so the network request for a
      // page starts in parallel with the worker booting, instead of after it.
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable().catch(() => undefined)
      }
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
})

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached
  const response = await fetch(request)
  // Opaque (no-cors) responses report status 0 and can silently fill the
  // quota with error pages, so only same-origin 200s are stored.
  if (response.ok && response.status === 200) cache.put(request, response.clone())
  return response
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then((response) => {
      if (response.ok && response.status === 200) cache.put(request, response.clone())
      return response
    })
    .catch(() => cached)
  return cached || network
}

async function handleNavigation(event) {
  const cache = await caches.open(SHELL_CACHE)
  try {
    const preloaded = await event.preloadResponse
    const response = preloaded || (await fetchWithTimeout(event.request, NAVIGATION_TIMEOUT))
    if (response && response.ok) cache.put('/', response.clone())
    if (response) return response
    throw new Error('no response')
  } catch {
    // The shell is keyed on '/' because this is a single-page app: every route
    // resolves to the same document.
    return (await cache.match('/')) || (await cache.match(OFFLINE_URL)) || Response.error()
  }
}

function fetchWithTimeout(request, timeout) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), timeout)
    fetch(request).then(
      (response) => { clearTimeout(timer); resolve(response) },
      (error) => { clearTimeout(timer); reject(error) },
    )
  })
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  // Cross-origin requests are left to the browser. Anything the site loads
  // from another origin is either an analytics beacon or a user-initiated
  // link, and neither benefits from being cached here.
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(event))
    return
  }

  if (url.pathname.startsWith('/assets/') || FONT_PATTERN.test(url.pathname)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE).catch(() => fetch(request)))
    return
  }

  if (MEDIA_PATTERN.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, MEDIA_CACHE))
  }
})
