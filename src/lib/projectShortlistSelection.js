import { routeMetadata, siteOrigin } from '../data/routeMetadata.js'

export const MAX_SHORTLIST = 3
export const shortlistProjectTitles = Object.freeze(Object.fromEntries(
  routeMetadata.filter(route => route.projectTitle && /^\/projects\/[a-z0-9-]+$/.test(route.pathname))
    .map(route => [route.pathname.slice('/projects/'.length), route.projectTitle]),
))
const publicSlugs = new Set(Object.keys(shortlistProjectTitles))

export function normalizeShortlist(value) {
  if (!Array.isArray(value)) return []
  const slugs = []
  for (const slug of value.slice(0, 256)) {
    if (typeof slug === 'string' && publicSlugs.has(slug) && !slugs.includes(slug)) slugs.push(slug)
    if (slugs.length === MAX_SHORTLIST) break
  }
  return slugs
}

export function toggleShortlist(current, slug) {
  const slugs = normalizeShortlist(current)
  if (typeof slug !== 'string' || !publicSlugs.has(slug)) return { slugs, status: 'invalid' }
  if (slugs.includes(slug)) return { slugs: slugs.filter(selected => selected !== slug), status: 'removed' }
  if (slugs.length === MAX_SHORTLIST) return { slugs, status: 'limit' }
  return { slugs: [...slugs, slug], status: 'added' }
}

export function readSharedShortlist(search) {
  if (typeof search !== 'string') return null
  if (search.length > 2048) return []
  const values = new URLSearchParams(search).getAll('compare')
  if (values.length === 0) return null
  if (values.length !== 1 || values[0].length > 256) return []
  return normalizeShortlist(values[0].split(','))
}

export function shortlistShareUrl(slugs) {
  return `${siteOrigin}/projects?compare=${normalizeShortlist(slugs).join(',')}#project-shortlist`
}
