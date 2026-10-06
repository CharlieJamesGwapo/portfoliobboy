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
    const releaseScrollLock = acquireBodyScrollLock('portfolio-detail')
    const focusTimer = window.setTimeout(() => focusWithoutScrolling(closeButtonRef.current), 0)

    const closeForOverlay = () => onCloseRef.current?.()
    window.addEventListener('portfolio:open-games', closeForOverlay)
    window.addEventListener('portfolio:lab-open', closeForOverlay)
    window.addEventListener('portfolio:open-palette', closeForOverlay)
    window.addEventListener('portfolio:open-music', closeForOverlay)
    window.addEventListener('portfolio:menu-open', closeForOverlay)

    return () => {
      window.clearTimeout(focusTimer)
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
