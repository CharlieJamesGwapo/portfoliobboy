import { test, expect } from '@playwright/test'

const year = new Date().getUTCFullYear()
const activity = selectedYear => {
  const days = []
  for (let time = Date.UTC(selectedYear, 0, 1); time < Date.UTC(selectedYear + 1, 0, 1); time += 86_400_000) {
    days.push({ date: new Date(time).toISOString().slice(0, 10), count: days.length ? 0 : 12, level: days.length ? 0 : 4 })
  }
  return { username: 'CharlieJamesGwapo', profileUrl: 'https://github.com/CharlieJamesGwapo', year: selectedYear, updatedAt: new Date().toISOString(), stale: false, publicRepositories: 70, total: 12, days }
}

test('built portfolio exposes owner build count and navigable live activity without external embeds', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
  const externalGitHubRequests = []
  page.on('request', request => { if (/^https:\/\/(?:api\.)?github\.com\//.test(request.url())) externalGitHubRequests.push(request.url()) })
  await page.route('**/api/github-activity?year=*', route => route.fulfill({ json: activity(Number(new URL(route.request().url()).searchParams.get('year'))) }))
  await page.goto('/')
  await expect(page.locator('.proof-strip')).toContainText('Custom builds')
  await expect(page.locator('.proof-strip')).toContainText('70+')
  await page.keyboard.press('ControlOrMeta+k')
  await page.getByRole('combobox', { name: 'Search sections and actions' }).fill('GitHub activity')
  await page.getByRole('combobox', { name: 'Search sections and actions' }).press('Enter')
  const section = page.getByRole('region', { name: 'GitHub activity', exact: true })
  await expect(section).toBeFocused()
  await expect(section.locator('.github-total')).toHaveText('12')
  await section.getByRole('button', { name: String(year - 1), exact: true }).click()
  await expect(section.locator('.github-summary')).toContainText(`contributions in ${year - 1}`)
  await page.getByRole('button', { name: 'Switch to light theme' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(section.getByRole('link', { name: /View GitHub profile/ })).toBeVisible()
  expect(externalGitHubRequests).toEqual([])
})

test('built mobile calendar has a usable date inspector and scoped scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await page.route('**/api/github-activity?year=*', route => route.fulfill({ json: activity(year) }))
  await page.goto('/#github')
  const section = page.locator('#github')
  await expect(section.locator('.github-total')).toHaveText('12')
  await section.getByLabel('Inspect a day', { exact: true }).fill(`${year}-01-02`)
  await expect(section.locator('.github-day-detail')).toContainText(`0 contributions on January 2, ${year}`)
  expect((await section.getByLabel('Inspect a day', { exact: true }).boundingBox()).height).toBeGreaterThanOrEqual(44)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Open navigation menu', exact: true }).click()
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'GitHub activity', exact: true }).click()
  await expect(page).toHaveURL('/#github')
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeHidden()
})
