/* eslint-env serviceworker */
// Hashed bundles/fonts are cache-first; stable media refreshes in the
// background. HTML and the stable resume route prefer fresh network bytes.
// APIs, cross-origin requests and non-GET requests never enter these caches.
const CACHE_VERSION = 'v4'
const SHELL_CACHE = `portfolio-shell-${CACHE_VERSION}`
const ASSET_CACHE = `portfolio-assets-${CACHE_VERSION}`
const MEDIA_CACHE = `portfolio-media-${CACHE_VERSION}`
const CACHE_ALLOWLIST = new Set([SHELL_CACHE, ASSET_CACHE, MEDIA_CACHE])
const OWN_CACHE = /^(?:portfolio-)?(?:shell|assets|media)-v\d+$/
const OFFLINE_URL = '/offline.html'
const RESUME_URL = '/charlie-james-abejo-resume.pdf'
const NAVIGATION_TIMEOUT = 4000
const SHELL_ASSETS = ['/', OFFLINE_URL, '/manifest.json', '/favicon.png']
const MEDIA_PATTERN = /\.(?:png|jpe?g|webp|avif|gif|svg|ico|mp3|m4a|wav|ogg|pdf)$/i
const FONT_PATTERN = /\.(?:woff2?|ttf|otf)$/i

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE)
    .then(cache => Promise.all(SHELL_ASSETS.map(url => cache.add(url).catch(() => undefined)))))
  // An update stays waiting until the visitor accepts the app's update banner.
})
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter(key => OWN_CACHE.test(key) && !CACHE_ALLOWLIST.has(key)).map(key => caches.delete(key)))
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable().catch(() => undefined)
    await self.clients.claim()
  })())
})
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
})

// Cache failures must not turn a successful HTTP response into a failed load.
// Limit entries to keep repeated deployments/media browsing from filling disk.
async function store(cache, request, response, limit, preserveShell = false) {
  if (!response || response.status !== 200 || !response.ok || response.headers.get('Cache-Control')?.includes('no-store')) return
  try {
    await cache.put(request, response.clone())
    const keys = await cache.keys()
    const runtimeKeys = preserveShell
      ? keys.filter(key => !SHELL_ASSETS.includes(new URL(key.url || key, self.location.origin).pathname))
      : keys
    await Promise.all(runtimeKeys.slice(0, Math.max(0, runtimeKeys.length - limit)).map(key => cache.delete(key)))
  } catch { /* Private mode, quota limits, or storage eviction. */ }
}
async function cacheFirst(request, cacheName, event) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached
  const response = await fetch(request)
  event.waitUntil(store(cache, request, response, 100))
  return response
}
async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(MEDIA_CACHE)
  const cached = await cache.match(request)
  const network = fetch(new Request(request, { cache: 'no-cache' })).then(async response => {
    await store(cache, request, response, 60)
    return response
  })
  event.waitUntil(network.then(() => undefined).catch(() => undefined))
  return cached || network.catch(() => Response.error())
}
async function networkFirst(request, event, cacheName, cacheKey, preloadResponse) {
  const cache = await caches.open(cacheName)
  const controller = new AbortController()
  let timer
  try {
    const network = Promise.resolve(preloadResponse).catch(() => undefined)
      .then(preloaded => preloaded || fetch(new Request(request, { cache: 'no-cache', signal: controller.signal })))
    const deadline = new Promise((_, reject) => {
      timer = setTimeout(() => { controller.abort(); reject(new Error('navigation deadline')) }, NAVIGATION_TIMEOUT)
    })
    // The deadline includes navigation preload, even if it never resolves.
    const response = await Promise.race([network, deadline])
    if (response?.ok) {
      event.waitUntil(store(cache, cacheKey, response, cacheName === SHELL_CACHE ? 10 : 60, cacheName === SHELL_CACHE))
      return response
    }
    if (response) return response
    throw new Error('No network response')
  } catch {
    return (await cache.match(cacheKey))
      || (cacheName === SHELL_CACHE ? (await cache.match('/')) || (await cache.match(OFFLINE_URL)) : undefined)
      || Response.error()
  } finally {
    clearTimeout(timer)
  }
}
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return
  if (url.pathname === RESUME_URL) {
    event.respondWith(networkFirst(request, event, MEDIA_CACHE, request).catch(() => fetch(request)))
  } else if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, event, SHELL_CACHE, url.pathname, event.preloadResponse).catch(() => fetch(request)))
  } else if (url.pathname.startsWith('/assets/') || FONT_PATTERN.test(url.pathname)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE, event).catch(() => fetch(request)))
  } else if (MEDIA_PATTERN.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, event).catch(() => fetch(request)))
  }
})
