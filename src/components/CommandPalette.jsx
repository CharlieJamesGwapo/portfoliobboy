// ============================================================================
// CommandPalette — ⌘K / Ctrl+K navigation.
//
// A long single-page portfolio is a scrolling problem: everything is reachable
// but nothing is quick. This gives keyboard users one shortcut that reaches
// any section or action, and gives everyone a visible entry point in the nav.
//
// Deliberately dependency-free. Matching is a simple subsequence test rather
// than a fuzzy-search library — the command list is fixed and about twenty
// items long, so anything heavier would be shipped weight for no benefit.
// ============================================================================
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowUp,
  Award,
  Briefcase,
  Copy,
  FileText,
  Gamepad2,
  Github,
  Layers,
  Linkedin,
  Mail,
  Music2,
  Search,
  Sparkles,
  User,
  Wrench,
} from 'lucide-react'
import { navigation, profile, resumeUrl } from '../data/portfolioData'

const SECTION_ICONS = {
  '#about': User,
  '#experience': Briefcase,
  '#projects': Layers,
  '#skills': Wrench,
  '#education': Award,
  '#lab': Gamepad2,
  '#contact': Mail,
}

// Case-insensitive subsequence match: typing "prj" finds "Projects", which is
// what people actually expect from a palette, without a scoring library.
function matches(query, text) {
  if (!query) return true
  const haystack = text.toLowerCase()
  const needle = query.toLowerCase()
  let index = 0
  for (const character of needle) {
    index = haystack.indexOf(character, index)
    if (index === -1) return false
    index += 1
  }
  return true
}

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const returnFocusRef = useRef(null)

  const goTo = useCallback((hash) => {
    const target = document.querySelector(hash)
    if (!target) return
    // scroll-padding-top on <html> already accounts for the fixed navbar, so
    // scrollIntoView lands the heading in the right place without maths here.
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // Move keyboard focus with the viewport; scrolling alone leaves a screen
    // reader's cursor stranded at the top of the document.
    target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }, [])

  const commands = useMemo(() => {
    const sections = navigation.map((link) => ({
      id: `go${link.href}`,
      label: link.label,
      hint: 'Jump to section',
      icon: SECTION_ICONS[link.href] || Layers,
      run: () => goTo(link.href),
    }))

    return [
      ...sections,
      {
        id: 'copy-email',
        label: 'Copy email address',
        hint: profile.email,
        icon: Copy,
        keepOpen: true,
        run: async () => {
          try {
            await navigator.clipboard.writeText(profile.email)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 2000)
          } catch {
            // Clipboard access is denied in some browsers without a secure
            // context; fall through to the mail client instead of failing.
            window.location.href = `mailto:${profile.email}`
          }
        },
      },
      {
        id: 'email',
        label: 'Send an email',
        hint: profile.email,
        icon: Mail,
        run: () => { window.location.href = `mailto:${profile.email}` },
      },
      {
        id: 'resume',
        label: 'Open resume (PDF)',
        hint: 'Opens in a new tab',
        icon: FileText,
        run: () => window.open(resumeUrl, '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'github',
        label: 'GitHub profile',
        hint: 'github.com',
        icon: Github,
        run: () => window.open(profile.github, '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'linkedin',
        label: 'LinkedIn profile',
        hint: 'linkedin.com',
        icon: Linkedin,
        run: () => window.open(profile.linkedin, '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'games',
        label: 'Play the arcade',
        hint: 'Eight playable experiments',
        icon: Sparkles,
        run: () => window.dispatchEvent(new CustomEvent('portfolio:open-games')),
      },
      {
        id: 'music',
        label: 'Open the music player',
        hint: 'Optional background audio',
        icon: Music2,
        run: () => window.dispatchEvent(new CustomEvent('portfolio:open-music')),
      },
      {
        id: 'top',
        label: 'Back to top',
        hint: 'Return to the hero',
        icon: ArrowUp,
        run: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      },
    ]
  }, [goTo])

  const results = useMemo(
    () => commands.filter((command) => matches(query, `${command.label} ${command.hint}`)),
    [commands, query],
  )

  useEffect(() => {
    setActive(0)
  }, [query])

  useEffect(() => {
    if (!open) return undefined
    returnFocusRef.current = document.activeElement
    setQuery('')
    setActive(0)
    document.body.classList.add('palette-open')
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 30)

    return () => {
      window.clearTimeout(focusTimer)
      document.body.classList.remove('palette-open')
      // Returning focus to whatever opened the palette is what makes ⌘K
      // usable twice in a row without touching the mouse.
      returnFocusRef.current?.focus?.()
    }
  }, [open])

  // Keep the highlighted row in view when arrowing past the fold.
  useEffect(() => {
    if (!open) return
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  if (!open) return null

  const runCommand = (command) => {
    if (!command) return
    if (!command.keepOpen) onClose()
    command.run()
  }

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }
    if (event.key === 'ArrowDown' || (event.key === 'Tab' && !event.shiftKey)) {
      event.preventDefault()
      setActive((index) => (results.length ? (index + 1) % results.length : 0))
      return
    }
    if (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey)) {
      event.preventDefault()
      setActive((index) => (results.length ? (index - 1 + results.length) % results.length : 0))
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      runCommand(results[active])
    }
  }

  return (
    <div className="palette-backdrop" onMouseDown={onClose}>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="palette-search">
          <Search size={18} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search sections and actions…"
            aria-label="Search sections and actions"
            aria-controls="palette-results"
            aria-activedescendant={results[active] ? `palette-option-${results[active].id}` : undefined}
            role="combobox"
            aria-expanded="true"
            autoComplete="off"
            spellCheck="false"
          />
          <kbd>Esc</kbd>
        </div>

        <ul className="palette-results" id="palette-results" role="listbox" ref={listRef} aria-label="Results">
          {results.map((command, index) => {
            const Icon = command.icon
            return (
              <li
                key={command.id}
                id={`palette-option-${command.id}`}
                role="option"
                aria-selected={index === active}
                className={index === active ? 'is-active' : ''}
                onMouseEnter={() => setActive(index)}
                onClick={() => runCommand(command)}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{command.label}</span>
                <small>{command.id === 'copy-email' && copied ? 'Copied' : command.hint}</small>
              </li>
            )
          })}
          {results.length === 0 && <li className="palette-empty">No matches for “{query}”.</li>}
        </ul>

        <div className="palette-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>Esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
