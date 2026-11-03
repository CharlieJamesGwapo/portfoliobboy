import { test, expect } from '@playwright/test'

test('selected work presents three evidence-backed studies and keeps the catalogue collapsed', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('main > section').nth(1)).toHaveAttribute('id', 'voice-demo')
  const studies = page.locator('.selected-case-study')
  await expect(studies).toHaveCount(3)
  for (const title of ['OneRide Balingasag', 'Zalio CRM', 'Alex / Hasti']) {
    const study = studies.filter({ has: page.getByRole('heading', { name: title, exact: true }) })
    await expect(study.getByText('My contribution', { exact: true })).toBeVisible()
    await expect(study.getByText('Delivered', { exact: true })).toBeVisible()
    await study.locator('summary').click()
    await expect(study.getByText('Engineering approach', { exact: true })).toBeVisible()
    await expect(study.locator('details')).toHaveAttribute('open', '')
    await study.locator('summary').press('Enter')
    await expect(study.locator('details')).not.toHaveAttribute('open', '')
  }
  await expect(page.locator('#full-project-archive')).not.toHaveAttribute('open', '')
  await expect(page.locator('#projects')).toBeHidden()
  await expect(page.locator('#momentum-work')).toBeHidden()
  await expect(page.locator('#live-projects')).toBeHidden()
})

test('voice engineering stays collapsed while audio remains directly playable', async ({ page }) => {
  await page.goto('/#voice-demo')
  const demo = page.locator('#voice-demo')
  const engineering = demo.locator('.voice-engineering')
  await expect(engineering).not.toHaveAttribute('open', '')
  await expect(demo.locator('.vc-figure')).toBeHidden()
  await expect(demo.locator('audio')).toBeVisible()
  await engineering.locator('summary').press('Enter')
  await expect(demo.locator('.vc-figure')).toBeVisible()
  await expect(demo.locator('#voice-sample-disclosure')).toContainText('Fictional conversations with synthetic voices.')
  await expect(demo.locator('#voice-sample-disclosure')).toContainText('No real appointment is made.')
})

for (const hash of ['projects', 'momentum-work', 'live-projects']) {
  test(`cold links open the archive at ${hash}`, async ({ page }) => {
    await page.goto(`/#${hash}`)
    await expect(page.locator('#full-project-archive')).toHaveAttribute('open', '')
    await expect(page.locator(`#${hash}`)).toBeVisible()
    await expect.poll(() => page.locator(`#${hash}`).evaluate(node => node.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0)
    await expect.poll(() => page.locator(`#${hash}`).evaluate(node => node.getBoundingClientRect().top)).toBeLessThan(200)
  })
}

test('command palette reveals a closed archive and transfers focus', async ({ page }) => {
  await page.goto('/')
  const mobileMenu = page.getByRole('button', { name: 'Open navigation menu', exact: true })
  if (await mobileMenu.isVisible()) {
    await mobileMenu.click()
    await page.getByRole('button', { name: 'Search sections and actions', exact: true }).click()
  } else {
    await page.getByRole('button', { name: 'Open command palette to search sections and actions' }).click()
  }
  await page.getByRole('combobox').fill('Projects')
  await page.getByRole('combobox').press('Enter')
  await expect(page.locator('#full-project-archive')).toHaveAttribute('open', '')
  await expect(page.locator('#projects')).toBeFocused()
})

test('an in-page link reopens the archive even when the fragment has not changed', async ({ page }) => {
  await page.goto('/')
  const link = page.getByRole('link', { name: 'Explore the systems', exact: true })
  await link.click()
  await expect(page.locator('#full-project-archive')).toHaveAttribute('open', '')
  await page.locator('#full-project-archive > summary').click()
  await expect(page.locator('#full-project-archive')).not.toHaveAttribute('open', '')
  await link.click()
  await expect(page.locator('#full-project-archive')).toHaveAttribute('open', '')
  await expect(page.locator('#momentum-work')).toBeVisible()
})

for (const [id, image, href] of [
  ['zalio-crm', 'zalio.png', 'https://zalio.ai/'],
  ['alex-hasti', 'hasti.png', 'https://hasti.com.au/'],
]) {
  test(`${id} retains its public link when the preview image fails`, async ({ page }) => {
    await page.route(`**/projects/${image}`, route => route.abort())
    await page.goto('/#product-studio-preview')
    const study = page.locator(`#case-${id}`)
    await study.scrollIntoViewIfNeeded()
    await expect(study.getByRole('status')).toContainText('Website preview unavailable')
    await expect(study.locator(`.case-study-actions a[href="${href}"]`)).toHaveAttribute('href', href)
    await expect(study.locator('img')).toHaveCount(0)
  })
}

for (const width of [320, 390, 768, 1440]) {
  test(`hiring content fits at ${width}px with usable controls`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/#product-studio-preview')
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    for (const control of await page.locator('.selected-case-study a, .selected-case-study summary, #full-project-archive > summary').all()) {
      const bounds = await control.boundingBox()
      expect(bounds.height).toBeGreaterThanOrEqual(44)
      expect(bounds.x).toBeGreaterThanOrEqual(0)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
    }
  })
}
