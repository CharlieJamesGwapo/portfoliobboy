import { test, expect } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const projects = ['scale-with-accounting', 'omji-billing', 'st-john-baptist', 'freelancepath', 'idealink', 'zero-to-hero-dev']
for (const slug of projects) {
  test(`${slug} has accessible media, a live link and responsive case study`, async ({ page, request }) => {
    const response = await request.get(`/projects/${slug}`)
    expect(response.ok()).toBe(true)
    expect(await response.text()).toContain(`https://portfoliobboy.vercel.app/projects/${slug}`)
    await page.goto(`/projects/${slug}`)
    await expect(page.getByRole('article').getByRole('heading', { level: 1 })).toBeVisible()
    const media = page.locator(`img[src="/projects/${slug}/showcase.webp"]`)
    await media.scrollIntoViewIfNeeded()
    await expect.poll(() => media.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true)
    await expect(page.getByRole('article').locator('a[href^="https://"]').first()).toBeVisible()
    mkdirSync('output/project-additions', { recursive: true })
    await page.screenshot({ path: `output/project-additions/${slug}-desktop.png`, fullPage: true })
    await page.setViewportSize({ width: 390, height: 844 })
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    await page.screenshot({ path: `output/project-additions/${slug}-mobile.png`, fullPage: true })
  })
}
