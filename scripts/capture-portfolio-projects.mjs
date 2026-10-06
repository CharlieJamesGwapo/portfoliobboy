import { mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const projects = [
  ['hasti', 'https://hasti.com.au/'],
  ['zalio', 'https://zalio.ai/'],
  ['gymfactories', 'https://gymfactories.com/'],
  ['momentum-strength', 'https://momentum-strength.vercel.app/'],
  ['hsie', 'https://health-dev-three.vercel.app/'],
]

await mkdir('public/projects', { recursive: true })
const browser = await chromium.launch({ headless: true })
try {
  for (const [name, url] of projects) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 })
      if (!response?.ok()) throw new Error(`Unexpected HTTP status: ${response?.status()}`)
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(2500)
      if (name === 'hasti') {
        await page.locator('#ai-callback-open').click()
        await page.getByRole('heading', { name: /Get a call from Alex/ }).waitFor({ state: 'visible' })
      }
      await page.screenshot({ path: `public/projects/${name}.png`, fullPage: false })
      console.log(`${name}: ${response.status()} — ${await page.title()}`)
    } finally {
      await page.close()
    }
  }
} finally {
  await browser.close()
}
