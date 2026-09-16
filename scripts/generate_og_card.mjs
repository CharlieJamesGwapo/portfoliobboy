import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const width = 1200
const height = 630
const ink = '#0b2528'
const paper = '#f3f0e9'
const mint = '#67e0c1'
const coral = '#ff9c77'
const output = join(process.cwd(), 'public', 'og-portfolio.png')
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'portfoliobboy-og-'))
const temporarySvg = join(temporaryDirectory, 'og-portfolio.svg')

const escapeXml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="1200" height="630" fill="${ink}"/>
  <path d="M72 118H360L430 188H816L888 116H1128" fill="none" stroke="${mint}" stroke-width="2"/>
  <path d="M72 118v58M1128 116v58" fill="none" stroke="${mint}" stroke-width="1" opacity="0.55"/>
  <circle cx="72" cy="118" r="7" fill="${coral}"/>
  <circle cx="1128" cy="116" r="7" fill="${mint}"/>
  <path d="M72 486H1128" fill="none" stroke="${paper}" stroke-width="1" opacity="0.24"/>
  <text x="72" y="170" fill="${mint}" font-family="Georgia, serif" font-size="28" font-weight="700" letter-spacing="4">CA</text>
  <text x="72" y="304" fill="${paper}" font-family="Georgia, serif" font-size="68" font-weight="700" letter-spacing="-2">${escapeXml('Charlie James Abejo')}</text>
  <text x="76" y="364" fill="${mint}" font-family="Arial, sans-serif" font-size="25" font-weight="700" letter-spacing="1">${escapeXml('Full-Stack Web & Mobile Developer')}</text>
  <text x="76" y="535" fill="${paper}" font-family="Arial, sans-serif" font-size="21" letter-spacing="0.5">${escapeXml('Misamis Oriental, Philippines · Remote')}</text>
  <text x="1128" y="535" fill="${coral}" font-family="Arial, sans-serif" font-size="17" font-weight="700" text-anchor="end" letter-spacing="2">PORTFOLIO / 2026</text>
</svg>`

try {
  writeFileSync(temporarySvg, svg)
  execFileSync('/usr/bin/sips', ['-s', 'format', 'png', temporarySvg, '--out', output], { stdio: 'inherit' })
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true })
}
