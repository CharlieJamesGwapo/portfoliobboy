import { test, expect } from '@playwright/test'

for (const shortcut of ['Control+k', 'Meta+k', '/']) {
  test(`palette shortcut ${shortcut} closes the mobile menu before taking focus`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 })
    await page.goto('/#home')

    const menuButton = page.getByRole('button', { name: 'Open navigation menu' })
    await menuButton.click()
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible()
    await expect(page.locator('main')).toHaveAttribute('inert', '')

    await page.keyboard.press(shortcut)

    await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible()
    await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('main')).not.toHaveAttribute('inert', '')
    await expect(page.getByRole('combobox', { name: 'Search sections and actions' })).toBeFocused()
  })
}

for (const shortcut of ['Control+k', 'Meta+k', '/']) {
  test(`palette shortcut ${shortcut} is suppressed while the Lab owns focus`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 })
    await page.goto('/#lab')
    await page.getByRole('button', { name: 'Enter interactive lab' }).click()

    const arcade = page.getByRole('dialog', { name: "Charlie's interactive game arcade" })
    await expect(arcade).toBeVisible()
    await page.keyboard.press(shortcut)

    await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeHidden()
    await expect(arcade).toBeVisible()
    await expect(page.locator('body')).toHaveClass(/game-open/)
  })
}

test('Control-K keeps its normal open-then-close toggle without another overlay', async ({ page }) => {
  await page.goto('/#home')

  await page.keyboard.press('Control+k')
  await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible()
  await page.keyboard.press('Control+k')
  await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeHidden()
})

test('credential detail dialog traps focus, restores its trigger, and releases page inertness', async ({ page }) => {
  test.skip(true, 'Pending Task 4 credential detail trigger mount; run this integration flow after Task 4.')

  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/#education')
  const trigger = page.getByRole('button', { name: 'Open details: Building with the Claude API' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Building with the Claude API' })
  await expect(dialog).toBeVisible()

  // A palette shortcut must close the native detail before the palette input
  // takes focus. This stays pending until Task 4 mounts the credential trigger.
  await page.keyboard.press('Control+k')
  const palette = page.getByRole('dialog', { name: 'Command palette' })
  await expect(dialog).toBeHidden()
  await expect(palette).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Search sections and actions' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(palette).toBeHidden()
  await expect(trigger).toBeFocused()

  await trigger.click()
  await expect(dialog).toBeVisible()

  await page.keyboard.press('Tab')
  await expect(dialog.locator(':focus')).toHaveCount(1)
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.locator(':focus')).toHaveCount(1)

  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()

  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible()
  await expect(page.locator('main')).toHaveAttribute('inert', '')
  await page.getByRole('button', { name: 'Close navigation menu' }).click()
  await expect(page.locator('main')).not.toHaveAttribute('inert', '')
})
