import { test, expect } from '@playwright/test'

const viewportWidths = [320, 390, 768, 1024, 1440, 1920]
const publicAnchorIds = [
  'home',
  'about',
  'experience',
  'ai-systems',
  'momentum-work',
  'projects',
  'skills',
  'education',
  'lab',
  'contact',
]

const waitForDecodedImage = async (image) => {
  await image.scrollIntoViewIfNeeded()
  await expect.poll(() => image.evaluate((element) => ({
    complete: element.complete,
    naturalWidth: element.naturalWidth,
    naturalHeight: element.naturalHeight,
  }))).toMatchObject({ complete: true, naturalWidth: expect.any(Number), naturalHeight: expect.any(Number) })
  const dimensions = await image.evaluate((element) => ({
    naturalWidth: element.naturalWidth,
    naturalHeight: element.naturalHeight,
  }))
  expect(dimensions.naturalWidth).toBeGreaterThan(0)
  expect(dimensions.naturalHeight).toBeGreaterThan(0)
}

const assertNoHorizontalOverflow = async (page) => {
  await expect.poll(() => page.evaluate(() => (
    document.documentElement.scrollWidth <= window.innerWidth
  ))).toBe(true)
}

const assertTouchTarget = async (locator, label) => {
  const bounds = await locator.boundingBox()
  expect(bounds, `${label} should be rendered`).not.toBeNull()
  expect(bounds.height, `${label} should be at least 44 CSS px high`).toBeGreaterThanOrEqual(44)
  expect(bounds.width, `${label} should be at least 44 CSS px wide`).toBeGreaterThanOrEqual(44)
}

for (const width of viewportWidths) {
  test(`Momentum content has no overflow and expands to all 8 systems at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/#momentum-work')

    await expect(page.locator('#momentum-work')).toBeVisible()
    await expect(page.locator('.momentum-card')).toHaveCount(3)
    await page.getByRole('button', { name: 'View all systems' }).click()
    await expect(page.locator('.momentum-card')).toHaveCount(8)
    await assertNoHorizontalOverflow(page)

    for (const button of await page.locator('.momentum-filters button, .momentum-view-toggle').all()) {
      await assertTouchTarget(button, 'Momentum control')
    }

    // Native lazy loading is exercised by visiting each image before checking
    // its decoded dimensions. This keeps Firefox from being tested by a
    // forced off-screen decode call.
    for (const image of await page.locator('.momentum-preview img').all()) {
      await waitForDecodedImage(image)
    }
  })
}

test('mobile landscape keeps navigation, full work collection, and touch controls usable', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 })
  await page.goto('/#momentum-work')

  await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeVisible()
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  const mobileNavigation = page.getByRole('navigation', { name: 'Mobile navigation' })
  await expect(mobileNavigation).toBeVisible()
  for (const label of ['Work', 'Services', 'About', 'Credentials', 'Contact', 'Experience', 'Projects', 'Skills', 'Interactive Lab']) {
    await expect(mobileNavigation.getByRole('link', { name: new RegExp(label, 'i') })).toBeVisible()
  }
  await assertTouchTarget(page.getByRole('button', { name: 'Close navigation menu' }), 'Mobile menu toggle')
  await page.getByRole('button', { name: 'Close navigation menu' }).click()

  await page.getByRole('button', { name: 'View all systems' }).click()
  await expect(page.locator('.momentum-card')).toHaveCount(8)
  await assertNoHorizontalOverflow(page)
})

test('200% text scaling reflows without horizontal overflow or losing core controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/#education')

  await page.evaluate(() => {
    // This changes the root text scale, exercising the browser's text-size
    // reflow path without claiming deviceScaleFactor is browser zoom.
    document.documentElement.style.fontSize = '200%'
  })
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).fontSize)).toBe('32px')
  await assertNoHorizontalOverflow(page)

  await expect(page.getByRole('searchbox', { name: 'Search credentials' })).toBeVisible()
  await assertTouchTarget(page.getByRole('button', { name: 'View all 23 records' }), 'Credential collection toggle')
  await page.getByRole('button', { name: 'View all 23 records' }).click()
  await expect(page.locator('.credential-explorer-item')).toHaveCount(23)
  await assertNoHorizontalOverflow(page)
})

test('theme controls work in Light and Dark modes and survive denied storage', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/#home')
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  const theme = page.locator('select[aria-label="Color theme"]:visible').first()

  for (const preference of ['light', 'dark']) {
    await theme.selectOption(preference)
    await expect.poll(() => page.evaluate(() => ({
      theme: document.documentElement.dataset.theme,
      colorScheme: document.documentElement.style.colorScheme,
      pageBackground: getComputedStyle(document.body).backgroundColor,
    }))).toMatchObject({ theme: preference, colorScheme: preference })
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)')
  }

  await page.addInitScript(() => {
    const deniedStorage = {
      getItem() { throw new Error('storage denied') },
      setItem() { throw new Error('storage denied') },
      removeItem() { throw new Error('storage denied') },
      clear() { throw new Error('storage denied') },
      key() { return null },
      length: 0,
    }
    Object.defineProperty(window, 'localStorage', { configurable: true, get: () => deniedStorage })
  })
  await page.reload()
  await expect(page.locator('#home')).toBeVisible()
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  const deniedTheme = page.locator('select[aria-label="Color theme"]:visible').first()
  await deniedTheme.selectOption('dark')
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark')
  await deniedTheme.selectOption('light')
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe('light')
})

test('reduced motion keeps essential content visible and decorative motion off', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#home')

  await expect(page.locator('.systems-visual-shell')).toBeVisible()
  await expect(page.locator('.systems-fallback')).toBeVisible()
  await expect(page.locator('.hero-orbit')).toHaveCount(2)
  for (const orbit of await page.locator('.hero-orbit').all()) {
    await expect(orbit).toHaveCSS('animation-name', 'none')
  }
  await page.getByRole('link', { name: /Explore selected work/i }).click()
  await expect(page.locator('#momentum-work')).toBeVisible()
  await assertNoHorizontalOverflow(page)
})

test('all public anchors remain unique and deep links settle below the sticky header', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/#home')

  for (const id of publicAnchorIds) {
    await expect(page.locator(`#${id}`), `anchor #${id} should remain unique`).toHaveCount(1)
  }

  for (const id of publicAnchorIds.slice(1)) {
    // Use a fresh document for each deep link. Reusing one page lets the
    // browser's scroll-restoration state race the app's cold-hash correction.
    const anchorPage = await page.context().newPage()
    await anchorPage.setViewportSize({ width: 390, height: 900 })
    await anchorPage.goto(`/#${id}`)
    const target = anchorPage.locator(`#${id}`)
    await expect(target).toBeVisible()
    await expect.poll(() => target.evaluate((element) => {
      const top = Math.round(element.getBoundingClientRect().top)
      return top >= 70 && top <= 110
    })).toBe(true)
    await anchorPage.close()
  }
})

test('wrapped project tabs support ArrowLeft, ArrowRight, Home, and End', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/#projects')
  const tabs = page.locator('#projects [role="tab"]')
  await expect(tabs).toHaveCount(8)

  await tabs.nth(0).focus()
  await page.keyboard.press('ArrowLeft')
  await expect(tabs.nth(7)).toBeFocused()
  await expect(tabs.nth(7)).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('ArrowRight')
  await expect(tabs.nth(0)).toBeFocused()
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('End')
  await expect(tabs.nth(7)).toBeFocused()
  await page.keyboard.press('Home')
  await expect(tabs.nth(0)).toBeFocused()
})

test('detail dialogs keep focus contained and return it to the trigger', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/#education')
  const trigger = page.getByRole('button', { name: 'Open details: Building with the Claude API' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Building with the Claude API' })
  await expect(dialog).toBeVisible()

  const firstFocusable = dialog.getByRole('button', { name: 'Close details' })
  const lastFocusable = dialog.getByRole('link', { name: /Open original certificate/i })
  await expect(firstFocusable).toBeFocused()

  // Exercise both actual focus-list boundaries. A single Tab/Shift+Tab
  // round-trip can pass even when the trap handler is removed.
  await firstFocusable.focus()
  await page.keyboard.press('Shift+Tab')
  await expect(lastFocusable).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(firstFocusable).toBeFocused()

  await lastFocusable.focus()
  await page.keyboard.press('Tab')
  await expect(firstFocusable).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(lastFocusable).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('initial loading excludes arcade/game/assistant and Three.js requests before idle release', async ({ page }) => {
  const requests = []
  await page.addInitScript(() => {
    const callbacks = []
    window.__releasePortfolioIdle = () => {
      const pending = callbacks.splice(0)
      for (const callback of pending) callback({ didTimeout: false, timeRemaining: () => 50 })
    }
    window.requestIdleCallback = (callback) => {
      callbacks.push(callback)
      return callbacks.length
    }
    window.cancelIdleCallback = () => {}
  })
  page.on('request', (request) => requests.push(request.url()))
  await page.goto('/#home', { waitUntil: 'domcontentloaded' })
  // Wait for the actual initial shell rather than an arbitrary timer. The
  // idle callback remains held, so post-paint work cannot race this snapshot.
  await expect(page.locator('#home')).toBeVisible()

  const forbiddenInitialRequest = requests.filter((url) => /ArcadeLobby|\/game\/|gameData|three(?:\.js|[-/])|r3f|assistant|portfolio-chat/i.test(url))
  expect(forbiddenInitialRequest, 'initial page must not request Lab/game/assistant/Three.js code').toEqual([])

  // The approved post-paint WebGL upgrade remains independently reachable;
  // releasing the held idle callback is intentionally outside the initial
  // loading assertion above.
  await page.evaluate(() => window.__releasePortfolioIdle())
})
