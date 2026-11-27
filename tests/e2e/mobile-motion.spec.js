import { test, expect } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' })

test('mobile case-study evidence settles within a short scroll entrance', async ({ page }) => {
  await page.goto('/')
  const settled = await page.locator('#case-oneride').evaluate(async (article) => {
    const reveal = article.closest('.reveal')
    article.scrollIntoView({ behavior: 'instant', block: 'start' })
    while (!reveal.classList.contains('is-visible')) await new Promise(requestAnimationFrame)
    await new Promise(requestAnimationFrame)
    // Sample the actual entrance at 400ms without depending on machine speed.
    for (const animation of reveal.getAnimations({ subtree: true })) {
      if (animation.effect.getTiming().iterations === Infinity) continue
      animation.pause()
      animation.currentTime = 400
    }
    return [...article.querySelectorAll('.case-study-media, .case-study-copy > *')].map((node) => {
      const style = getComputedStyle(node)
      return {
        opacity: Number(style.opacity),
        atRest: style.transform === 'none' || new DOMMatrixReadOnly(style.transform).isIdentity,
      }
    })
  })
  expect(settled.length).toBeGreaterThan(1)
  for (const state of settled) {
    expect(state.opacity).toBe(1)
    expect(state.atRest).toBe(true)
  }
})

test('enabling reduced motion exposes delayed evidence on the next frame', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.reveal-showcase:not(.is-visible)').first()).toBeAttached()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const hiddenEvidence = await page.evaluate(async () => {
    await new Promise(requestAnimationFrame)
    return [...document.querySelectorAll('.reveal .case-study-copy > *, .reveal .section-heading > *')]
      .filter((node) => getComputedStyle(node).opacity !== '1')
      .map((node) => node.textContent.trim().slice(0, 80))
  })
  expect(hiddenEvidence).toEqual([])
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.locator('.reveal:not(.is-visible)')).toHaveCount(0)
})
