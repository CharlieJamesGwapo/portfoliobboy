import { useEffect, useRef, useState } from 'react'

const TYPE_DELAY = 68
const DELETE_DELAY = 34
const READ_DELAY = 1800
const BETWEEN_DELAY = 320

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function RotatingTitle({ titles }) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState(titles[0] || '')
  const timerRef = useRef(null)

  useEffect(() => {
    if (!titles.length || prefersReducedMotion()) {
      setText(titles[0] || '')
      return undefined
    }

    let cancelled = false
    let deleting = false
    let position = 0
    let titleIndex = 0

    const schedule = (delay) => {
      timerRef.current = window.setTimeout(step, delay)
    }

    const step = () => {
      if (cancelled) return
      const title = titles[titleIndex]

      if (!deleting) {
        position += 1
        setText(title.slice(0, position))
        if (position >= title.length) {
          deleting = true
          schedule(READ_DELAY)
        } else {
          schedule(TYPE_DELAY + Math.round(Math.random() * 32))
        }
        return
      }

      position -= 1
      setText(title.slice(0, Math.max(0, position)))
      if (position <= 0) {
        deleting = false
        titleIndex = (titleIndex + 1) % titles.length
        setIndex(titleIndex)
        schedule(BETWEEN_DELAY)
      } else {
        schedule(DELETE_DELAY)
      }
    }

    setText('')
    schedule(360)
    return () => {
      cancelled = true
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [titles])

  return (
    <div className="rotating-title">
      <span className="sr-only">Professional roles: {titles.join(', ')}</span>
      <span className="rotating-title-label" aria-hidden="true">Open to opportunities as</span>
      <span className="rotating-title-value" aria-hidden="true" data-role-index={index}>
        {text}<span className="type-caret" />
      </span>
    </div>
  )
}
