import { getRouteMetadata, routeStructuredData, siteOrigin } from '../data/routeMetadata.js'

export function updateRouteMetadata(pathname) {
  const metadata = getRouteMetadata(pathname)
  document.title = metadata.title
  for (const [selector, value] of [
    ['meta[name="description"]', metadata.description],
    ['meta[property="og:title"]', metadata.title],
    ['meta[property="og:description"]', metadata.description],
    ['meta[property="og:url"]', siteOrigin + pathname],
    ['meta[property="twitter:title"]', metadata.title],
    ['meta[property="twitter:description"]', metadata.description],
    ['meta[property="twitter:url"]', siteOrigin + pathname],
    ['meta[name="robots"]', metadata.noindex ? 'noindex, follow' : 'index, follow'],
  ]) document.querySelector(selector)?.setAttribute('content', value)
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', siteOrigin + pathname)
  let script = document.getElementById('project-structured-data')
  const structured = routeStructuredData(metadata)
  if (!structured) { script?.remove(); return }
  if (!script) {
    script = document.createElement('script')
    script.id = 'project-structured-data'
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(structured)
}
