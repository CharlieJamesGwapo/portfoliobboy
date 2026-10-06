import { test, expect } from '@playwright/test'

test('new systems can be filtered and inspected while the existing portfolio remains available', async ({ page }) => {
  await page.goto('/#ai-systems')
  await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' })
  await expect(page.locator('#ai-systems-title')).toBeVisible()
  await expect(page.locator('#momentum-work')).toBeVisible()
  await expect(page.locator('.momentum-card')).toHaveCount(3)
  await expect(page.getByRole('button', { name: 'View all systems' })).toBeVisible()
  const filters = page.getByRole('group', { name: 'Filter Momentum systems' })
  await filters.getByRole('button', { name: 'Voice', exact: true }).click()
  await expect(page.locator('.momentum-card')).toHaveCount(2)
  await expect(page.locator('.momentum-card').first()).toContainText('Hasti')
  await expect(page.locator('.momentum-card').filter({ hasText: 'AI Voice Runtime' })).toContainText('Private engineering case study')
  await expect(page.locator('.momentum-card').filter({ hasText: 'AI Voice Runtime' }).getByRole('link')).toHaveCount(0)
  const hasti = page.locator('.momentum-card').filter({ has: page.getByRole('heading', { name: 'Hasti', exact: true }) })
  const hastiTrigger = hasti.getByRole('button', { name: 'Open case study: Hasti' })
  await hastiTrigger.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'auto' }))
  const scrollBeforeDetails = await page.evaluate(() => window.scrollY)
  await hastiTrigger.click()
  const hastiDialog = page.getByRole('dialog', { name: 'Hasti' })
  await expect(hastiDialog).toBeVisible()
  for (const heading of ['Problem', 'Engineering scope', 'Architecture', 'Available experience']) {
    await expect(hastiDialog.getByRole('heading', { name: heading, exact: true })).toBeVisible()
  }
  await expect(hastiDialog.getByRole('link', { name: /Try the AI receptionist/ })).toHaveAttribute('href', 'https://hasti.com.au/')
  await page.keyboard.press('Escape')
  await expect(hastiDialog).toBeHidden()
  await expect(hastiTrigger).toBeFocused()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollBeforeDetails)
  await expect(filters.getByRole('button', { name: 'Voice', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.momentum-card')).toHaveCount(2)
  await expect(hasti.getByRole('link', { name: /Try the AI receptionist/ })).toHaveAttribute('href', 'https://hasti.com.au/')
  await filters.getByRole('button', { name: 'All systems', exact: true }).click()
  await expect(page.locator('.momentum-card')).toHaveCount(3)
  await page.getByRole('button', { name: 'View all systems' }).click()
  await expect(page.locator('.momentum-card')).toHaveCount(8)
  await expect(page.getByRole('button', { name: 'Show featured systems' })).toBeVisible()
  for (const [title, url] of [
    ['Hasti', 'https://hasti.com.au/'],
    ['Zalio', 'https://zalio.ai/'],
    ['GymFactories', 'https://gymfactories.com/'],
    ['Momentum Strength', 'https://momentum-strength.vercel.app/'],
    ['HSIE Site Scoring', 'https://health-dev-three.vercel.app/'],
  ]) {
    const card = page.locator('.momentum-card').filter({ has: page.getByRole('heading', { name: title, exact: true }) })
    await expect(card.getByRole('link')).toHaveAttribute('href', url)
  }
  for (const [title, status] of [
    ['AI Voice Runtime', 'Private engineering case study'],
    ['Gym Analytics & Retention', 'Private product system'],
    ['Agent & Platform Operations', 'Private engineering case study'],
  ]) {
    const card = page.locator('.momentum-card').filter({ has: page.getByRole('heading', { name: title, exact: true }) })
    await expect(card).toContainText(status)
    await expect(card.getByRole('link')).toHaveCount(0)
  }
  await expect(page.locator('#momentum-work')).not.toContainText('internal.zalio.ai')
  for (const id of ['home', 'about', 'experience', 'projects', 'skills', 'education', 'lab', 'contact']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1)
  }
  await expect(page.locator('#projects [role="tab"]')).toHaveCount(8)
})

test('Zalio case study uses a private architecture overview without internal workspace links', async ({ page }) => {
  await page.goto('/#momentum-work')
  await page.getByRole('button', { name: 'Open case study: Zalio' }).click()

  const dialog = page.getByRole('dialog', { name: 'Zalio' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('Architecture overview · Private authenticated workspace.')
  for (const label of ['CRM', 'Agents', 'Operations', 'Roster', 'Library', 'Team chat']) {
    await expect(dialog.getByText(label, { exact: true })).toBeVisible()
  }
  await expect(dialog).not.toContainText('internal.zalio.ai')
  await expect(dialog.locator('a[href*="internal.zalio.ai"]')).toHaveCount(0)
  await page.keyboard.press('Escape')
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`new portfolio content fits a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/#ai-systems')
    await expect(page.locator('.ai-capability')).toHaveCount(6)
    await expect(page.locator('.momentum-card')).toHaveCount(3)
    await page.getByRole('button', { name: 'View all systems' }).click()
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
