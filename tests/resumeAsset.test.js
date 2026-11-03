import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { resumeUrl } from '../src/data/portfolioData.js'

test('the stable resume route is backed by the October 2026 supplied resume', () => {
  const sourcePath = resolve(process.cwd(), 'ABEJO_CHARLIE_JAMES_RESUME.pdf')
  const digest = createHash('sha256').update(readFileSync(sourcePath)).digest('hex')

  assert.equal(resumeUrl, '/charlie-james-abejo-resume.pdf')
  assert.equal(digest, '88c2bfb3614bb42ccb309c3f556f44d5c53b35280c63ec092b24077a3e72d52e')
})
