# Portfolio assistant operations record

Status at the evidence refresh on 2026-10-06: the assistant is not activated.
This document records public, non-secret integration evidence for the bounded
portfolio assistant. It is not proof of production readiness, a deployment
record, or permission to spend credits.

## Current decision

The release decision is **blocked / fail closed**.

- `PORTFOLIO_CHAT_ENABLED` remains `false` until the server endpoint, platform
  protection, and cost evidence all pass.
- `VITE_PORTFOLIO_CHAT_ENABLED` remains `false` until the same gates pass; a
  browser flag never authorizes a server request.
- No provider model generation was made during this verification.
- No provider key, API key, environment value, balance, payment detail, or
  token is recorded here.
- No WAF draft was published, no recharge or purchase was made, and no
  deployment or production setting was changed by this task.

The planned public behavior is read-only and portfolio-grounded: bounded
public facts, no repository or private-client access, no tools, no raw model
HTML, no autonomous loops, no persistent chat, and no question/answer logs.

## Evidence collected

Evidence timestamps below are UTC. The latest read-only refresh was
`2026-10-06T22:03:17Z`; the public model catalogue fetch was
`2026-10-06T22:00:01Z`.

### Project and runtime

| Item | Read-only result |
| --- | --- |
| Vercel project | `portfoliobboy` resolved explicitly; Vite framework, Node.js `24.x`, `npm run build`, output `dist` |
| Local runtime | `/usr/local/bin/node` `v24.14.1` |
| npm | `11.11.0` |
| Vercel CLI | `62.4.0` (the registry reports `62.5.0` as newer; no global upgrade was run) |
| AI SDK registry version | `7.0.128` |
| Installed AI SDK | `ai` `7.0.128`, engine `>=22` |
| Installed Gateway provider | `@ai-sdk/gateway` `4.0.104`, engine `>=22` |
| Compatibility | The project Node 24 runtime satisfies the installed package engines; no engine warning occurred during the package install |

The existing project environment inventory was inspected as names only. No
environment file was pulled or written. The assistant-specific names remain
configuration contracts, not exposed browser secrets.

### Model catalogue

The live catalogue endpoint returned 413 models at the fetch timestamp. The
selected low-cost text model is the exact catalogue ID
`google/gemini-2.5-flash-lite`.

| Catalogue field | Observed metadata |
| --- | --- |
| Type and modality | `language`; text input and text output (the catalogue also lists image/PDF input, which this assistant will not use) |
| Context / output limit | `1,048,576` context; `65,535` maximum output tokens |
| Base price | `$0.10 / 1M` input tokens; `$0.40 / 1M` output tokens |
| Catalogue capabilities | reasoning, tool-use, structured output, vision, web search, file input, and implicit caching tags |
| Retention metadata | model-level `zdr: some`; model-level `no_training: all` |
| Provider endpoints | 2 endpoints were returned; endpoint metadata reports no-training support on both and ZDR support on one. This is not a universal ZDR claim. |

The assistant will not enable tools, web search, fallbacks, file input, or
model selection from the browser. `PORTFOLIO_AI_MODEL`, when eventually
configured server-side, must equal a currently verified catalogue ID.

### Authentication and free-credit evidence

- A project-scoped development OIDC environment run successfully performed an
  authenticated, read-only `GET https://ai-gateway.vercel.sh/v1/credits` at
  the latest refresh: HTTP 200, with a positive-credit result. Only the
  boolean result was observed; exact balances were not printed or persisted.
- Controller evidence previously showed the selected model as eligible for
  **Free AI Gateway Credit: Yes**. This is positive availability evidence, not
  a current activation gate: the model/account view and free-credit status
  must be refreshed again before any activation decision.
- Authentication must use the project OIDC path for project-budget
  attribution. No provider key, AI Gateway API key, BYOK credential, or new
  key was created or inspected.

### Budget, recharge, and spend boundary

The project has an active project-scoped USD 1 monthly AI Gateway budget that
applies to OIDC traffic and excludes BYOK traffic. AI Gateway documents this
budget type as a **soft cap**: the request that crosses the limit can finish.
It is therefore not an enforceable hard fail-closed spending boundary for a
public endpoint.

An earlier controller UI check observed automatic recharge disabled, but that
state was not freshly confirmed in this run. Do not describe recharge as
currently disabled until the owner refreshes the billing view. No credits were
purchased and no recharge or team-wide billing setting was changed.

### Platform rate-limit protection

The intended protection gate is a published platform rule for the disabled
portfolio-chat endpoint: five requests per 60-second fixed window per IP, with
the sixth request rejected as HTTP 429. A read-only controller check found a
valid draft matching that policy, but current publication/active status remains
unverified. This document intentionally omits raw firewall identifiers and
account metadata.

Vercel documents fixed-window counters as per-region, so a real controlled
client six-request test is still required after the disabled endpoint is
deployed and the owner confirms the rule is active. Trusted provider headers
will not be spoofed to manufacture that proof.

## Activation gates still missing

The following are required before either flag may become true:

1. Task 3 must deploy the real endpoint disabled and prove that the actual
   published platform rule rejects the sixth request, without relying on a
   memory-only counter.
2. The owner must confirm the intended protection is published and active by a
   fresh scoped inspection; the current state is not treated as published.
3. The owner must refresh free-credit eligibility and recharge state, then
   provide an enforceable provider-side spending boundary. The existing USD 1
   project budget is soft and does not satisfy that gate by itself.
4. Task 5 must provide bounded public-only evaluation, cost/error evidence,
   review, and the applicable release authority.

Until then, the server must fail closed, the launcher must stay hidden, and
the assistant must not be described as activation-ready.

## Installed SDK verification

The following installed, version-matched documents were read before any SDK
integration code is written:

- `node_modules/ai/package.json`
- `node_modules/@ai-sdk/gateway/package.json`
- `node_modules/@ai-sdk/gateway/docs/00-ai-gateway.mdx`
- `node_modules/ai/docs/03-ai-sdk-core/05-generating-text.mdx`
- `node_modules/ai/docs/07-reference/01-ai-sdk-core/02-stream-text.mdx`
- `node_modules/ai/docs/03-ai-sdk-core/25-settings.mdx`
- `node_modules/ai/docs/02-foundations/03-prompts.mdx`
- `node_modules/ai/docs/06-advanced/02-stopping-streams.mdx`
- `node_modules/ai/docs/06-advanced/03-backpressure.mdx`
- `node_modules/ai/docs/09-troubleshooting/14-stream-abort-handling.mdx`
- `node_modules/ai/docs/09-troubleshooting/07-unclosed-streams.mdx`
- `node_modules/ai/docs/09-troubleshooting/15-stream-text-not-working.mdx`

The installed API facts that constrain Task 3 are:

- AI SDK 7 exposes `streamText` and the Gateway provider accepts an exact
  `creator/model-name` string such as the live-selected model ID. No separate
  provider package is required for Gateway routing.
- `streamText` accepts `instructions`, `messages`, `maxOutputTokens`,
  `maxRetries`, and `abortSignal`. The current docs prefer `instructions` for
  server-owned model behavior; user-controlled messages must not be promoted
  to trusted system content.
- `textStream` is an async iterable/readable stream of text deltas, but error
  parts are not surfaced there. The endpoint must also observe `result.stream`
  or `onError`, consume the stream to completion, and avoid treating an empty
  or interrupted stream as a successful answer.
- `maxRetries: 0` disables request retries. The current `streamText` reference
  also documents `streamRetries` as opt-in and defaulting to zero; Task 3 must
  keep both bounded.
- Forwarding the request `AbortSignal` cancels the model request. The Vercel
  Node function must opt into per-route cancellation; a client Stop or
  disconnect must not leave a provider stream running.
- AI SDK streaming uses backpressure and only requests more model output as
  the consumer reads. The handler still needs to stop writes after disconnect,
  observe provider errors, and clean up its deadline/listeners.

The eventual bounded call shape remains subject to Task 3 tests and the
installed reference:

```js
const result = streamText({
  model,
  instructions: buildInstructions(),
  messages: [{
    role: 'user',
    content: JSON.stringify({ untrustedHistory: history, question }),
  }],
  maxOutputTokens: 600,
  maxRetries: 0,
  abortSignal: signal,
})
```

No live model call was made to validate this snippet in Task 1.

## Changes made in this task

- Added the single public operations record at this path.
- Installed only the required `ai` package with the existing npm lockfile.
  `package.json` records `ai` `^7.0.128`; `package-lock.json` records the
  resolved AI SDK/Gateway dependencies.
- `npm install ai` completed with 11 packages added and 185 packages audited.
  npm reported 10 audit findings (2 moderate, 8 high); no audit fix or
  unrelated dependency upgrade was run.

No source/assets, games, QA screenshots, client data, deployment settings,
WAF publication, environment values, account resources, or production state
were changed.
