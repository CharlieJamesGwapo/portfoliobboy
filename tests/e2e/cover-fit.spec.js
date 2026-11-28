import { test, expect } from '@playwright/test'

async function expectArchitectureFits(cover) {
  await expect(cover).toBeVisible()
  const overflow = await cover.evaluate((element) => {
    const artwork = element.querySelector('.project-cover-artwork').getBoundingClientRect()
    return [...element.querySelectorAll('.project-cover-agent-core > span, .project-cover-agent-roles, .project-cover-agent-map > p')]
      .filter((item) => item.checkVisibility())
      .map((item) => item.getBoundingClientRect())
      .some((bounds) => bounds.top < artwork.top - 1 || bounds.bottom > artwork.bottom + 1)
  })
  expect(overflow, 'Visible BBOY diagram content must fit inside its artwork frame').toBe(false)
  for (const role of ['Coordinator', 'Developer', 'Reviewer']) {
    await expect(cover.getByText(role, { exact: true })).toBeVisible()
  }
}

for (const width of [320, 390]) {
  test(`BBOY architecture stays inside each cover at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const hero = page.getByRole('region', { name: 'Featured projects' })
    await hero.getByRole('tab', { name: /BBOY/ }).click()
    await expectArchitectureFits(hero.locator('[data-project-cover="bboy-assistant"]'))

    await page.goto('/#bboy-assistant')
    await expectArchitectureFits(page.locator('#independent-products [data-project-cover="bboy-assistant"]'))

    await page.goto('/projects/bboy')
    await expectArchitectureFits(page.locator('[data-project-cover="bboy-assistant"]'))

    await page.goto('/projects')
    const archiveCover = page.locator('[data-project-cover="bboy-assistant"]')
    await archiveCover.scrollIntoViewIfNeeded()
    await expectArchitectureFits(archiveCover)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  })
}
