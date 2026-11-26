import { test, expect } from '@playwright/test'

test.use({ reducedMotion: 'no-preference' })

test('featured projects move in the requested direction and remain keyboard operable', async ({ page }) => {
  await page.goto('/')
  const carousel = page.getByRole('region', { name: 'Featured projects' })
  const sampleTransition = async (label) => page.evaluate(async (buttonLabel) => {
    document.querySelector(`[aria-label="${buttonLabel}"]`).click()
    await new Promise(requestAnimationFrame)
    const media = document.querySelector('#hero-featured-panel .hero-project-media')
    const animation = media.getAnimations()[0]
    if (!animation) return null
    animation.pause()
    animation.currentTime = 80
    const matrix = new DOMMatrixReadOnly(getComputedStyle(media).transform)
    const position = matrix.m41
    animation.finish()
    return position
  }, label)

  expect(await sampleTransition('Next featured project')).toBeGreaterThan(0)
  await expect(carousel.getByRole('heading', { name: 'AutoFlow AI Pro' })).toBeVisible()
  expect(await sampleTransition('Previous featured project')).toBeLessThan(0)
  const firstTab = carousel.getByRole('tab').first()
  await firstTab.focus()
  await page.keyboard.press('End')
  await expect(carousel.getByRole('tab').last()).toBeFocused()
  await page.keyboard.press('Home')
  await expect(firstTab).toBeFocused()
  await expect(firstTab).toHaveAttribute('aria-selected', 'true')
})

test('changing the motion preference exposes all content and disables effects', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.reveal:not(.is-visible)').first()).toBeAttached()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect.poll(() => page.locator('.reveal:not(.is-visible)').count()).toBe(0)
  await expect(page.locator('.hero-line').first()).toHaveCSS('animation-name', 'none')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.locator('.reveal:not(.is-visible)')).toHaveCount(0)
})

test('focus into unrevealed work exposes the evidence without waiting for animation', async ({ page }) => {
  await page.goto('/')
  const link = page.locator('#case-oneride .case-study-actions a').first()
  const opacity = await link.evaluate((node) => {
    node.focus()
    return [...function* () { for (let parent = node; parent; parent = parent.parentElement) yield parent }()]
      .map((parent) => Number(getComputedStyle(parent).opacity))
  })
  expect(opacity.every((value) => value === 1)).toBe(true)
  await expect(link).toBeFocused()
})

test('focusing a disclosure does not toggle it before Enter', async ({ page }) => {
  await page.goto('/#case-oneride')
  const disclosure = page.locator('#case-oneride .case-study-engineering')
  await disclosure.locator('summary').focus()
  await expect(disclosure).not.toHaveAttribute('open')
  await page.keyboard.press('Enter')
  await expect(disclosure).toHaveAttribute('open')
  await page.keyboard.press('Enter')
  await expect(disclosure).not.toHaveAttribute('open')
})

test('keyboard wrap follows the arrow direction', async ({ page }) => {
  await page.goto('/')
  const tabs = page.locator('.hero-project-tabs [role="tab"]')
  await tabs.last().click()
  // Sample within one browser task so protocol latency cannot outlive the
  // short entrance on a busy machine (notably in Firefox).
  const x = await page.evaluate(async () => {
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await new Promise(requestAnimationFrame)
    const media = document.querySelector('.hero-project-media')
    const animation = media.getAnimations()[0]
    animation.pause()
    animation.currentTime = 80
    const x = new DOMMatrixReadOnly(getComputedStyle(media).transform).m41
    animation.finish()
    return x
  })
  expect(x).toBeGreaterThan(0)
  await expect(tabs.first()).toBeFocused()
})

test('section links, cold fragments and history reveal their destinations', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Explore my work', exact: true }).click()
  await expect(page).toHaveURL(/#product-studio-preview$/)
  const target = page.locator('#product-studio-preview')
  await expect.poll(() => target.boundingBox().then((box) => Math.abs(box.y - 96))).toBeLessThan(24)
  // Later case studies should still make their entrance as the visitor scrolls.
  await expect(page.locator('.reveal-showcase:not(.is-visible)').last()).toBeAttached()
  await page.goBack()
  await expect(page).toHaveURL(/\/$/)
  await page.goto('/#case-oneride')
  await expect(page.locator('#case-oneride')).toBeInViewport()
  await expect(page.locator('#case-oneride').locator('..')).toHaveCSS('opacity', '1')
})

test('case-study section links finish a smooth scroll without an instant reset', async ({ page }) => {
  await page.goto('/projects/oneride')
  await page.evaluate(() => {
    const scrollIntoView = Element.prototype.scrollIntoView
    window.__sectionScrolls = []
    Element.prototype.scrollIntoView = function (options) {
      if (this.id === 'oneride-walkthrough') window.__sectionScrolls.push(options?.behavior)
      return scrollIntoView.call(this, options)
    }
  })
  await page.getByRole('link', { name: 'Explore the customer app' }).click()
  await expect(page).toHaveURL(/#oneride-walkthrough$/)
  const target = page.locator('#oneride-walkthrough')
  await expect(target).toBeFocused()
  // Engines differ in combining scroll margin with root scroll padding.
  // The heading must settle below the fixed nav and within the first screen.
  await expect.poll(() => target.boundingBox().then((box) => box.y)).toBeLessThan(260)
  await expect.poll(() => target.boundingBox().then((box) => box.y)).toBeGreaterThanOrEqual(80)
  expect(await page.evaluate(() => window.__sectionScrolls)).toEqual(['smooth'])
  await page.goBack()
  await expect(page).toHaveURL(/\/projects\/oneride$/)
  await page.goForward()
  await expect(target).toBeInViewport()
})

for (const reducedMotion of ['no-preference', 'reduce']) {
  test(`showcase fits a narrow phone with ${reducedMotion} motion`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 })
    await page.emulateMedia({ reducedMotion })
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Lead Full-Stack Developer — AI, Web & Mobile.')
    await expect(page.getByRole('link', { name: 'Explore my work', exact: true })).toBeInViewport()
    await page.locator('#case-oneride').scrollIntoViewIfNeeded()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
    if (reducedMotion === 'reduce') {
      await expect(page.locator('#case-oneride .case-study-media')).toHaveCSS('transform', 'none')
    }
  })
}
