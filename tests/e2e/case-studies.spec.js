import { test, expect } from '@playwright/test'

const caseStudyRoutes = [
  ['/projects/alex-hasti', 'Alex / Hasti'],
  ['/projects/zalio-crm', 'Zalio CRM'],
  ['/projects/oneride', 'OneRide Balingasag'],
  ['/projects/autoflow-ai-pro', 'AutoFlow AI Pro'],
  ['/projects/easyappy', 'EasyAppy'],
  ['/projects/bboy', 'BBOY'],
  ['/projects/agentforge', 'AgentForge'],
  ['/projects/contextpilot', 'ContextPilot'],
  ['/projects/omji-billing', 'OMJI Internet Access & Billing System'],
  ['/projects/fitness-crm', 'Enterprise CRM Platform'],
  ['/projects/fintech-lending', 'Fintech Lending Platform Modernization'],
  ['/projects/moist-alumni', 'MOIST Alumni Tracking System'],
  ['/projects/filtra-pos', 'Filtra Coffee POS'],
  ['/projects/ecycle-hub', 'E-Cycle Hub'],
  ['/projects/mobile-booking', 'Jolly Ride & Massage Booking Apps'],
]

for (const [route, title] of caseStudyRoutes) {
  test(`opens the ${title} case study from a direct URL`, async ({ page }) => {
    await page.goto(route)
    const article = page.getByRole('article')

    await expect(article.getByRole('heading', { level: 1, name: title })).toBeVisible()
    await expect(article.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'All projects' })).toHaveAttribute('href', '/projects')
    await expect(article.getByRole('heading', { name: /problem/i })).toBeVisible()
    await expect(article.getByRole('heading', { name: /my role/i })).toBeVisible()
    await expect(article.getByRole('heading', { name: /architecture/i })).toBeVisible()
    await expect(article.getByRole('heading', { name: /engineering challenges/i })).toBeVisible()
    await expect(article.getByRole('heading', { name: /delivered outcome/i })).toBeVisible()
    await expect(article.getByRole('link', { name: /next project/i })).toHaveAttribute('href', /^\/projects\//)
  })
}

test('separates ContextPilot capabilities that exist today from the proposed voice direction', async ({ page }) => {
  await page.goto('/projects/contextpilot')
  const article = page.getByRole('article')

  await expect(article.getByRole('heading', { name: 'Current capabilities' })).toBeVisible()
  await expect(article.getByText(/search and retrieve relevant code context/i)).toBeVisible()
  await expect(article.getByRole('heading', { name: /proposed voice ai agents/i })).toBeVisible()
  await expect(article.getByText(/proposed direction/i)).toBeVisible()
  await expect(article.getByText(/local tools require no account or API key/i)).toBeVisible()
  await expect(article.getByRole('link', { name: /repository/i })).toHaveCount(0)
})

test('preserves unrelated query parameters while project technology filters change', async ({ page }) => {
  await page.goto('/projects?campaign=portfolio&q=member&category=CRM&tech=Postgres')
  const search = page.getByRole('searchbox', { name: 'Search projects' })
  const category = page.getByRole('button', { name: /^CRM/ })
  const technology = page.getByRole('combobox', { name: 'Filter by technology' })

  await expect(search).toHaveValue('member')
  await expect(category).toHaveAttribute('aria-pressed', 'true')
  await expect(technology).toHaveValue('Postgres')
  await expect(page.getByRole('tab', { name: /Enterprise CRM Platform/i })).toBeVisible()

  await technology.selectOption('Next.js')
  await expect(page).toHaveURL(/campaign=portfolio/)
  await expect(page).toHaveURL(/q=member/)
  await expect(page).toHaveURL(/category=CRM/)
  await expect(page).toHaveURL(/tech=Next(?:%2E|\.)js/i)

  await page.getByRole('button', { name: 'Clear all filters' }).click()
  await expect(page).toHaveURL(/campaign=portfolio/)
  await expect(page).not.toHaveURL(/(?:\?|&)(?:q|category|tech)=/)
})

test('keeps case-study content available when a concept image fails to load', async ({ page }) => {
  await page.route('**/projects/contextpilot/workspace.webp', (route) => route.abort())
  await page.goto('/projects/contextpilot')
  const article = page.getByRole('article')

  await expect(article.locator('.product-media').getByRole('status')).toContainText(/preview image unavailable/i)
  await expect(article.getByRole('heading', { name: 'Current capabilities' })).toBeVisible()
  await expect(article.getByRole('link', { name: 'All projects' }).first()).toHaveAttribute('href', '/projects')
})

test('shows matching case-study links from the featured project explorer', async ({ page }) => {
  await page.goto('/projects?category=AI&tech=TypeScript')
  const projects = page.locator('#projects')

  await projects.getByRole('tab', { name: /AgentForge/ }).click()
  await expect(projects.getByRole('link', { name: /Read the AgentForge case study/i })).toHaveAttribute('href', '/projects/agentforge')
})

for (const width of [320, 390, 768, 1440]) {
  test(`case-study layout fits within a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/projects/contextpilot')
    await expect(page.getByRole('article').getByRole('heading', { level: 1, name: 'ContextPilot' })).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  })
}
