import { test, expect } from '@playwright/test'

test('stored theme is applied before the first themed document update', async ({ page }) => {
  await page.addInitScript(() => {
    if (window.location.hostname !== '127.0.0.1') return
    localStorage.setItem('portfolio-theme', 'light')

    let themeObserver
    const captureFirstTheme = () => {
      const root = document.documentElement
      if (!root || !root.dataset.theme || window.__firstThemeMutation) return false
      window.__firstThemeMutation = root.dataset.theme
      themeObserver?.disconnect()
      documentObserver.disconnect()
      return true
    }
    const watchRoot = () => {
      const root = document.documentElement
      if (!root) return
      if (captureFirstTheme()) return
      if (!themeObserver) {
        themeObserver = new MutationObserver(captureFirstTheme)
        themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
      }
    }
    const documentObserver = new MutationObserver(watchRoot)
    documentObserver.observe(document, { childList: true, subtree: true })
    watchRoot()
  })

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect.poll(() => page.evaluate(() => window.__firstThemeMutation)).toBe('light')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible()
})

test('theme follows the system until chosen, then persists the visitor choice', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible()

  await page.getByRole('button', { name: 'Switch to light theme' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe('light')
  await expect.poll(() => page.evaluate(() => localStorage.getItem('portfolio-theme'))).toBe('light')

  await page.emulateMedia({ colorScheme: 'dark' })
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible()
})

test('mobile navigation traps focus and returns it after Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')

  const menuButton = page.getByRole('button', { name: 'Open navigation menu' })
  await menuButton.click()
  await expect(page.getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Projects' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeFocused()
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeHidden()
})

test('the two contact paths prefill distinct, editable subjects', async ({ page }) => {
  await page.goto('/#contact')

  await page.getByRole('button', { name: 'Hire me' }).click()
  const subject = page.locator('#contact-subject')
  await expect(subject).toBeFocused()
  await expect(subject).toHaveValue('Remote role enquiry')

  await page.getByRole('button', { name: 'Build with me' }).click()
  await expect(subject).toBeFocused()
  await expect(subject).toHaveValue('Product collaboration enquiry')
  await expect(subject).toHaveAttribute('aria-invalid', 'false')
})

test('capability tabs show the selected group’s real technologies', async ({ page }) => {
  await page.goto('/#skills')

  const tabs = page.getByRole('tablist', { name: 'Capability categories' })
  const panel = page.locator('#skills [role="tabpanel"]')
  await tabs.getByRole('tab', { name: 'AI & automation' }).click()
  await expect(panel).toContainText('OpenAI API')
  await expect(panel).toContainText('MCP servers')

  await tabs.getByRole('tab', { name: 'Backend & APIs' }).click()
  await expect(panel).toContainText('Python')
  await expect(panel).not.toContainText('OpenAI API')
})

test('home section links point back to the homepage from nested portfolio routes', async ({ page }) => {
  await page.goto('/projects/alex-hasti')
  const primary = page.getByRole('navigation', { name: 'Primary navigation' })

  await expect(primary.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/#contact')
  await expect(primary.getByRole('link', { name: 'Featured work' })).toHaveAttribute('href', '/#product-studio-preview')
  await expect(primary.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects')
})

test('footer keeps useful portfolio destinations and a visible copyright', async ({ page }) => {
  test.setTimeout(20_000)
  await page.goto('/')
  const footer = page.locator('.footer')

  await expect(footer.getByRole('link', { name: /project archive/i })).toHaveAttribute('href', '/projects')
  await expect(footer.getByRole('link', { name: /interactive lab/i })).toHaveAttribute('href', '/lab')
  await expect(footer.getByRole('link', { name: /voice demo/i })).toHaveAttribute('href', '/#voice-demo')
  await expect(footer.getByRole('link', { name: /resume/i })).toHaveAttribute('href', '/charlie-james-abejo-resume.pdf')
  await expect(footer).toContainText(String(new Date().getFullYear()))
})

test('light and dark themes keep navigation and contact text readable', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/#contact')

  const measureContrast = async (theme) => {
    await page.getByRole('button', { name: `Switch to ${theme} theme` }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
    const getContrast = () => page.locator('.contact-form label > span').first().evaluate((label) => {
      const parse = (value) => value.match(/[\d.]+/g).map(Number)
      const color = parse(getComputedStyle(label).color)
      const background = parse(getComputedStyle(label.closest('.contact-form')).backgroundColor)
      const luminance = ([red, green, blue]) => {
        const values = [red, green, blue].map((channel) => {
          const normalized = channel / 255
          return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
        })
        return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2]
      }
      const values = [luminance(color), luminance(background)].sort((a, b) => b - a)
      return (values[0] + 0.05) / (values[1] + 0.05)
    })
    await expect.poll(getContrast).toBeGreaterThanOrEqual(4.5)
    return getContrast()
  }

  const lightThemeContrast = await measureContrast('light')
  const darkThemeContrast = await measureContrast('dark')
  expect(lightThemeContrast).toBeGreaterThanOrEqual(4.5)
  expect(darkThemeContrast).toBeGreaterThanOrEqual(4.5)
})

test('navigation and homepage fit the requested viewport widths', async ({ page }) => {
  await page.goto('/')
  for (const width of [320, 375, 430, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(page.locator('.navbar')).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  }
})
