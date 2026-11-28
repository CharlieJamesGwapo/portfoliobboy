import { test, expect } from '@playwright/test'
import { mockContactBotChallenge } from '../helpers/contactBotClientFixture.js'

test.use({ serviceWorkers: 'block' })
test.beforeEach(async ({ page }) => { await mockContactBotChallenge(page) })

test('catalogue starts with six service examples and progressively reveals matching cards', async ({ page }) => {
  await page.goto('/#automations')
  const catalogue = page.locator('#automations')
  await expect(catalogue.locator('.auto-card')).toHaveCount(6)
  await expect(catalogue.getByRole('status')).toHaveText('Showing 6 of 24 solution patterns')
  await catalogue.getByRole('button', { name: 'Show 6 more patterns' }).click()
  await expect(catalogue.locator('.auto-card')).toHaveCount(12)
  await expect(catalogue.locator('.auto-card').nth(6)).toBeFocused()
  await catalogue.getByRole('button', { name: 'Custom Bots', exact: true }).click()
  await expect(catalogue.locator('.auto-card')).toHaveCount(4)
  await expect(catalogue.getByRole('button', { name: 'Custom Bots', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await catalogue.getByRole('button', { name: 'All', exact: true }).click()
  await expect(catalogue.locator('.auto-card')).toHaveCount(6)
})

test('search combines with platform filters, searches safeguards and resets empty results', async ({ page }) => {
  await page.goto('/#automations')
  const catalogue = page.locator('#automations')
  const search = catalogue.getByRole('searchbox', { name: 'Search solution patterns' })
  await catalogue.getByRole('button', { name: 'AWS & DevOps', exact: true }).click()
  await search.fill('  LAMBDA  ')
  await expect(catalogue.locator('.auto-card')).toHaveCount(1)
  await expect(catalogue.getByRole('heading', { name: 'Serverless event processing' })).toBeVisible()
  await search.fill('least privilege')
  await expect(catalogue.locator('.auto-card')).toHaveCount(1)
  await search.fill('no matching solution here')
  await expect(catalogue.getByRole('status')).toHaveText('Showing 0 of 0 solution patterns')
  await expect(catalogue.getByText('No matching patterns yet.')).toBeVisible()
  await catalogue.getByRole('button', { name: 'Reset filters', exact: true }).click()
  await expect(search).toHaveValue('')
  await expect(search).toBeFocused()
  await expect(catalogue.locator('.auto-card')).toHaveCount(6)
  await expect(catalogue.getByRole('button', { name: 'All', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('details are keyboard accessible and show the proposed implementation and safeguards', async ({ page }) => {
  await page.goto('/#automations')
  const card = page.locator('#automations .auto-card').first()
  await expect(card.getByText('Service example', { exact: true })).toBeVisible()
  const disclosure = card.locator('summary')
  await disclosure.focus()
  await disclosure.press('Enter')
  await expect(card.getByText('Implementation approach', { exact: true })).toBeVisible()
  await expect(card.getByText('Safeguards & handoff', { exact: true })).toBeVisible()
  await expect(card.locator('details')).toHaveAttribute('open', '')
  await disclosure.press('Enter')
  await expect(card.locator('details')).not.toHaveAttribute('open', '')
})

test('enquiry stages an editable subject without sending and preserves an existing draft', async ({ page }) => {
  await page.goto('/#automations')
  const actions = []
  page.on('request', request => {
    if (request.method() === 'POST' && /\/api\/(contact|voice|booking)/.test(request.url())) actions.push(request.url())
  })
  const firstEnquiry = page.locator('#automations .auto-card').first().getByRole('link', { name: /Discuss this pattern/ })
  await firstEnquiry.click()
  await expect(page.locator('#contact-subject')).toHaveValue('Automation enquiry: AI lead qualification & routing')
  await page.locator('#contact-subject').fill('My existing project subject')
  await page.locator('#contact-message').fill('Private draft: keep my words.')
  await page.locator('#automations .auto-card').nth(1).getByRole('link', { name: /Discuss this pattern/ }).click()
  await expect(page.locator('#contact-subject')).toHaveValue('My existing project subject')
  await expect(page.locator('#contact-message')).toHaveValue('Private draft: keep my words.')
  expect(actions).toEqual([])
})

for (const theme of ['dark', 'light']) {
  test(`catalogue controls and expanded details fit at 320px in ${theme} theme`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 })
    await page.goto('/#automations')
    await page.evaluate(value => { document.documentElement.dataset.theme = value }, theme)
    const catalogue = page.locator('#automations')
    await catalogue.getByRole('button', { name: 'AWS & DevOps', exact: true }).click()
    await catalogue.locator('.auto-card').first().locator('summary').click()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
    for (const control of await catalogue.locator('button, input, summary, .auto-card-enquiry').all()) {
      const box = await control.boundingBox()
      expect(box.height).toBeGreaterThanOrEqual(43.99)
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(320)
    }
  })
}
