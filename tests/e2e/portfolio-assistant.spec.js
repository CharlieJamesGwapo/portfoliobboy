import { test, expect } from '@playwright/test'

const GREETING = /Welcome to Charlie James Abejo's portfolio!/

test('on wide screens Alex welcomes every visit from the corner, clear of the hero copy', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const greeting = page.locator('.alex-greeting')
  await expect(page.getByText(GREETING)).toBeVisible({ timeout: 8000 })
  await expect(greeting).toHaveClass(/is-on-hero/)
  // Never on top of the hero's calls to action.
  const bubble = await greeting.boundingBox()
  const cta = await page.getByRole('link', { name: /Explore my work/ }).boundingBox()
  expect(bubble.x).toBeGreaterThan(cta.x + cta.width)
  await expect(greeting.getByRole('button', { name: 'Chat' })).toBeVisible()
  await greeting.getByRole('button', { name: 'Book a call' }).click()
  await expect(page.locator('#book-a-call')).toBeInViewport()

  // A refresh is a new visit, so Alex says hello again.
  await page.reload()
  await expect(page.getByText(GREETING)).toBeVisible({ timeout: 8000 })
})

test('on phones Alex waits until the hero is scrolled away', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.waitForTimeout(4500)
  await expect(page.locator('.alex-launcher')).toHaveCount(0)
  await expect(page.getByText(GREETING)).toHaveCount(0)
  await page.locator('#product-studio-preview').scrollIntoViewIfNeeded()
  await expect(page.locator('.alex-launcher')).toBeVisible()
  await expect(page.getByText(GREETING)).toBeVisible({ timeout: 5000 })
  await page.getByRole('button', { name: "Dismiss Alex's greeting" }).click()
  await expect(page.getByText(GREETING)).toHaveCount(0)
})

test('Alex answers locally and links to sections', async ({ page }) => {
  const external = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (!['127.0.0.1', 'localhost'].includes(url.hostname) && !url.hostname.endsWith('fonts.googleapis.com') && !url.hostname.endsWith('fonts.gstatic.com')) external.push(url.hostname)
  })
  await page.goto('/projects')
  const launcher = page.getByRole('button', { name: 'Open Alex, AI Portfolio Assistant' })
  await expect(launcher).toBeVisible()
  await launcher.click()

  const panel = page.getByRole('dialog', { name: 'Alex' })
  await expect(panel).toBeVisible()
  await expect(panel.getByRole('textbox', { name: 'Ask Alex a question' })).toBeFocused()
  // Enabled only when an agent ID is configured for the build.
  await expect(panel.getByRole('button', { name: 'Talk to Alex' })).toBeVisible()
  await expect(panel).not.toContainText(/Eleven v4/)

  const before = external.length
  await panel.getByRole('button', { name: /How do I contact him\?/ }).click()
  await expect(panel.getByText(/Email Charlie at capstonee2@gmail.com/)).toBeVisible()
  await expect(panel.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', /linkedin\.com\/in\/charlie-james-abejo/)

  await panel.getByRole('textbox', { name: 'Ask Alex a question' }).fill('what is the weather like')
  await panel.getByRole('button', { name: 'Send question' }).click()
  await expect(panel.getByText(/I don't have an answer for that one/)).toBeVisible()
  expect(external.slice(before)).toEqual([])

  // From a nested route, a section link brings the visitor home to that section.
  await panel.getByRole('link', { name: 'Contact Charlie' }).click()
  await expect(page).toHaveURL(/\/#contact$/)

  await page.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)
})
