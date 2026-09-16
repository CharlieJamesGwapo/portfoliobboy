import { createHash } from 'node:crypto'
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const canonicalPdfHash = 'ffe82da88e664d43d931bcf7f96f620b3efb58cc32d9bd35c18dffc33f18ff60'
const resumePath = '/charlie-james-abejo-resume.pdf'

const contactValues = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  subject: 'System review',
  message: 'I would like to discuss a production system.',
}

const contactFields = ['name', 'email', 'subject', 'message']

const settle = (page, ms = 450) => page.waitForTimeout(ms)

async function expectTargetBelowNavbar(page, hash) {
  const target = page.locator(hash)
  await expect(target).toBeVisible()
  const measurements = await page.evaluate((selector) => {
    const navbar = document.querySelector('.navbar')
    const element = document.querySelector(selector)
    const navBottom = navbar?.getBoundingClientRect().bottom ?? 0
    const targetTop = element?.getBoundingClientRect().top ?? Number.NaN
    return { navBottom, targetTop }
  }, hash)

  expect(measurements.targetTop, `${hash} landed above the fixed navbar`).toBeGreaterThanOrEqual(measurements.navBottom - 2)
  expect(measurements.targetTop - measurements.navBottom, `${hash} landed too far from the fixed navbar`).toBeLessThanOrEqual(140)
}

async function openArchive(page) {
  const details = page.locator('.additional-work-disclosure')
  if (!(await details.evaluate((element) => element.open))) {
    await details.locator('summary').click()
  }
  await expect.poll(() => details.evaluate((element) => element.open)).toBe(true)
  return details
}

async function fillContact(page) {
  for (const [field, value] of Object.entries(contactValues)) {
    await page.locator(`#contact-${field}`).fill(value)
  }
}

async function expectNoSeriousAxeViolations(page) {
  const results = await new AxeBuilder({ page }).analyze()
  const blocking = results.violations.filter((item) => ['critical', 'serious'].includes(item.impact))
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
}

async function tabUntil(page, locator, limit = 120) {
  for (let index = 0; index < limit; index += 1) {
    if (await locator.evaluate((element) => element === document.activeElement)) return index
    await page.keyboard.press('Tab')
    const activeTag = await page.evaluate(() => document.activeElement?.tagName || '')
    expect(activeTag, `Tab ${index + 1} moved focus to the document body`).not.toBe('BODY')
  }
  throw new Error(`Could not reach ${await locator.getAttribute('aria-label') || await locator.textContent()}`)
}

test.describe('portfolio browser quality', () => {
  test('primary navigation and cold-load deep links land on headings', async ({ page }) => {
    await page.goto('/')

    const primaryNav = page.locator('.desktop-nav')
    await expect(primaryNav.locator('a')).toHaveCount(5)
    await expect(primaryNav.locator('a', { hasText: 'Work' })).toHaveAttribute('href', '#work')
    await expect(primaryNav.locator('a', { hasText: 'Experience' })).toHaveAttribute('href', '#experience')
    await expect(primaryNav.locator('a', { hasText: 'Capabilities' })).toHaveAttribute('href', '#capabilities')
    await expect(primaryNav.locator('a', { hasText: 'Credentials' })).toHaveAttribute('href', '#credentials')
    await expect(primaryNav.locator('a', { hasText: 'Contact' })).toHaveAttribute('href', '#contact')

    for (const hash of ['#work', '#experience', '#capabilities', '#credentials', '#contact', '#archive']) {
      const deepLinkPage = await page.context().newPage()
      await deepLinkPage.goto(`/${hash}`)
      await settle(deepLinkPage)
      await expectTargetBelowNavbar(deepLinkPage, hash)
      await deepLinkPage.close()
    }
  })

  test('mobile menu traps focus, closes on Escape, and restores the toggle', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    const toggle = page.locator('.menu-toggle')
    const menu = page.locator('#mobile-navigation')
    const menuLinks = menu.getByRole('link')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await page.waitForTimeout(120)
    await expect(menuLinks.first()).toBeFocused()
    await expect(menuLinks).toHaveCount(6)

    for (let index = 1; index < 6; index += 1) {
      await page.keyboard.press('Tab')
      await expect(menuLinks.nth(index)).toBeFocused()
    }

    await page.keyboard.press('Tab')
    await expect(toggle).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle).toBeFocused()
  })

  test('archive opens from footer and direct hash', async ({ page }) => {
    await page.goto('/')
    const details = page.locator('.additional-work-disclosure')
    await expect(details).toBeVisible()
    await expect(details.locator('summary')).toHaveText('More: archive & lab')
    await page.getByRole('link', { name: 'More: archive & lab', exact: true }).click()
    await expect.poll(() => details.evaluate((element) => element.open)).toBe(true)
    await expect(page.getByRole('heading', { name: 'Additional project archive' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Interactive lab' })).toBeVisible()

    await page.goto('/#archive')
    await settle(page)
    await expect.poll(() => details.evaluate((element) => element.open)).toBe(true)
    await expect(page.getByRole('heading', { name: 'Additional project archive' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Interactive lab' })).toBeVisible()
  })

  test('lab code loads only after the explicit launch', async ({ page }) => {
    const requests = []
    page.on('request', (request) => requests.push(request.url()))
    await page.goto('/')
    await settle(page)

    const labRequestPattern = /(?:InteractiveLab|ArcadeLobby|three-vendor|r3f-vendor|supabase|MusicPlayer|youtube|googlevideo|\.(?:mp3|wav)(?:\?|$))/i
    expect(requests.some((url) => labRequestPattern.test(url))).toBe(false)

    await openArchive(page)
    const launch = page.getByRole('button', { name: 'Launch the lab' })
    const labRequest = page.waitForRequest(/\/assets\/(?:InteractiveLab|ArcadeLobby)-/i)
    await launch.click()
    const request = await labRequest
    expect(request.url()).toMatch(/\/assets\/(?:InteractiveLab|ArcadeLobby)-/i)
    await expect(page.getByRole('button', { name: 'Exit arcade and return to portfolio' })).toBeVisible({ timeout: 15_000 })
  })

  test('contact failure preserves entries and direct email', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'temporary failure' }),
    }))
    await page.goto('/')
    await fillContact(page)
    await page.locator('#contact form').getByRole('button', { name: 'Send message' }).click()

    const status = page.locator('.form-status')
    await expect(status).toContainText('The form could not send right now')
    await expect(status).toHaveAttribute('role', 'status')
    await expect(page.locator('.contact-email')).toBeVisible()
    await expect(page.locator('.contact-email')).toHaveAttribute('href', 'mailto:capstonee2@gmail.com')
    for (const field of contactFields) {
      await expect(page.locator(`#contact-${field}`)).toHaveValue(contactValues[field])
    }
  })

  test('contact success announces and clears fields', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    }))
    await page.goto('/')
    await fillContact(page)
    await page.locator('#contact form').getByRole('button', { name: 'Send message' }).click()

    await expect(page.locator('.form-status')).toContainText('Thanks — your message is on its way')
    await expect(page.locator('.form-status')).toHaveAttribute('role', 'status')
    for (const field of contactFields) {
      await expect(page.locator(`#contact-${field}`)).toHaveValue('')
    }
  })

  test('canonical resume PDF is stable and linked consistently', async ({ page }) => {
    const response = await page.request.get(resumePath)
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('application/pdf')
    const digest = createHash('sha256').update(await response.body()).digest('hex')
    expect(digest).toBe(canonicalPdfHash)

    await page.goto('/')
    const heroResume = page.locator('.hero-actions a').filter({ hasText: 'View resume (PDF)' })
    await expect(heroResume).toHaveAttribute('href', resumePath)
    await expect(heroResume).toHaveAttribute('target', '_blank')
    await expect(page.locator('#contact .contact-socials a[download]')).toHaveAttribute('href', resumePath)
    await expect(page.locator('.resume-download')).toHaveAttribute('href', resumePath)
  })

  test('professional page stays within viewport at common widths', async ({ page }) => {
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/')
      await expect(page.locator('h1')).toBeVisible()
      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }))
      expect(dimensions.scrollWidth, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(dimensions.clientWidth)
    }
  })

  test('failed portrait keeps professional content available', async ({ page }) => {
    await page.route('**/profile.webp', (route) => route.abort())
    await page.route('**/profile.png', (route) => route.abort())
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('.hero-intro')).toBeVisible()
    await expect(page.locator('.availability-pill')).toBeVisible()
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)
  })

  test('failed lab import is retryable and preserves professional DOM', async ({ page }) => {
    await page.route('**/assets/InteractiveLab-*.js', (route) => route.abort())
    await page.goto('/')
    await openArchive(page)
    await page.getByRole('button', { name: 'Launch the lab' }).click()

    await expect(page.getByRole('alert').filter({ hasText: 'The interactive lab could not load' })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('button', { name: 'Retry lab' })).toBeVisible()
    await expect(page.locator('#work')).toBeAttached()
    await expect(page.locator('#experience')).toBeAttached()
    await expect(page.locator('#contact')).toBeAttached()
  })

  test('serious accessibility violations stay clear across disclosure states', async ({ page }) => {
    await page.goto('/')
    await expectNoSeriousAxeViolations(page)

    await page.setViewportSize({ width: 390, height: 844 })
    await page.reload()
    await page.getByRole('button', { name: 'Open navigation menu' }).click()
    await page.waitForTimeout(220)
    await expectNoSeriousAxeViolations(page)

    await page.goto('/')
    await openArchive(page)
    await settle(page)
    await expectNoSeriousAxeViolations(page)
    await expect(page.getByRole('button', { name: 'Launch the lab' })).toBeVisible()
    await expectNoSeriousAxeViolations(page)
  })

  test('keyboard-only traversal preserves focus order', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop nav order is the release keyboard baseline')
    await page.goto('/')

    const skipLink = page.getByRole('link', { name: 'Skip to content' })
    const main = page.locator('#main-content')
    await page.keyboard.press('Tab')
    await expect(skipLink).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(main).toBeFocused()

    await page.goto('/')
    await page.keyboard.press('Tab')
    await expect(skipLink).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.locator('.wordmark')).toBeFocused()

    const primaryNav = page.getByRole('navigation', { name: 'Primary navigation' })
    const navLinks = ['Work', 'Experience', 'Capabilities', 'Credentials', 'Contact']
    for (const label of navLinks) {
      await page.keyboard.press('Tab')
      await expect(primaryNav.getByRole('link', { name: label, exact: true })).toBeFocused()
    }

    await tabUntil(page, page.locator('#contact-name'))
    await expect(page.locator('#contact-name')).toBeFocused()
    await tabUntil(page, page.locator('.additional-work-disclosure > summary'))
    await expect(page.locator('.additional-work-disclosure > summary')).toBeFocused()
    await page.keyboard.press('Enter')
    await expect.poll(() => page.locator('.additional-work-disclosure').evaluate((element) => element.open)).toBe(true)
  })

  test('media preferences preserve content, focus, and optional controls', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    await page.keyboard.press('Tab')
    const reducedFocus = await page.evaluate(() => {
      const active = document.activeElement
      const style = active ? getComputedStyle(active) : null
      return { tag: active?.tagName, outline: style?.outlineStyle }
    })
    expect(reducedFocus.tag).toBe('A')
    expect(reducedFocus.outline).not.toBe('none')
    await openArchive(page)
    await expect(page.getByRole('button', { name: 'Launch the lab' })).toBeVisible()

    await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'active' })
    await page.reload()
    await expect(page.locator('h1')).toBeVisible()
    await page.keyboard.press('Tab')
    const forcedFocus = await page.evaluate(() => {
      const active = document.activeElement
      const style = active ? getComputedStyle(active) : null
      return { tag: active?.tagName, outline: style?.outlineStyle }
    })
    expect(forcedFocus.tag).toBe('A')
    expect(forcedFocus.outline).not.toBe('none')
    await openArchive(page)
    await expect(page.getByRole('button', { name: 'Launch the lab' })).toBeVisible()
  })

  test('delayed JavaScript does not show a fake loading shell', async ({ page }) => {
    await page.route('**/assets/index-*.js', async (route) => {
      await page.waitForTimeout(1500)
      await route.continue()
    })
    const navigation = page.goto('/')
    await page.waitForTimeout(300)
    const interim = await page.evaluate(() => ({
      rootChildren: document.getElementById('root')?.children.length ?? 0,
      rootText: document.getElementById('root')?.textContent ?? '',
      overlays: document.querySelectorAll('[role="dialog"], [role="progressbar"], .splash, .loading-screen').length,
    }))
    expect(interim.rootChildren).toBe(0)
    expect(interim.rootText).toBe('')
    expect(interim.overlays).toBe(0)
    await navigation
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('#work')).toBeVisible()
    await expect(page.locator('#experience')).toBeVisible()
    await expect(page.locator('#contact')).toBeVisible()
  })

  test('CSS-disabled DOM retains semantic source order', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    await page.evaluate(() => {
      document.querySelectorAll('style, link[rel~="stylesheet"]').forEach((style) => {
        style.disabled = true
      })
    })

    const structure = await page.evaluate(() => {
      const sequence = Array.from(document.querySelectorAll('h1, h2, h3, p, a, ul, ol, label')).map((element) => element.textContent.trim())
      const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map((element) => element.textContent.trim())
      const paragraphs = Array.from(document.querySelectorAll('p')).map((element) => element.textContent.trim()).filter(Boolean)
      const links = Array.from(document.querySelectorAll('a')).map((element) => element.textContent.trim()).filter(Boolean)
      const lists = document.querySelectorAll('ul, ol').length
      const labels = Array.from(document.querySelectorAll('label')).map((element) => element.textContent.trim())
      const relationships = Array.from(document.querySelectorAll('.system-relationships li')).map((element) => element.textContent.trim())
      const labelled = Array.from(document.querySelectorAll('[aria-labelledby]')).map((element) => ({
        reference: element.getAttribute('aria-labelledby'),
        exists: Boolean(document.getElementById(element.getAttribute('aria-labelledby'))),
      }))
      const sectionIds = Array.from(document.querySelectorAll('main > section')).map((element) => element.id)
      return { sequence, headings, paragraphs, links, lists, labels, relationships, labelled, sectionIds }
    })

    expect(structure.headings[0]).toContain('Full-stack product engineer')
    expect(structure.headings.findIndex((heading) => heading.includes('Systems designed around real operational pressure'))).toBeGreaterThan(0)
    expect(structure.paragraphs.some((paragraph) => paragraph.includes('CRM integrations'))).toBe(true)
    expect(structure.links).toContain('View selected work')
    expect(structure.links).toContain('Download resume (PDF, approximately 505 KB)')
    expect(structure.lists).toBeGreaterThan(0)
    expect(structure.labels).toEqual(expect.arrayContaining(['Name', 'Email', 'Subject', 'Message']))
    expect(structure.relationships.length).toBeGreaterThan(0)
    expect(structure.labelled.every((item) => item.exists)).toBe(true)
    expect(structure.sectionIds).toEqual(['home', 'work', 'experience', 'capabilities', 'credentials', 'contact', 'archive'])
    expect(structure.sequence.findIndex((entry) => entry.includes('Full-stack product engineer'))).toBeLessThan(structure.sequence.findIndex((entry) => entry.includes('Systems designed around real operational pressure')))
  })

  test('captures mobile, tablet, and desktop release screenshots', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Screenshots are generated once by the desktop project')
    for (const [name, width, height] of [
      ['mobile-390', 390, 844],
      ['tablet-768', 768, 1024],
      ['desktop-1440', 1440, 1000],
    ]) {
      await page.setViewportSize({ width, height })
      await page.goto('/')
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('.additional-work-disclosure')).not.toHaveAttribute('open')
      // Full-page capture does not scroll through the document, so make the
      // progressive-reveal content visible before inspecting the whole page.
      await page.evaluate(() => document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible')))
      await page.evaluate(() => document.fonts?.ready)
      await page.screenshot({ path: `artifacts/qa/${name}.png`, fullPage: true, animations: 'disabled' })
    }
  })
})
