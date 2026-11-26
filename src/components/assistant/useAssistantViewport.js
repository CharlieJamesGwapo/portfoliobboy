import { useEffect } from 'react'

// iOS can resize/pan its visual viewport without resizing CSS's layout viewport.
export default function useAssistantViewport(ref, isOpen) {
  useEffect(() => {
    const panel = ref.current
    const viewport = window.visualViewport
    if (!panel || !viewport || !isOpen) return undefined
    const update = () => {
      panel.style.setProperty('--alex-viewport-height', `${viewport.height}px`)
      panel.style.setProperty('--alex-viewport-bottom', `${Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)}px`)
      panel.classList.toggle('is-compact', viewport.height <= 600)
    }
    update()
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    return () => {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [ref, isOpen])
}
