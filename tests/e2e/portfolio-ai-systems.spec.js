import { test, expect } from '@playwright/test'

test('new systems can be filtered and inspected while the existing portfolio remains available', async ({ page }) => {
  await page.goto('/#ai-systems')
  await expect(page.locator('#ai-systems-title')).toBeVisible()
  await expect(page.locator('.momentum-card')).toHaveCount(8)
  const filters = page.getByRole('group', { name: 'Filter Momentum systems' })
  await filters.getByRole('button', { name: 'Voice', exact: true }).click()
  await expect(page.locator('.momentum-card')).toHaveCount(2)
  await expect(page.locator('.momentum-card').first()).toContainText('Hasti')
  const hasti = page.locator('.momentum-card').filter({ has: page.getByRole('heading', { name: 'Hasti', exact: true }) })
  await hasti.locator('summary').focus()
  await page.keyboard.press('Enter')
  await expect(hasti.locator('details')).toHaveAttribute('open', '')
  await expect(hasti.getByRole('link', { name: /Try the AI receptionist/ })).toHaveAttribute('href', 'https://hasti.com.au/')
  await filters.getByRole('button', { name: 'All systems', exact: true }).click()
  await expect(page.locator('.momentum-card')).toHaveCount(8)
  for (const id of ['home', 'about', 'experience', 'projects', 'skills', 'education', 'lab', 'contact']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1)
  }
  await expect(page.locator('#projects [role="tab"]')).toHaveCount(8)
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`new portfolio content fits a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/#ai-systems')
    await expect(page.locator('.ai-capability')).toHaveCount(6)
    await expect(page.locator('.momentum-card')).toHaveCount(8)
    await page.locator('#momentum-work').scrollIntoViewIfNeeded()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    // Native lazy images load as a visitor reaches them. Firefox does not
    // force an offscreen lazy image to load just because decode() is called.
    for (const image of await page.locator('.momentum-preview img').all()) {
      await image.scrollIntoViewIfNeeded()
      await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true)
    }
    for (const button of await page.locator('.momentum-filters button').all()) {
      const bounds = await button.boundingBox()
      expect(bounds.height).toBeGreaterThanOrEqual(44)
    }
  })
}
