import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, lstatSync, mkdirSync, readFileSync, readlinkSync, symlinkSync, writeFileSync } from 'node:fs'
import { isAbsolute, join, relative, resolve } from 'node:path'

const hashBytes = (bytes) => createHash('sha256').update(bytes).digest('hex')

function hashPath(filePath) {
  const stat = lstatSync(filePath)
  if (stat.isSymbolicLink()) return hashBytes(Buffer.from(readlinkSync(filePath)))
  return hashBytes(readFileSync(filePath))
}

function gitOutput(sourceRoot, args) {
  return execFileSync('git', args, {
    cwd: sourceRoot,
    encoding: 'buffer',
    maxBuffer: 512 * 1024 * 1024,
  })
}

function commitBytes(sourceRoot, sourceCommit, relativePath) {
  return gitOutput(sourceRoot, ['show', `${sourceCommit}:${relativePath}`])
}

export function isApplicationInput(relativePath) {
  if (/^(?:src|public|api|server)\//.test(relativePath)) return true
  if (/^(?:index\.html|package(?:-lock)?\.json|vite\.config\.js|tailwind\.config\.js|postcss\.config\.js|vercel\.json)$/.test(relativePath)) return true
  // Root-level verified assets are read by vite.config.js and are part of the
  // production build input even though they are not under public/.
  if (!relativePath.includes('/') && /\.(?:pdf|png|jpe?g|webp|woff2)$/i.test(relativePath)) return true
  return false
}

function trackedTree(sourceRoot, sourceCommit) {
  const output = gitOutput(sourceRoot, ['ls-tree', '-r', '-z', sourceCommit]).toString('utf8')
  return output.split('\0').filter(Boolean).map((entry) => {
    const [metadata, relativePath] = entry.split('\t')
    const [mode, type, object] = metadata.split(' ')
    return { mode, type, object, relativePath }
  })
}

export function createHashManifest({ sourceRoot, copyRoot, sourceCommit }) {
  const tracked = trackedTree(sourceRoot, sourceCommit)
  const applicationInputs = tracked
    .filter(({ type, relativePath }) => type === 'blob' && isApplicationInput(relativePath))
    .map(({ mode, object, relativePath }) => {
      const sourcePath = resolve(sourceRoot, relativePath)
      const copyPath = resolve(copyRoot, relativePath)
      const commitSha256 = hashBytes(commitBytes(sourceRoot, sourceCommit, relativePath))
      const sourceSha256 = hashPath(sourcePath)
      const copySha256 = hashPath(copyPath)
      return {
        mode,
        object,
        path: relativePath,
        commitSha256,
        sourceSha256,
        copySha256,
        matchesCommit: commitSha256 === copySha256,
        sourceMatchesCommit: sourceSha256 === commitSha256,
      }
    })

  return {
    sourceCommit,
    sourceRoot: resolve(sourceRoot),
    copyRoot: resolve(copyRoot),
    relativeCopyPath: relative(resolve(sourceRoot), resolve(copyRoot)),
    archiveCommand: `git archive --format=tar ${sourceCommit} | tar -xf - -C ${resolve(copyRoot)}`,
    trackedFileCount: tracked.length,
    applicationInputCount: applicationInputs.length,
    applicationInputs,
    allCopyInputsMatchCommit: applicationInputs.every((item) => item.matchesCommit),
    allSourceInputsMatchCommit: applicationInputs.every((item) => item.sourceMatchesCommit),
  }
}

export function constructTrackedCopy({ sourceRoot, copyRoot, sourceCommit, manifestPath, nodeModulesPath = null }) {
  const projectRoot = resolve(sourceRoot)
  const targetRoot = isAbsolute(copyRoot) ? copyRoot : resolve(projectRoot, copyRoot)
  if (existsSync(targetRoot)) {
    throw new Error(`Refusing to overwrite existing provenance copy: ${targetRoot}`)
  }
  mkdirSync(targetRoot, { recursive: true })
  const archive = gitOutput(projectRoot, ['archive', '--format=tar', sourceCommit])
  execFileSync('tar', ['-xf', '-', '-C', targetRoot], {
    input: archive,
    maxBuffer: 512 * 1024 * 1024,
  })
  let dependencyLink = null
  if (nodeModulesPath) {
    dependencyLink = resolve(nodeModulesPath)
    symlinkSync(dependencyLink, join(targetRoot, 'node_modules'), 'dir')
  }

  const manifest = createHashManifest({ sourceRoot: projectRoot, copyRoot: targetRoot, sourceCommit })
  if (!manifest.allCopyInputsMatchCommit || !manifest.allSourceInputsMatchCommit) {
    throw new Error(`Tracked-copy hash comparison failed: ${JSON.stringify(manifest, null, 2)}`)
  }
  const outputManifest = manifestPath
    ? (isAbsolute(manifestPath) ? manifestPath : resolve(projectRoot, manifestPath))
    : `${targetRoot}.provenance.json`
  mkdirSync(resolve(outputManifest, '..'), { recursive: true })
  writeFileSync(outputManifest, `${JSON.stringify({ ...manifest, dependencyLink, manifestPath: outputManifest }, null, 2)}\n`)
  return { ...manifest, dependencyLink, manifestPath: outputManifest }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  const args = new Map()
  for (let index = 2; index < process.argv.length; index += 1) {
    const value = process.argv[index]
    if (!value.startsWith('--')) continue
    args.set(value.slice(2), process.argv[index + 1])
    index += 1
  }
  const sourceRoot = resolve(args.get('source') || process.cwd())
  const sourceCommit = args.get('commit') || execFileSync('git', ['rev-parse', 'HEAD'], { cwd: sourceRoot, encoding: 'utf8' }).trim()
  const copyRoot = args.get('copy-root')
  if (!copyRoot) throw new Error('Usage: node task7-source-provenance.mjs --copy-root <fresh-path> [--source <root>] [--commit <sha>]')
  const result = constructTrackedCopy({
    sourceRoot,
    copyRoot,
    sourceCommit,
    manifestPath: args.get('manifest'),
    nodeModulesPath: args.get('node-modules'),
  })
  console.log(JSON.stringify(result, null, 2))
}
