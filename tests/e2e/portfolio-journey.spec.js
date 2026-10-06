import { test, expect } from '@playwright/test'

const primaryLinks = [
  ['Work', '#momentum-work'],
  ['Services', '#ai-systems'],
  ['About', '#about'],
  ['Credentials', '#education'],
  ['Contact', '#contact'],
]

const legacySectionIds = ['home', 'about', 'experience', 'projects', 'skills', 'education', 'lab', 'contact']

test('journey 1 exposes five measured primary destinations in the approved order', async ({ page }) => {
  await page.goto('/#education')
  await expect(page.locator('#education')).toBeVisible()
  await expect.poll(() => page.locator('#education').evaluate((element) => Math.round(element.getBoundingClientRect().top))).toBe(96)

  const primary = page.getByRole('navigation', { name: 'Primary navigation' })
  await expect(primary.getByRole('link')).toHaveCount(5)
  await expect(primary.getByRole('link')).toHaveText(primaryLinks.map(([label]) => label))
  for (const [index, [, href]] of primaryLinks.entries()) {
    await expect(primary.getByRole('link').nth(index)).toHaveAttribute('href', href)
  }

  const sectionOrder = await page.locator('#main-content > section').evaluateAll((sections) => sections.map((section) => section.id))
  expect(sectionOrder).toEqual([
    'home',
    'momentum-work',
    'ai-systems',
    'about',
    'experience',
    'projects',
    'skills',
    'education',
    'lab',
    'contact',
  ])
})

test('legacy section anchors remain unique and deep links still land on the requested section', async ({ page }) => {
  await page.goto('/#projects')
  await expect(page.locator('#projects')).toBeVisible()

  for (const id of legacySectionIds) {
    await expect(page.locator(`#${id}`)).toHaveCount(1)
  }

  await page.goto('/#education')
  await expect(page.locator('#education')).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.location.hash)).toBe('#education')
})

test('mobile navigation keeps secondary section links and presentation actions reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/#home')

  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  const mobile = page.getByRole('navigation', { name: 'Mobile navigation' })
  await expect(mobile).toBeVisible()
  for (const [label, href] of [
    ['Experience', '#experience'],
    ['Projects', '#projects'],
    ['Skills', '#skills'],
    ['Interactive Lab', '#lab'],
  ]) {
    await expect(mobile.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href)
  }
  await expect(mobile.getByRole('link', { name: /resume/i })).toBeVisible()
  await expect(mobile.getByRole('button', { name: /music/i })).toBeVisible()
})

test('hero shows the concise profile role while native details retain every professional title', async ({ page }) => {
  await page.goto('/#home')
  const roleSummary = page.locator('.rotating-title')
  await expect(roleSummary.locator('.rotating-title-value')).toHaveText('AI Developer & Full-Stack Engineer')
  await expect(roleSummary.locator('details')).toBeVisible()

  await roleSummary.locator('summary').click()
  for (const title of [
    'AI Developer',
    'Full-Stack Developer',
    'Python and Go Developer',
    'Backend Engineer',
    'AI Integration Engineer',
    'SaaS Developer',
    '.NET Developer',
    'Mobile Application Developer',
  ]) {
    await expect(roleSummary.locator('details')).toContainText(title)
  }
  await expect(page.getByRole('link', { name: /Explore selected work/i })).toHaveAttribute('href', '#momentum-work')
})

test('original projects retain eight tabs, readable details, and a collapsed eight-build archive', async ({ page }) => {
  await page.goto('/#projects')
  const projects = page.locator('#projects')
  await expect(projects.locator('[role="tab"]')).toHaveCount(8)
  await expect(projects.locator('[role="tabpanel"]')).toContainText('A unified ride-hailing')
  await expect(projects.locator('.project-links a')).toBeVisible()

  const details = projects.locator('.project-story-details summary')
  await expect(details).toBeVisible()
  await details.click()
  await expect(projects.locator('.project-story-details')).toContainText('Context')
  await expect(projects.locator('.project-story-details')).toContainText('Architecture')
  await expect(projects.locator('.project-story-details')).toContainText('Product features')

  await expect(projects.locator('.archive-project')).toHaveCount(0)
  await projects.getByRole('button', { name: 'View all 8 earlier builds' }).click()
  await expect(projects.locator('.archive-project')).toHaveCount(8)
  await expect(projects.getByRole('button', { name: 'Hide earlier builds' })).toBeVisible()
})

test('skills retain six groups and disclose their complete token lists natively', async ({ page }) => {
  await page.goto('/#skills')
  const skills = page.locator('#skills')
  await expect(skills.locator('details.skill-group')).toHaveCount(6)
  await expect(skills.locator('details.skill-group[open]')).toHaveCount(0)

  for (const group of await skills.locator('details.skill-group').all()) {
    await group.locator('summary').click()
  }
  await expect(skills.locator('.skill-cloud span')).toHaveCount(65)
  await expect(skills).toContainText('CRM webhook sync')
  await expect(skills).toContainText('Offline-tolerant sync')
})

test('reduced motion keeps the hero fallback visible when WebGL is unavailable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function getContext(type, ...args) {
      if (type === 'webgl2' || type === 'webgl') return null
      return originalGetContext.call(this, type, ...args)
    }
  })
  await page.goto('/#home')

  await expect(page.locator('.systems-visual-shell')).toBeVisible()
  await expect(page.locator('.systems-fallback')).toBeVisible()
  for (const orbit of await page.locator('.hero-orbit').all()) {
    await expect(orbit).toHaveCSS('animation-name', 'none')
  }
})
