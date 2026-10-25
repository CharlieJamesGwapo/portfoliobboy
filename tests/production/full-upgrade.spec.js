import { test, expect } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const output = '/tmp/charlie-portfolio-preview/full-upgrade'

test('static case-study documents provide distinct metadata before JavaScript', async ({ request }) => {
  const routes = [
    ['/projects/contextpilot', 'ContextPilot'],
    ['/projects/alex-hasti', 'Alex / Hasti'],
    ['/projects/oneride', 'One Ride'],
    ['/lab', 'Arcade'],
  ]
  const social = await request.get('/social-preview.jpg')
  expect(social.ok()).toBe(true)
  expect(social.headers()['content-type']).toContain('image/jpeg')
  for (const [path, title] of routes) {
    const response = await request.get(path)
    expect(response.ok()).toBe(true)
    const html = await response.text()
    expect(html).toMatch(new RegExp(`<title>[^<]*${title.replace('/', '\\/')}`))
    expect(html).toContain(`href="https://portfoliobboy.vercel.app${path}"`)
    expect(html).toContain('src="/theme-init.js"')
  }
})

test('cold case-study fragments scroll after lazy content is mounted', async ({ page }) => {
  await page.goto('/projects/contextpilot#case-study-outcome-title')
  const heading = page.locator('#case-study-outcome-title')
  await expect(heading).toBeVisible()
  await expect.poll(() => heading.evaluate(node => node.getBoundingClientRect().top)).toBeLessThan(210)
  await expect(heading).toBeFocused()
})

test('project navigation, command palette and dedicated lab retain their real content', async ({ page }) => {
  await page.goto('/projects/agentforge')
  await page.getByRole('link', { name: 'Explore my work', exact: true }).click()
  await expect(page).toHaveURL('/projects')
  await page.getByRole('searchbox', { name: 'Search projects' }).fill('ContextPilot')
  await expect(page.locator('#projects [role="tab"]')).toHaveCount(1)
  await page.keyboard.press('ControlOrMeta+k')
  await page.getByRole('combobox', { name: 'Search sections and actions' }).fill('EasyAppy')
  await page.getByRole('combobox', { name: 'Search sections and actions' }).press('Enter')
  await expect(page).toHaveURL('/projects/easyappy')
  await expect(page.getByRole('heading', { level: 1, name: 'EasyAppy' })).toBeVisible()
  await page.goto('/lab')
  await expect(page.locator('.lab-game-row')).toHaveCount(9)
  await page.getByRole('button', { name: 'Enter interactive lab', exact: true }).click()
  await expect(page.getByRole('dialog', { name: "Charlie's interactive game arcade" })).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Play', exact: true })).toHaveCount(9)
})

test('captures the real homepage, sections and case studies in both themes', async ({ page }) => {
  test.setTimeout(60_000)
  mkdirSync(output, { recursive: true })
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await expect(page.locator('.hero-identity img')).toBeVisible()
  await expect.poll(() => page.locator('.hero-identity img').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true)
  await page.screenshot({ path: `${output}/homepage-dark.png` })
  for (const [id, name] of [['product-studio-preview', 'featured-work'], ['ai-systems', 'ai-engineering'], ['experience', 'experience'], ['contact', 'contact']]) {
    const section = page.locator(`#${id}`)
    await section.scrollIntoViewIfNeeded()
    await expect(section).toBeVisible()
    await page.screenshot({ path: `${output}/${name}-dark.png` })
  }
  await page.getByRole('button', { name: 'Switch to light theme' }).click()
  await page.goto('/#home')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.screenshot({ path: `${output}/homepage-light.png` })
  await page.goto('/projects/alex-hasti')
  await expect(page.locator('.case-study-hero h1')).toBeVisible()
  await page.screenshot({ path: `${output}/case-study-light.png` })
  await page.locator('.case-study-architecture').scrollIntoViewIfNeeded()
  await page.screenshot({ path: `${output}/architecture-light.png` })
  for (const [width, name] of [[1280, 'laptop'], [768, 'tablet'], [430, 'mobile']]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await page.screenshot({ path: `${output}/homepage-${name}-light.png` })
  }
})

test('hero and project explorer text retain contrast in both themes', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  for (const theme of ['dark', 'light']) {
    if (await page.locator('html').getAttribute('data-theme') !== theme) await page.getByRole('button', { name: `Switch to ${theme} theme` }).click()
    const readContrast = async selector => page.locator(selector).evaluateAll(nodes => {
      const rgba = color => {
        const values = color.match(/[\d.]+/g)?.map(Number) || [0, 0, 0, 0]
        return values.length === 3 ? [...values, 1] : values
      }
      const luminance = values => values.slice(0, 3).map(value => {
        const v = value / 255
        return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4
      }).reduce((total, value, index) => total + value * [.2126, .7152, .0722][index], 0)
      return nodes.map(node => {
        const layers = []
        for (let element = node; element; element = element.parentElement) {
          const color = rgba(getComputedStyle(element).backgroundColor)
          layers.push(color)
          if (color[3] === 1) break
        }
        let background = [255, 255, 255]
        for (const color of layers.reverse()) background = background.map((value, index) => color[index] * color[3] + value * (1 - color[3]))
        const foreground = rgba(getComputedStyle(node).color)
        const lights = [luminance(background), luminance(foreground)].sort((a, b) => b - a)
        return { text: node.textContent.trim(), contrast: (lights[0] + .05) / (lights[1] + .05) }
      })
    })
    const heroRatios = await readContrast('.hero-project-copy h2, .hero-project-copy > p, .hero-project-details, .hero-project-copy-meta > span, #independent-products .product-media figcaption')
    for (const ratio of heroRatios) expect(ratio.contrast, `${theme}: ${ratio.text}`).toBeGreaterThanOrEqual(4.5)
    await page.goto('/projects')
    await expect(page.locator('.project-overview')).toBeVisible()
    const projectRatios = await readContrast('.route-page-heading .eyebrow, #projects .project-eyebrow, #projects .project-overview, #projects .project-story-grid > div > span, #projects .project-archive-heading p, #projects .project-links > span, #projects .project-links a, #projects .tag-list-dark span, #projects .product-media figcaption, #projects .product-media-thumbnails button')
    expect(projectRatios.length).toBeGreaterThan(10)
    for (const ratio of projectRatios) expect(ratio.contrast, `${theme} project: ${ratio.text}`).toBeGreaterThanOrEqual(4.5)
    await page.goto('/')
  }
})
