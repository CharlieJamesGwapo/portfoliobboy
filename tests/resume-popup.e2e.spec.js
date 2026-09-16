import { createHash } from 'node:crypto'
import { test, expect } from '@playwright/test'

const canonicalPdfHash = 'ffe82da88e664d43d931bcf7f96f620b3efb58cc32d9bd35c18dffc33f18ff60'
const resumePath = '/charlie-james-abejo-resume.pdf'

test('hero resume action opens the canonical PDF popup', async ({ page }) => {
  const response = await page.request.get(resumePath)
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('application/pdf')
  const digest = createHash('sha256').update(await response.body()).digest('hex')
  expect(digest).toBe(canonicalPdfHash)

  await page.goto('/')
  const heroResume = page.locator('.hero-actions a').filter({ hasText: 'View resume (PDF)' })
  await expect(heroResume).toHaveAttribute('href', resumePath)
  await expect(heroResume).toHaveAttribute('target', '_blank')
  const resumeRoute = `**${resumePath}`
  await page.context().route(resumeRoute, (route) => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: '<!doctype html><title>Resume PDF route</title><main>Resume route test response</main>',
  }))
  const popupPromise = page.waitForEvent('popup')
  await heroResume.click()
  const popup = await popupPromise
  await popup.waitForLoadState('domcontentloaded')
  expect(new URL(popup.url()).pathname).toBe(resumePath)
  await popup.close()
  await page.context().unroute(resumeRoute)
  await expect(page.locator('#contact .contact-socials a[download]')).toHaveAttribute('href', resumePath)
  await expect(page.locator('.resume-download')).toHaveAttribute('href', resumePath)
})
