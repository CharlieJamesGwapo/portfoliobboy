import { test, expect } from '@playwright/test'
import { readFileSync, mkdirSync } from 'node:fs'

test.use({ serviceWorkers: 'block', reducedMotion: 'reduce' })

async function setup(page, privacy = false) {
  const events = [], contacts = []
  await page.addInitScript(({ privacy }) => {
    if (privacy) Object.defineProperty(navigator, 'globalPrivacyControl', { configurable: true, value: true })
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__copiedDocument = text } } })
  }, { privacy })
  await page.route('**/api/analytics', route => { events.push(route.request().postDataJSON()); return route.fulfill({ status: 204 }) })
  await page.route('**/api/contact', route => { contacts.push(route.request().url()); return route.abort() })
  await page.goto('/projects/oneride')
  await page.getByRole('button', { name: 'Open Alex, AI Portfolio Assistant' }).click()
  return { panel: page.getByRole('dialog', { name: 'Alex', exact: true }), events, contacts }
}

async function brief(panel) {
  await panel.getByRole('button', { name: 'Prepare a brief', exact: true }).click()
  for (const answer of ['Private project scope', 'A small team', 'Appointment reminders', 'Budget to discuss']) {
    await panel.getByRole('textbox', { name: 'Your answer', exact: true }).fill(answer)
    await panel.getByRole('button', { name: 'Send question', exact: true }).click()
    await expect(panel.locator('.alex-typing')).toHaveCount(0)
  }
}

for (const width of [320, 1440]) {
  test(`OneRide walkthrough stays readable and truthful at ${width}px in both themes`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/projects/oneride')
    await page.getByRole('link', { name: 'Explore the customer app' }).click()
    const story = page.locator('.oneride-story')
    await expect(story.getByRole('heading', { name: 'From discovery to orders.' })).toBeInViewport()
    const screens = story.getByRole('group', { name: 'OneRide walkthrough screens' })
    for (const label of ['Home', 'Stores', 'Orders']) {
      await screens.getByRole('button', { name: new RegExp(label) }).click()
      await expect(screens.getByRole('button', { name: new RegExp(label) })).toHaveAttribute('aria-pressed', 'true')
      await expect(story.locator('.oneride-screen img')).toBeVisible()
    }
    await expect(story).toContainText('empty state before an order is placed')
    await expect(story).toContainText('beta testing')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    mkdirSync('/tmp/charlie-portfolio-preview', { recursive: true })
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; localStorage.setItem('portfolio-theme', theme) }, theme)
      await page.locator('#oneride-walkthrough').screenshot({ path: `/tmp/charlie-portfolio-preview/oneride-${width}-${theme}.png` })
    }
  })
}

test('failed OneRide screenshots leave the narrative and public evidence available', async ({ page }) => {
  await page.route('**/projects/oneride/official-screen-03.webp', route => route.abort())
  await page.goto('/projects/oneride#oneride-walkthrough')
  const story = page.locator('.oneride-story')
  await story.getByRole('button', { name: /Orders/ }).click()
  await expect(story.getByRole('status')).toContainText('Screenshot preview unavailable')
  await expect(story.getByRole('link', { name: 'View the Google Play listing' })).toHaveAttribute('href', /play.google.com/)
  await story.getByRole('button', { name: /Home/ }).click()
  await expect(story.locator('.oneride-screen img')).toBeVisible()
})

test('recruiter downloads, copying and PDF preserve displayed qualifications and public evidence', async ({ page, browserName }) => {
  const { panel, events, contacts } = await setup(page)
  await panel.getByRole('button', { name: 'Check role fit', exact: true }).click()
  await panel.getByRole('textbox', { name: 'Paste job requirements' }).fill('React\n5 years of Python\nKubernetes\n招聘 José <img src=x onerror=alert(1)>')
  await panel.getByRole('button', { name: 'Send question' }).click()
  const tools = panel.getByRole('region', { name: 'Recruiter summary' })
  await tools.getByRole('button', { name: 'Copy summary' }).click()
  expect(await page.evaluate(() => window.__copiedDocument)).toContain('5 years of Python')
  const downloadEvent = page.waitForEvent('download')
  await tools.getByRole('button', { name: 'Download text' }).click()
  const download = await downloadEvent
  expect(download.suggestedFilename()).toBe('charlie-abejo-recruiter-summary.txt')
  const text = readFileSync(await download.path(), 'utf8')
  for (const expected of ['Documented', 'Partly documented', 'Needs confirmation', 'not a hiring verdict', 'https://portfoliobboy.vercel.app/charlie-james-abejo-resume.pdf', '招聘 José <img']) expect(text).toContain(expected)
  const popupEvent = page.waitForEvent('popup')
  await tools.getByRole('button', { name: 'Save as PDF' }).click()
  const popup = await popupEvent
  await expect(popup.locator('main')).toContainText('5 years of Python')
  await expect(popup.locator('main')).toContainText('招聘 José <img')
  await expect(popup.locator('img, script')).toHaveCount(0)
  if (browserName === 'chromium') await popup.pdf({ path: '/tmp/charlie-portfolio-preview/recruiter-summary.pdf', format: 'A4', printBackground: true })
  await popup.close()
  expect(events).toEqual([])
  expect(contacts).toEqual([])
})

test('brief counts reflect requested downloads and opened print views, excluding failed operations', async ({ page }) => {
  const { panel, events, contacts } = await setup(page)
  await brief(panel)
  await panel.getByRole('button', { name: 'Copy brief' }).click()
  expect(events).toEqual([])
  const downloadEvent = page.waitForEvent('download')
  await panel.getByRole('button', { name: 'Download text' }).click()
  await downloadEvent
  await expect.poll(() => events.length).toBe(1)
  expect(events[0]).toEqual({ event: 'portfolio_brief_downloaded', properties: { surface: 'text_guide' } })
  const popupEvent = page.waitForEvent('popup')
  await panel.getByRole('button', { name: 'Save as PDF' }).click()
  const popup = await popupEvent
  await popup.close()
  await expect.poll(() => events.length).toBe(2)
  expect(events[1]).toEqual({ event: 'portfolio_brief_print_opened', properties: { surface: 'text_guide' } })
  await page.evaluate(() => { window.open = () => null; URL.createObjectURL = () => { throw new Error('blocked') } })
  await panel.getByRole('button', { name: 'Save as PDF' }).click()
  await expect(panel.getByRole('status')).toContainText('Print view was blocked')
  await panel.getByRole('button', { name: 'Download text' }).click()
  await expect(panel.getByRole('status')).toContainText('Download could not start')
  expect(events).toHaveLength(2)
  expect(JSON.stringify(events)).not.toContain('Private project scope')
  expect(contacts).toEqual([])
})

test('a long browser paste and Unicode qualifications retain coverage and uncertainty in the export', async ({ page }) => {
  const { panel } = await setup(page)
  await panel.getByRole('button', { name: 'Check role fit', exact: true }).click()
  const field = panel.getByRole('textbox', { name: 'Paste job requirements' })
  await field.focus()
  // Browser insertion follows the native maxLength path used by a paste.
  const prefix = 'React (母语级中文)\n不要 React\n'
  await page.keyboard.insertText(prefix + 'x'.repeat(4000 - prefix.length - 1) + ' more requirements after the native limit')
  expect((await field.inputValue()).length).toBe(4000)
  expect((await field.inputValue()).endsWith(' ')).toBe(true)
  await panel.getByRole('button', { name: 'Send question' }).click()
  await expect(panel.getByText('Showing up to 30 requirements from the first 4,000 characters. Split a longer role into smaller sections.')).toBeVisible()
  const rows = panel.getByRole('list', { name: 'Requirement comparison' }).locator(':scope > li')
  await expect(rows.nth(0)).toContainText('Partly documented')
  await expect(rows.nth(1)).toContainText('Needs confirmation')
  const tools = panel.getByRole('region', { name: 'Recruiter summary' })
  const downloadEvent = page.waitForEvent('download')
  await tools.getByRole('button', { name: 'Download text' }).click()
  const text = readFileSync(await (await downloadEvent).path(), 'utf8')
  expect(text).toContain('Coverage: up to 30 requirements from the first 4,000 characters')
  expect(text).toContain('React (母语级中文)\nAssessment: Partly documented')
  expect(text).toContain('不要 React\nAssessment: Needs confirmation')
})

test('booking counts keyboard, primary and middle activations without treating right-click as a booking', async ({ page }) => {
  const { panel, events } = await setup(page)
  await panel.getByRole('button', { name: 'Book a call', exact: true }).click()
  const link = panel.getByRole('link', { name: 'Choose a time' })
  const url = await link.getAttribute('href')
  await page.context().route(`${url}**`, route => route.fulfill({ contentType: 'text/html', body: '<h1>Test scheduler</h1>' }))
  await link.dispatchEvent('contextmenu', { button: 2 })
  await link.dispatchEvent('auxclick', { button: 2 })
  expect(events).toEqual([])
  for (const method of ['primary', 'keyboard', 'middle']) {
    // A noreferrer middle-click opens a background page without an opener.
    const popupEvent = page.context().waitForEvent('page')
    if (method === 'keyboard') { await link.focus(); await page.keyboard.press('Enter') }
    else await link.click({ button: method === 'middle' ? 'middle' : 'left' })
    await (await popupEvent).close()
  }
  await expect.poll(() => events.length).toBe(3)
  expect(events).toEqual(Array.from({ length: 3 }, () => ({ event: 'portfolio_booking_clicked', properties: { surface: 'text_guide', booking_id: 'intro' } })))
  await page.goto('/#book-a-call')
  const popupEvent = page.waitForEvent('popup')
  await page.locator('#book-a-call').getByRole('link', { name: 'Pick a time' }).click()
  await (await popupEvent).close()
  await expect.poll(() => events.length).toBe(4)
  expect(events[3]).toEqual({ event: 'portfolio_booking_clicked', properties: { surface: 'contact', booking_id: 'intro' } })
})

test('privacy preferences suppress new events while brief downloads and booking remain usable', async ({ page }) => {
  const { panel, events } = await setup(page, true)
  await brief(panel)
  const downloadEvent = page.waitForEvent('download')
  await panel.getByRole('button', { name: 'Download text' }).click()
  await downloadEvent
  await panel.getByRole('button', { name: 'Book a call', exact: true }).click()
  await expect(panel.getByRole('link', { name: 'Choose a time' })).toBeVisible()
  expect(events).toEqual([])
})
