import { test, expect } from '@playwright/test'

const themeSelect = (page) => page.locator('select[aria-label="Color theme"]:visible').first()

const parseHex = (value) => {
  const normalized = value.replace('#', '')
  return [0, 2, 4].map((offset) => Number.parseInt(normalized.slice(offset, offset + 2), 16) / 255)
}

const relativeLuminance = (value) => {
  const [red, green, blue] = parseHex(value).map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  )
  return (0.2126 * red) + (0.7152 * green) + (0.0722 * blue)
}

const contrastRatio = (foreground, background) => {
  const light = Math.max(relativeLuminance(foreground), relativeLuminance(background))
  const dark = Math.min(relativeLuminance(foreground), relativeLuminance(background))
  return (light + 0.05) / (dark + 0.05)
}

const readThemeSurfaceState = (page) => page.evaluate(() => {
  const root = getComputedStyle(document.documentElement)
  const sample = (selector) => {
    const element = document.querySelector(selector)
    if (!element) return null
    const styles = getComputedStyle(element)
    return {
      background: styles.backgroundColor,
      color: styles.color,
      border: styles.borderTopColor,
    }
  }

  return {
    resolved: document.documentElement.dataset.theme,
    colorScheme: document.documentElement.style.colorScheme,
    page: root.getPropertyValue('--surface-page').trim(),
    card: root.getPropertyValue('--surface-card').trim(),
    text: root.getPropertyValue('--text-primary').trim(),
    muted: root.getPropertyValue('--text-muted').trim(),
    border: root.getPropertyValue('--border-ui').trim(),
    borderControl: root.getPropertyValue('--border-control').trim(),
    accent: root.getPropertyValue('--accent-action').trim(),
    onAccent: root.getPropertyValue('--on-accent').trim(),
    statusError: root.getPropertyValue('--status-error').trim(),
    nav: sample('.navbar'),
    cardSample: sample('.ai-capability'),
    error: sample('.field-error'),
    errorSurface: sample('.contact-form'),
    roleLabel: sample('.rotating-title-label'),
    momentumType: (() => {
      const type = document.querySelector('.momentum-card-type')
      const card = type?.closest('.momentum-card')
      if (!type || !card) return null
      return {
        color: getComputedStyle(type).color,
        background: getComputedStyle(card).backgroundColor,
      }
    })(),
    palette: sample('.palette'),
  }
})

test('theme selector exposes Light, Dark, and System and persists an explicit choice', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  await page.evaluate(() => {
    window.__themeEvents = []
    window.addEventListener('portfolio:theme-change', (event) => window.__themeEvents.push(event.detail))
  })

  const select = themeSelect(page)
  await expect(select).toBeVisible()
  await expect(select.locator('option')).toHaveText(['Light', 'Dark', 'System'])

  await select.selectOption('dark')
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark')
  await expect.poll(() => page.evaluate(() => document.documentElement.style.colorScheme)).toBe('dark')
  await expect.poll(() => page.evaluate(() => document.querySelector('meta[name="theme-color"]').content)).toBe('#0b2024')
  await expect.poll(() => page.evaluate(() => window.__themeEvents.at(-1))).toBe('dark')
  await page.reload()
  await expect(themeSelect(page)).toHaveValue('dark')
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark')
})

test('System follows operating-system changes while explicit Light stays fixed', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  const select = themeSelect(page)

  await select.selectOption('system')
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe('light')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark')

  await select.selectOption('light')
  await page.emulateMedia({ colorScheme: 'light' })
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe('light')
})

test('theme surfaces keep navigation, cards, contact errors, and palette legible', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  const select = themeSelect(page)
  await select.selectOption('light')

  await page.locator('#contact').scrollIntoViewIfNeeded()
  await page.getByRole('button', { name: 'Send message' }).click()
  await page.keyboard.press('Control+KeyK')
  await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible()
  const light = await readThemeSurfaceState(page)
  expect(light.resolved).toBe('light')
  expect(light.page).toBe('#f3f0e9')
  expect(light.card).toBe('#fffdfa')
  expect(light.text).toBe('#0b2528')
  expect(light.muted).toBe('#56696a')
  expect(light.palette.background).toBe('rgb(255, 253, 250)')
  expect(light.error.color).toBe('rgb(143, 47, 38)')
  expect(light.roleLabel.color).toBe('rgb(86, 105, 106)')
  expect(light.momentumType).toEqual({ color: 'rgb(11, 107, 88)', background: 'rgb(255, 253, 250)' })

  await page.keyboard.press('Escape')
  await select.selectOption('dark')
  await page.keyboard.press('Control+KeyK')
  await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible()
  const dark = await readThemeSurfaceState(page)
  expect(dark.resolved).toBe('dark')
  expect(dark.page).toBe('#0b2024')
  expect(dark.card).toBe('#163236')
  expect(dark.text).toBe('#f3f0e9')
  expect(dark.muted).toBe('#bacbc7')
  expect(dark.palette.background).toBe('rgb(22, 50, 54)')
  expect(dark.cardSample.background).toBe('rgb(22, 50, 54)')
  expect(dark.error.color).toBe('rgb(240, 115, 102)')
  expect(dark.roleLabel.color).toBe('rgb(186, 203, 199)')
  expect(dark.momentumType).toEqual({ color: 'rgb(103, 224, 193)', background: 'rgb(22, 50, 54)' })
})

test('semantic text, action, error, and control-border pairs meet their contrast contracts', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  const select = themeSelect(page)

  for (const preference of ['light', 'dark']) {
    await select.selectOption(preference)
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe(preference)
    const tokens = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement)
      return Object.fromEntries([
        'surface-page', 'surface-card', 'text-primary', 'text-muted', 'border-control',
        'accent-action', 'on-accent', 'status-error', 'status-error-surface',
      ].map((name) => [name, styles.getPropertyValue(`--${name}`).trim()]))
    })

    expect(contrastRatio(tokens['text-primary'], tokens['surface-card'])).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(tokens['text-muted'], tokens['surface-card'])).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(tokens['text-muted'], tokens['surface-page'])).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(tokens['border-control'], tokens['surface-page'])).toBeGreaterThanOrEqual(3)
    expect(contrastRatio(tokens['accent-action'], tokens['surface-page'])).toBeGreaterThanOrEqual(3)
    expect(contrastRatio(tokens['accent-action'], tokens['surface-card'])).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(tokens['on-accent'], tokens['accent-action'])).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(tokens['status-error'], tokens['status-error-surface'])).toBeGreaterThanOrEqual(4.5)
  }
})

test('denied storage keeps the current-session theme selector usable', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('denied') }
    Storage.prototype.setItem = () => { throw new Error('denied') }
  })
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  const select = themeSelect(page)
  await select.selectOption('dark')
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark')
  await expect(select).toHaveValue('dark')
})
