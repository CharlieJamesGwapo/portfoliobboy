import { test, expect } from '@playwright/test'

for (const viewport of [{ width: 667, height: 375 }, { width: 390, height: 520 }]) {
  test(`Alex remains closable and usable at ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/projects')
    await page.getByRole('button', { name: 'Open Alex, AI Portfolio Assistant' }).click()
    const panel = page.getByRole('dialog', { name: 'Alex', exact: true })
    await panel.getByRole('button', { name: 'Prepare a brief', exact: true }).click()
    await panel.getByRole('textbox', { name: 'Your answer' }).fill('A customer portal')
    await expect(panel.getByRole('button', { name: 'Close Alex', exact: true })).toBeInViewport()
    await expect(panel.getByRole('button', { name: 'Send question' })).toBeInViewport()
    const [outer, close] = await Promise.all([panel.boundingBox(), panel.getByRole('button', { name: 'Close Alex', exact: true }).boundingBox()])
    expect(close.y).toBeGreaterThanOrEqual(outer.y)
    expect(close.y + close.height).toBeLessThanOrEqual(outer.y + outer.height)
    await panel.getByRole('button', { name: 'Close Alex', exact: true }).click()
    await expect(panel).toHaveCount(0)
  })
}
