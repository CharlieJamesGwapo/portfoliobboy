// Emit route-specific HTML metadata for static hosting and social crawlers.
// The React case-study UI and lab still load on demand in the browser.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { routeMetadata, routeStructuredData, siteOrigin } from '../src/data/routeMetadata.js'

const escape = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const template = await readFile(resolve('dist/index.html'), 'utf8')
for (const metadata of routeMetadata) {
  if (metadata.pathname === '/') continue
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${escape(metadata.title)}</title>`)
  for (const [attribute, name, content] of [
    ['name', 'description', metadata.description],
    ['property', 'og:title', metadata.title], ['property', 'og:description', metadata.description], ['property', 'og:url', siteOrigin + metadata.pathname],
    ['property', 'twitter:title', metadata.title], ['property', 'twitter:description', metadata.description], ['property', 'twitter:url', siteOrigin + metadata.pathname],
  ]) html = html.replace(new RegExp(`(<meta ${attribute}="${name}" content=")[^"]*("\\s*/?>)`), `$1${escape(content)}$2`)
  html = html.replace(/(<link rel="canonical" href=")[^"]*("\s*\/?>)/, `$1${siteOrigin + metadata.pathname}$2`)
  const structured = routeStructuredData(metadata)
  if (structured) html = html.replace('</head>', `<script type="application/ld+json" id="project-structured-data">${JSON.stringify(structured).replaceAll('<', '\\u003c')}</script></head>`)
  const directory = resolve('dist', metadata.pathname.slice(1))
  await mkdir(directory, { recursive: true })
  await writeFile(resolve(directory, 'index.html'), html)
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routeMetadata.map(route => `  <url><loc>${siteOrigin}${route.pathname}</loc></url>`).join('\n')}\n</urlset>\n`
await writeFile(resolve('dist/sitemap.xml'), sitemap)
console.log(`Emitted metadata for ${routeMetadata.length} portfolio routes.`)
