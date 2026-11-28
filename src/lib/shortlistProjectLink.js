import { shortlistProjectTitles } from './projectShortlistSelection.js'

export function shortlistSlugFromHref(href) {
  const slug = typeof href === 'string' ? href.match(/^\/projects\/([a-z0-9-]+)$/)?.[1] : null
  return slug && Object.hasOwn(shortlistProjectTitles, slug) ? slug : null
}
