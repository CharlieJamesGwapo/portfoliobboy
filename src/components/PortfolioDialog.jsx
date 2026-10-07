import { useEffect, useId, useRef } from 'react'
import { acquireBodyScrollLock } from '../lib/overlayScrollLock'

function focusWithoutScrolling(element) {
  if (!element?.isConnected) return
  try {
    element.focus({ preventScroll: true })
  } catch {
    element.focus()
  }
}

export default function PortfolioDialog({
  open,
  title,
  onClose,
  returnFocusRef,
  fallbackFocusRef,
  children,
}) {
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const titleRef = useRef(title)
  const returnFocusRefRef = useRef(returnFocusRef)
  const fallbackFocusRefRef = useRef(fallbackFocusRef)
  const titleId = `portfolio-dialog-title-${useId().replaceAll(':', '')}`

  onCloseRef.current = onClose
  titleRef.current = title
  returnFocusRefRef.current = returnFocusRef
  fallbackFocusRefRef.current = fallbackFocusRef

  useEffect(() => {
    if (!open) return undefined

    const dialog = dialogRef.current
    if (!dialog) return undefined

    // Notify other overlay owners before moving focus into this modal.
    window.dispatchEvent(new CustomEvent('portfolio:detail-open', {
      detail: { title: titleRef.current },
    }))

    if (!dialog.open) dialog.showModal()
    // WebKit does not consistently move focus into a native modal when the
    // opening control was clicked after another overlay closed. Move focus
    // synchronously, then repeat on the next task for browsers that finish
    // promoting the dialog asynchronously.
    focusWithoutScrolling(closeButtonRef.current)
    const releaseScrollLock = acquireBodyScrollLock('portfolio-detail')
    const focusTimer = window.setTimeout(() => focusWithoutScrolling(closeButtonRef.current), 0)

    const getFocusableElements = () => Array.from(dialog.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )).filter((element) => element instanceof HTMLElement && element.offsetParent !== null)

    const onKeyDown = (event) => {
      if (event.key !== 'Tab') return
      const focusable = getFocusableElements()
      if (focusable.length === 0) return

      const active = document.activeElement
      const activeIndex = focusable.indexOf(active)
      const nextIndex = activeIndex === -1
        ? (event.shiftKey ? focusable.length - 1 : 0)
        : (activeIndex + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length
      event.preventDefault()
      focusWithoutScrolling(focusable[nextIndex])
    }
    // Capture at the window because WebKit can keep native-dialog Tab events
    // from reaching a bubbling document listener before moving focus to body.
    window.addEventListener('keydown', onKeyDown, true)

    const closeForOverlay = () => onCloseRef.current?.()
    window.addEventListener('portfolio:open-games', closeForOverlay)
    window.addEventListener('portfolio:lab-open', closeForOverlay)
    window.addEventListener('portfolio:open-palette', closeForOverlay)
    window.addEventListener('portfolio:open-music', closeForOverlay)
    window.addEventListener('portfolio:menu-open', closeForOverlay)

    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('portfolio:open-games', closeForOverlay)
      window.removeEventListener('portfolio:lab-open', closeForOverlay)
      window.removeEventListener('portfolio:open-palette', closeForOverlay)
      window.removeEventListener('portfolio:open-music', closeForOverlay)
      window.removeEventListener('portfolio:menu-open', closeForOverlay)
      if (dialog.open) dialog.close()
      releaseScrollLock()

      const trigger = returnFocusRefRef.current?.current
      const fallback = fallbackFocusRefRef.current?.current
      if (trigger?.isConnected) focusWithoutScrolling(trigger)
      else if (fallback?.isConnected) focusWithoutScrolling(fallback)
    }
  }, [open])

  const handleCancel = (event) => {
    // Native Escape dispatches `cancel`; preventing the default keeps the
    // browser's `open` state in sync with the React `open` prop.
    event.preventDefault()
    onCloseRef.current?.()
  }

  return (
    <dialog
      ref={dialogRef}
      className="portfolio-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onCancel={handleCancel}
    >
      <div className="portfolio-dialog-shell">
        <header className="portfolio-dialog-header">
          <h2 id={titleId}>{title}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="portfolio-dialog-close"
            onClick={() => onCloseRef.current?.()}
            aria-label="Close details"
          >
            Close details
          </button>
        </header>
        <div className="portfolio-dialog-content">{children}</div>
      </div>
    </dialog>
  )
}
