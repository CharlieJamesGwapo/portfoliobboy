import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { test } from 'node:test'
import { resolve } from 'node:path'
import { createHashManifest, isApplicationInput } from './helpers/task7-source-provenance.mjs'

const root = resolve(import.meta.dirname, '..')

test('source provenance selects and hashes committed application/build inputs', () => {
  const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
  const manifest = createHashManifest({ sourceRoot: root, copyRoot: root, sourceCommit })

  assert.ok(manifest.applicationInputCount > 0)
  assert.equal(manifest.allSourceInputsMatchCommit, true)
  assert.equal(isApplicationInput('src/App.jsx'), true)
  assert.equal(isApplicationInput('public/certificates/claude-anthropic-api.webp'), true)
  assert.equal(isApplicationInput('server/portfolioKnowledge.js'), true)
  assert.equal(isApplicationInput('server/portfolioChatPolicy.js'), true)
  assert.equal(isApplicationInput('docs/portfolio-ux-verification.md'), false)
  assert.equal(isApplicationInput('tests/e2e/portfolio-stage-a.spec.js'), false)
})
