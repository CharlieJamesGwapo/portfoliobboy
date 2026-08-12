// ============================================================================
// prefetch — warm a lazy chunk before it is needed.
//
// Intent-based, never speculative-on-scroll. The arcade chunk drags in
// three.js and @react-three/fiber; downloading that because someone scrolled
// past the section would cost most visitors ~800 kB they never use. Hovering,
// focusing, or touching a launch control is a real signal, and it buys the
// entire network round trip before the click lands.
// ============================================================================

const started = new Map()

/**
 * Run `loader` at most once per key. Returns the same promise on every call,
 * so the props that attach it (onPointerEnter, onFocus, onTouchStart) can all
 * fire without triggering duplicate work.
 */
export function prefetchOnce(key, loader) {
  const existing = started.get(key)
  if (existing) return existing
  // Rejections are swallowed: a failed prefetch must stay silent, because the
  // real import will run again and surface any error through Suspense.
  const promise = Promise.resolve().then(loader).catch(() => undefined)
  started.set(key, promise)
  return promise
}

/**
 * Props spread onto any element that should warm a chunk on hover/focus/touch.
 * `onTouchStart` matters most: on a phone there is no hover, and the ~80 ms
 * between touchstart and click is still enough to start the request early.
 */
export function prefetchProps(key, loader) {
  const warm = () => { prefetchOnce(key, loader) }
  return {
    onPointerEnter: warm,
    onFocus: warm,
    onTouchStart: warm,
  }
}
