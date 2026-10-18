import { test, expect } from '@playwright/test'

for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 720 }]) {
  test(`all arcade choices are reachable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await page.getByRole('button', { name: 'Enter interactive lab', exact: true }).click()
    const arcade = page.getByRole('dialog', { name: "Charlie's interactive game arcade" })
    await expect(arcade).toBeVisible()
    const heading = arcade.getByRole('heading', { name: /Charlie's Arcade/ })
    await expect.poll(async () => (await heading.boundingBox())?.y).toBeGreaterThanOrEqual(70)
    const choices = arcade.getByRole('button', { name: 'Play', exact: true })
    await expect(choices).toHaveCount(9)
    for (const choice of await choices.all()) {
      await choice.scrollIntoViewIfNeeded()
      const bounds = await choice.boundingBox()
      expect(bounds.y).toBeGreaterThanOrEqual(65)
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height)
    }
    await arcade.getByRole('button', { name: 'Exit arcade and return to portfolio' }).click()
    await expect(arcade).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Enter interactive lab', exact: true })).toBeFocused()
  })
}

test('arcade leaderboard contains keyboard focus and restores its opener', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Enter interactive lab', exact: true }).click()
  const arcade = page.getByRole('dialog', { name: "Charlie's interactive game arcade" })
  await expect(arcade.getByRole('button', { name: 'My Avatar', exact: true })).toBeVisible()
  const opener = arcade.getByRole('button', { name: /Leaderboard/ })
  await opener.click()
  const board = page.getByRole('dialog', { name: 'Arcade leaderboards' })
  await expect(board.getByRole('button', { name: 'Close', exact: true })).toBeFocused()
  for (let index = 0; index < 12; index++) {
    await page.keyboard.press('Tab')
    expect(await board.evaluate((element) => element.contains(document.activeElement))).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(board).toHaveCount(0)
  await expect(opener).toBeFocused()
})
