import { test, expect, devices } from '@playwright/test'
import { writeFileSync } from 'node:fs'

test.use({ ...devices['iPhone 13'], defaultBrowserType: 'chromium', serviceWorkers: 'block' })

test('mobile load measurement', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    window.mobileMetrics = { cls: 0, lcp: 0 }
    new PerformanceObserver(list => list.getEntries().forEach(entry => {
      if (!entry.hadRecentInput) window.mobileMetrics.cls += entry.value
    })).observe({ type: 'layout-shift', buffered: true })
    new PerformanceObserver(list => list.getEntries().forEach(entry => {
      window.mobileMetrics.lcp = entry.startTime
    })).observe({ type: 'largest-contentful-paint', buffered: true })
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await expect.poll(() => page.locator('.hero-identity img').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true)
  await page.locator('#voice-demo').scrollIntoViewIfNeeded()
  // Observe the existing idle upgrade window as well as the initial request graph.
  await expect(page.locator('#voice-demo h2')).toBeVisible()
  await page.waitForTimeout(3000)
  const resources = await page.evaluate(() => ({
    ...window.mobileMetrics,
    requests: performance.getEntriesByType('resource').map(entry => ({ path: new URL(entry.name).pathname, bytes: entry.encodedBodySize })),
    overflow: document.documentElement.scrollWidth > innerWidth,
  }))
  const result = { ...resources, totalEncodedBytes: resources.requests.reduce((sum, resource) => sum + resource.bytes, 0) }
  await testInfo.attach('mobile-load-measurement', { body: JSON.stringify(result, null, 2), contentType: 'application/json' })
  if (process.env.MOBILE_MEASUREMENT_PATH) writeFileSync(process.env.MOBILE_MEASUREMENT_PATH, JSON.stringify(result, null, 2))
  expect(result.overflow).toBe(false)
})

test('a touch visitor can explore voice demos without downloading a decorative 3D engine', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 })
  const expensiveRequests = []
  page.on('request', request => {
    if (/three-vendor|voiceOrbWebgl/.test(request.url())) expensiveRequests.push(new URL(request.url()).pathname)
  })
  await page.goto('/#voice-demo')
  await expect(page.locator('.vs-orb')).toBeVisible()
  await page.waitForTimeout(3000)
  expect(expensiveRequests).toEqual([])
  await expect(page.getByRole('tab', { name: /English Accents/ })).toBeVisible()
})

test('recordings stay on demand and still support seeking before playback', async ({ page }) => {
  const audioRequests = []
  page.on('request', request => { if (/\.mp3(?:\?|$)/.test(request.url())) audioRequests.push(request.url()) })
  await page.goto('/#voice-demo')
  await expect(page.getByRole('tab', { name: /English Accents/ })).toBeVisible()
  await expect(page.locator('#vs-panel-accents audio')).toHaveCount(1)
  await page.getByRole('tab', { name: /Multilingual Conversations/ }).click()
  await expect(page.locator('#vs-panel-multilingual audio').first()).toBeAttached()
  expect(audioRequests).toEqual([])
  await page.getByRole('tab', { name: /English Accents/ }).click()
  const player = page.locator('#vs-panel-accents .vs-player')
  const seek = player.getByRole('slider', { name: /^Seek/ })
  await seek.fill('4')
  await expect(seek).toHaveValue('4')
  await player.getByRole('button', { name: /^Play/ }).click()
  await expect.poll(() => player.locator('audio').evaluate(audio => audio.paused)).toBe(false)
  expect(audioRequests.length).toBeGreaterThan(0)
  await expect.poll(() => player.locator('audio').evaluate(audio => audio.currentTime)).toBeGreaterThanOrEqual(4)
  await player.getByRole('button', { name: /^Pause/ }).click()
})

test('official phone screenshots render using small optimized assets', async ({ page }) => {
  await page.goto('/')
  const preview = page.getByRole('region', { name: 'Featured projects' })
  const image = preview.getByTestId('oneride-screen')
  await image.scrollIntoViewIfNeeded()
  await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true)
  const source = await image.evaluate(node => node.currentSrc)
  const response = await page.request.get(source)
  expect(response.ok()).toBe(true)
  expect(response.headers()['content-type']).toMatch(/image\/webp/)
  expect((await response.body()).byteLength).toBeLessThan(50_000)
  await expect(preview.getByRole('heading', { name: 'OneRide Balingasag' })).toBeVisible()
})

test('back to top respects reduced motion without an animated scroll', async ({ page }) => {
  // Keep the initial fragment's delayed layout-settle pass pending until after
  // the visitor acts; otherwise this race depends on machine speed.
  const start = new Date('2026-11-27T00:00:00Z')
  await page.clock.install({ time: start })
  await page.clock.pauseAt(start)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#contact')
  await page.clock.runFor(100)
  const top = page.getByRole('button', { name: 'Back to top', exact: true })
  await expect(top).toBeVisible()
  // Capture the public API argument while preserving the actual browser action.
  await page.evaluate(() => {
    const original = window.scrollTo.bind(window)
    window.scrollTo = (...args) => { window.lastScrollRequest = args[0]; original(...args) }
  })
  await top.click()
  expect(await page.evaluate(() => window.lastScrollRequest?.behavior)).toBe('instant')
  await page.clock.runFor(600)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})
