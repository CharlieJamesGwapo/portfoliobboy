import { test, expect } from '@playwright/test'

const credentialTitles = [
  'Building with the Claude API',
  'Introduction to Model Context Protocol',
  'Introduction to Agent Skills',
  'Claude Code in Action',
  'Model Context Protocol: Advanced Topics',
  'Go Programming',
]

const uploadedCertificates = [
  ['Introduction to Model Context Protocol', '/certificates/introduction-model-context-protocol.webp'],
  ['Teaching the AI Fluency Framework', '/certificates/teaching-ai-fluency-framework.webp'],
  ['Claude 101', '/certificates/claude-101.webp'],
  ['Building with the Claude API', '/certificates/claude-anthropic-api.webp'],
  ['AI Fluency: Framework & Foundations', '/certificates/ai-fluency-framework-foundations.webp'],
]

function relativeLuminance(value) {
  const channels = value.match(/[\d.]+/g)?.slice(0, 3).map(Number) || [0, 0, 0]
  const linear = channels.map((channel) => {
    const normalized = channel / 255
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  })
  return (0.2126 * linear[0]) + (0.7152 * linear[1]) + (0.0722 * linear[2])
}

function contrastRatio(foreground, background) {
  const light = Math.max(relativeLuminance(foreground), relativeLuminance(background))
  const dark = Math.min(relativeLuminance(foreground), relativeLuminance(background))
  return (light + 0.05) / (dark + 0.05)
}

async function openCredentials(page, viewport = { width: 1440, height: 900 }) {
  await page.setViewportSize(viewport)
  await page.goto('/#education')
  await expect(page.getByRole('heading', { name: 'Find a record by title, issuer, or ID.' })).toBeVisible()
}

test('shows six featured credentials with complete collection counts', async ({ page }) => {
  await openCredentials(page)

  await expect(page.locator('.credential-explorer-item')).toHaveCount(6)
  await expect(page.getByText('Showing 6 of 23 records in all categories.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'View all 23 records' })).toBeVisible()

  for (const title of credentialTitles) {
    await expect(page.locator(`[data-credential-title="${title}"]`)).toBeVisible()
  }
})

test('searches the complete inventory and offers an empty-state reset', async ({ page }) => {
  await openCredentials(page)
  const search = page.getByRole('searchbox', { name: 'Search credentials' })

  await search.fill(' active DIRECTORY ')
  await expect(page.locator('.credential-explorer-item')).toHaveCount(1)
  await expect(page.locator('[data-credential-title="Active Directory"]')).toBeVisible()
  await expect(page.getByText('Showing 1 of 23 records in all categories.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Show featured' })).toHaveCount(0)
  await expect(page.getByText('Filters search all 23 records.')).toBeVisible()

  await search.fill('does-not-exist')
  await expect(page.getByRole('status')).toContainText('No credentials match')
  await page.getByRole('button', { name: 'Clear search' }).click()
  await expect(search).toHaveValue('')
  await expect(page.locator('.credential-explorer-item')).toHaveCount(6)
  await expect(page.getByRole('button', { name: 'View all 23 records' })).toBeVisible()
})

test('category controls search all AI and technical records', async ({ page }) => {
  await openCredentials(page)

  await page.getByRole('button', { name: 'AI & Anthropic' }).click()
  await expect(page.locator('.credential-explorer-item')).toHaveCount(11)
  await expect(page.getByText('Showing 11 of 23 records in AI & Anthropic.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'View all 23 records' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Show featured' })).toHaveCount(0)

  await page.getByRole('button', { name: 'Technical & Professional' }).click()
  await expect(page.locator('.credential-explorer-item')).toHaveCount(12)
  await expect(page.locator('[data-credential-title="Active Directory"]')).toBeVisible()
  await expect(page.locator('[data-credential-title="Full-Stack Web Development Certification"]')).toBeVisible()
})

test('progressive disclosure exposes all records and restores featured view', async ({ page }) => {
  await openCredentials(page)

  await page.getByRole('button', { name: 'View all 23 records' }).click()
  await expect(page.locator('.credential-explorer-item')).toHaveCount(23)
  await expect(page.getByRole('button', { name: 'Show featured' })).toBeVisible()

  await page.getByRole('button', { name: 'Show featured' }).click()
  await expect(page.locator('.credential-explorer-item')).toHaveCount(6)
})

test('retains expanded preference after query and category filters are cleared', async ({ page }) => {
  await openCredentials(page)

  await page.getByRole('button', { name: 'View all 23 records' }).click()
  await expect(page.locator('.credential-explorer-item')).toHaveCount(23)
  await expect(page.getByRole('button', { name: 'Show featured' })).toBeVisible()

  const search = page.getByRole('searchbox', { name: 'Search credentials' })
  await search.fill('active directory')
  await expect(page.locator('.credential-explorer-item')).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Show featured' })).toHaveCount(0)
  await expect(page.getByText('Filters search all 23 records.')).toBeVisible()

  await page.getByRole('button', { name: 'Technical & Professional' }).click()
  await expect(page.locator('.credential-explorer-item')).toHaveCount(1)

  await search.fill('')
  await expect(page.locator('.credential-explorer-item')).toHaveCount(12)
  await expect(page.getByRole('button', { name: 'Show featured' })).toHaveCount(0)

  await page.getByRole('button', { name: 'All', exact: true }).click()
  await expect(page.locator('.credential-explorer-item')).toHaveCount(23)
  await expect(page.getByRole('button', { name: 'Show featured' })).toBeVisible()
})

test('details expose the five supplied certificate image URLs', async ({ page }) => {
  await openCredentials(page)
  await page.getByRole('button', { name: 'View all 23 records' }).click()

  for (const [title, image] of uploadedCertificates) {
    const trigger = page.getByRole('button', { name: `Open details: ${title}` })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: title })
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('img.credential-detail-image')).toHaveAttribute('src', image)
    await expect(dialog.getByRole('link', { name: 'Open original certificate in a new tab' })).toHaveAttribute('href', image)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  }
})

test('details retain expired status and explicitly label missing images', async ({ page }) => {
  await openCredentials(page)
  await page.getByRole('button', { name: 'View all 23 records' }).click()

  await page.getByRole('button', { name: 'Open details: Full-Stack Web Development Certification' }).click()
  const expiredDialog = page.getByRole('dialog', { name: 'Full-Stack Web Development Certification' })
  await expect(expiredDialog).toContainText('Expired Jul 2025')
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Open details: Active Directory' }).click()
  const missingImageDialog = page.getByRole('dialog', { name: 'Active Directory' })
  await expect(missingImageDialog).toContainText('No uploaded certificate image')
  await page.keyboard.press('Escape')
})

test('credential dialog foregrounds and controls meet computed contrast in both themes', async ({ page }) => {
  await openCredentials(page)
  const themeSelect = page.locator('select[aria-label="Color theme"]:visible').first()

  for (const theme of ['light', 'dark']) {
    await themeSelect.selectOption(theme)
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe(theme)

    await page.getByRole('button', { name: 'Open details: Building with the Claude API' }).click()
    const dialog = page.getByRole('dialog', { name: 'Building with the Claude API' })
    await expect(dialog).toBeVisible()
    const pairs = await page.evaluate(() => {
      const dialogElement = document.querySelector('.portfolio-dialog')
      const intro = dialogElement?.querySelector('.credential-detail-intro')
      const close = dialogElement?.querySelector('.portfolio-dialog-close')
      const dialogStyles = getComputedStyle(dialogElement)
      const introStyles = getComputedStyle(intro)
      const closeStyles = getComputedStyle(close)
      return {
        dialog: { foreground: introStyles.color, background: dialogStyles.backgroundColor },
        close: { foreground: closeStyles.color, background: closeStyles.backgroundColor },
      }
    })

    expect(contrastRatio(pairs.dialog.foreground, pairs.dialog.background)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(pairs.close.foreground, pairs.close.background)).toBeGreaterThanOrEqual(4.5)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  }
})

test('mobile credential explorer has no horizontal overflow and stays below the baseline height', async ({ page }) => {
  await openCredentials(page, { width: 390, height: 900 })

  const measurements = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    sectionHeight: document.querySelector('#education')?.getBoundingClientRect().height || 0,
  }))

  expect(measurements.documentWidth).toBeLessThanOrEqual(measurements.viewportWidth)
  expect(measurements.sectionHeight).toBeLessThan(5692.796875)
  await page.getByRole('button', { name: 'View all 23 records' }).click()
  await expect(page.locator('.credential-explorer-item')).toHaveCount(23)
})
