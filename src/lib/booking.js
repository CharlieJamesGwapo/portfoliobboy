// Public scheduling links are owner supplied, never built from visitor notes.
export function getBookingUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return ''
  try {
    const url = new URL(value.trim())
    const host = url.hostname.toLowerCase().replace(/\.$/, '')
    if (url.protocol !== 'https:' || url.username || url.password
      || !host.includes('.') || host === 'localhost' || host.endsWith('.localhost')
      || host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.home.arpa')
      || /^[\d.]+$/.test(host) || host.includes(':')) return ''
    return url.href
  } catch { return '' }
}

// Runs in Vite's Node configuration before any public value is bundled.
export function resolveBookingConfiguration(value) {
  if (typeof value !== 'string' || !value.trim()) return ''
  const url = getBookingUrl(value)
  if (!url) throw new Error('PORTFOLIO_BOOKING_URL must be a public HTTPS appointment URL without credentials.')
  return url
}

export function buildBookingRequest(option, brief) {
  const notes = typeof brief?.message === 'string' ? brief.message : ''
  const introduction = `Hi Charlie, I’d like to request a ${option.minutes}-minute ${option.title.toLowerCase()}.\n\nPreferred date and time (with timezone): To discuss\n\nWhat I’d like to discuss:\n`
  // A fully edited, maximum-length brief takes precedence over boilerplate.
  const message = notes && introduction.length + notes.length > 4500 ? notes : introduction + (notes || 'To discuss')
  return { subject: `Request a ${option.minutes}-min ${option.title.toLowerCase()}`, message: message.slice(0, 4500) }
}
