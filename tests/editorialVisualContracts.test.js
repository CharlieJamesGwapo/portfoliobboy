import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path, encoding = 'utf8') => readFileSync(new URL(`../${path}`, import.meta.url), encoding)
const css = () => read('src/index.css')
const rule = (selector) => new RegExp(`${selector}\\s*\\{[\\s\\S]*?\\}`)

const luminance = (hex) => {
  const channels = [0, 2, 4]
    .map((offset) => parseInt(hex.slice(1 + offset, 3 + offset), 16) / 255)
    .map((channel) => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

const contrast = (foreground, background) => {
  const foregroundLuminance = luminance(foreground)
  const backgroundLuminance = luminance(background)
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
}

test('styles every mounted accessibility utility and preserves a real input focus outline', () => {
  const source = css()

  assert.match(source, rule('\\.skip-link'))
  assert.match(source, /\.skip-link\s*\{[\s\S]*?transform: translateY\(-150%\)/)
  assert.match(source, /\.skip-link:focus-visible\s*\{[\s\S]*?transform: translateY\(0\)/)
  assert.match(source, /\.scroll-progress\s*\{[\s\S]*?transform: scaleX\(0\)[\s\S]*?transform-origin: left center/)
  assert.match(source, /:focus-visible\s*\{[\s\S]*?outline: 3px solid var\(--ink\)/)
  assert.match(source, /:focus-visible\s*\{[\s\S]*?box-shadow: 0 0 0 6px var\(--coral\)/)
  assert.match(source, /\.contact-form input:focus-visible,[\s\S]*?\.contact-form textarea:focus-visible\s*\{[\s\S]*?outline: 3px solid var\(--ink\)/)

  for (const background of ['#0b2528', '#123438', '#f3f0e9', '#fffdfa', '#67e0c1']) {
    const ringContrast = Math.max(contrast('#0b2528', background), contrast('#ff9c77', background))
    assert.ok(ringContrast >= 3, `one focus-ring layer must contrast with ${background}`)
  }
})

test('keeps the editorial grid and readable narrative contract', () => {
  const source = css()

  assert.match(source, /\.hero-copy\s*\{[\s\S]*?grid-column: span 7/)
  assert.match(source, /\.hero-visual\s*\{[\s\S]*?grid-column: 8 \/ -1/)
  assert.match(source, /\.case-study-section p,[\s\S]*?\.case-study-section li\s*\{[\s\S]*?font-size: 1rem[\s\S]*?line-height: 1\.7[0-9]?/)
  assert.match(source, /\.experience-summary\s*\{[\s\S]*?font-size: 1rem[\s\S]*?line-height: 1\.7[0-9]?/)
  assert.match(source, /\.experience-record-body li\s*\{[\s\S]*?font-size: 1rem[\s\S]*?line-height: 1\.7[0-9]?/)
  assert.match(source, /@media \(max-width: 640px\)[\s\S]*?\.hero-intro\s*\{[\s\S]*?font-size: 1rem/)
  assert.match(source, /@media \(max-width: 640px\)[\s\S]*?\.experience-summary\s*\{[\s\S]*?font-size: 1rem/)
  assert.match(source, /\.project-eyebrow\s*\{[\s\S]*?text-transform: uppercase/)
  assert.doesNotMatch(read('src/components/Hero.jsx'), /hero-enter/)
})

test('keeps interaction transitions in the restrained range', () => {
  const source = css()

  assert.match(source, /\.button\s*\{[\s\S]*?transition:[\s\S]*?180ms/)
  assert.match(source, /\.back-to-top\s*\{[\s\S]*?transition: opacity 180ms ease, transform 180ms ease/)
})
