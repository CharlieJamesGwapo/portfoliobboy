import { test, expect } from '@playwright/test'

// Bboy AI Voice Studio: eight pre-recorded accent previews on a custom player.
// Audio requests are matched by file name; Vite also requests each .mp3 as a
// JS module (resourceType "script"), which must be allowed through.
const ACCENTS = [
  ['American', 'en-US', 'american-english'],
  ['British', 'en-GB', 'british-english'],
  ['Australian', 'en-AU', 'australian-english'],
  ['Filipino', 'en-PH', 'filipino-english'],
  ['Canadian', 'en-CA', 'canadian-english'],
  ['Irish', 'en-IE', 'irish-english'],
  ['Indian', 'en-IN', 'indian-english'],
  ['South African', 'en-ZA', 'south-african-english'],
]

const accentButton = (demo, name) => demo.getByRole('group', { name: 'Choose an English accent' }).getByRole('button', { name: new RegExp(`^${name}`) })

test('a preview can retry after a failed load without reloading the page', async ({ page }) => {
  let available = false
  await page.route(/american-english[^/]*\.mp3/, (route) => available || route.request().resourceType() === 'script' ? route.continue() : route.abort())
  await page.goto('/#voice-demo')
  const demo = page.locator('#voice-demo')
  await expect(demo.getByRole('status')).toContainText("This preview couldn't load")
  available = true
  await demo.getByRole('button', { name: 'Try again', exact: true }).click()
  await expect(demo.getByRole('status')).toHaveCount(0)
  await demo.getByRole('button', { name: 'Play American English preview' }).click()
  await expect.poll(() => demo.locator('audio').evaluate((element) => element.currentTime)).toBeGreaterThan(0)
})

test('voice studio is the first section after the hero', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('main > section').nth(1)).toHaveAttribute('id', 'voice-demo')
})

test('every accent plays its own recording, with a matching transcript, and switching stops the previous one', async ({ page }) => {
  await page.goto('/#voice-demo')
  const demo = page.locator('#voice-demo')
  await expect(demo.getByRole('group', { name: 'Choose an English accent' }).getByRole('button')).toHaveCount(8)
  await demo.getByText('Read the conversation', { exact: true }).click()
  for (const [name, lang, file] of ACCENTS) {
    await accentButton(demo, name).click()
    await expect(accentButton(demo, name)).toHaveAttribute('aria-pressed', 'true')
    await expect(demo.locator('.vs-transcript ol')).toHaveAttribute('lang', lang)
    await expect(demo.locator('.vs-transcript ol li').first()).toBeVisible()
    const audio = demo.locator('audio')
    await expect(audio).toHaveAttribute('src', new RegExp(`${file}(?:-[\\w-]+)?\\.mp3$`))
    await demo.getByRole('button', { name: `Play ${name} English preview` }).click()
    await expect.poll(() => audio.evaluate((element) => element.currentTime)).toBeGreaterThan(0)
    const duration = await audio.evaluate((element) => element.duration)
    expect(duration).toBeGreaterThan(15)
    expect(duration).toBeLessThan(40)
  }
  const previous = await demo.locator('audio').elementHandle()
  await accentButton(demo, 'American').click()
  expect(await previous.evaluate((element) => element.paused)).toBe(true)
  await expect(demo.locator('audio')).toHaveJSProperty('paused', true)
  await expect(demo).not.toContainText(/William|Natasha/)
})

test('a failed accent preview can recover by choosing another accent', async ({ page }) => {
  await page.route(/australian-english[^/]*\.mp3/, (route) => route.request().resourceType() === 'script' ? route.continue() : route.abort())
  await page.goto('/#voice-demo')
  const demo = page.locator('#voice-demo')
  await accentButton(demo, 'Australian').click()
  await expect(demo.getByRole('status')).toContainText("This preview couldn't load")
  await accentButton(demo, 'British').click()
  await expect(demo.getByRole('status')).toHaveCount(0)
  await demo.getByRole('button', { name: 'Play British English preview' }).click()
  await expect.poll(() => demo.locator('audio').evaluate((element) => element.currentTime)).toBeGreaterThan(0)
})

test('previews play, pause, seek and finish within a mobile screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#voice-demo')
  const demo = page.locator('#voice-demo')
  await demo.locator('.vs-studio').scrollIntoViewIfNeeded()
  for (const name of ['American', 'Irish']) {
    await accentButton(demo, name).click()
    const play = demo.getByRole('button', { name: `Play ${name} English preview` })
    const audio = demo.locator('audio')
    await play.click()
    await expect.poll(() => audio.evaluate((element) => element.currentTime)).toBeGreaterThan(0)
    await demo.getByRole('button', { name: `Pause ${name} English preview` }).click()
    await expect(audio).toHaveJSProperty('paused', true)
    // Seek with the keyboard on the waveform's range control, then play to the end.
    const seek = demo.getByRole('slider', { name: `Seek ${name} English preview` })
    await seek.focus()
    await seek.press('End')
    await expect.poll(() => audio.evaluate((element) => element.duration - element.currentTime)).toBeLessThan(1)
    await audio.evaluate((element) => { element.currentTime = element.duration - 0.5 })
    await play.click()
    await expect.poll(() => audio.evaluate((element) => element.ended)).toBe(true)
    await expect(demo.getByRole('button', { name: `Replay ${name} English preview` })).toBeVisible()
    const bounds = await demo.locator('.vs-player').boundingBox()
    expect(bounds.x).toBeGreaterThanOrEqual(0)
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(390)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})
