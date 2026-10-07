import { build } from 'vite'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join, resolve } from 'node:path'

const normalizeId = (value) => String(value).replaceAll('\\', '/')

// These patterns are applied to Rollup's emitted module IDs, not chunk names.
// A hashed shared chunk therefore cannot hide an Arcade/game/Three/R3F module.
export const forbiddenModuleRules = [
  { name: 'arcade-lobby', test: /(?:^|\/)ArcadeLobby\.(?:jsx?|tsx?)$/i },
  { name: 'game-module', test: /(?:^|\/)components\/game\//i },
  { name: 'game-data', test: /(?:^|\/)gameData\.(?:jsx?|tsx?)$/i },
  { name: 'three', test: /(?:^|\/)node_modules\/three\//i },
  // Do not misclassify a nested dependency such as
  // @react-three/fiber/node_modules/scheduler as the R3F package itself.
  { name: 'react-three-fiber', test: /(?:^|\/)node_modules\/@react-three\/[^/]+(?:\/(?!node_modules\/).*)?$/i },
  // The assistant plan keeps only a small launcher eligible for the initial
  // graph. Panel/client/endpoint implementation modules are lazy, so classify
  // their Rollup module IDs even when Rollup places them in an arbitrary
  // shared chunk. These basename rules intentionally do not match
  // AssistantLauncher.jsx.
  { name: 'assistant-panel', test: /(?:^|\/)(?:PortfolioAssistant|AssistantPanel)\.(?:jsx?|tsx?|mjs|cjs)(?:[?#].*)?$/i },
  { name: 'assistant-client', test: /(?:^|\/)(?:portfolioChatClient|PortfolioAssistantClient|AssistantClient)\.(?:jsx?|tsx?|mjs|cjs)(?:[?#].*)?$/i },
  { name: 'assistant-endpoint', test: /(?:^|\/)(?:portfolio-chat|PortfolioAssistantEndpoint|AssistantEndpoint)\.(?:jsx?|tsx?|mjs|cjs)(?:[?#].*)?$/i },
  { name: 'assistant-server', test: /(?:^|\/)(?:portfolioChatHandler|portfolioGateway)\.(?:jsx?|tsx?|mjs|cjs)(?:[?#].*)?$/i },
  { name: 'assistant-sdk', test: /(?:^|\/)node_modules\/(?:ai|@ai-sdk\/[^/]+)(?:\/|$)/i },
  { name: 'assistant', test: /(?:^|\/)(?:assistant|portfolio-chat)(?:[./\/]|$)/i },
]

const cleanAssetPath = (value) => normalizeId(value).replace(/^\/?/, '')

const htmlLinks = (html, relation) => {
  const links = []
  const pattern = new RegExp(`<link\\b[^>]*\\brel=["']${relation}["'][^>]*\\bhref=["']([^"']+)["'][^>]*>`, 'gi')
  for (const match of html.matchAll(pattern)) links.push(cleanAssetPath(match[1]))
  return links
}

const htmlModuleScripts = (html) => {
  const scripts = []
  const pattern = /<script\b[^>]*\btype=["']module["'][^>]*\bsrc=["']([^"']+)["'][^>]*>/gi
  for (const match of html.matchAll(pattern)) scripts.push(cleanAssetPath(match[1]))
  return scripts
}

export function readHtmlEntryGraph(html) {
  const source = String(html)
  return {
    modulepreload: htmlLinks(source, 'modulepreload'),
    moduleScripts: htmlModuleScripts(source),
  }
}

export function collectRollupGraph(bundle) {
  const htmlAsset = Object.values(bundle).find((item) => item.type === 'asset' && item.fileName === 'index.html')
  if (!htmlAsset) throw new Error('Production bundle did not emit index.html')

  const chunks = Object.values(bundle)
    .filter((item) => item.type === 'chunk')
    .map((chunk) => ({
      fileName: normalizeId(chunk.fileName),
      isEntry: Boolean(chunk.isEntry),
      isDynamicEntry: Boolean(chunk.isDynamicEntry),
      imports: chunk.imports.map(normalizeId),
      dynamicImports: chunk.dynamicImports.map(normalizeId),
      // Rollup module IDs are the source-of-truth for classification. The
      // emitted filename is intentionally kept separately because it is often
      // an arbitrary content hash or a shared chunk name.
      modules: Object.keys(chunk.modules).map(normalizeId).sort(),
    }))

  return {
    html: readHtmlEntryGraph(htmlAsset.source),
    chunks,
  }
}

const chunkFile = (fileName) => cleanAssetPath(fileName)

function expandChunkFiles(graph, roots, includeDynamicImports = false) {
  const byFile = new Map(graph.chunks.map((chunk) => [chunkFile(chunk.fileName), chunk]))
  const visited = new Set()
  const queue = roots.map(chunkFile)

  while (queue.length > 0) {
    const fileName = queue.shift()
    if (visited.has(fileName)) continue
    visited.add(fileName)
    const chunk = byFile.get(fileName)
    if (!chunk) continue
    for (const imported of chunk.imports) queue.push(chunkFile(imported))
    if (includeDynamicImports) {
      for (const imported of chunk.dynamicImports) queue.push(chunkFile(imported))
    }
  }

  return { byFile, visited }
}

function moduleMatchesForbiddenRule(moduleId) {
  return forbiddenModuleRules
    .filter((rule) => rule.test.test(normalizeId(moduleId)))
    .map((rule) => rule.name)
}

export function classifyProductionGraph(graph) {
  const initialRoots = [...graph.html.modulepreload, ...graph.html.moduleScripts]
  const initial = expandChunkFiles(graph, initialRoots)
  const initialChunks = [...initial.visited]
    .map((fileName) => initial.byFile.get(fileName))
    .filter(Boolean)
  const initialModules = initialChunks.flatMap((chunk) => chunk.modules.map((moduleId) => ({
    moduleId,
    chunk: chunk.fileName,
    rules: moduleMatchesForbiddenRule(moduleId),
  })))
  const violations = initialModules.filter((item) => item.rules.length > 0)

  const dynamicRoots = initialChunks.flatMap((chunk) => chunk.dynamicImports)
  const dynamic = expandChunkFiles(graph, dynamicRoots, true)
  const dynamicChunks = [...dynamic.visited]
    .map((fileName) => dynamic.byFile.get(fileName))
    .filter(Boolean)
  const dynamicModules = dynamicChunks.flatMap((chunk) => chunk.modules.map((moduleId) => ({
    moduleId,
    chunk: chunk.fileName,
  })))
  const heroDynamicModules = dynamicModules.filter((item) => /(?:^|\/)heroWebgl\.(?:jsx?|tsx?)$/i.test(item.moduleId))

  return {
    initialRoots,
    initialChunkFiles: [...initial.visited],
    initialModulepreload: graph.html.modulepreload,
    initialModules,
    violations,
    dynamicChunkFiles: [...dynamic.visited],
    heroDynamicModules,
  }
}

export function assertProductionGraphSafe(graph) {
  if (graph.html.modulepreload.length === 0) {
    throw new Error('Production index.html emitted no modulepreload links to inspect')
  }
  const result = classifyProductionGraph(graph)
  if (result.initialChunkFiles.length === 0) {
    throw new Error('Production entry graph resolved to no emitted chunks')
  }
  if (result.violations.length > 0) {
    throw new Error(`Forbidden module entered the initial production graph: ${JSON.stringify(result.violations)}`)
  }
  if (result.heroDynamicModules.length === 0) {
    throw new Error('Approved idle heroWebgl dynamic import was not present in the emitted graph')
  }
  return result
}

export async function buildProductionGraph({ root, outputRoot, sourceCommit = null }) {
  const projectRoot = resolve(root)
  const evidenceRoot = isAbsolute(outputRoot) ? outputRoot : resolve(projectRoot, outputRoot)
  const distRoot = join(evidenceRoot, 'dist')
  const graphPath = join(evidenceRoot, 'production-module-graph.json')
  if (existsSync(evidenceRoot)) {
    throw new Error(`Refusing to overwrite existing production proof directory: ${evidenceRoot}`)
  }
  mkdirSync(evidenceRoot, { recursive: true })

  let emittedGraph = null
  const metadataPlugin = {
    name: 'task7-production-module-graph',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      emittedGraph = collectRollupGraph(bundle)
      writeFileSync(graphPath, `${JSON.stringify({ sourceCommit, ...emittedGraph }, null, 2)}\n`)
    },
  }

  await build({
    root: projectRoot,
    configFile: resolve(projectRoot, 'vite.config.js'),
    plugins: [metadataPlugin],
    build: {
      outDir: distRoot,
      emptyOutDir: false,
    },
  })

  if (!emittedGraph) throw new Error('Production graph plugin did not observe the emitted bundle')
  const graph = JSON.parse(readFileSync(graphPath, 'utf8'))
  const proof = assertProductionGraphSafe(graph)
  const output = { graphPath, distRoot, graph, proof }
  writeFileSync(join(evidenceRoot, 'production-graph-proof.json'), `${JSON.stringify({
    sourceCommit,
    graphPath,
    distRoot,
    initialModulepreload: proof.initialModulepreload,
    initialChunkFiles: proof.initialChunkFiles,
    initialModuleCount: proof.initialModules.length,
    forbiddenInitialModules: proof.violations,
    dynamicChunkFiles: proof.dynamicChunkFiles,
    heroDynamicModules: proof.heroDynamicModules,
  }, null, 2)}\n`)
  return output
}
