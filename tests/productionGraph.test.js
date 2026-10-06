import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { test } from 'node:test'
import { join, resolve } from 'node:path'
import {
  assertProductionGraphSafe,
  buildProductionGraph,
  classifyProductionGraph,
} from './helpers/productionGraph.mjs'

const root = resolve(import.meta.dirname, '..')
const defaultEvidenceRoot = join(
  root,
  '.superpowers/sdd/2026-10-06-portfolio-ux-upgrade/tmp',
  `task-7-production-proof-auto-${Date.now()}-${process.pid}`,
)

test('emitted production HTML/modulepreload graph excludes deferred modules by module identity', { timeout: 120_000 }, async () => {
  const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
  const outputRoot = process.env.TASK7_PRODUCTION_GRAPH_DIR || defaultEvidenceRoot
  const { graphPath, proof } = await buildProductionGraph({ root, outputRoot, sourceCommit })

  assert.ok(proof.initialModulepreload.length > 0, `expected modulepreload links in ${graphPath}`)
  assert.deepEqual(proof.violations, [])
  assert.ok(proof.heroDynamicModules.some(({ moduleId }) => /heroWebgl/i.test(moduleId)))

  console.log(`Task7 production graph proof: ${graphPath}`)
  console.log(`Task7 production initial chunks: ${proof.initialChunkFiles.join(', ')}`)
})

test('hashed shared chunk negative fixture catches a forbidden module in the initial graph', () => {
  const fixture = {
    html: {
      modulepreload: ['assets/runtime-a1b2.js'],
      moduleScripts: ['assets/index-c3d4.js'],
    },
    chunks: [
      {
        fileName: 'assets/index-c3d4.js',
        imports: ['assets/shared-e5f6.js'],
        dynamicImports: ['assets/hero-h7i8.js'],
        modules: ['src/main.jsx'],
      },
      {
        // The hash and filename contain no forbidden product name. The module
        // identity is still classified from Rollup metadata.
        fileName: 'assets/shared-e5f6.js',
        imports: [],
        dynamicImports: [],
        modules: ['src/components/ArcadeLobby.jsx'],
      },
      {
        fileName: 'assets/hero-h7i8.js',
        imports: [],
        dynamicImports: [],
        modules: ['src/lib/heroWebgl.js'],
      },
    ],
  }

  const result = classifyProductionGraph(fixture)
  assert.equal(result.violations.length, 1)
  assert.deepEqual(result.violations[0].rules, ['arcade-lobby'])
  assert.throws(() => assertProductionGraphSafe(fixture), /Forbidden module entered/)
})
