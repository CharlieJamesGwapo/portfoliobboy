import { test, expect } from '@playwright/test'
import { readFileSync, mkdirSync } from 'node:fs'

test.use({ serviceWorkers: 'block', reducedMotion: 'reduce' })

async function openAlex(page) {
  await page.route('**/api/contact', route => { throw new Error('No real contact submission is allowed in brief tests') })
  await page.route('**/api/analytics', route => route.fulfill({ status: 204 }))
  await page.goto('/projects/zalio-crm')
  await page.getByRole('button', { name: 'Open Alex, AI Portfolio Assistant' }).click()
  return page.getByRole('dialog', { name: 'Alex', exact: true })
}

async function prepareBrief(page) {
  const panel = await openAlex(page)
  await panel.getByRole('button', { name: 'Prepare a brief', exact: true }).click()
  for (const answer of ['A clinic CRM', 'Three receptionists', 'Reminders and a shared inbox', 'Budget and timeline to discuss']) {
    await panel.getByRole('textbox', { name: 'Your answer', exact: true }).fill(answer)
    await panel.getByRole('button', { name: 'Send question', exact: true }).click()
    await expect(panel.locator('.alex-typing')).toHaveCount(0)
  }
  return panel
}

test('the downloaded brief and PDF print view contain current edits and harmless Unicode text', async ({ page, browserName }) => {
  const panel = await prepareBrief(page)
  const edited = 'José’s clinic — 预约提醒 👋\nKeep my migration plan.\n<img src=x onerror="alert(1)"> & <script>bad()</script>'
  await panel.getByRole('textbox', { name: 'Review your project brief' }).fill(edited)
  const downloadEvent = page.waitForEvent('download')
  await panel.getByRole('button', { name: 'Download text', exact: true }).click()
  const download = await downloadEvent
  expect(download.suggestedFilename()).toBe('charlie-abejo-project-brief.txt')
  expect(readFileSync(await download.path(), 'utf8')).toContain(edited)
  const popupEvent = page.waitForEvent('popup')
  await panel.getByRole('button', { name: 'Save as PDF', exact: true }).click()
  const popup = await popupEvent
  await expect(popup.locator('main')).toContainText(edited)
  await expect(popup.locator('img, script, iframe')).toHaveCount(0)
  expect(await popup.evaluate(() => window.opener === null)).toBe(true)
  await expect(popup.getByRole('button', { name: 'Print / Save as PDF' })).toBeVisible()
  mkdirSync('/tmp/charlie-portfolio-preview', { recursive: true })
  await popup.screenshot({ path: '/tmp/charlie-portfolio-preview/alex-brief-print.png' })
  if (browserName === 'chromium') await popup.pdf({ path: '/tmp/charlie-portfolio-preview/alex-brief.pdf', format: 'A4', printBackground: true })
  await popup.close()
  await expect(panel.getByRole('textbox', { name: 'Review your project brief' })).toHaveValue(edited)
})

test('clipboard success copies the current brief and blocked APIs expose useful fallbacks', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__copiedBrief = text } } })
  })
  const panel = await prepareBrief(page)
  const edited = 'My edited requirements: CRM and appointment reminders.'
  await panel.getByRole('textbox', { name: 'Review your project brief' }).fill(edited)
  await panel.getByRole('button', { name: 'Copy brief', exact: true }).click()
  await expect(panel.getByRole('status')).toContainText('Brief copied')
  expect(await page.evaluate(() => window.__copiedBrief)).toContain(edited)
  await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('denied') }; window.open = () => null })
  await panel.getByRole('button', { name: 'Copy brief', exact: true }).click()
  await expect(panel.getByRole('status')).toContainText('Copy is unavailable')
  await panel.getByRole('button', { name: 'Save as PDF', exact: true }).click()
  await expect(panel.getByRole('status')).toContainText('Print view was blocked')
  await expect(panel.getByRole('textbox', { name: 'Review your project brief' })).toHaveValue(edited)
})

test('Alex call requests preserve the reviewed brief and an existing contact draft', async ({ page }) => {
  const panel = await prepareBrief(page)
  const edited = 'My reviewed clinic project brief. Please keep these edited requirements.'
  await panel.getByRole('textbox', { name: 'Review your project brief' }).fill(edited)
  await panel.getByRole('button', { name: 'Book a call', exact: true }).click()
  await expect(panel.getByLabel('Choose your conversation')).toBeFocused()
  await panel.getByLabel('Choose your conversation').selectOption('discovery')
  await panel.getByRole('button', { name: 'Request this call' }).click()
  await expect(page).toHaveURL(/\/#contact$/)
  await expect(page.locator('#contact-message')).toHaveValue(new RegExp(edited))
  await expect(page.locator('#contact-subject')).toHaveValue('Request a 30-min project discovery')
  await page.locator('#contact-message').fill('Keep my earlier contact message.')
  await page.getByRole('button', { name: 'Open Alex, AI Portfolio Assistant' }).click()
  await panel.getByLabel('Choose your conversation').selectOption('consult')
  await panel.getByRole('button', { name: 'Request this call' }).click()
  await expect(page.locator('#contact-message')).toHaveValue('Keep my earlier contact message.')
  await expect(page.locator('#contact-prepared-message')).toHaveValue(new RegExp(edited))
})

for (const viewport of [{ width: 320, height: 740 }, { width: 390, height: 520 }, { width: 667, height: 375 }]) {
  test(`brief export controls stay reachable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    const panel = await prepareBrief(page)
    await panel.getByRole('button', { name: 'Download text', exact: true }).scrollIntoViewIfNeeded()
    await expect(panel.getByRole('button', { name: 'Close Alex', exact: true })).toBeInViewport()
    await expect(panel.getByRole('button', { name: 'Download text', exact: true })).toBeInViewport()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width)
    const controls = panel.locator('.brief-tools-actions button')
    for (const control of await controls.all()) expect((await control.boundingBox()).height).toBeGreaterThanOrEqual(44)
    mkdirSync('/tmp/charlie-portfolio-preview', { recursive: true })
    await panel.screenshot({ path: `/tmp/charlie-portfolio-preview/alex-brief-${viewport.width}.png` })
  })
}

test('a keyboard-style visual viewport resize keeps Alex above the keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(() => {
    const viewport = new EventTarget()
    Object.assign(viewport, { height: 844, offsetTop: 0 })
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport })
  })
  const panel = await openAlex(page)
  await page.evaluate(() => { window.visualViewport.height = 360; window.visualViewport.dispatchEvent(new Event('resize')) })
  await expect(panel).toHaveClass(/is-compact/)
  const box = await panel.boundingBox()
  expect(box.y).toBeGreaterThanOrEqual(0)
  expect(box.y + box.height).toBeLessThanOrEqual(360)
  await expect(panel.getByRole('button', { name: 'Close Alex' })).toBeInViewport()
  await panel.getByRole('button', { name: 'Send question' }).scrollIntoViewIfNeeded()
  const send = await panel.getByRole('button', { name: 'Send question' }).boundingBox()
  expect(send.y + send.height).toBeLessThanOrEqual(360)
  await page.evaluate(() => { window.visualViewport.height = 844; window.visualViewport.dispatchEvent(new Event('resize')) })
  await expect(panel).not.toHaveClass(/is-compact/)
})

test('a configured scheduler opens separately without sending the visitor brief', async ({ page }) => {
  test.skip(!process.env.TEST_SCHEDULER_URL, 'Run with a temporary public test scheduler configured at build time')
  const panel = await prepareBrief(page)
  const edited = 'Private clinic notes must stay out of the scheduling URL.'
  await panel.getByRole('textbox', { name: 'Review your project brief' }).fill(edited)
  await panel.getByRole('button', { name: 'Book a call', exact: true }).click()
  const link = panel.getByRole('link', { name: 'Choose a time' })
  await expect(link).toHaveAttribute('href', process.env.TEST_SCHEDULER_URL)
  await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(link).toHaveAttribute('referrerpolicy', 'no-referrer')
  await page.context().route(`${process.env.TEST_SCHEDULER_URL}**`, route => route.fulfill({ contentType: 'text/html', body: '<h1>Test scheduler</h1>' }))
  const popupEvent = page.waitForEvent('popup')
  await link.click()
  const popup = await popupEvent
  expect(popup.url()).toBe(process.env.TEST_SCHEDULER_URL)
  await popup.close()
  await panel.getByRole('button', { name: 'Prepare a brief', exact: true }).click()
  await expect(panel.getByRole('textbox', { name: 'Review your project brief' })).toHaveValue(edited)
})

test('a brief containing only a few Unicode characters can still be saved locally', async ({ page }) => {
  const panel = await prepareBrief(page)
  await panel.getByRole('textbox', { name: 'Review your project brief' }).fill('診所預約排程')
  for (const name of ['Copy brief', 'Download text', 'Save as PDF']) await expect(panel.getByRole('button', { name, exact: true })).toBeEnabled()
  await expect(panel.getByRole('button', { name: 'Review in contact form', exact: true })).toBeDisabled()
})

test('a subject-only contact draft survives a booking request', async ({ page }) => {
  await page.goto('/#contact')
  await page.locator('#contact-subject').fill('Keep my personally written subject')
  await page.getByRole('button', { name: 'Open Alex, AI Portfolio Assistant' }).click()
  const panel = page.getByRole('dialog', { name: 'Alex', exact: true })
  await panel.getByRole('button', { name: 'Book a call', exact: true }).click()
  await panel.getByLabel('Choose your conversation').selectOption('discovery')
  await panel.getByRole('button', { name: 'Request this call' }).click()
  await expect(page.locator('#contact-subject')).toHaveValue('Keep my personally written subject')
  await expect(page.locator('#contact-message')).toHaveValue(/30-minute project discovery/)
  await expect(page.locator('#contact-prepared-subject')).toHaveValue('Request a 30-min project discovery')
})

test('landscape keyboard resize and pan keep Alex in the visual viewport', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 })
  await page.addInitScript(() => {
    const viewport = new EventTarget()
    Object.assign(viewport, { height: 375, offsetTop: 0 })
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport })
  })
  const panel = await openAlex(page)
  await page.evaluate(() => { Object.assign(window.visualViewport, { height: 220, offsetTop: 30 }); window.visualViewport.dispatchEvent(new Event('resize')) })
  await expect(panel).toHaveClass(/is-compact/)
  const box = await panel.boundingBox()
  expect(box.y).toBeGreaterThanOrEqual(30)
  expect(box.y + box.height).toBeLessThanOrEqual(250)
  await panel.getByRole('button', { name: 'Send question' }).scrollIntoViewIfNeeded()
  const send = await panel.getByRole('button', { name: 'Send question' }).boundingBox()
  expect(send.y + send.height).toBeLessThanOrEqual(250)
})
