import { test, expect } from '@playwright/test'

for (const width of [320, 1440]) {
  test(`the illustrated workflow works with keyboard and reduced motion at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'dark' })
    await page.goto('/')
    const workflow = page.locator('.hero-workflow')
    const details = workflow.locator('details')
    const summary = details.locator('summary')
    await workflow.scrollIntoViewIfNeeded()
    await summary.focus()
    await expect(details).not.toHaveAttribute('open', '')
    await page.keyboard.press('Enter')
    await expect(details).toHaveAttribute('open', '')
    await expect(details.locator('p')).toBeVisible()
    await page.keyboard.press('Space')
    await expect(details).not.toHaveAttribute('open', '')
    const duration = await workflow.locator('.hero-workflow-icon').first().evaluate(node => getComputedStyle(node).animationDuration)
    expect(parseFloat(duration)).toBeGreaterThan(0)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await expect(workflow.locator('.hero-workflow-icon').first()).toHaveCSS('animation-name', 'none')
    for (const theme of ['dark', 'light']) {
      if (theme === 'light') {
        if (width === 320) await page.getByRole('button', { name: 'Open navigation menu' }).click()
        await page.getByRole('button', { name: 'Switch to light theme' }).click()
        if (width === 320) await page.getByRole('button', { name: 'Close navigation menu' }).click()
      }
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
      await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Lead Full-Stack Developer — AI, Web & Mobile.')
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
      for (const control of [summary, page.getByRole('link', { name: 'Explore my work', exact: true })]) {
        expect((await control.boundingBox()).height).toBeGreaterThanOrEqual(43.9)
      }
    }
  })
}

async function expectOfficialScreen(preview, number, label) {
  await expect(preview.getByRole('button', {
    name: `Show OneRide screenshot ${number}: ${label}`,
    exact: true,
  })).toHaveAttribute('aria-pressed', 'true')
  await expect(preview.getByTestId('oneride-screen')).toHaveAttribute(
    'src',
    `/projects/oneride/official-screen-0${number}.webp`,
  )
  await expect.poll(() => preview.getByTestId('oneride-screen').evaluate(
    (image) => image.complete && image.naturalWidth > 0,
  )).toBe(true)
}

for (const width of [390, 1440]) {
  test(`preserves the official OneRide hero controls after visiting refreshed covers at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/')

    const carousel = page.getByRole('region', { name: 'Featured projects' })
    const oneRideTab = carousel.getByRole('tab', { name: /OneRide/ })
    const preview = carousel.getByTestId('oneride-preview')

    await expect(oneRideTab).toHaveAttribute('aria-selected', 'true')
    await expectOfficialScreen(preview, 2, 'Stores')
    await expect(carousel.locator('.project-cover')).toHaveCount(0)

    await preview.getByRole('button', { name: 'Show OneRide screenshot 1: Home', exact: true }).click()
    await expectOfficialScreen(preview, 1, 'Home')

    const stores = preview.getByRole('button', { name: 'Show OneRide screenshot 2: Stores', exact: true })
    await stores.focus()
    await page.keyboard.press('Enter')
    await expectOfficialScreen(preview, 2, 'Stores')

    const orders = preview.getByRole('button', { name: 'Show OneRide screenshot 3: Orders', exact: true })
    await orders.focus()
    await page.keyboard.press('Space')
    await expectOfficialScreen(preview, 3, 'Orders')

    for (const product of ['EasyAppy', 'BBOY', 'AgentForge']) {
      const productTab = carousel.getByRole('tab', { name: new RegExp(product) })
      await productTab.click()
      await expect(productTab).toHaveAttribute('aria-selected', 'true')
      await expect(carousel.locator('.project-cover')).toBeVisible()

      await productTab.focus()
      await page.keyboard.press('Home')
      await expect(oneRideTab).toBeFocused()
      await expect(oneRideTab).toHaveAttribute('aria-selected', 'true')
      await expect(carousel.locator('.project-cover')).toHaveCount(0)
      await expectOfficialScreen(preview, 2, 'Stores')
      await preview.getByRole('button', { name: 'Show OneRide screenshot 3: Orders', exact: true }).click()
      await expectOfficialScreen(preview, 3, 'Orders')
    }

    await expect(page.locator('#case-oneride .project-cover')).toHaveCount(0)
  })
}

for (const surface of ['hero', 'showcase']) {
  test(`keeps EasyAppy ${surface} gallery controls usable through a failed covered preview`, async ({ page }) => {
    await page.route('**/projects/easyappy/welcome.webp', (route) => route.abort())
    await page.goto(surface === 'hero' ? '/' : '/#easyappy')

    const container = surface === 'hero'
      ? page.getByRole('region', { name: 'Featured projects' })
      : page.locator('#independent-products')
    if (surface === 'hero') {
      await container.getByRole('tab', { name: /EasyAppy/ }).click()
    }
    const gallery = container.locator('.product-media')
    await gallery.scrollIntoViewIfNeeded()

    await expect(gallery.locator('.project-cover')).toBeVisible()
    await expect(gallery.getByRole('status')).toContainText('Preview image unavailable')
    await expect(gallery.getByRole('button', { name: /Show EasyAppy preview:/ })).toHaveCount(4)

    const email = gallery.getByRole('button', { name: 'Show EasyAppy preview: Email review', exact: true })
    await email.click()
    await expect(email).toHaveAttribute('aria-pressed', 'true')
    await expect(gallery.getByRole('status')).toHaveCount(0)
    await expect(gallery.locator('img')).toHaveAttribute('alt', /reviewed hiring email/i)
    await expect.poll(() => gallery.locator('img').evaluate(
      (image) => image.complete && image.naturalWidth > 0,
    )).toBe(true)

    const interviews = gallery.getByRole('button', { name: 'Show EasyAppy preview: Interviews', exact: true })
    await interviews.focus()
    await page.keyboard.press('Enter')
    await expect(interviews).toHaveAttribute('aria-pressed', 'true')
    await expect(email).toHaveAttribute('aria-pressed', 'false')
    await expect(gallery.locator('img')).toHaveAttribute('alt', /upcoming interviews/i)
    await expect(gallery.locator('figcaption')).toHaveText('Promotional concept preview')
  })
}
