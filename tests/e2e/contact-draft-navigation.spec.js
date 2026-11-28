import { test, expect } from '@playwright/test'

for (const succeeds of [true, false]) {
  test(`an old ${succeeds ? 'successful' : 'failed'} send cannot erase a newer draft after navigation`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    let release
    const ready = new Promise(resolve => { release = resolve })
    let submissions = 0
    await page.route('**/api/contact', async route => {
      submissions++
      await ready
      await route.fulfill({ status: succeeds ? 200 : 500, json: succeeds ? { success: true } : {} })
    })
    await page.goto('/#contact')
    await page.getByLabel('Name', { exact: true }).fill('Portfolio QA')
    await page.getByLabel('Email', { exact: true }).fill('qa@example.test')
    await page.locator('#contact-subject').fill('First enquiry')
    await page.locator('#contact-message').fill('First local test enquiry.')
    await page.getByRole('button', { name: 'Send message', exact: true }).click()
    await expect.poll(() => submissions).toBe(1)
    const nav = page.getByRole('navigation', { name: 'Primary navigation', exact: true })
    await nav.getByRole('link', { name: 'Projects', exact: true }).click()
    await expect(page).toHaveURL('/projects')
    await expect(page.getByRole('heading', { name: 'Your project shortlist', exact: true })).toBeVisible()
    await nav.getByRole('link', { name: 'Contact', exact: true }).click()
    await expect(page.locator('#contact-message')).toHaveValue('')
    await page.locator('#contact-subject').fill('Newer enquiry')
    await page.locator('#contact-message').fill('Newer local private draft retained.')
    const response = page.waitForResponse(response => new URL(response.url()).pathname === '/api/contact')
    release()
    await (await response).finished()
    await nav.getByRole('link', { name: 'Projects', exact: true }).click()
    await expect(page).toHaveURL('/projects')
    await expect(page.getByRole('heading', { name: 'Your project shortlist', exact: true })).toBeVisible()
    await nav.getByRole('link', { name: 'Contact', exact: true }).click()
    await expect(page.locator('#contact-subject')).toHaveValue('Newer enquiry')
    await expect(page.locator('#contact-message')).toHaveValue('Newer local private draft retained.')
    expect(submissions).toBe(1)
  })
}
