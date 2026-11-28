import { test, expect } from '@playwright/test'

const currentYear = new Date().getUTCFullYear()
function fixture(year, extra = {}) {
  const days = []
  for (let date = new Date(Date.UTC(year, 0, 1)); date.getUTCFullYear() === year; date.setUTCDate(date.getUTCDate() + 1)) {
    const day = date.toISOString().slice(0, 10)
    days.push({ date: day, count: day.endsWith('01-01') ? 12 : day.endsWith('01-03') ? (year === currentYear ? 1222 : 555) : 0, level: day.endsWith('01-01') || day.endsWith('01-03') ? 4 : 0 })
  }
  return { username: 'CharlieJamesGwapo', profileUrl: 'https://github.com/CharlieJamesGwapo', year, updatedAt: `${currentYear}-01-10T01:00:00.000Z`, stale: false, publicRepositories: 42, total: year === currentYear ? 1234 : 567, days, ...extra }
}
async function mockActivity(page, handler) {
  await page.route('**/api/github-activity?year=*', async route => {
    const year = Number(new URL(route.request().url()).searchParams.get('year'))
    if (handler) return handler(route, year)
    await route.fulfill({ json: fixture(year) })
  })
}
async function openCalendar(page) {
  await page.goto('/#github')
  const section = page.locator('#github')
  await section.scrollIntoViewIfNeeded()
  return section
}

test('loads near the viewport, switches real year totals and supports one calendar tab stop and arrow keys', async ({ page }) => {
  let requests = 0
  await mockActivity(page, async (route, year) => { requests++; await route.fulfill({ json: fixture(year) }) })
  await page.goto('/')
  await expect(page.locator('#github')).toBeAttached()
  await expect(page.locator('#github')).not.toBeInViewport()
  expect(requests).toBe(0)
  await page.locator('#github').scrollIntoViewIfNeeded()
  const section = page.locator('#github')
  await expect(section.getByText('1,234', { exact: true })).toBeVisible()
  await expect(section.getByText('42 public repositories', { exact: true })).toBeVisible()
  await expect(section.getByRole('link', { name: /View GitHub profile/ })).toHaveAttribute('href', 'https://github.com/CharlieJamesGwapo')
  const first = section.getByRole('button', { name: `12 contributions on January 1, ${currentYear}`, exact: true })
  await first.focus()
  await page.keyboard.press('ArrowDown')
  await expect(section.getByRole('button', { name: `0 contributions on January 2, ${currentYear}`, exact: true })).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(section.getByRole('button', { name: `0 contributions on January 9, ${currentYear}`, exact: true })).toBeFocused()
  await expect(section.locator('.github-day[tabindex="0"]')).toHaveCount(1)
  await page.keyboard.press('Home')
  await expect(first).toBeFocused()
  await section.getByLabel('Inspect a day').fill(`${currentYear}-02-01`)
  await expect(section.locator('.github-day-detail')).toContainText(`February 1, ${currentYear}`)
  await section.getByRole('button', { name: String(currentYear - 1), exact: true }).click()
  await expect(section.getByText('567', { exact: true })).toBeVisible()
  await expect(section.getByRole('button', { name: String(currentYear - 1), exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('shows an honest unavailable state and retry recovers without invented zero totals', async ({ page }) => {
  let failed = true
  await mockActivity(page, async (route, year) => {
    if (failed) return route.fulfill({ status: 503, json: { error: 'unavailable' } })
    await route.fulfill({ json: fixture(year) })
  })
  const section = await openCalendar(page)
  await expect(section.getByRole('status')).toContainText('Couldn’t load GitHub activity')
  await expect(section.locator('.github-total')).toHaveCount(0)
  failed = false
  await section.getByRole('button', { name: 'Try again' }).click()
  await expect(section.getByText('1,234', { exact: true })).toBeVisible()
})

test('keeps the calendar scroll inside the page at 320px in both themes', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await mockActivity(page)
  const section = await openCalendar(page)
  await expect(section.getByText('1,234', { exact: true })).toBeVisible()
  for (const theme of ['light', 'dark']) {
    await page.evaluate(value => document.documentElement.dataset.theme = value, theme)
    await expect(section.getByText(/Scroll horizontally/)).toBeVisible()
    expect(await section.evaluate(node => node.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
    const scroll = section.locator('.github-calendar-scroll')
    expect(await scroll.evaluate(node => node.scrollWidth > node.clientWidth)).toBe(true)
    await scroll.evaluate(node => { node.scrollLeft = node.scrollWidth })
    expect(await scroll.evaluate(node => node.scrollLeft > 0)).toBe(true)
    const yearButton = section.getByRole('button', { name: String(currentYear), exact: true })
    expect((await yearButton.boundingBox()).height).toBeGreaterThanOrEqual(44)
    const inspector = section.getByLabel('Inspect a day')
    expect((await inspector.boundingBox()).height).toBeGreaterThanOrEqual(44)
    await inspector.fill(`${currentYear}-02-01`)
    await expect(section.locator('.github-day-detail')).toContainText(`February 1, ${currentYear}`)
  }
})

test('rejects malformed activity and prevents an older response from replacing the selected year', async ({ page }) => {
  await mockActivity(page, async (route, year) => {
    if (year === currentYear) await new Promise(resolve => setTimeout(resolve, 700))
    await route.fulfill({ json: fixture(year) }).catch(() => {})
  })
  const section = await openCalendar(page)
  await section.getByRole('button', { name: String(currentYear - 1), exact: true }).click()
  await expect(section.getByText('567', { exact: true })).toBeVisible()
  await expect(section.getByRole('button', { name: String(currentYear - 1), exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.waitForTimeout(850)
  await expect(section.getByText('567', { exact: true })).toBeVisible()
  await page.unroute('**/api/github-activity?year=*')
  await mockActivity(page, (route, year) => route.fulfill({ json: fixture(year, { total: 'unknown' }) }))
  await section.getByRole('button', { name: String(currentYear), exact: true }).click()
  await expect(section.getByRole('status')).toContainText('Couldn’t load GitHub activity')
})

test('reserves calendar space while the feed loads on desktop and phone', async ({ page }) => {
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 900 })
    let release
    const ready = new Promise(resolve => { release = resolve })
    await mockActivity(page, async (route, year) => { await ready; await route.fulfill({ json: fixture(year) }) })
    await page.goto(`/?calendar-layout=${width}#github`)
    const section = page.locator('#github')
    await section.scrollIntoViewIfNeeded()
    await expect(section.getByRole('status')).toContainText('Loading')
    const before = await section.locator('.github-panel').boundingBox()
    release()
    await expect(section.locator('.github-total')).toBeVisible()
    const after = await section.locator('.github-panel').boundingBox()
    expect(Math.abs(after.height - before.height)).toBeLessThanOrEqual(32)
    await page.unroute('**/api/github-activity?year=*')
  }
})
