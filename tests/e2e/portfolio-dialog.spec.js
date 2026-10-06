import { test, expect } from '@playwright/test'

test('credential detail dialog traps focus, restores its trigger, and releases page inertness', async ({ page }) => {
  test.skip(true, 'Pending Task 4 credential detail trigger mount; run this integration flow after Task 4.')

  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/#education')
  const trigger = page.getByRole('button', { name: 'Open details: Building with the Claude API' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Building with the Claude API' })
  await expect(dialog).toBeVisible()

  await page.keyboard.press('Tab')
  await expect(dialog.locator(':focus')).toHaveCount(1)
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.locator(':focus')).toHaveCount(1)

  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()

  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible()
  await expect(page.locator('main')).not.toHaveAttribute('inert', '')
})
