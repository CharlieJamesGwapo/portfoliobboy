import { test, expect } from '@playwright/test'

async function openPanel(page, path = '/projects') {
  await page.goto(path)
  await page.getByRole('button', { name: 'Open Alex, AI Portfolio Assistant', exact: true }).click()
  return page.getByRole('dialog', { name: 'Alex', exact: true })
}

test('new chat clears mode drafts, edited briefs and conversation while preserving separate contact and shortlist data', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => sessionStorage.setItem('portfolio-project-shortlist', JSON.stringify(['zalio-crm'])))
  const panel = await openPanel(page, '/#contact')
  await panel.getByRole('button', { name: 'Close Alex', exact: true }).click()
  await page.locator('#contact-subject').fill('Existing contact subject')
  await page.locator('#contact-message').fill('Existing contact draft is separate.')
  await page.getByRole('button', { name: 'Open Alex, AI Portfolio Assistant', exact: true }).click()
  await panel.getByRole('textbox', { name: 'Ask Alex a question' }).fill('Private general draft')
  await panel.getByRole('button', { name: 'Find projects', exact: true }).click()
  await panel.getByRole('textbox', { name: 'Describe your project' }).fill('Private project draft')
  await panel.getByRole('button', { name: 'Check role fit', exact: true }).click()
  await panel.getByRole('textbox', { name: 'Paste job requirements' }).fill('Private role requirements')
  await panel.getByRole('button', { name: 'Prepare a brief', exact: true }).click()
  for (const answer of ['Private brief idea', 'Private brief users', 'Private brief features', 'Private brief timing']) {
    await panel.getByRole('textbox', { name: 'Your answer' }).fill(answer)
    await panel.getByRole('button', { name: 'Send question' }).click()
    await expect(panel.getByLabel('Alex is typing')).toHaveCount(0)
  }
  await panel.locator('#alex-brief').fill('Private edited brief')
  await panel.getByRole('button', { name: 'Start a new chat', exact: true }).click()
  await expect(panel.getByRole('textbox', { name: 'Ask Alex a question' })).toBeFocused()
  await expect(panel.getByRole('textbox', { name: 'Ask Alex a question' })).toHaveValue('')
  await expect(panel.locator('.alex-msg-visitor')).toHaveCount(0)
  await expect(panel.locator('#alex-brief')).toHaveCount(0)
  await expect(panel).not.toContainText('Private')
  for (const [mode, field] of [['Find projects', 'Describe your project'], ['Check role fit', 'Paste job requirements']]) {
    await panel.getByRole('button', { name: mode, exact: true }).click()
    await expect(panel.getByRole('textbox', { name: field })).toHaveValue('')
  }
  await panel.getByRole('button', { name: 'Prepare a brief', exact: true }).click()
  await expect(panel.locator('#alex-mode-help')).toContainText('Step 1 of 4')
  await expect(panel.getByRole('textbox', { name: 'Your answer' })).toHaveValue('')
  await expect(page.locator('#contact-subject')).toHaveValue('Existing contact subject')
  await expect(page.locator('#contact-message')).toHaveValue('Existing contact draft is separate.')
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('portfolio-project-shortlist')))).toEqual(['zalio-crm'])
})

test('new chat cancels a pending reply and resets used suggestions after close and reopen', async ({ page }) => {
  await page.clock.install()
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const panel = await openPanel(page)
  await panel.getByRole('button', { name: 'What has Charlie built?', exact: true }).click()
  await expect(panel.getByLabel('Alex is typing')).toBeVisible()
  await panel.getByRole('button', { name: 'Start a new chat', exact: true }).click()
  await page.clock.runFor(1000)
  await expect(panel.locator('.alex-msg-alex')).toHaveCount(1)
  await expect(panel.locator('.alex-msg-visitor')).toHaveCount(0)
  await expect(panel.getByRole('button', { name: 'What has Charlie built?', exact: true })).toBeVisible()
  await panel.getByRole('button', { name: 'Close Alex', exact: true }).click()
  await page.getByRole('button', { name: 'Open Alex, AI Portfolio Assistant', exact: true }).click()
  await expect(panel.locator('.alex-msg-alex')).toHaveCount(1)
  await expect(panel.getByRole('textbox', { name: 'Ask Alex a question' })).toBeFocused()
})
