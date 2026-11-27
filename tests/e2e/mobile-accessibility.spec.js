import { test, expect } from '@playwright/test'

// These checks exercise local navigation only. No voice, booking or contact
// submission is started by this suite.
async function openMobileSearch(page) {
  await page.getByRole('button', { name: 'Open navigation menu', exact: true }).click()
  await page.getByRole('button', { name: 'Search sections and actions', exact: true }).click()
  await expect(page.getByRole('combobox')).toBeFocused()
}

async function textContrast(locator, pseudo = null) {
  return locator.evaluate((element, pseudo) => {
    const parse = (value) => value.match(/[\d.]+/g).map(Number)
    const over = (front, back) => {
      const alpha = front[3] ?? 1
      return front.slice(0, 3).map((channel, index) => channel * alpha + back[index] * (1 - alpha))
    }
    const layers = []
    for (let node = element; node; node = node.parentElement) layers.push(parse(getComputedStyle(node).backgroundColor))
    let background = [255, 255, 255]
    for (const layer of layers.reverse()) background = over(layer, background)
    const foreground = over(parse(getComputedStyle(element, pseudo).color), background)
    const luminance = (color) => color.map((channel) => {
      const value = channel / 255
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    }).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0)
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
    return (values[0] + 0.05) / (values[1] + 0.05)
  }, pseudo)
}

for (const width of [320, 390]) {
  test(`mobile section selection transfers focus out of the closed menu at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 700 })
    await page.goto('/')
    await page.getByRole('button', { name: 'Open navigation menu', exact: true }).click()
    await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'About', exact: true }).click()
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeHidden()
    await expect(page.locator('#about')).toBeFocused()
    await expect(page.locator('#main-content')).not.toHaveAttribute('inert', '')
  })

  test(`mobile search has a touch close and restores a visible opener at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 700 })
    await page.goto('/')
    await openMobileSearch(page)
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Open navigation menu', exact: true })).toBeFocused()
    await openMobileSearch(page)
    await expect.poll(() => page.locator('.palette-results').evaluate((list) => list.scrollWidth - list.clientWidth)).toBeLessThanOrEqual(1)
    const close = page.getByRole('button', { name: 'Close command palette', exact: true })
    await expect(close).toBeVisible()
    await expect(page.locator('.palette')).toHaveCSS('transform', 'none')
    const box = await close.boundingBox()
    expect(box.width).toBeGreaterThanOrEqual(44)
    expect(box.height).toBeGreaterThanOrEqual(44)
    await close.click()
    await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeHidden()
    await expect(page.getByRole('button', { name: 'Open navigation menu', exact: true })).toBeFocused()
  })
}

test('palette keyboard focus stays in the dialog and returns after close', async ({ page }) => {
  await page.goto('/')
  const opener = page.getByRole('button', { name: 'Open command palette to search sections and actions' })
  await opener.click()
  const input = page.getByRole('combobox')
  await expect(input).toBeFocused()
  await expect(page.locator('.navbar')).toHaveAttribute('inert', '')
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('option', { name: 'Experience Jump to section' })).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('ArrowUp')
  await expect(page.getByRole('option', { name: 'About Jump to section' })).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('Tab')
  const close = page.getByRole('button', { name: 'Close command palette', exact: true })
  await expect(close).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(input).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(opener).toBeFocused()
  await expect(page.locator('.navbar')).not.toHaveAttribute('inert', '')
})

test('palette empty search is announced without a selectable empty option', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open command palette to search sections and actions' }).click()
  await page.getByRole('combobox').fill('no-such-destination-987654')
  await expect(page.getByRole('dialog', { name: 'Command palette' }).getByRole('status')).toContainText('No matches')
  await expect(page.getByRole('listbox', { name: 'Results' }).getByRole('option')).toHaveCount(0)
  await expect(page.getByRole('combobox')).not.toHaveAttribute('aria-activedescendant', /.+/)
})

for (const colorScheme of ['dark', 'light']) {
  test(`palette secondary text meets text contrast in ${colorScheme} theme`, async ({ page }) => {
    await page.emulateMedia({ colorScheme })
    await page.goto('/')
    await page.getByRole('button', { name: 'Open command palette to search sections and actions' }).click()
    await expect(page.getByRole('combobox')).toBeFocused()
    for (const locator of [page.locator('.palette-results li small').first(), page.locator('.palette-footer')]) {
      await expect.poll(() => textContrast(locator)).toBeGreaterThanOrEqual(4.5)
    }
    await expect.poll(() => textContrast(page.getByRole('combobox'), '::placeholder')).toBeGreaterThanOrEqual(4.5)
  })
}

test('desktop search is a comfortable touch target', async ({ page }) => {
  await page.goto('/')
  const box = await page.getByRole('button', { name: 'Open command palette to search sections and actions' }).boundingBox()
  expect(box.width).toBeGreaterThanOrEqual(44)
  expect(box.height).toBeGreaterThanOrEqual(44)
})
