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
  await expect(preview.getByRole('button', { name: /Show OneRide screenshot 1: Home/i })).toHaveAttribute('aria-pressed', 'true')
  await expect(preview.getByRole('button', { name: /Show OneRide screenshot 3: Orders/i })).toHaveAttribute('aria-pressed', 'false')
})

test('shows an honest official-listing state when every OneRide screenshot fails', async ({ page }) => {
  await page.route('**/projects/oneride/official-screen-*.png', (route) => route.abort())
  await page.goto('/#home')
  const preview = page.locator('[data-testid="oneride-preview"]')
  await expect(preview.getByRole('status')).toContainText(/Official preview unavailable/i)
  await expect(preview.getByRole('link', { name: /Open official app listing/i })).toHaveAttribute('href', /play\.google\.com\/store\/apps\/details\?id=com\.oneridebalingasag\.app/)
  await expect(preview.locator('img[data-testid="oneride-screen"]')).toHaveCount(0)
  expect(await preview.getByRole('button', { name: /Show OneRide screenshot/i }).evaluateAll((buttons) => buttons.every((button) => button.getAttribute('aria-pressed') === 'false'))).toBe(true)
})

test('retries a failed OneRide screenshot after a deliberate selection', async ({ page }) => {
  let failedOnce = false
  await page.route('**/projects/oneride/official-screen-03.png', (route) => {
    if (!failedOnce) {
      failedOnce = true
      return route.abort()
    }
    return route.continue()
  })
  await page.goto('/#home')
  const preview = page.locator('[data-testid="oneride-preview"]')
  const orders = preview.getByRole('button', { name: /Show OneRide screenshot 3: Orders/i })
  await orders.click()
  await expect(orders).toHaveAttribute('aria-pressed', 'false')
  await orders.click()
  await expect(orders).toHaveAttribute('aria-pressed', 'true')
  await expect(preview.locator('img[data-testid="oneride-screen"]')).toHaveAttribute('alt', /screenshot 3 showing the orders screen/i)
})

test('recovers the compact OneRide screenshot card without inventing fallback imagery', async ({ page }) => {
  await page.route('**/projects/oneride/official-screen-02.png', (route) => route.abort())
  await page.goto('/#product-studio-preview')
  const card = page.locator('.studio-static-phone')
  await expect(card.locator('img')).toHaveAttribute('src', /official-screen-01\.png/)
  await expect(card.locator('img')).not.toHaveAttribute('src', /zalio|gymfactories|hasti/i)
})

test('keeps hero decorative orbit and availability status static', async ({ page }) => {
  await page.goto('/#home')
  await expect.poll(() => page.locator('.hero-orbit').first().evaluate((node) => getComputedStyle(node).animationName)).toBe('none')
  await expect.poll(() => page.locator('.status-dot').evaluate((node) => getComputedStyle(node, '::after').animationName)).toBe('none')
})

test('keeps the systems view available and keeps More keyboard-operable', async ({ page }) => {
  await page.goto('/')
  const more = page.getByRole('button', { name: /More navigation/i })
  await expect(more).toBeVisible()
  await expect(more).not.toHaveAttribute('aria-haspopup')
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

  await more.press('Enter')
  const lastMoreLink = page.getByRole('link', { name: 'AI systems', exact: true })
  await lastMoreLink.focus()
  await page.keyboard.press('Tab')
  await expect(more).toHaveAttribute('aria-expanded', 'false')

  await page.locator('[data-testid="systems-view-disclosure"] summary').click()
  await expect(page.locator('.systems-visual-shell')).toBeVisible()
})

test('closes the desktop More disclosure when resizing to the mobile navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const more = page.getByRole('button', { name: /More navigation/i })
  await more.focus()
  await more.press('Enter')
  await expect(more).toHaveAttribute('aria-expanded', 'true')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(more).toBeHidden()
  const mobileToggle = page.getByRole('button', { name: 'Open navigation menu' })
  await expect(mobileToggle).toBeFocused()
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(page.getByRole('button', { name: /More navigation/i })).toHaveAttribute('aria-expanded', 'false')
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

test('coalesces phone pointer work and resets when save-data changes', async ({ page }) => {
  await page.addInitScript(() => {
    const connection = new EventTarget()
    let saveData = false
    Object.defineProperty(connection, 'saveData', { configurable: true, get: () => saveData })
    connection.setSaveData = (next) => {
      saveData = next
      connection.dispatchEvent(new Event('change'))
    }
    Object.defineProperty(navigator, 'connection', { configurable: true, value: connection })
  })
  await page.goto('/#home')
  const phone = page.locator('[data-testid="oneride-phone"]')
  await expect(phone).toHaveAttribute('data-tilt-enabled', 'true')
  await page.evaluate(() => {
    const phone = document.querySelector('[data-testid="oneride-phone"]')
    let reads = 0
    const original = phone.getBoundingClientRect.bind(phone)
    phone.getBoundingClientRect = (...args) => {
      reads += 1
      return original(...args)
    }
    window.__phoneLayoutReads = () => reads
    for (let index = 0; index < 20; index += 1) {
      phone.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 180 + index, clientY: 140 + index }))
    }
  })
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  expect(await page.evaluate(() => window.__phoneLayoutReads())).toBe(1)
  await page.evaluate(() => navigator.connection.setSaveData(true))
  await expect(phone).toHaveAttribute('data-tilt-enabled', 'false')
  await expect.poll(() => phone.evaluate((node) => node.style.getPropertyValue('--phone-rotate-y'))).toBe('-9deg')
})

test('keeps product preview metadata readable at mobile and desktop widths', async ({ page }) => {
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/#product-studio-preview')
    const sizes = await page.locator('#product-studio-preview .studio-card-eyebrow, #product-studio-preview .studio-source-note, #product-studio-preview .studio-feature-meta span, #product-studio-preview .studio-screen-controls button, #product-studio-preview .studio-live-card-copy > p:not(.studio-card-eyebrow), #product-studio-preview .studio-secondary-links a').evaluateAll((nodes) => nodes.map((node) => ({ selector: node.className, size: Number.parseFloat(getComputedStyle(node).fontSize) })))
    expect(sizes.length).toBeGreaterThan(0)
    expect(Math.min(...sizes.map((item) => item.size))).toBeGreaterThanOrEqual(12)
    const bodySizes = await page.locator('#product-studio-preview .studio-feature-copy > p:not(.studio-card-eyebrow):not(.studio-source-note), #product-studio-preview .studio-live-card-copy > p:not(.studio-card-eyebrow)').evaluateAll((nodes) => nodes.map((node) => Number.parseFloat(getComputedStyle(node).fontSize)))
    expect(Math.min(...bodySizes)).toBeGreaterThanOrEqual(14)
  }
})
