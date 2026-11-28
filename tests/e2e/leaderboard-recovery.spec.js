import { test, expect } from '@playwright/test'

async function openBoard(page, saved) {
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort())
  await page.addInitScript(value => localStorage.setItem('dungeon_local_leaderboard', value), saved)
  await page.goto('/lab')
  await page.getByRole('button', { name: 'Enter interactive lab', exact: true }).click()
  const arcade = page.getByRole('dialog', { name: "Charlie's interactive game arcade" })
  await arcade.getByRole('button', { name: /Leaderboard/ }).click()
  return page.getByRole('dialog', { name: 'Arcade leaderboards' })
}

test('corrupt saved scores recover to a visitor-friendly empty board', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const board = await openBoard(page, 'null')
  await expect(board.getByText(/No scores yet/)).toBeVisible()
  await expect(board.getByText(/Scores.*(device|session)/i)).toBeVisible()
  await expect(board).not.toContainText(/VITE_|Supabase|\.env/)
  expect(errors).toEqual([])
})

test('racing board shows the fastest lap first in readable time', async ({ page }) => {
  const board = await openBoard(page, JSON.stringify([
    { player_name: 'Slow lap', score: 75001, game: 'racing', time_seconds: 100 },
    { player_name: 'Fast lap', score: 62345, game: 'racing', time_seconds: 90 },
    { player_name: 'No completed lap', score: 0, game: 'racing', time_seconds: 0 },
  ]))
  await board.getByRole('button', { name: /Pixel/ }).click()
  await expect(board.locator('ol li')).toHaveCount(2)
  await expect(board.locator('ol li').first()).toContainText('Fast lap')
  await expect(board.locator('ol li').first()).toContainText('1:02.345')
  await expect(board.locator('ol li').last()).toContainText('1:15.001')
  await expect(board).not.toContainText('62,345')
})
