import { test, expect } from '@playwright/test'
import { readFileSync, mkdirSync } from 'node:fs'
import { createOfflineOrigin } from './helpers/offlineOrigin.js'
const config = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'))
const csp = config.headers.find(rule => rule.source === '/(.*)').headers.find(h => h.key === 'Content-Security-Policy').value

test('production renders all product galleries under the configured CSP', async ({ browser, baseURL }) => {
  // Use HTTPS so upgrade-insecure-requests is enforced as deployed, including
  // WebKit, which also upgrades HTTP loopback subresources.
  const origin = await createOfflineOrigin(baseURL, { secure: true })
  const page = await browser.newPage({ ignoreHTTPSErrors: true })
  try {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (message.type() === 'error' && /Content Security Policy|Refused to/i.test(message.text())) errors.push(message.text()) })
    // Preview does not apply Vercel headers; apply the tracked CSP to its real
    // built document so this checks browser enforcement, not just its spelling.
    await page.route(url => url.pathname === '/', async route => {
      const response = await route.fetch()
      await route.fulfill({ response, headers: { ...response.headers(), 'content-security-policy': csp } })
    })
    await page.goto(`${origin.url}/#independent-products`)
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
  } finally {
    await page.close()
    await origin.stop()
  }
})

test('initial load defers game engines, music and unselected product imagery', async ({ page }) => {
  const requests = []
  page.on('request', request => requests.push(request.url()))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('#full-project-archive img')).toHaveCount(0)
  await page.locator('#independent-products').scrollIntoViewIfNeeded()
  await expect(page.locator('#independent-products img')).toBeVisible()
  expect(requests.filter(url => /three-vendor|r3f-vendor|ArcadeLobby|GameOverlay|MusicPlayer|CaseStudyPage|LabPage|youtube\.com/.test(url))).toEqual([])
  expect(requests.filter(url => /projects\/(?:easyappy|agentforge|autoflow\/(?:welcome|copilot|studio|providers))/.test(url))).toEqual([])
})

test('archive media mounts on disclosure and project filters survive closing and reopening', async ({ page }) => {
  await page.goto('/')
  const archive = page.locator('#full-project-archive')
  await expect(archive.locator('img')).toHaveCount(0)
  await archive.locator(':scope > summary').press('Enter')
  const search = archive.getByRole('searchbox', { name: 'Search projects' })
  await search.fill('EasyAppy')
  const image = archive.locator('#projects img')
  await image.scrollIntoViewIfNeeded()
  await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true)
  await archive.locator(':scope > summary').click()
  await expect(archive).not.toHaveAttribute('open', '')
  await archive.locator(':scope > summary').press('Enter')
  await expect(search).toHaveValue('EasyAppy')
  await expect(archive.locator('.project-discovery-card')).toHaveCount(1)
  await expect(image).toBeVisible()
})

for (const hash of ['projects', 'momentum-work', 'live-projects']) {
  test(`archive media and cold fragment navigation remain usable at ${hash}`, async ({ page }) => {
    await page.goto(`/#${hash}`)
    await expect(page.locator('#full-project-archive')).toHaveAttribute('open', '')
    await expect(page.locator(`#${hash}`)).toBeVisible()
    await expect(page.locator('#full-project-archive img').first()).toBeAttached()
    await expect.poll(() => page.locator(`#${hash}`).evaluate(node => node.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0)
    await expect.poll(() => page.locator(`#${hash}`).evaluate(node => node.getBoundingClientRect().top)).toBeLessThan(210)
  })
}

test('the resume remains available after its network origin becomes unreachable', async ({ page, baseURL }) => {
  const origin = await createOfflineOrigin(baseURL)
  try {
    await page.goto(origin.url)
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready
      if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }))
    })
    const online = await page.evaluate(async () => Array.from(new Uint8Array(await (await fetch('/charlie-james-abejo-resume.pdf')).arrayBuffer())))
    await expect.poll(() => page.evaluate(async () => Boolean(await caches.match('/charlie-james-abejo-resume.pdf')))).toBe(true)
    await origin.stop()
    const uncachedNetworkFailed = await page.evaluate(async () => {
      try { await fetch('/offline-network-probe', { cache: 'no-store' }); return false } catch { return true }
    })
    expect(uncachedNetworkFailed).toBe(true)
    const offline = await page.evaluate(async () => Array.from(new Uint8Array(await (await fetch('/charlie-james-abejo-resume.pdf')).arrayBuffer())))
    expect(offline).toEqual(online)
    expect(online.slice(0, 5)).toEqual([37, 80, 68, 70, 45])
  } finally {
    await origin.stop()
  }
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
