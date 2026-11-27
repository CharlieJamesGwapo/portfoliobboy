import { checkBotId } from 'botid/server'

// SDK defaults treat anything except NODE_ENV=production as development. Only
// an explicit local dev process may bypass; previews and missing config fail closed.
export async function verifyContactBot(req, { check = checkBotId, timeoutMs = 3000 } = {}) {
  if (process.env.NODE_ENV === 'development' && process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) return { allowed: true }
  let timer
  try {
    const verification = await Promise.race([
      check({ developmentOptions: { isDevelopment: false }, advancedOptions: { checkLevel: 'basic', headers: req.headers } }),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Verification deadline')), timeoutMs) }),
    ])
    if (verification?.isHuman === true && verification.isBot === false && verification.bypassed !== true) return { allowed: true }
    return { allowed: false, status: 403, code: 'BOT_VERIFICATION_FAILED' }
  } catch {
    return { allowed: false, status: 503, code: 'BOT_VERIFICATION_UNAVAILABLE' }
  } finally { clearTimeout(timer) }
}
