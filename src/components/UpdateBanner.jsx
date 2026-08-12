// ============================================================================
// UpdateBanner — surfaces a waiting service worker.
//
// Without this, a visitor who keeps the tab open sits on an old build until
// they happen to hard-refresh. Auto-reloading instead would be worse: it can
// throw away a half-written contact form. So the new version is offered, and
// applying it is the visitor's call.
// ============================================================================
import { useEffect, useState } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { SW_UPDATE_EVENT } from '../lib/registerServiceWorker'

export default function UpdateBanner() {
  const [apply, setApply] = useState(null)

  useEffect(() => {
    const onUpdate = (event) => setApply(() => event.detail?.apply)
    window.addEventListener(SW_UPDATE_EVENT, onUpdate)
    return () => window.removeEventListener(SW_UPDATE_EVENT, onUpdate)
  }, [])

  if (!apply) return null

  return (
    <div className="update-banner" role="status">
      <span>A newer version of this site is ready.</span>
      <button
        type="button"
        className="update-banner-apply"
        onClick={() => {
          // The worker activates, `controllerchange` fires, and the
          // registration module reloads the page for us.
          apply()
          setApply(null)
        }}
      >
        <RefreshCw size={15} aria-hidden="true" /> Refresh
      </button>
      <button
        type="button"
        className="update-banner-dismiss"
        onClick={() => setApply(null)}
        aria-label="Dismiss update notice"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
