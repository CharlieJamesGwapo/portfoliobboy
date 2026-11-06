import { test, expect } from '@playwright/test'

// Multilingual Conversations sit under the eight English accents. The Spanish
// call is recorded; the Taglish card shows its script only until approved.
for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  test(`multilingual cards fit and read correctly at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/#voice-demo')
    // Multilingual calls sit behind the second Voice Studio tab.
    const tab = page.getByRole('tab', { name: /Multilingual/ })
    await expect(tab).toHaveAttribute('aria-selected', 'false')
    await tab.click()
    await expect(tab).toHaveAttribute('aria-selected', 'true')
    const section = page.getByRole('region', { name: 'Multilingual Conversations' })
    await section.scrollIntoViewIfNeeded()
    await expect(section.getByText('One conversation. Multiple languages. Natural communication.')).toBeVisible()

    const spanish = section.getByRole('article', { name: 'Mexican Spanish' })
    const taglish = section.getByRole('article', { name: 'Filipino / Taglish' })
    await expect(taglish.getByText('Planned', { exact: true })).toBeVisible()
    await expect(taglish.getByRole('button', { name: /^Play / })).toHaveCount(0)

    // The recorded Spanish call plays inline, about 30 seconds long.
    const audio = spanish.locator('audio')
    await expect(audio).toHaveAttribute('src', /es-mx[^/]*\.mp3$/)
    await spanish.getByRole('button', { name: 'Play Mexican Spanish conversation' }).click()
    await expect.poll(() => audio.evaluate((element) => element.currentTime)).toBeGreaterThan(0)
    const duration = await audio.evaluate((element) => element.duration)
    expect(duration).toBeGreaterThan(25)
    expect(duration).toBeLessThan(35)
    await spanish.getByRole('button', { name: 'Pause Mexican Spanish conversation' }).click()

    await spanish.getByText('Read the transcript').click()
    const transcript = spanish.getByRole('list', { name: 'Mexican Spanish conversation transcript' })
    await expect(transcript.locator('[lang="es-MX"]').first()).toBeVisible()
    await expect(transcript.getByText('¿Se la aparto?', { exact: false })).toBeVisible()

    // Switching back pauses the call and shows the eight accents again.
    await spanish.getByRole('button', { name: 'Play Mexican Spanish conversation' }).click()
    await page.getByRole('tab', { name: /English Accents/ }).click()
    // Role locators skip hidden panels, so read the call's <audio> by id.
    await expect.poll(() => page.locator('#vs-panel-multilingual audio').evaluate((element) => element.paused)).toBe(true)
    await expect(page.getByRole('group', { name: 'Choose an English accent' }).getByRole('button')).toHaveCount(8)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width)
  })
}
