import { test, expect } from '@playwright/test'

// Multilingual Conversations sit under the eight English accents. Until a
// recording is approved and generated, a card shows its script only.
for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  test(`multilingual cards fit and read correctly at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/#voice-demo')
    const section = page.getByRole('region', { name: 'Multilingual Conversations' })
    await section.scrollIntoViewIfNeeded()
    await expect(section.getByText('One conversation. Multiple languages. Natural communication.')).toBeVisible()

    const spanish = section.getByRole('article', { name: 'Mexican Spanish' })
    const taglish = section.getByRole('article', { name: 'Filipino / Taglish' })
    await expect(spanish.getByText('Recording soon')).toBeVisible()
    await expect(taglish.getByText('Planned', { exact: true })).toBeVisible()
    await expect(section.getByRole('button', { name: /^Play / })).toHaveCount(0)

    await spanish.getByText('Read the script').click()
    const script = spanish.getByRole('list', { name: 'Mexican Spanish script' })
    await expect(script.locator('[lang="es-MX"]').first()).toBeVisible()
    await expect(script.getByText('¿Se la aparto?', { exact: false })).toBeVisible()

    // The eight accents are untouched.
    await expect(page.getByRole('group', { name: 'Choose an English accent' }).getByRole('button')).toHaveCount(8)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width)
  })
}
