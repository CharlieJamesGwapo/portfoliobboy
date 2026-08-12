// ============================================================================
// ArcadeSkeleton — the Suspense fallback while the arcade chunk downloads.
//
// It replaces a centred spinner with the arcade's real layout: title block,
// avatar row, and a grid of game cards. Two reasons that is worth the markup:
// the visitor can see what is arriving instead of staring at a spinner, and
// the swap to the real lobby doesn't shift the whole screen because the boxes
// are already the right size and in the right place.
// ============================================================================
import { Gamepad2 } from 'lucide-react'

const CARDS = Array.from({ length: 8 }, (_, index) => index)

export default function ArcadeSkeleton() {
  return (
    <div className="arcade-skeleton" role="status" aria-live="polite">
      <span className="sr-only">Loading the interactive lab…</span>
      <div className="arcade-skeleton-inner" aria-hidden="true">
        <div className="arcade-skeleton-head">
          <span className="arcade-skeleton-icon"><Gamepad2 size={22} /></span>
          <span className="skeleton-bar" style={{ width: '210px', height: '26px' }} />
          <span className="skeleton-bar" style={{ width: '320px', height: '13px' }} />
        </div>
        <div className="arcade-skeleton-grid">
          {CARDS.map((index) => (
            <div key={index} className="arcade-skeleton-card" style={{ '--card-index': index }}>
              <span className="skeleton-bar" style={{ width: '38px', height: '38px', borderRadius: '11px' }} />
              <span className="skeleton-bar" style={{ width: '72%', height: '14px' }} />
              <span className="skeleton-bar" style={{ width: '52%', height: '11px' }} />
            </div>
          ))}
        </div>
        <p className="arcade-skeleton-note">Loading game code and 3D assets…</p>
      </div>
    </div>
  )
}
