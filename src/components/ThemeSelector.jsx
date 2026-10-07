import { useTheme } from './ThemeProvider'

export default function ThemeSelector({ className = '' }) {
  const { preference, setPreference } = useTheme()
  const classes = ['theme-selector', className].filter(Boolean).join(' ')

  return (
    <label className={classes}>
      <span>Color theme</span>
      <select
        aria-label="Color theme"
        value={preference}
        onChange={(event) => setPreference(event.target.value)}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </label>
  )
}
