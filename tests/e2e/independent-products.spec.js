import { test, expect } from '@playwright/test'

test('switches independent product tabs and image gallery with keyboard controls', async ({ page }) => {
  await page.goto('/#independent-products')
  const showcase = page.locator('#independent-products')
  const tabs = showcase.getByRole('tab')

  await expect(tabs).toHaveCount(5)
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true')
  await expect(showcase.getByRole('heading', { name: 'AutoFlow AI Pro' })).toBeVisible()

  await tabs.nth(0).focus()
  await page.keyboard.press('ArrowRight')
  await expect(tabs.nth(1)).toBeFocused()
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
  await expect(page).toHaveURL(/#easyappy$/)
  await expect(showcase.getByRole('heading', { name: 'EasyAppy' })).toBeVisible()
  const easyAppyGallery = showcase.locator('.product-media')
  const easyAppyButtons = easyAppyGallery.getByRole('button', { name: /Show EasyAppy preview/i })
  await expect(easyAppyButtons).toHaveCount(4)
  await easyAppyButtons.nth(3).click()
  await expect(easyAppyButtons.nth(3)).toHaveAttribute('aria-pressed', 'true')
  await expect(easyAppyGallery.locator('img')).toHaveAttribute('alt', /reviewed hiring email/i)

  await tabs.nth(1).focus()
  await page.keyboard.press('End')
  await expect(tabs.nth(4)).toBeFocused()
  await expect(tabs.nth(4)).toHaveAttribute('aria-selected', 'true')
  await expect(page).toHaveURL(/#contextpilot$/)
  await expect(showcase.getByRole('heading', { name: 'ContextPilot' })).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(/#easyappy$/)
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')

  await tabs.nth(1).focus()
  await page.keyboard.press('ArrowRight')
  await expect(tabs.nth(2)).toBeFocused()
  await expect(showcase.getByRole('heading', { name: 'BBOY' })).toBeVisible()
  await expect(showcase.locator('.independent-agent-diagram')).toBeVisible()

  await page.keyboard.press('Home')
  await expect(showcase.getByRole('heading', { name: 'AutoFlow AI Pro' })).toBeVisible()
  const gallery = showcase.locator('.product-media')
  const imageButtons = gallery.getByRole('button', { name: /Show AutoFlow AI Pro preview/i })
  await expect(imageButtons).toHaveCount(5)
  const image = gallery.locator('img')
  const firstSrc = await image.getAttribute('src')
  await imageButtons.nth(2).click()
  await expect(imageButtons.nth(2)).toHaveAttribute('aria-pressed', 'true')
  await expect(image).not.toHaveAttribute('src', firstSrc)
  await expect(image).toHaveAttribute('alt', /Copilot/i)
  await expect(gallery.locator('figcaption')).toHaveText('Promotional concept preview')
})

test('opens each independent product from a direct hash link after a cold load and reload', async ({ page }) => {
  const products = [
    { id: 'autoflow-ai-pro', title: 'AutoFlow AI Pro' },
    { id: 'easyappy', title: 'EasyAppy' },
    { id: 'bboy-assistant', title: 'BBOY' },
    { id: 'agentforge', title: 'AgentForge' },
  ]
  const showcase = page.locator('#independent-products')

  for (const product of products) {
    await page.goto(`/#${product.id}`)
    const tab = showcase.locator(`#${product.id}`)
    await expect(tab).toHaveAttribute('aria-selected', 'true')
    await expect(showcase.getByRole('heading', { name: product.title })).toBeVisible()

    await page.reload()
    await expect(tab).toHaveAttribute('aria-selected', 'true')
    await expect(showcase.getByRole('heading', { name: product.title })).toBeVisible()
  }
})

test('shows AgentForge as a CLI toolkit with a promotional concept and direct link', async ({ page }) => {
  await page.goto('/#agentforge')
  const showcase = page.locator('#independent-products')
  const panel = showcase.getByRole('tabpanel')

  await expect(showcase.locator('#agentforge')).toHaveAttribute('aria-selected', 'true')
  await expect(showcase.locator('#agentforge')).toContainText('CLI toolkit')
  await expect(panel.getByText('Build with AI. On Your Terms.')).toBeVisible()
  await expect(panel.locator('.product-media img')).toHaveAttribute('src', '/projects/agentforge/showcase.webp')
  await expect(panel.locator('.product-media figcaption')).toHaveText('Promotional concept · AgentForge is a CLI toolkit')
  await expect(panel.getByRole('link', { name: 'Link to this project' })).toHaveAttribute('href', '#agentforge')
  await expect(panel).toContainText('fails closed')

  await page.goto('/#projects')
  const projects = page.locator('#projects')
  await projects.getByRole('tab', { name: /AgentForge/ }).click()
  await expect(projects.getByRole('link', { name: /View source on GitHub/ })).toHaveAttribute(
    'href',
    'https://github.com/CharlieJamesGwapo/AgentForge',
  )
})

test('keeps product copy and gallery controls available when a preview image fails', async ({ page }) => {
  await page.route('**/projects/autoflow/home.webp', (route) => route.abort())
  await page.goto('/#independent-products')
  const showcase = page.locator('#independent-products')
  const gallery = showcase.locator('.product-media')

  await expect(gallery.getByRole('status')).toContainText(/Preview image unavailable/i)
  await expect(showcase.getByRole('heading', { name: 'AutoFlow AI Pro' })).toBeVisible()
  await expect(showcase.getByRole('button', { name: /Show AutoFlow AI Pro preview/i })).toHaveCount(5)
  await expect(showcase.getByText(/In development/i).first()).toBeVisible()
})

test('shows BBOY as a private personal product without a public repository link', async ({ page }) => {
  await page.goto('/#projects')
  const tab = page.locator('#projects').getByRole('tab', { name: /BBOY/ })
  await tab.click()
  const panel = page.locator('#active-project-panel')

  await expect(panel).toContainText(/Private personal source/i)
  await expect(panel.locator('.independent-agent-diagram')).toBeVisible()
  await expect(panel.locator('a[href*="github.com"]')).toHaveCount(0)
  await expect(panel.getByText(/Asset pending/i)).toHaveCount(0)
})

for (const width of [320, 390, 768, 1440]) {
  test(`independent product showcase fits within ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/#independent-products')
    await expect(page.locator('#independent-products')).toBeVisible()
    await expect(page.locator('#independent-products').getByRole('tab')).toHaveCount(5)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await page.goto('/#projects')
    await expect(page.locator('#projects').getByRole('tab', { name: /BBOY/ })).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  })
}
