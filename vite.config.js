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
    source: resolve(process.cwd(), 'ABEJO_CHARLIE_JAMES_RESUME.pdf'),
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
        // Long-lived vendor chunks. Everything named here is either on the
        // critical path already (React) or reached exclusively through dynamic
        // imports (three.js, r3f), so naming them does not pull anything new
        // into the entry's preload graph — it only stops unrelated code from
        // sharing a cache key.
        //
        // three.js is the one that matters. It is used by the hero's WebGL
        // upgrade and by six of the arcade games; left to the default chunker
        // it was inlined into the arcade's data chunk, which meant ~960 kB
        // re-downloaded whenever a game or a line of game data changed, and no
        // reuse at all between the hero and the arcade. Pinned, it is fetched
        // once and then served from cache for every other consumer.
        //
        // Expressed with rolldown's `advancedChunks` rather than the legacy
        // `manualChunks` callback: under the compat callback rolldown merged
        // `three-vendor` back into `r3f-vendor`, because a group below its
        // minimum size gets folded into the chunk that pulls it in. Declaring
        // `minSize: 0` per group is what actually keeps them apart.
        advancedChunks: {
          groups: [
            {
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 30,
              minSize: 0,
            },
            {
              name: 'three-vendor',
              test: /[\\/]node_modules[\\/]three[\\/]/,
              priority: 20,
              minSize: 0,
            },
            {
              name: 'r3f-vendor',
              test: /[\\/]node_modules[\\/]@react-three[\\/]/,
              priority: 10,
              minSize: 0,
            },
          ],
        },
      },
    },
  },
})
