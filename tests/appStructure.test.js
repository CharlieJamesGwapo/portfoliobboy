import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('App composes the professional narrative in the approved order', () => {
  const app = read('src/App.jsx')
  const components = ['<Hero', '<Projects', '<Experience', '<Skills', '<Education', '<Contact']
  const positions = components.map((component) => app.indexOf(component))
  assert.ok(positions.every((position) => position >= 0))
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b))
})

test('the primary shell excludes retired and heavy features', () => {
  const app = read('src/App.jsx')
  const hero = read('src/components/Hero.jsx')
  const projects = read('src/components/Projects.jsx')
  assert.doesNotMatch(app, /CommandPalette|MusicPlayer|UpdateBanner|InteractiveLab/)
  assert.doesNotMatch(hero, /RotatingTitle|AnimatedStat|Gamepad|HeroSystemsScene/)
  assert.doesNotMatch(projects, /useState|projectCategories|role="tab"|Product gallery|media pending/i)
})

test('case studies use the reusable semantic diagram', () => {
  const projects = read('src/components/Projects.jsx')
  const diagram = read('src/components/SystemDiagram.jsx')
  assert.match(projects, /caseStudies\.map/)
  assert.match(projects, /<SystemDiagram/)
  assert.match(diagram, /<ol/)
  assert.match(diagram, /aria-hidden="true"/)
  assert.match(diagram, /focusable="false"/)
})
