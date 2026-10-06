import { createChatHandler } from '../server/portfolioChatHandler.js'
import { PORTFOLIO_AI_MODEL, streamPortfolioAnswer } from '../server/portfolioGateway.js'
import { selectSources } from '../server/portfolioKnowledge.js'

const PRODUCTION_ORIGIN = 'https://portfoliobboy.vercel.app'
const LOCAL_ORIGINS = ['http://localhost:5173', 'http://localhost:4173']

const exactPlatformOrigin = (value) => {
  if (typeof value !== 'string' || !value.trim() || value.includes('*')) return null
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`
  try {
    const url = new URL(candidate)
    if ((url.protocol !== 'https:' && url.protocol !== 'http:') || url.username || url.password) return null
    if (url.pathname !== '/' || url.search || url.hash) return null
    if (url.protocol === 'http:' && !['localhost', '127.0.0.1'].includes(url.hostname)) return null
    return url.origin
  } catch {
    return null
  }
}

export function buildAllowedOrigins(env = process.env) {
  const origins = new Set([PRODUCTION_ORIGIN, ...LOCAL_ORIGINS])
  for (const name of ['VERCEL_URL', 'VERCEL_BRANCH_URL']) {
    const origin = exactPlatformOrigin(env?.[name])
    if (origin) origins.add(origin)
  }
  return origins
}

const hasForbiddenGatewayCredential = (env) => Boolean(
  env?.AI_GATEWAY_API_KEY || env?.VERCEL_ACCESS_TOKEN,
)

const activationEnabled = (env = process.env) => env?.PORTFOLIO_CHAT_ENABLED === 'true'
  && env?.PORTFOLIO_AI_MODEL === PORTFOLIO_AI_MODEL
  && !hasForbiddenGatewayCredential(env)
  && Boolean(env?.VERCEL_OIDC_TOKEN)

// The route remains fail-closed until the owner has refreshed OIDC, model,
// protection, quota, and cost evidence. No API-key or alternate-provider
// fallback is injected here.
const handler = createChatHandler({
  enabled: activationEnabled(),
  allowedOrigins: buildAllowedOrigins(),
  model: process.env.PORTFOLIO_AI_MODEL,
  streamAnswer: streamPortfolioAnswer,
  sourcesFor: selectSources,
  deadlineMs: 9000,
})

// Vercel Pages API route config: retain the existing ten-second function cap
// and opt this route into platform request cancellation only.
export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 10,
  supportsCancellation: true,
}

export default handler
