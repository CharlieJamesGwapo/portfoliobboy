import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { resumeUrl } from '../src/data/portfolioData.js'

test('the stable resume route is backed by the corrected PDF bytes', () => {
  const sourcePath = resolve(process.cwd(), 'ABEJO_CHARLIE_JAMES_RESUME.pdf')
  const digest = createHash('sha256').update(readFileSync(sourcePath)).digest('hex')

  assert.equal(resumeUrl, '/charlie-james-abejo-resume.pdf')
  assert.equal(digest, 'f4e3947a8121b57eb199b96d339530a51524b85957b5806374dadec837c29622')
})
