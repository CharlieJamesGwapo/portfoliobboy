import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const STORAGE_KEY = 'portfolio-theme'
const THEME_CHANGE_EVENT = 'portfolio:theme-change'

const isTheme = (value) => value === 'light' || value === 'dark'

function readStoredTheme() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isTheme(stored) ? stored : null
  } catch {
    // Private browsing settings can deny storage. The control still works for
    // this visit, with the system preference as the initial choice.
    return null
  }
}

function systemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme) {
  if (!isTheme(theme) || typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark'
  const stored = readStoredTheme()
  if (stored) return stored
  const bootstrapped = document.documentElement.dataset.theme
  return isTheme(bootstrapped) ? bootstrapped : systemTheme()
}

export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)

    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    const onSystemThemeChange = (event) => {
      if (readStoredTheme()) return
      const nextTheme = event.matches ? 'dark' : 'light'
      applyTheme(nextTheme)
      setTheme(nextTheme)
    }
    const onThemeChange = (event) => {
      if (!isTheme(event.detail)) return
      setTheme(event.detail)
    }

    if (media?.addEventListener) media.addEventListener('change', onSystemThemeChange)
    else media?.addListener?.(onSystemThemeChange)
    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange)

    return () => {
      if (media?.removeEventListener) media.removeEventListener('change', onSystemThemeChange)
      else media?.removeListener?.(onSystemThemeChange)
      window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange)
    }
  }, [theme])

  const nextTheme = theme === 'dark' ? 'light' : 'dark'
  const label = `Switch to ${nextTheme} theme`
  const Icon = theme === 'dark' ? Sun : Moon

  const toggleTheme = () => {
    applyTheme(nextTheme)
    setTheme(nextTheme)
    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme)
    } catch {
      // Keep the immediate theme change available when storage is disabled.
    }
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: nextTheme }))
  }

  return (
    <button
      className={`theme-toggle ${className}`.trim()}
      type="button"
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      aria-pressed={theme === 'dark'}
    >
      <Icon size={18} aria-hidden="true" />
      <span className="theme-toggle-label">{theme === 'dark' ? 'Dark' : 'Light'}</span>
    </button>
  )
}
