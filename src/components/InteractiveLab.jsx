import { lazy, Suspense, useCallback } from 'react'
import ArcadeSkeleton from './ArcadeSkeleton'

const ArcadeLobby = lazy(() => import('./game/ArcadeLobby'))

export default function InteractiveLab({ onClose, returnFocusRef }) {
  const close = useCallback(() => {
    onClose?.()
    window.requestAnimationFrame(() => returnFocusRef?.current?.focus?.())
  }, [onClose, returnFocusRef])

  return (
    <Suspense fallback={<ArcadeSkeleton />}>
      <ArcadeLobby onClose={close} />
    </Suspense>
  )
}
