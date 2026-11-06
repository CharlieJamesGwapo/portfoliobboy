// Guards against the 2026-10-30 supply-chain injection coming back.
//
// That commit (pushed with stolen credentials) added a hidden VS Code task that
// ran on folder open, an obfuscated loader disguised as a font file, an `init`
// script wired into `npm run dev`/`build`, code hidden after long runs of
// whitespace, and removed `.env*` and `.vscode/*` from .gitignore. Each check
// below fails the test suite if any of those signatures reappears.
import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean)
const BINARY = /\.(png|jpe?g|webp|gif|avif|ico|mp3|m4a|wav|ogg|pdf|woff2?|ttf|eot|zip)$/i
const textFiles = tracked.filter((path) => !BINARY.test(path) && path !== 'package-lock.json' && existsSync(path))

test('no editor tasks or settings that can run code on folder open are tracked', () => {
  const editorFiles = tracked.filter((path) => /(^|\/)\.vscode\//.test(path) && !path.endsWith('.vscode/extensions.json'))
  assert.deepEqual(editorFiles, [])
  for (const path of textFiles.filter((p) => /tasks\.json$/.test(p))) {
    assert.doesNotMatch(readFileSync(path, 'utf8'), /folderOpen/, `${path} runs a task on folder open`)
  }
})

test('no disguised loaders or root init scripts are tracked', () => {
  assert.deepEqual(tracked.filter((path) => /\.orc$/i.test(path) || path === 'init' || path === 'init.js'), [])
})

test('package scripts have no install hooks and run only known local code', () => {
  const { scripts = {} } = JSON.parse(readFileSync('package.json', 'utf8'))
  for (const hook of ['preinstall', 'install', 'postinstall', 'prepare', 'prepack', 'postpack']) {
    assert.equal(scripts[hook], undefined, `unexpected "${hook}" lifecycle script`)
  }
  for (const [name, command] of Object.entries(scripts)) {
    assert.doesNotMatch(command, /\bnode\s+(\.\/)?init\b|\.orc\b|curl\s|wget\s|\|\s*(ba)?sh\b/, `suspicious "${name}" script: ${command}`)
    for (const [, file] of command.matchAll(/\bnode\s+([^\s&|;]+)/g)) {
      assert.match(file, /^(scripts\/|--)/, `"${name}" runs node on ${file}, outside scripts/`)
    }
  }
})

test('no code is hidden after long runs of whitespace', () => {
  const hidden = textFiles.filter((path) => /[ \t]{200,}\S/.test(readFileSync(path, 'utf8')))
  assert.deepEqual(hidden, [])
})

test('.gitignore keeps secrets and editor task files out of the repository', () => {
  const ignore = readFileSync('.gitignore', 'utf8').split('\n').map((line) => line.trim())
  assert.ok(ignore.includes('.env*'), '.env* must be ignored')
  assert.ok(ignore.includes('.vscode/*'), '.vscode/* must be ignored')
  const envFiles = tracked.filter((path) => /(^|\/)\.env(\.|$)/.test(path) && !path.endsWith('.env.example'))
  assert.deepEqual(envFiles, [])
})
