import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { resumeUrl } from '../src/data/portfolioData.js'

test('the stable resume route is backed by the supplied PDF bytes', () => {
  const sourcePath = resolve(process.cwd(), 'ABEJO_CHARLIE_JAMES_RESUME.pdf')
  const digest = createHash('sha256').update(readFileSync(sourcePath)).digest('hex')

  assert.equal(resumeUrl, '/charlie-james-abejo-resume.pdf')
  assert.equal(digest, 'ffe82da88e664d43d931bcf7f96f620b3efb58cc32d9bd35c18dffc33f18ff60')
})
