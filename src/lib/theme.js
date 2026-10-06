export const THEME_KEY = 'portfolio:theme:v1'

const THEME_PREFERENCES = ['light', 'dark', 'system']

export const isThemePreference = (value) => THEME_PREFERENCES.includes(value)

export const resolveTheme = (preference, systemDark) =>
  preference === 'light' || preference === 'dark' ? preference : systemDark ? 'dark' : 'light'

export function readTheme(storage) {
  try {
    const value = storage?.getItem?.(THEME_KEY)
    return isThemePreference(value) ? value : 'system'
  } catch {
    return 'system'
  }
}
