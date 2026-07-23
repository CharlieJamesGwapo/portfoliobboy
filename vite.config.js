import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const verifiedAssets = [
  {
    route: '/charlie-james-abejo-resume.pdf',
    source: resolve(process.cwd(), 'CHARLIE_JAMES_ABEJO_RESUME (1).pdf'),
    contentType: 'application/pdf',
    contentDisposition: 'inline; filename="charlie-james-abejo-resume.pdf"',
  },
  { route: '/certificates/claude-101.jpg', source: resolve(process.cwd(), 'Claude 101.jpg'), contentType: 'image/jpeg' },
  { route: '/certificates/claude-anthropic-api.jpg', source: resolve(process.cwd(), 'Claude with the Anthropic API.jpg'), contentType: 'image/jpeg' },
  { route: '/certificates/introduction-model-context-protocol.jpg', source: resolve(process.cwd(), 'Introduction to ModelContextProtocol.jpg'), contentType: 'image/jpeg' },
  { route: '/certificates/teaching-ai-fluency-framework.jpg', source: resolve(process.cwd(), 'Teaching the Al FluencyFramework.jpg'), contentType: 'image/jpeg' },
  { route: '/certificates/ai-fluency-framework-foundations.jpg', source: resolve(process.cwd(), 'Al Fluency Framework & Foundations.jpg'), contentType: 'image/jpeg' },
]

function verifiedAssetPlugin() {
  let isBuild = false
  const serveResume = (request, response, next) => {
    const route = decodeURIComponent(request.url?.split('?')[0] || '')
    const asset = verifiedAssets.find((item) => item.route === route)
    if (!asset) {
      next()
      return
    }

    response.statusCode = 200
    response.setHeader('Content-Type', asset.contentType)
    if (asset.contentDisposition) response.setHeader('Content-Disposition', asset.contentDisposition)
    response.end(readFileSync(asset.source))
  }

  return {
    name: 'verified-portfolio-assets',
    configResolved(config) {
      isBuild = config.command === 'build'
    },
    configureServer(server) {
      server.middlewares.use(serveResume)
    },
    configurePreviewServer(server) {
      server.middlewares.use(serveResume)
    },
    buildStart() {
      if (!isBuild) return
      verifiedAssets.forEach((asset) => {
        this.emitFile({
          type: 'asset',
          fileName: asset.route.slice(1),
          source: readFileSync(asset.source),
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), verifiedAssetPlugin()],
})
