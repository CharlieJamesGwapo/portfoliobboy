import test from 'node:test'
import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const renderApp = async () => {
  const server = await createServer({
    configFile: resolve(process.cwd(), 'vite.config.js'),
    server: { middlewareMode: true, hmr: false },
  })

  try {
    const { default: App } = await server.ssrLoadModule('/src/App.jsx')
    return renderToStaticMarkup(createElement(App)).replace(/\s+/g, ' ')
  } finally {
    await server.close()
  }
}

test('renders the product studio between the hero and the existing about section', async () => {
  const markup = await renderApp()
  const heroIndex = markup.indexOf('id="home"')
  const studioIndex = markup.indexOf('id="product-studio-preview"')
  const aboutIndex = markup.indexOf('id="about"')

  assert.ok(heroIndex >= 0, 'the existing hero remains in the document')
  assert.ok(studioIndex > heroIndex, 'the product studio follows the hero')
  assert.ok(aboutIndex > studioIndex, 'the existing about section follows the product studio')
})

test('publishes only the verified public actions in the product studio', async () => {
  const markup = await renderApp()
  const publicActions = [
    'https://play.google.com/store/apps/details?id=com.oneridebalingasag.app&hl=en',
    'https://landing-oneride.vercel.app/',
    'https://hasti.com.au/',
    'https://gymfactories.com/designer',
    'https://zalio.ai/',
    'https://g2possystem.vercel.app/landing',
    'https://reflecticss.vercel.app/',
    'https://study-pulse-ten.vercel.app/',
    'https://ecyclehub.vercel.app/',
  ]

  publicActions.forEach((url) => {
    const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replaceAll('&', '&amp;')
    assert.match(markup, new RegExp(escapedUrl))
  })
  assert.match(markup, /App preview · official store screenshots/i)
  assert.match(markup, /Systems view/i)
  assert.doesNotMatch(markup, /internal authenticated CRM demo/i)
})
