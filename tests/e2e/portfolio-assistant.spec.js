import { test, expect } from '@playwright/test'

const GREETING = /Hey there! 👋 I'm Alex, Charlie's AI assistant/

test('Alex stays off the hero, greets once after scrolling, and remembers dismissal', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(2500)
  // Nothing floats over the hero on arrival.
  await expect(page.locator('.alex-launcher')).toHaveCount(0)
  await expect(page.getByText(GREETING)).toHaveCount(0)

  await page.locator('#product-studio-preview').scrollIntoViewIfNeeded()
  await expect(page.locator('.alex-launcher')).toBeVisible()
  await expect(page.getByText(GREETING)).toBeVisible({ timeout: 5000 })
  await page.getByRole('button', { name: "Dismiss Alex's greeting" }).click()
  await expect(page.getByText(GREETING)).toHaveCount(0)

  await page.reload()
  await page.locator('#product-studio-preview').scrollIntoViewIfNeeded()
  await expect(page.locator('.alex-launcher')).toBeVisible()
  await page.waitForTimeout(2500)
  await expect(page.locator('.alex-greeting')).toHaveCount(0)
})

test('Alex answers locally, links to sections, and keeps voice disabled', async ({ page }) => {
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
  await expect(panel.getByRole('button', { name: 'Talk to Alex' })).toBeDisabled()
  await expect(panel).not.toContainText(/Eleven v4/)

  const before = external.length
  await panel.getByRole('button', { name: /How do I contact him\?/ }).click()
  await expect(panel.getByText(/You can email Charlie at/)).toBeVisible()

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
