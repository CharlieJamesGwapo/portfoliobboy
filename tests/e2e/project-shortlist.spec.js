import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const shortlist = page => page.getByRole('region', { name: 'Your project shortlist' })
const shared = '/projects?compare=alex-hasti,zalio-crm,oneride#project-shortlist'

test('project selections enforce three, persist across routes and reload, and keep removal focus', async ({ page }) => {
  await page.goto('/projects')
  await expect(shortlist(page)).toContainText('up to 3')
  const cards = page.locator('.project-discovery-card')
  for (let index = 0; index < 3; index++) await cards.nth(index).getByRole('button', { name: /^Add .* to shortlist$/ }).click()
  const fourth = cards.nth(3).getByRole('button', { name: /^Add .* to shortlist$/ })
  await fourth.click()
  await expect(fourth).toHaveAttribute('aria-pressed', 'false')
  await expect(cards.nth(3).getByRole('status')).toContainText(/3|three/)
  await expect(shortlist(page).getByRole('article')).toHaveCount(3)
  await cards.first().getByRole('link', { name: /^Read the .* case study$/ }).click()
  await expect(page).toHaveURL(/\/projects\/[a-z-]+$/)
  await expect(page.getByRole('button', { name: /^Remove .* from shortlist$/ })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('link', { name: 'View shortlist' }).click()
  await expect(page).toHaveURL(/\/projects#project-shortlist$/)
  await expect(shortlist(page).getByRole('article')).toHaveCount(3)
  await page.reload()
  await expect(shortlist(page).getByRole('article')).toHaveCount(3)
  await shortlist(page).getByRole('button', { name: /^Remove / }).first().click()
  await expect(shortlist(page).getByRole('button', { name: /^Remove / }).first()).toBeFocused()
  await shortlist(page).getByRole('button', { name: 'Clear shortlist' }).click()
  await expect(shortlist(page).getByRole('heading', { name: 'Your project shortlist' })).toBeFocused()
  await expect(shortlist(page).getByRole('article')).toHaveCount(0)
})

test('shared links restore and normalize without resurrecting removed projects or losing filters', async ({ page }) => {
  await page.goto('/projects?q=CRM&category=All&compare=zalio-crm,unknown,zalio-crm,oneride,alex-hasti,bboy#project-shortlist')
  await expect(shortlist(page).getByRole('article')).toHaveCount(3)
  await shortlist(page).getByRole('button', { name: 'Remove Zalio CRM from shortlist' }).click()
  await expect(page).toHaveURL(/q=CRM/)
  expect(new URL(page.url()).searchParams.get('compare')).toBe('oneride,alex-hasti')
  await page.reload()
  await expect(shortlist(page).getByRole('article')).toHaveCount(2)
  await shortlist(page).getByRole('button', { name: 'Clear shortlist' }).click()
  await page.reload()
  await expect(shortlist(page).getByRole('article')).toHaveCount(0)
  await page.goto('/projects?compare=unknown,%3Cscript%3E#project-shortlist')
  await expect(shortlist(page)).toContainText('up to 3')
  await expect(shortlist(page).getByRole('article')).toHaveCount(0)
})

test('browser history restores shared selections on internal navigation', async ({ page }) => {
  await page.goto('/projects?compare=zalio-crm#project-shortlist')
  await page.evaluate(() => {
    const link = document.createElement('a')
    link.href = '/projects?compare=oneride,alex-hasti#project-shortlist'
    link.textContent = 'Different comparison'
    document.body.append(link)
    link.click()
    link.remove()
  })
  await expect(shortlist(page).getByRole('article')).toHaveCount(2)
  await page.goBack()
  await expect(shortlist(page).getByRole('article')).toHaveCount(1)
  await expect(shortlist(page)).toContainText('Zalio CRM')
  await page.goForward()
  await expect(shortlist(page).getByRole('article')).toHaveCount(2)
})

test('storage denial keeps working in memory and clipboard denial reveals a private safe share URL', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', { get() { throw new DOMException('Denied', 'SecurityError') } })
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('Denied') } } })
  })
  await page.goto('/projects?compare=zalio-crm&q=private-notes&email=private@example.com#project-shortlist')
  const comparison = shortlist(page)
  await comparison.getByRole('button', { name: 'Copy comparison link' }).click()
  const url = comparison.getByRole('textbox', { name: 'Comparison link' })
  await expect(url).toHaveValue('https://portfoliobboy.vercel.app/projects?compare=zalio-crm#project-shortlist')
  await expect(url).toHaveAttribute('readonly', '')
  await expect(comparison).toContainText(/select and copy/i)
  await comparison.getByRole('link', { name: 'Read Zalio CRM case study' }).click()
  await expect(page.getByRole('button', { name: 'Remove Zalio CRM from shortlist' })).toHaveAttribute('aria-pressed', 'true')
})

test('comparison exposes public evidence and exports readable text and print documents', async ({ page }) => {
  await page.goto(shared)
  const comparison = shortlist(page)
  await expect(comparison).toContainText('Lead engineer · CRM module')
  await expect(comparison).toContainText('Private product module · Public Zalio product tour available')
  await expect(comparison.getByRole('heading', { name: 'Responsibilities', exact: true })).toHaveCount(3)
  await expect(comparison.getByRole('heading', { name: 'Stack', exact: true })).toHaveCount(3)
  const downloadEvent = page.waitForEvent('download')
  await comparison.getByRole('button', { name: 'Download text' }).click()
  const download = await downloadEvent
  const text = await readFile(await download.path(), 'utf8')
  expect(text).toContain('Zalio CRM')
  expect(text).toContain('Private product module')
  expect(text).toContain('https://portfoliobboy.vercel.app/projects/zalio-crm')
  const popupEvent = page.waitForEvent('popup')
  await comparison.getByRole('button', { name: 'Save as PDF' }).click()
  const popup = await popupEvent
  await expect(popup.locator('main')).toContainText('Zalio CRM')
  await expect(popup.locator('main')).toContainText('Private product module')
  await popup.close()
})

test('preparing a shortlist enquiry preserves an existing contact subject and draft without submitting', async ({ page }) => {
  const posts = []
  page.on('request', request => { if (request.method() === 'POST') posts.push(request.url()) })
  await page.goto('/#contact')
  await page.locator('#contact-name').fill('Test visitor')
  await page.locator('#contact-email').fill('visitor@example.com')
  await page.locator('#contact-subject').fill('Existing project subject')
  await page.locator('#contact-message').fill('Existing private message')
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Projects', exact: true }).click()
  await shortlist(page).getByLabel('Add a case study').selectOption('zalio-crm')
  await shortlist(page).getByRole('button', { name: 'Add project', exact: true }).click()
  await shortlist(page).getByRole('button', { name: 'Prepare an enquiry' }).click()
  await expect(page).toHaveURL(/\/#contact$/)
  await expect(page.locator('#contact-name')).toHaveValue('Test visitor')
  await expect(page.locator('#contact-email')).toHaveValue('visitor@example.com')
  await expect(page.locator('#contact-subject')).toHaveValue('Existing project subject')
  await expect(page.locator('#contact-message')).toHaveValue('Existing private message')
  await expect(page.locator('#contact-prepared-message')).toHaveValue(/Zalio CRM/)
  expect(posts).toEqual([])
})

for (const theme of ['light', 'dark']) {
  test(`shortlist controls fit a 320px ${theme} phone and support keyboard removal`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 740 })
    await page.addInitScript(value => localStorage.setItem('portfolio-theme', value), theme)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(shared)
    const comparison = shortlist(page)
    await expect(comparison.getByRole('article')).toHaveCount(3)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
    for (const control of await comparison.getByRole('button').all()) {
      const box = await control.boundingBox()
      expect(box.height).toBeGreaterThanOrEqual(44)
      expect(box.width).toBeGreaterThanOrEqual(44)
    }
    await comparison.getByRole('button', { name: /^Remove / }).first().focus()
    await page.keyboard.press('Enter')
    await expect(comparison.getByRole('article')).toHaveCount(2)
    await expect(comparison.getByRole('button', { name: /^Remove / }).first()).toBeFocused()
  })
}

test('the case study selector adds projects outside featured cards and explains the limit', async ({ page }) => {
  await page.goto('/projects')
  const comparison = shortlist(page)
  const select = comparison.getByLabel('Add a case study')
  for (const slug of ['alex-hasti', 'zalio-crm', 'oneride']) {
    await select.selectOption(slug)
    await comparison.getByRole('button', { name: 'Add project', exact: true }).click()
  }
  await expect(select.locator('option[value="alex-hasti"]')).toBeDisabled()
  await select.selectOption('bboy')
  await comparison.getByRole('button', { name: 'Add project', exact: true }).click()
  await expect(comparison.getByRole('article')).toHaveCount(3)
  await expect(comparison.getByRole('status').first()).toContainText(/Remove a project/)
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('portfolio-project-shortlist')))).toEqual(['alex-hasti', 'zalio-crm', 'oneride'])
})

test('a completed clipboard request cannot announce an outdated comparison after removal', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => new Promise(resolve => { window.finishShortlistCopy = resolve }) } })
  })
  await page.goto(shared)
  const comparison = shortlist(page)
  await comparison.getByRole('button', { name: 'Copy comparison link' }).click()
  await comparison.getByRole('button', { name: 'Remove Zalio CRM from shortlist' }).click()
  await page.evaluate(() => window.finishShortlistCopy())
  await expect(comparison.getByRole('button', { name: 'Copy comparison link' })).toBeEnabled()
  await expect(comparison).not.toContainText('Comparison link copied.')
  await expect(comparison.getByRole('article')).toHaveCount(2)
})

for (const [description, stored] of [['malformed', '{broken'], ['oversized', JSON.stringify(['zalio-crm', 'x'.repeat(2048)])]]) {
  test(`${description} stored selection starts empty and remains usable`, async ({ page }) => {
    await page.addInitScript(value => sessionStorage.setItem('portfolio-project-shortlist', value), stored)
    await page.goto('/projects')
    const comparison = shortlist(page)
    await expect(comparison.getByRole('article')).toHaveCount(0)
    await comparison.getByLabel('Add a case study').selectOption('zalio-crm')
    await comparison.getByRole('button', { name: 'Add project', exact: true }).click()
    await expect(comparison.getByRole('article')).toHaveCount(1)
  })
}

test('returning to an earlier selection resets a pending share-link action', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => new Promise(() => {}) } })
  })
  await page.goto('/projects?compare=zalio-crm#project-shortlist')
  const comparison = shortlist(page)
  await comparison.getByRole('button', { name: 'Copy comparison link' }).click()
  await comparison.getByRole('button', { name: 'Clear shortlist' }).click()
  await comparison.getByLabel('Add a case study').selectOption('zalio-crm')
  await comparison.getByRole('button', { name: 'Add project', exact: true }).click()
  await expect(comparison.getByRole('button', { name: 'Copy comparison link' })).toBeEnabled()
})
