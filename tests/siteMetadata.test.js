import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path, encoding = 'utf8') => readFileSync(new URL(`../${path}`, import.meta.url), encoding)
const title = 'Charlie James Abejo | Full-Stack Web & Mobile Developer'
const description = 'Full-stack developer with 5+ years building production web, iOS, Android, CRM, API integration, and real-time systems. Based in the Philippines and available for remote work.'

test('publishes exact primary and social metadata', () => {
  const html = read('index.html')
  assert.match(html, /<title>Charlie James Abejo \| Full-Stack Web &amp; Mobile Developer<\/title>/)
  assert.match(html, new RegExp(description.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.match(html, /property="og:image" content="https:\/\/portfoliobboy\.vercel\.app\/og-portfolio\.png"/)
  assert.match(html, /"jobTitle": "Full-Stack Web & Mobile App Developer"/)
  assert.doesNotMatch(html, /AI Developer & Full-Stack Engineer/)
})

test('ships the editorial fonts and exact palette', () => {
  const css = read('src/index.css')
  assert.ok(read('public/fonts/newsreader-var-latin.woff2', null).length > 50_000)
  assert.match(css, /font-family: 'Newsreader'/)
  for (const token of ['#0b2528', '#123438', '#f3f0e9', '#e8e3da', '#fffdfa', '#67e0c1', '#0f806d', '#ff9c77', '#56696a', '#a9b9b8']) {
    assert.match(css, new RegExp(token))
  }
})

test('ships a 1200 by 630 PNG social card', () => {
  const png = read('public/og-portfolio.png', null)
  assert.equal(png.subarray(1, 4).toString(), 'PNG')
  assert.equal(png.readUInt32BE(16), 1200)
  assert.equal(png.readUInt32BE(20), 630)
})
