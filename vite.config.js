import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// The resume lives at the repo root with a name we don't want in the URL, so
// it is copied to a stable public route at build time. Certificate images are
// now pre-optimised WebP files in public/certificates/ and need no plugin.
const verifiedAssets = [
  {
    route: '/charlie-james-abejo-resume.pdf',
    source: resolve(process.cwd(), 'CHARLIE_JAMES_ABEJO_RESUME (1).pdf'),
    contentType: 'application/pdf',
    contentDisposition: 'inline; filename="charlie-james-abejo-resume.pdf"',
  },
]

function verifiedAssetPlugin() {
  let isBuild = false
  const serveAsset = (request, response, next) => {
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
      server.middlewares.use(serveAsset)
    },
    configurePreviewServer(server) {
      server.middlewares.use(serveAsset)
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
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    // Assets below this size are inlined as data URIs, saving a request.
    assetsInlineLimit: 2048,
    reportCompressedSize: false,
    // The arcade chunk (Three.js + the eight games) is deliberately large and
    // is only fetched when someone opens the interactive lab. It never touches
    // the landing page, so the default 500 kB warning is just noise here.
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        // Keep React in its own long-lived chunk so shipping a content change
        // doesn't invalidate the framework bytes in everyone's browser cache.
        // Only React is pinned. Everything else (three.js, supabase, howler)
        // is reached exclusively through dynamic imports, so leaving it to the
        // default chunker keeps it off the landing page's critical path —
        // grouping it manually would pull it into the entry's preload graph.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react-vendor'
          return undefined
        },
      },
    },
  },
})
