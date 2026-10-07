import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import * as current from '../src/data/portfolioData.js'

const source = execFileSync('git', ['show', 'edbcbc2f0d84b170b74ef70db4ef9870d1daf16f:src/data/portfolioData.js'], { encoding: 'utf8' })
const baseline = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)

test('original data exports remain unchanged', () => {
  for (const [name, value] of Object.entries(baseline)) assert.deepEqual(current[name], value, name)
})
