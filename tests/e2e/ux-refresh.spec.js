import { test, expect } from '@playwright/test'

// Covers the UX audit changes (docs/PORTFOLIO_UX_AUDIT.md).

test('hero offers work, AI, and contact paths, all above the fold on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const hero = page.locator('#home')
  for (const name of [/Explore my work/, /Experience my AI/, /Let's work together/]) {
    const link = hero.getByRole('link', { name })
    await expect(link).toBeVisible()
    const box = await link.boundingBox()
    expect(box.y + box.height).toBeLessThanOrEqual(844)
  }
  await expect(hero.getByRole('link', { name: /Experience my AI/ })).toHaveAttribute('href', '#voice-demo')
})

test('"What can I build for you?" links each service to real evidence and a prefilled contact', async ({ page }) => {
  await page.goto('/#services')
  const services = page.locator('#services')
  await expect(services.getByRole('heading', { name: 'What can I build for you?' })).toBeVisible()
  await expect(services.getByRole('heading', { level: 3 })).toHaveText(['AI Agents', 'Automation', 'Web & Mobile', 'Backend Systems'])

  // Every evidence link points at a section or route that exists.
  for (const href of await services.locator('.service-links a:not(.service-start)').evaluateAll((links) => links.map((link) => link.getAttribute('href')))) {
    if (href.startsWith('#')) await expect(page.locator(href)).toHaveCount(1)
    else expect(href).toBe('/projects')
  }

  await services.getByRole('link', { name: 'Start a Automation project' }).click()
  await expect(page.locator('#contact-subject')).toHaveValue('AI automation project enquiry')
})

test('a "Start a project" link never overwrites a subject the visitor already typed', async ({ page }) => {
  await page.goto('/#contact')
  await page.locator('#contact-subject').fill('My own subject')
  await page.goto('/#services')
  await page.locator('#services').getByRole('link', { name: 'Start a Web & Mobile project' }).click()
  await expect(page.locator('#contact-subject')).toHaveValue('My own subject')
})

test('Voice Studio tabs follow the ARIA tabs pattern and keep both demos discoverable', async ({ page }) => {
  await page.goto('/#voice-demo')
  const tablist = page.getByRole('tablist', { name: 'Voice Studio demos' })
  const accents = tablist.getByRole('tab', { name: /English Accents/ })
  const multilingual = tablist.getByRole('tab', { name: /Multilingual/ })
  await expect(accents).toContainText('8 recordings')
  await expect(multilingual).toContainText('1 recorded · 1 planned')

  await accents.focus()
  await page.keyboard.press('ArrowRight')
  await expect(multilingual).toBeFocused()
  await expect(multilingual).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel', { name: /Multilingual/ })).toBeVisible()
  await expect(page.locator('#vs-panel-accents')).toBeHidden()

  await page.keyboard.press('Home')
  await expect(accents).toBeFocused()
  await expect(accents).toHaveAttribute('aria-selected', 'true')
})

test('the multilingual tab opens directly from its share link', async ({ page }) => {
  await page.goto('/#voice-multilingual')
  await expect(page.getByRole('tab', { name: /Multilingual/ })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('article', { name: 'Mexican Spanish' })).toBeVisible()
})

for (const width of [320, 768, 1024, 1920]) {
  test(`no horizontal overflow and readable sections at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await page.locator('#services').scrollIntoViewIfNeeded()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  })
}
