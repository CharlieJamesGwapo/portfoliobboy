import { test, expect } from '@playwright/test'

test('language selector plays distinct regional audio and updates transcript language', async ({ page }) => {
  await page.goto('/#voice-demo')
  const demo = page.locator('#voice-demo')
  const options = demo.getByRole('group', { name: 'Choose an English accent' })
  await expect(options.getByRole('button')).toHaveCount(2)
  await demo.getByText('Read sample transcript', { exact: true }).click()
  for (const [title, lang, src] of [
    ['US English', 'en-US', '/audio/voice-us-chatterbox-v5.m4a'],
    ['Australian English', 'en-AU', '/audio/voice-au-chatterbox-v5.m4a'],
  ]) {
    await options.getByRole('button', { name: title, exact: true }).click()
    await expect(options.getByRole('button', { name: title, exact: true })).toHaveAttribute('aria-pressed', 'true')
    await expect(demo.locator('.voice-transcript')).toHaveAttribute('lang', lang)
    await expect(demo.locator('.voice-transcript li')).toHaveCount(3)
    await expect(demo.locator('.voice-transcript')).toContainText('Customer')
    const audio = demo.locator('audio')
    await expect(audio).toHaveAttribute('src', src)
    await audio.evaluate((element) => element.play())
    await expect.poll(() => audio.evaluate((element) => element.currentTime)).toBeGreaterThan(0)
    expect(await audio.evaluate((element) => element.duration)).toBeGreaterThan(5)
  }
  await expect(demo.getByRole('button', { name: 'Filipino / Taglish', exact: true })).toHaveCount(0)
  await expect(demo).toContainText('US and Australian English')
  const previous = await demo.locator('audio').elementHandle()
  await options.getByRole('button', { name: 'US English', exact: true }).click()
  expect(await previous.evaluate((element) => element.paused)).toBe(true)
  await expect(demo.locator('audio')).toHaveJSProperty('paused', true)
})

test('a failed language sample can recover by choosing another voice', async ({ page }) => {
  await page.route('**/voice-au-chatterbox-v5.m4a', (route) => route.abort())
  await page.goto('/#voice-demo')
  const demo = page.locator('#voice-demo')
  await demo.getByRole('button', { name: 'Australian English', exact: true }).click()
  await expect(demo.getByRole('status')).toContainText('Audio could not load')
  await demo.getByRole('button', { name: 'US English', exact: true }).click()
  await expect(demo.getByRole('status')).toHaveCount(0)
  await demo.locator('audio').evaluate((element) => element.play())
  await expect.poll(() => demo.locator('audio').evaluate((element) => element.currentTime)).toBeGreaterThan(0)
})
