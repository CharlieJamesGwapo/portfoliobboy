import { streamText } from 'ai'

import { buildInstructions } from './portfolioKnowledge.js'

export const PORTFOLIO_AI_MODEL = 'google/gemini-2.5-flash-lite'

export class PortfolioGatewayError extends Error {
  constructor(code) {
    super(code)
    this.name = 'PortfolioGatewayError'
    this.code = code
  }
}

const gatewayError = (code) => new PortfolioGatewayError(code)

const isAbort = (error, signal) => signal?.aborted
  || error?.name === 'AbortError'
  || error?.code === 'ABORT_ERR'

/**
 * Stream exactly one grounded text generation through the verified Gateway
 * route. The caller owns the activation gate; this adapter never falls back
 * to another model, provider, key, tool, or retry path.
 */
async function* streamPortfolioAnswerWith({ question, history, signal, model }, streamTextImpl) {
  if (model !== PORTFOLIO_AI_MODEL) throw gatewayError('ASSISTANT_MISCONFIGURED')
  if (typeof question !== 'string' || !Array.isArray(history)) {
    throw gatewayError('INVALID_GENERATION_INPUT')
  }
  if (signal?.aborted) throw gatewayError('REQUEST_ABORTED')

  let result
  let observedError = false
  try {
    result = streamTextImpl({
      model,
      instructions: buildInstructions(),
      messages: [{
        role: 'user',
        content: JSON.stringify({ untrustedHistory: history, question }),
      }],
      maxOutputTokens: 600,
      maxRetries: 0,
      streamRetries: 0,
      abortSignal: signal,
      providerOptions: {
        gateway: {
          only: ['vertex'],
          byok: {},
        },
      },
      onError() {
        // The SDK's default observer logs provider payloads. Keep only a
        // boolean so the adapter can fail closed without logging any input,
        // output, or provider detail.
        observedError = true
      },
    })

    let text = ''
    let finished = false

    for await (const part of result.stream) {
      if (part?.type === 'text-delta') {
        if (typeof part.text !== 'string') throw gatewayError('PROVIDER_UNAVAILABLE')
        text += part.text
        yield part.text
        continue
      }

      if (part?.type === 'error') throw gatewayError('PROVIDER_UNAVAILABLE')
      if (part?.type === 'abort') throw gatewayError('REQUEST_ABORTED')
      if (part?.type === 'finish') {
        if (part.finishReason === 'error') throw gatewayError('PROVIDER_UNAVAILABLE')
        finished = true
      }
    }

    if (signal?.aborted) throw gatewayError('REQUEST_ABORTED')
    if (observedError) throw gatewayError('PROVIDER_UNAVAILABLE')
    if (!finished) throw gatewayError('PROVIDER_UNAVAILABLE')
    if (!text.trim()) throw gatewayError('EMPTY_RESPONSE')
  } catch (error) {
    if (isAbort(error, signal)) throw gatewayError('REQUEST_ABORTED')
    if (error instanceof PortfolioGatewayError) throw error
    throw gatewayError('PROVIDER_UNAVAILABLE')
  }
}

export async function* streamPortfolioAnswer(args) {
  yield* streamPortfolioAnswerWith(args, streamText)
}

// Explicit test-only dependency injection. Production imports the adapter
// above, which is always bound to the installed AI SDK implementation.
export const createPortfolioGatewayForTests = (streamTextImpl) => {
  if (typeof streamTextImpl !== 'function') throw new TypeError('streamText implementation required')
  return (args) => streamPortfolioAnswerWith(args, streamTextImpl)
}
