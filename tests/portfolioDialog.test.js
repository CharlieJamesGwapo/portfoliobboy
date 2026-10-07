import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { acquireBodyScrollLock } from '../src/lib/overlayScrollLock.js'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

test('PortfolioDialog renders a labelled native dialog with a visible close control', async () => {
  const vite = await createServer({
    root: repositoryRoot,
    appType: 'custom',
    logLevel: 'error',
  })

  try {
    const { default: PortfolioDialog } = await vite.ssrLoadModule('/src/components/PortfolioDialog.jsx')
    const markup = renderToStaticMarkup(
      React.createElement(
        PortfolioDialog,
        { open: true, title: 'Building with the Claude API', onClose: () => {} },
        React.createElement('p', null, 'Details for this record.'),
      ),
    )

    assert.match(markup, /<dialog[^>]*aria-labelledby="[^"]+"/)
    assert.match(markup, /aria-modal="true"/)
    assert.match(markup, /<h2[^>]*id="[^"]+">Building with the Claude API<\/h2>/)
    assert.match(markup, /<button[^>]*aria-label="Close details"[^>]*>Close details<\/button>/)
    assert.match(markup, /Details for this record\./)
  } finally {
    await vite.close()
  }
})

test('body scroll ownership is reference-counted and stale cleanup keeps another overlay locked', () => {
  const previousDocument = globalThis.document
  const body = { style: { overflow: 'scroll' } }
  globalThis.document = { body }

  try {
    const releaseDialog = acquireBodyScrollLock('portfolio-detail')
    const releasePalette = acquireBodyScrollLock('command-palette')

    assert.equal(body.style.overflow, 'hidden')
    releaseDialog()
    assert.equal(body.style.overflow, 'hidden')
    releaseDialog()
    assert.equal(body.style.overflow, 'hidden')

    releasePalette()
    assert.equal(body.style.overflow, 'scroll')
  } finally {
    globalThis.document = previousDocument
  }
})
