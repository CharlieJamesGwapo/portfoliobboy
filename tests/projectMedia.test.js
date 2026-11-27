import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { resolve } from 'node:path'

test('the closed homepage archive keeps its navigation targets without mounting media', async () => {
  const server = await createServer({ configFile: resolve('vite.config.js'), server: { middlewareMode: true, hmr: false, ws: false } })
  try {
    const { default: ProjectCollection } = await server.ssrLoadModule('/src/components/ProjectCollection.jsx')
    const { default: Projects } = await server.ssrLoadModule('/src/components/Projects.jsx')
    const archive = renderToStaticMarkup(createElement(ProjectCollection))
    for (const id of ['projects', 'momentum-work', 'live-projects']) assert.ok(archive.includes(`id="${id}"`))
    assert.doesNotMatch(archive, /<img\b/)
    assert.match(renderToStaticMarkup(createElement(Projects)), /<img\b[^>]+src="\/projects\//)
  } finally {
    await server.close()
  }
})
