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
  await expect(page.locator('#main-content')).toBeVisible()

  await page.keyboard.press('Control+k')
  await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible()
  await page.keyboard.press('Control+k')
  await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeHidden()
})

test('credential detail dialog traps focus, restores its trigger, and releases page inertness', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/#education')
  const trigger = page.getByRole('button', { name: 'Open details: Building with the Claude API' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Building with the Claude API' })
  await expect(dialog).toBeVisible()

  // A palette shortcut must close the native detail before the palette input
  // takes focus.
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

test('credential detail returns focus to search when its trigger is filtered away', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/#education')
  await page.getByRole('button', { name: 'Open details: Building with the Claude API' }).click()
  const dialog = page.getByRole('dialog', { name: 'Building with the Claude API' })
  await expect(dialog).toBeVisible()

  // Native modal semantics keep the page behind the dialog inert. Dispatching
  // the same input event React receives lets this regression exercise the
  // collection's fallback ref without weakening that browser guarantee.
  await page.evaluate(() => {
    const input = document.querySelector('input[aria-label="Search credentials"]')
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    setter?.call(input, 'Active Directory')
    input?.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await expect(page.locator('[data-credential-title="Building with the Claude API"]')).toHaveCount(0)

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(page.getByRole('searchbox', { name: 'Search credentials' })).toBeFocused()
})
