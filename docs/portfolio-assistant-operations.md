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
- The owner has a fresh scoped published WAF configuration proof, recorded
  below; this task did not publish WAF or change a production setting.
- No recharge or purchase was made, and no deployment was changed by this
  task.

The planned public behavior is read-only and portfolio-grounded: bounded
public facts, no repository or private-client access, no tools, no raw model
HTML, no autonomous loops, no persistent chat, and no question/answer logs.

### Public-data, privacy, and funding contract

These fixed global constraints are the handoff for later implementation:

- The model sees the visitor's question, bounded conversational context, and that public knowledge payload.
- No filesystem reads of the full repository, private screenshots, research notes, credentials, internal URLs, or live client database access.
- Validate content type, same-origin policy, message roles, body size (maximum 24 KiB), user question length (maximum 2,000 characters), and history (maximum 10 messages).
- Cap output at 600 tokens and allow one model generation per request, without tools or autonomous loops.
- Default financial boundary: no purchased credits, no automatic recharge, no paid plan upgrade, and no provider-key reuse from other client projects.
- Before enabling the public endpoint, require enforceable rate limits (initial target: five requests per minute per client) and a verified provider spending cap.
- Do not substitute canned responses and advertise them as AI. No raw model HTML, prompt/answer logs, persistent chat storage, private client access, outbound messages or calls.
- A separate Railway service is not required for this bounded read-only assistant; do not provision or modify Railway as part of this design.

For honest conversation provenance, history is sent as untrusted quoted context
inside a single user message; it is never promoted to authoritative assistant
or system content.

### Task 3 request contract (fixed handoff)

The future endpoint must enforce these constraints before any provider call;
this Task 1 record does not implement the endpoint or make an SDK call:

- Accept `POST` only with `Content-Type: application/json` and reject unknown
  request-object keys, arbitrary URL/source fields, rich message parts,
  `system`, and `tool` roles.
- Enforce exact same-origin checks. A browser POST must carry `Origin` matching
  the configured production origin, approved localhost development origin, or
  the platform-injected exact preview URL. Missing browser `Origin`, an
  arbitrary `*.vercel.app` origin, or a user-supplied `Host` must not qualify.
- Permit only `user` and `assistant` history roles. The transport body is
  `{question:string, history:Array<{role:'user'|'assistant', content:string}>}`.
- Reject raw UTF-8 bodies over 24 KiB, an empty or over-2,000-character
  question, more than 10 history messages, or any history content over 4,000
  characters. Check body size before JSON parsing and validate the parsed
  object again.
- A valid request may cause exactly one model generation, capped at 600 output
  tokens, with no tools, retries, fallbacks, autonomous loops, or browser
  model override. Disabled or misconfigured activation must fail closed before
  a provider call.
- Do not substitute canned text and present it as AI. No raw model HTML,
  prompt/answer logs, persistent chat, private-client access, outbound sends,
  or calls are allowed.

## Evidence collected

Evidence timestamps below are UTC. The latest read-only OIDC credits refresh
was `2026-10-06T22:03:17Z`; the public model catalogue fetch was
`2026-10-06T22:00:01Z`; the latest scoped WAF configuration proof was
`2026-10-06T22:13:46.575Z`.

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
  attribution. The installed Gateway docs state that a supplied API key or
  Vercel access token takes precedence over OIDC, even when invalid; no
  `AI_GATEWAY_API_KEY` fallback is allowed for this assistant. The same docs
  state that a request-scoped `providerOptions.gateway.byok` object excludes
  cached BYOK credentials; Task 3 may use an empty request-scoped object only
  after validating that behavior against the installed runtime. No provider
  key, AI Gateway API key, BYOK credential, or new key was created or
  inspected, and no credential from another client project may be reused.

### Budget, recharge, and spend boundary

The project has an active project-scoped USD 1 monthly AI Gateway budget that
applies to OIDC traffic and excludes BYOK traffic. AI Gateway documents this
budget type as a **soft cap**: the request that crosses the limit can finish.
It is therefore not an enforceable hard fail-closed spending boundary for a
public endpoint.

An earlier controller UI check observed automatic recharge disabled, but that
state was not freshly confirmed in this run. Do not describe recharge as
currently disabled until the owner refreshes the billing view. No credits were
purchased and no recharge or team-wide billing setting was changed. No paid
call or paid-plan upgrade is authorized; the OIDC path and the verified soft
budget do not constitute a hard fail-closed ceiling.

### Platform rate-limit protection

The latest scoped read-only configuration proof after the owner's publication
reports the following public policy at `2026-10-06T22:13:46.575Z`:

- Display name: `Protect Charlie AI`.
- Published request paths: `POST /api/chat` and `POST /api/portfolio-chat`.
- Counter: five requests per 60-second fixed window per IP.
- Excess action: HTTP 429 rate limiting.
- Configuration validity: `true`; remaining draft changes: `0`.

This is configuration proof only, not runtime behavior proof. The actual
controlled-client six-request test has not been performed; it remains required
after the disabled endpoint is deployed. Trusted provider headers will not be
spoofed to manufacture that proof. This document intentionally omits raw
firewall identifiers and account metadata.

Vercel documents fixed-window counters as per-region, so the six-request test
must use an independent controlled client against the real protected route.

## Activation gates still missing

The following are required before either flag may become true:

1. Task 3 must deploy the real endpoint disabled and prove that the actual
   published platform rule rejects the sixth request, without relying on a
   memory-only counter.
2. The owner must refresh free-credit eligibility and recharge state, then
   provide an enforceable provider-side spending boundary. The existing USD 1
   project budget is soft and does not satisfy that gate by itself.
3. Task 5 must provide bounded public-only evaluation, cost/error evidence,
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
- Gateway authentication precedence and cached BYOK behavior are activation
  hazards: a supplied API key or Vercel access token wins over OIDC, and a
  request-scoped `byok` option can exclude cached BYOK credentials. Task 3
  must preserve project OIDC, reject API-key fallback, and validate the
  request-scoped empty-`byok` approach before using it. No other-client key is
  permitted.
- `streamText` accepts `instructions`, `messages`, `maxOutputTokens`,
  `maxRetries`, and `abortSignal`. The current docs prefer `instructions` for
  server-owned model behavior; user-controlled messages must not be promoted
  to trusted system content.
- `textStream` is an async iterable/readable stream of text deltas, but error
  parts are not surfaced there. The endpoint must observe preferred
  `result.stream` (the installed API marks `fullStream` deprecated) or
  `onError`, consume the stream to completion, and avoid treating an empty or
  interrupted stream as a successful answer. The installed default `onError`
  logs with `console.error`; production code must override it with a sanitized
  handler that never logs question, answer, or provider payload content.
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
environment values, account resources, or production state were changed by
this task. The owner's published WAF configuration proof above was an external
scoped operation; this task performed no publication and no provider call.
