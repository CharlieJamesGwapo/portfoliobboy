import { test, expect } from '@playwright/test'
import { mockContactBotChallenge } from '../helpers/contactBotClientFixture.js'

// These UI tests intercept API/challenge requests. A controlling service worker
// would bypass page.route; offline/cache behavior has dedicated browser tests.
test.use({ serviceWorkers: 'block' })
test.beforeEach(async ({ page }) => { await mockContactBotChallenge(page) })

test('booking cards pre-fill a call request and every contact channel is reachable', async ({ page }) => {
  await page.goto('/#book-a-call')
  const block = page.locator('#book-a-call')
  await expect(block.getByRole('heading', { name: /Book a call/ })).toBeVisible()
  await expect(block.locator('.booking-card')).toHaveCount(3)
  await expect(block).toContainText('15 min')
  await expect(block).toContainText('60 min')

  await block.locator('.booking-card', { hasText: 'Project discovery' }).getByRole('button', { name: 'Request this call' }).click()
  await expect(page.locator('#contact-subject')).toHaveValue('Book a 30-min project discovery (Google Meet)')
  const message = page.locator('#contact-message')
  await expect(message).toHaveValue(/30-minute project discovery on Google Meet/)
  await expect(message).toBeFocused()

  // Typed text is never overwritten by a second booking choice.
  await message.fill('Tuesday 10am AEST works. We need a CRM.')
  await block.locator('.booking-card', { hasText: 'Technical deep-dive' }).getByRole('button', { name: 'Request this call' }).click()
  await expect(page.locator('#contact-subject')).toHaveValue('Book a 60-min technical deep-dive (Google Meet)')
  await expect(message).toHaveValue('Tuesday 10am AEST works. We need a CRM.')

  const contact = page.locator('#contact')
  await expect(contact.locator('a[href="tel:+639856122843"]')).toBeVisible()
  await expect(contact.locator('a[href="mailto:charliejamesdevzxc@gmail.com"]')).toBeVisible()
  await expect(contact.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', /linkedin\.com\/in\/charlie-james-abejo-2b625a3a5/)
})

test('booking cards stack without horizontal scroll on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/#book-a-call')
  const cards = page.locator('#book-a-call .booking-card')
  await expect(cards).toHaveCount(3)
  const [first, second] = [await cards.nth(0).boundingBox(), await cards.nth(1).boundingBox()]
  expect(second.y).toBeGreaterThan(first.y + first.height - 1)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})

test('contact fields are protected during a slow send and recover without losing the draft', async ({ page }) => {
  let release
  const pending = new Promise(resolve => { release = resolve })
  await page.route('**/api/contact', async route => {
    await pending
    await route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Test failure"}' })
  })
  await page.goto('/#contact')
  await page.locator('#contact-name').fill('Portfolio review')
  await page.locator('#contact-email').fill('preview@example.com')
  await page.locator('#contact-subject').fill('Project enquiry')
  await page.locator('#contact-message').fill('Please keep this draft if the send fails.')
  await page.getByRole('button', { name: 'Send message', exact: true }).click()
  try {
    for (const id of ['contact-name', 'contact-email', 'contact-subject', 'contact-message']) {
      await expect(page.locator(`#${id}`)).toBeDisabled()
    }
  } finally { release() }
  await expect(page.locator('#contact-message')).toBeEnabled()
  await expect(page.locator('#contact-message')).toHaveValue('Please keep this draft if the send fails.')
})

test('blocked verification preserves the draft, email fallback and retry identity', async ({ page }) => {
  const submissions = []
  await page.route('**/api/contact', async route => {
    submissions.push(route.request().postDataJSON())
    await route.fulfill({ status: 403, contentType: 'application/json', body: '{"code":"BOT_VERIFICATION_FAILED"}' })
  })
  await page.goto('/#contact')
  await page.locator('#contact-name').fill('Portfolio visitor')
  await page.locator('#contact-email').fill('nobody@example.com')
  await page.locator('#contact-subject').fill('Private enquiry')
  await page.locator('#contact-message').fill('Preserve this private project enquiry.')
  const send = page.getByRole('button', { name: 'Send message', exact: true })
  await send.click()
  await expect(page.locator('#contact')).toContainText('Verification could not complete')
  await expect(page.locator('#contact-message')).toHaveValue('Preserve this private project enquiry.')
  const fallback = page.locator('.form-fallback')
  await expect(fallback).toHaveAttribute('href', /subject=Private%20enquiry/)
  await expect(fallback).toHaveAttribute('href', /Preserve%20this%20private%20project%20enquiry/)
  await send.click()
  await expect.poll(() => submissions.length).toBe(2)
  expect(submissions[0].submissionId).toMatch(/^[a-f0-9-]{36}$/)
  expect(submissions[1].submissionId).toBe(submissions[0].submissionId)
  await page.locator('#contact-message').fill('A changed private enquiry after the failed send.')
  await send.click()
  await expect.poll(() => submissions.length).toBe(3)
  expect(submissions[2].submissionId).not.toBe(submissions[0].submissionId)
})

test('verification initialization failure leaves the form and email fallback usable', async ({ page }) => {
  // A restricted browser/extension may refuse to let verification wrap fetch.
  // In a production preview this throws from SDK initialization before render.
  await page.addInitScript(() => {
    const nativeFetch = window.fetch.bind(window)
    Object.defineProperty(window, 'fetch', {
      configurable: true,
      get: () => nativeFetch,
      set: () => { throw new Error('Fetch wrapping is unavailable') },
    })
  })
  await page.route('**/api/contact', route => route.fulfill({ status: 403, contentType: 'application/json', body: '{"code":"BOT_VERIFICATION_FAILED"}' }))
  await page.goto('/#contact')
  await page.locator('#contact-name').fill('Portfolio visitor')
  await page.locator('#contact-email').fill('nobody@example.com')
  await page.locator('#contact-subject').fill('Private enquiry')
  await page.locator('#contact-message').fill('Keep this enquiry when verification is unavailable.')
  await page.getByRole('button', { name: 'Send message', exact: true }).click()
  await expect(page.locator('.form-fallback')).toBeVisible()
  await expect(page.locator('#contact-message')).toHaveValue('Keep this enquiry when verification is unavailable.')
})
