import { test, expect } from '@playwright/test'

const publicStudioLinks = {
  'Open OneRide on Google Play': 'https://play.google.com/store/apps/details?id=com.oneridebalingasag.app&hl=en',
  'Visit the OneRide product website': 'https://landing-oneride.vercel.app/',
  'Try the Hasti voice demo': 'https://hasti.com.au/',
  'Open the GymFactories layout designer': 'https://gymfactories.com/designer',
  'Explore the Zalio product tour': 'https://zalio.ai/',
  'Open G2 POS System': 'https://g2possystem.vercel.app/landing',
  'Open ReflectiCSS': 'https://reflecticss.vercel.app/',
  'Open Study Pulse': 'https://study-pulse-ten.vercel.app/',
  'Open E-Cycle Hub': 'https://ecyclehub.vercel.app/',
}

test('shows the live product showcase before the existing about section', async ({ page }) => {
  await page.goto('/#product-studio-preview')
  const hero = page.locator('#home')
  const studio = page.locator('#product-studio-preview')
  const about = page.locator('#about')
  await expect(studio).toBeVisible()
  expect(await studio.boundingBox()).not.toBeNull()
  expect((await studio.boundingBox()).y).toBeGreaterThanOrEqual((await hero.boundingBox()).y)
  expect((await about.boundingBox()).y).toBeGreaterThan((await studio.boundingBox()).y)
  await expect(studio.getByRole('heading', { name: /Live product work/i })).toBeVisible()

  for (const [label, href] of Object.entries(publicStudioLinks)) {
    await expect(studio.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href)
  }
})

test('selects official OneRide screenshots and exposes a recoverable image fallback', async ({ page }) => {
  await page.goto('/#home')
  const preview = page.locator('[data-testid="oneride-preview"]')
  const image = preview.locator('img[data-testid="oneride-screen"]')
  const selectors = preview.getByRole('button', { name: /Show OneRide screenshot/i })

  await expect(selectors).toHaveCount(3)
  await expect(selectors.nth(1)).toHaveAttribute('aria-pressed', 'true')
  const firstSrc = await image.getAttribute('src')
  await selectors.nth(2).click()
  await expect(selectors.nth(2)).toHaveAttribute('aria-pressed', 'true')
  await expect(image).not.toHaveAttribute('src', firstSrc)
  await expect(image).toHaveAttribute('alt', /OneRide official Google Play screenshot 3/i)
})

test('falls back to another official OneRide screenshot when a selected image fails', async ({ page }) => {
  await page.route('**/projects/oneride/official-screen-03.png', (route) => route.abort())
  await page.goto('/#home')
  const preview = page.locator('[data-testid="oneride-preview"]')
  const image = preview.locator('img[data-testid="oneride-screen"]')
  await preview.getByRole('button', { name: /Show OneRide screenshot/i }).nth(2).click()
  await expect(preview.getByRole('status')).toContainText(/another verified official screenshot/i)
  await expect(image).toHaveAttribute('src', /official-screen-01\.png/)
})

test('keeps the systems view available and keeps More keyboard-operable', async ({ page }) => {
  await page.goto('/')
  const more = page.getByRole('button', { name: /More navigation/i })
  await expect(more).toBeVisible()
  await more.focus()
  await page.keyboard.press('Enter')
  await expect(more).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('link', { name: 'Skills', exact: true })).toBeVisible()
  await page.locator('#home h1').click()
  await expect(more).toHaveAttribute('aria-expanded', 'false')

  await more.focus()
  await page.keyboard.press('Enter')
  await expect(more).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(more).toHaveAttribute('aria-expanded', 'false')
  await expect(more).toBeFocused()

  await page.locator('[data-testid="systems-view-disclosure"] summary').click()
  await expect(page.locator('.systems-visual-shell')).toBeVisible()
})

test('preserves the existing mobile menu and project filters', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const toggle = page.getByRole('button', { name: 'Open navigation menu' })
  await toggle.click()
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Work', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeFocused()

  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(page.locator('body')).not.toHaveClass(/menu-open/)
  await expect(page.locator('#main-content')).not.toHaveAttribute('inert', '')

  await page.locator('#projects').scrollIntoViewIfNeeded()
  await page.getByRole('button', { name: /Mobile/ }).last().click()
  await expect(page.locator('#projects [role="tab"]')).toHaveCount(2)
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`fits the product studio at ${width}px without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/#product-studio-preview')
    await expect(page.locator('#product-studio-preview')).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    for (const control of await page.locator('#product-studio-preview button, #product-studio-preview a').all()) {
      const bounds = await control.boundingBox()
      expect(bounds?.height ?? 0).toBeGreaterThanOrEqual(44)
    }
  })
}

test('disables phone tilt in reduced-motion mode', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#product-studio-preview')
  const phone = page.locator('[data-testid="oneride-phone"]')
  await expect(phone).toHaveAttribute('data-tilt-enabled', 'false')
  await phone.dispatchEvent('pointermove', { clientX: 300, clientY: 200 })
  await expect(phone).toHaveCSS('transform', /none|matrix\(1, 0, 0, 1, 0, 0\)/)
})
