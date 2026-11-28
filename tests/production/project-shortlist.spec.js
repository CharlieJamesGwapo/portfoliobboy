import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const panel = page => page.getByRole('region', { name: 'Your project shortlist', exact: true })

test('built project comparison restores public evidence and downloads the selected studies', async ({ page }) => {
  await page.goto('/projects?compare=zalio-crm,autoflow-ai-pro#project-shortlist')
  const comparison = panel(page)
  await expect(comparison.getByRole('article')).toHaveCount(2)
  await expect(comparison).toContainText('In development · Planned integrations')
  await expect(comparison).toContainText('Private product module · Public Zalio product tour available')
  await comparison.getByLabel('Add a case study').selectOption('oneride')
  await comparison.getByRole('button', { name: 'Add project', exact: true }).click()
  await expect(comparison.getByRole('article')).toHaveCount(3)
  const downloaded = page.waitForEvent('download')
  await comparison.getByRole('button', { name: 'Download text', exact: true }).click()
  const file = await downloaded
  expect(file.suggestedFilename()).toBe('charlie-abejo-project-comparison.txt')
  const content = await readFile(await file.path(), 'utf8')
  expect(content).toContain('https://portfoliobboy.vercel.app/projects/oneride')
  expect(content).toContain('In development · Planned integrations')
  expect(content).toContain('Private product module')
  await comparison.getByRole('link', { name: 'Read Zalio CRM case study', exact: true }).click()
  await expect(page).toHaveURL('/projects/zalio-crm')
  await expect(page.getByRole('button', { name: 'Remove Zalio CRM from shortlist', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('built shortlist enquiry retains a private contact draft across internal browsing without submitting', async ({ page }) => {
  const submissions = []
  page.on('request', request => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/contact') submissions.push(request.url())
  })
  await page.goto('/#contact')
  await page.getByLabel('Name', { exact: true }).fill('Portfolio QA')
  await page.getByLabel('Email', { exact: true }).fill('qa@example.test')
  await page.locator('#contact-subject').fill('Existing private subject')
  await page.locator('#contact-message').fill('Existing private enquiry draft to preserve.')
  await page.getByRole('navigation', { name: 'Primary navigation', exact: true }).getByRole('link', { name: 'Projects', exact: true }).click()
  await expect(page).toHaveURL('/projects')
  await panel(page).getByLabel('Add a case study').selectOption('zalio-crm')
  await panel(page).getByRole('button', { name: 'Add project', exact: true }).click()
  const saved = await page.evaluate(() => sessionStorage.getItem('portfolio-project-shortlist'))
  expect(JSON.parse(saved)).toEqual(['zalio-crm'])
  expect(saved).not.toMatch(/qa@example|private|Portfolio QA/)
  await panel(page).getByRole('button', { name: 'Prepare an enquiry', exact: true }).click()
  await expect(page).toHaveURL('/#contact')
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Portfolio QA')
  await expect(page.getByLabel('Email', { exact: true })).toHaveValue('qa@example.test')
  await expect(page.locator('#contact-subject')).toHaveValue('Existing private subject')
  await expect(page.locator('#contact-message')).toHaveValue('Existing private enquiry draft to preserve.')
  await expect(page.locator('#contact-prepared-message')).toHaveValue(/Zalio CRM/)
  await expect(page.locator('#contact-prepared-subject')).toHaveValue(/Selected portfolio examples/)
  expect(submissions).toEqual([])
})
