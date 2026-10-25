import { test, expect } from '@playwright/test'
import { readFileSync, mkdirSync } from 'node:fs'
const config = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'))
const csp = config.headers.find(rule => rule.source === '/(.*)').headers.find(h => h.key === 'Content-Security-Policy').value

test('production renders all product galleries under the configured CSP', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error' && /Content Security Policy|Refused to/i.test(message.text())) errors.push(message.text()) })
  // Preview does not apply Vercel headers; apply the tracked CSP to its real
  // built document so this checks browser enforcement, not just its spelling.
  await page.route('http://127.0.0.1:4173/', async route => {
    const response = await route.fetch()
    await route.fulfill({ response, headers: { ...response.headers(), 'content-security-policy': csp } })
  })
  await page.goto('/#independent-products')
  const showcase = page.locator('#independent-products')
  for (const title of ['AutoFlow AI Pro', 'EasyAppy', 'BBOY', 'AgentForge', 'ContextPilot']) {
    await showcase.getByRole('tab', { name: new RegExp(title) }).click()
    await expect(showcase.getByRole('heading', { name: title, exact: true })).toBeVisible()
    for (const button of await showcase.locator('.product-media-thumbnails button').all()) {
      await button.click()
      await expect.poll(() => showcase.locator('img').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true)
    }
  }
  expect(errors).toEqual([])
})

test('initial load defers game engines, music and unselected product imagery', async ({ page }) => {
  const requests = []
  page.on('request', request => requests.push(request.url()))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.locator('#independent-products').scrollIntoViewIfNeeded()
  await expect(page.locator('#independent-products img')).toBeVisible()
  expect(requests.filter(url => /three-vendor|r3f-vendor|ArcadeLobby|GameOverlay|MusicPlayer|CaseStudyPage|LabPage|youtube\.com/.test(url))).toEqual([])
  expect(requests.filter(url => /projects\/(?:easyappy|agentforge|autoflow\/(?:welcome|copilot|studio|providers))/.test(url))).toEqual([])
})

test('the resume remains available offline after fresh network retrieval', async ({ page, context }) => {
  await page.goto('/')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
    if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }))
  })
  const online = await page.evaluate(async () => Array.from(new Uint8Array(await (await fetch('/charlie-james-abejo-resume.pdf')).arrayBuffer())))
  await expect.poll(() => page.evaluate(async () => Boolean(await caches.match('/charlie-james-abejo-resume.pdf')))).toBe(true)
  await context.setOffline(true)
  const offline = await page.evaluate(async () => Array.from(new Uint8Array(await (await fetch('/charlie-james-abejo-resume.pdf')).arrayBuffer())))
  expect(offline).toEqual(online)
  expect(online.slice(0, 5)).toEqual([37, 80, 68, 70, 45])
})


test('professional hero stays readable on desktop and mobile', async ({ page }) => {
  mkdirSync('/tmp/charlie-portfolio-preview', { recursive: true })
  await page.setViewportSize({ width: 1440, height: 1040 })
  await page.goto('/')
  const carousel = page.getByRole('region', { name: 'Featured projects' })
  await expect(carousel.getByRole('tab')).toHaveCount(6)
  await expect(page.locator('.hero-identity img')).toHaveAttribute('src', '/profile-2026.png')
  await expect.poll(() => page.locator('.hero-identity img').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true)
  await page.screenshot({ path: '/tmp/charlie-portfolio-preview/hero-desktop.png' })
  await carousel.getByRole('tab', { name: /EasyAppy/ }).click()
  await expect.poll(() => carousel.locator('.product-media img').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true)
  await page.screenshot({ path: '/tmp/charlie-portfolio-preview/easyappy-desktop.png' })
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/')
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await page.screenshot({ path: '/tmp/charlie-portfolio-preview/hero-mobile.png' })
})
