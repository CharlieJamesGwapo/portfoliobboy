// A lock belongs to the overlay instance that acquired it. Releasing one
// instance must never unlock a different overlay that is still open.
const activeLocks = new Map()
let previousOverflow = null

export function acquireBodyScrollLock(owner = 'overlay') {
  if (typeof document === 'undefined' || !document.body) return () => {}

  const token = Symbol(owner)
  if (activeLocks.size === 0) previousOverflow = document.body.style.overflow
  activeLocks.set(token, owner)
  document.body.style.overflow = 'hidden'

  let released = false
  return () => {
    if (released) return
    released = true
    activeLocks.delete(token)

    if (activeLocks.size === 0 && document.body) {
      document.body.style.overflow = previousOverflow || ''
      previousOverflow = null
    }
  }
}
