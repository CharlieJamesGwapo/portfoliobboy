import { test, expect } from '@playwright/test'
import { independentProducts } from '../../src/data/independentProducts.js'

test('shows the featured projects in an accessible, keyboard-operable hero carousel', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')

  const hero = page.locator('.hero-section')
  const portrait = hero.getByRole('img', { name: /Charlie James Z. Abejo/ })
  await expect(portrait).toBeVisible()
  await expect(portrait).toHaveAttribute('width', '640')
  await expect(portrait).toHaveAttribute('height', '640')
  await expect(portrait).toHaveAttribute('loading', 'eager')
  await expect(portrait).toHaveAttribute('fetchpriority', 'high')
  await expect(hero.getByRole('heading', { level: 1 })).toContainText('Lead Full-Stack')
  const desktopPortrait = await portrait.boundingBox()
  expect(desktopPortrait.width).toBeGreaterThanOrEqual(160)
  expect(desktopPortrait.height).toBeGreaterThanOrEqual(180)

  const carousel = page.getByRole('region', { name: 'Featured projects' })
  const tabs = carousel.getByRole('tab')
  await expect(tabs).toHaveCount(independentProducts.length + 1)
  await expect(tabs.nth(0)).toContainText('OneRide')
  await expect(tabs.nth(1)).toContainText('AutoFlow')
  await expect(tabs.nth(2)).toContainText('EasyAppy')
  await expect(tabs.nth(3)).toContainText('BBOY')
  await expect(tabs.nth(4)).toContainText('AgentForge')
  if (independentProducts.some((product) => product.id === 'contextpilot')) {
    await expect(tabs.last()).toContainText('ContextPilot')
  }
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true')
  await expect(carousel.getByTestId('oneride-preview')).toBeVisible()

  await tabs.nth(0).focus()
  await page.keyboard.press('ArrowRight')
  await expect(tabs.nth(1)).toBeFocused()
  await expect(carousel.getByRole('heading', { name: 'AutoFlow AI Pro' })).toBeVisible()

  await page.keyboard.press('ArrowRight')
  await expect(tabs.nth(2)).toBeFocused()
  await expect(carousel.locator('.product-media img')).toHaveAttribute('alt', /EasyAppy/i)
  await expect(carousel.getByRole('link', { name: 'View project details' })).toHaveAttribute('href', '#easyappy')

  const agentForgeTab = carousel.getByRole('tab', { name: /AgentForge/ })
  await agentForgeTab.click()
  await expect(agentForgeTab).toHaveAttribute('aria-selected', 'true')
  await expect(carousel.getByRole('heading', { name: 'AgentForge' })).toBeVisible()
  await expect(carousel.getByText(/CLI toolkit/i).first()).toBeVisible()

  await page.keyboard.press('Home')
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true')
  await expect(carousel.getByTestId('oneride-preview')).toBeVisible()
})

test('wraps carousel navigation and identifies BBOY as private', async ({ page }) => {
  await page.goto('/')
  const carousel = page.getByRole('region', { name: 'Featured projects' })

  await carousel.getByRole('button', { name: 'Previous featured project' }).click()
  await expect(carousel.getByRole('tab').last()).toHaveAttribute('aria-selected', 'true')
  await carousel.getByRole('button', { name: 'Next featured project' }).click()
  await expect(carousel.getByRole('tab', { name: /OneRide/ })).toHaveAttribute('aria-selected', 'true')

  await carousel.getByRole('tab', { name: /BBOY/ }).click()
  await expect(carousel.getByText(/private personal product/i)).toBeVisible()
  await expect(carousel.getByRole('link', { name: 'View project details' })).toHaveAttribute('href', '#bboy-assistant')
})

// The editorial refresh keeps a recognizable portrait while giving the title
// its own full-width line. Protect fit and legibility at every breakpoint.
const portraitSizeTargets = [320, 375, 430, 768, 1024, 1280, 1440, 1920].map(width => ({
  width,
  minWidth: width <= 370 ? 146 : 162,
  minHeight: width <= 370 ? 166 : 182,
}))

for (const target of portraitSizeTargets) {
  const { width, minWidth, minHeight } = target
  test(`hero portrait, carousel, and touch targets fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')

    const hero = page.locator('.hero-section')
    const portrait = hero.getByRole('img', { name: /Charlie James Z. Abejo/ })
    const primaryTitle = hero.locator('.hero-line-primary')
    const carousel = page.getByRole('region', { name: 'Featured projects' })
    const firstTab = carousel.getByRole('tab').first()
    const nextButton = carousel.getByRole('button', { name: 'Next featured project' })

    await expect(portrait).toBeVisible()
    const portraitBounds = await portrait.boundingBox()
    // Firefox can report a settled CSS pixel as 181.9999847. Allow only
    // subpixel rounding; a visibly smaller portrait still fails this check.
    expect(portraitBounds.width).toBeGreaterThanOrEqual(minWidth - 0.1)
    expect(portraitBounds.height).toBeGreaterThanOrEqual(minHeight - 0.1)
    const titleFontSize = await primaryTitle.first().evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))
    expect(titleFontSize).toBeGreaterThanOrEqual(28)
    expect(await firstTab.boundingBox().then((bounds) => bounds.height)).toBeGreaterThanOrEqual(44)
    expect(await nextButton.boundingBox().then((bounds) => bounds.width)).toBeGreaterThanOrEqual(44)
    const primaryCtaBounds = await hero.getByRole('link', { name: /Explore my work/ }).boundingBox()
    expect(primaryCtaBounds.y + primaryCtaBounds.height).toBeLessThanOrEqual(900)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)

    if (width === 1440) {
      const identityBounds = await hero.locator('.hero-identity').boundingBox()
      expect(identityBounds.y).toBeLessThan(270)
    }
  })
}
