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

const sharedChunkFixture = (moduleId) => ({
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
      // The hash and filename intentionally contain no product/module name.
      // Classification must use Rollup's module IDs below.
      fileName: 'assets/shared-e5f6.js',
      imports: [],
      dynamicImports: [],
      modules: [moduleId],
    },
    {
      fileName: 'assets/hero-h7i8.js',
      imports: [],
      dynamicImports: [],
      modules: ['src/lib/heroWebgl.js'],
    },
  ],
})

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
  const fixture = sharedChunkFixture('src/components/ArcadeLobby.jsx')

  const result = classifyProductionGraph(fixture)
  assert.equal(result.violations.length, 1)
  assert.deepEqual(result.violations[0].rules, ['arcade-lobby'])
  assert.throws(() => assertProductionGraphSafe(fixture), /Forbidden module entered/)
})

const assistantIdentityFixtures = [
  ['planned portfolio panel', 'src/components/PortfolioAssistant.jsx', 'assistant-panel'],
  ['reviewed panel alias', 'src/components/AssistantPanel.jsx', 'assistant-panel'],
  ['planned portfolio client', 'src/lib/portfolioChatClient.js', 'assistant-client'],
  ['reviewed client alias', 'src/lib/AssistantClient.js', 'assistant-client'],
  ['planned portfolio endpoint', 'api/portfolio-chat.js', 'assistant-endpoint'],
  ['reviewed endpoint alias', 'api/AssistantEndpoint.js', 'assistant-endpoint'],
  ['planned server handler', 'server/portfolioChatHandler.js', 'assistant-server'],
  ['planned server gateway', 'server/portfolioGateway.js', 'assistant-server'],
  ['planned AI SDK package', 'node_modules/ai/index.js', 'assistant-sdk'],
  ['provider AI SDK package', 'node_modules/@ai-sdk/openai/index.js', 'assistant-sdk'],
]

for (const [label, moduleId, expectedRule] of assistantIdentityFixtures) {
  test(`hashed shared chunk rejects ${label} by module identity`, () => {
    const result = classifyProductionGraph(sharedChunkFixture(moduleId))
    assert.equal(result.violations.length, 1)
    assert.ok(
      result.violations[0].rules.includes(expectedRule),
      `${moduleId} was not classified by ${expectedRule}: ${JSON.stringify(result.violations)}`,
    )
    assert.throws(() => assertProductionGraphSafe(sharedChunkFixture(moduleId)), /Forbidden module entered/)
  })
}

test('hashed shared chunk permits the intentionally lightweight AssistantLauncher', () => {
  const fixture = sharedChunkFixture('src/components/AssistantLauncher.jsx')
  const result = classifyProductionGraph(fixture)
  assert.deepEqual(result.violations, [])
  assert.doesNotThrow(() => assertProductionGraphSafe(fixture))
})
