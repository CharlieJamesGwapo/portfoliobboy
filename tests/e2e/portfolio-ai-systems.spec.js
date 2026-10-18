import { test, expect } from '@playwright/test'

test('new systems can be filtered and inspected while the existing portfolio remains available', async ({ page }) => {
  await page.goto('/#ai-systems')
  await expect(page.locator('#ai-systems-title')).toBeVisible()
  await page.getByRole('link', { name: 'Explore the systems' }).click()
  await expect(page.locator('.momentum-card')).toHaveCount(13)
  const filters = page.getByRole('group', { name: 'Filter Momentum systems' })
  await filters.getByRole('button', { name: 'Voice', exact: true }).click()
  await expect(page.locator('.momentum-card')).toHaveCount(4)
  await expect(page.locator('.momentum-card').first()).toContainText('Alex')
  const hasti = page.locator('.momentum-card').filter({ has: page.getByRole('heading', { name: 'Hasti', exact: true }) })
  await hasti.locator('summary').focus()
  await page.keyboard.press('Enter')
  await expect(hasti.locator('details')).toHaveAttribute('open', '')
  await expect(hasti.getByRole('link', { name: /Try the AI receptionist/ })).toHaveAttribute('href', 'https://hasti.com.au/')
  await filters.getByRole('button', { name: 'All systems', exact: true }).click()
  await expect(page.locator('.momentum-card')).toHaveCount(13)
  for (const id of ['home', 'about', 'experience', 'projects', 'skills', 'education', 'lab', 'contact']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1)
  }
  await expect(page.locator('#projects [role="tab"]')).toHaveCount(8)
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`new portfolio content fits a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    // Viewport checks control their own scroll. Cold hash settling is covered
    // by the navigation test above and would compete with lazy-image scrolling.
    await page.goto('/')
    await expect(page.locator('.ai-capability')).toHaveCount(6)
    await page.locator('#full-project-archive > summary').click()
    await expect(page.locator('.momentum-card')).toHaveCount(width <= 640 ? 3 : 13)
    if (width <= 640) {
      await page.getByRole('button', { name: 'Show all 13 systems', exact: true }).click()
      await expect(page.locator('.momentum-card')).toHaveCount(13)
    }
    await page.locator('#momentum-work').scrollIntoViewIfNeeded()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    // Native lazy images load as a visitor reaches them. Firefox does not
    // force an offscreen lazy image to load just because decode() is called.
    for (const image of await page.locator('.momentum-preview img').all()) {
      await expect.poll(async () => {
        await image.scrollIntoViewIfNeeded()
        return image.evaluate((element) => element.complete && element.naturalWidth > 0)
      }).toBe(true)
    }
    for (const button of await page.locator('.momentum-filters button').all()) {
      const bounds = await button.boundingBox()
      expect(bounds.height).toBeGreaterThanOrEqual(44)
    }
  })
}
