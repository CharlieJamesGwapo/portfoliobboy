import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { isThemePreference, readTheme, resolveTheme, THEME_KEY } from '../lib/theme'

const ThemeContext = createContext(null)
const SYSTEM_QUERY = '(prefers-color-scheme: dark)'
const THEME_COLORS = {
  light: '#f3f0e9',
  dark: '#0b2024',
}

const getStorage = () => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

const getSystemDark = () => {
  try {
    return typeof window !== 'undefined' && window.matchMedia(SYSTEM_QUERY).matches
  } catch {
    return false
  }
}

const applyResolvedTheme = (resolvedTheme) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.dataset.theme = resolvedTheme
  root.style.colorScheme = resolvedTheme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[resolvedTheme])
  window.dispatchEvent(new CustomEvent('portfolio:theme-change', { detail: resolvedTheme }))
}

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(() => readTheme(getStorage()))
  const [systemDark, setSystemDark] = useState(getSystemDark)
  const resolvedTheme = resolveTheme(preference, systemDark)

  useEffect(() => {
    applyResolvedTheme(resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mediaQuery = window.matchMedia(SYSTEM_QUERY)
    const onSystemChange = (event) => setSystemDark(Boolean(event.matches))
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', onSystemChange)
      return () => mediaQuery.removeEventListener('change', onSystemChange)
    }
    mediaQuery.addListener?.(onSystemChange)
    return () => mediaQuery.removeListener?.(onSystemChange)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const onStorage = (event) => {
      if (event.key !== THEME_KEY) return
      setPreferenceState(isThemePreference(event.newValue) ? event.newValue : 'system')
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setPreference = useCallback((nextPreference) => {
    const next = isThemePreference(nextPreference) ? nextPreference : 'system'
    setPreferenceState(next)
    try {
      window.localStorage.setItem(THEME_KEY, next)
    } catch {
      // Private browsing, denied storage, and exhausted quota must not disable
      // the current-session control.
    }
  }, [])

  const value = useMemo(() => ({ preference, resolvedTheme, setPreference }), [preference, resolvedTheme, setPreference])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
