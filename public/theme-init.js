// Apply the preferred palette before styles and React paint. Kept external so
// the production CSP does not need to permit executable inline scripts.
try {
  const stored = localStorage.getItem('portfolio-theme')
  const theme = stored === 'light' || stored === 'dark'
    ? stored
    : window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
} catch {
  document.documentElement.dataset.theme = 'dark'
}
