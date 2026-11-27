// Race the whole patched fetch, not just the network request: BotID can wait
// for a challenge before calling native fetch, where AbortSignal alone cannot
// release the UI. Abort also prevents a late challenge from sending this draft.
export async function sendContactEnquiry(body, { fetchRequest = globalThis.fetch, timeoutMs = 25000 } = {}) {
  const controller = new AbortController()
  let timer
  try {
    return await Promise.race([
      (async () => {
        const response = await fetchRequest('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        })
        const result = await response.json()
        if (!response.ok || result.success !== true) {
          const error = new Error('Contact submission failed')
          error.code = result.code
          throw error
        }
        return result
      })(),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          controller.abort()
          reject(new Error('Contact deadline exceeded'))
        }, timeoutMs)
      }),
    ])
  } finally { clearTimeout(timer) }
}
