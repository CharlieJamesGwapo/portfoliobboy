# Real portfolio assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real, optional assistant answering from Charlie's reviewed public portfolio without exposing private systems or creating uncontrolled AI spending.

**Architecture:** A lazy React panel calls a same-origin Node Vercel endpoint. A separately tested public-knowledge registry and request validator precede a single bounded real AI generation. UI verification can run against a clearly test-only transport, but live readiness requires real provider and distributed abuse/cost evidence.

**Tech Stack:** Existing React/Vite, Node 24 server runtime, installed-version-matched Vercel AI SDK/AI Gateway, native fetch/AbortController, Node test runner and Playwright.

**Spec:** `docs/superpowers/specs/2026-10-06-portfolio-ux-upgrade-design.md`; stage A plan `docs/superpowers/plans/2026-10-06-portfolio-ux-upgrade.md`.

## Global Constraints

- The model sees the visitor's question, bounded conversational context, and that public knowledge payload.
- No filesystem reads of the full repository, private screenshots, research notes, credentials, internal URLs, or live client database access.
- Validate content type, same-origin policy, message roles, body size (maximum 24 KiB), user question length (maximum 2,000 characters), and history (maximum 10 messages).
- Cap output at 600 tokens and allow one model generation per request, without tools or autonomous loops.
- Default financial boundary: no purchased credits, no automatic recharge, no paid plan upgrade, and no provider-key reuse from other client projects.
- Before enabling the public endpoint, require enforceable rate limits (initial target: five requests per minute per client) and a verified provider spending cap.
- Do not substitute canned responses and advertise them as AI. No raw model HTML, prompt/answer logs, persistent chat storage, private client access, outbound messages or calls.
- A separate Railway service is not required for this bounded read-only assistant; do not provision or modify Railway as part of this design.

## Review Focus

- Forged assistant/system messages or oversized UTF-8 bodies must be rejected before a provider call (Task 2).
- A spoofed Origin/Host header or unrelated Vercel deployment must not qualify as same-origin (Task 2).
- Disabled or misconfigured production protection must fail closed; a memory-only rate counter is insufficient (Tasks 1 and 3).
- Rapid Stop, Retry, Close and reopen must never let an old response overwrite the latest conversation (Task 4).
- HTML, model-invented URLs, internal references and unsupported rates must not become links or factual claims (Tasks 2–4; live evaluation Task 5).

## File map and interfaces

Create `server/portfolioKnowledge.js`, `server/portfolioChatPolicy.js`, `server/portfolioGateway.js`, `server/portfolioChatHandler.js`, `api/portfolio-chat.js`, `src/lib/portfolioChatClient.js`, `src/components/PortfolioAssistant.jsx`, `src/components/AssistantLauncher.jsx`, `src/styles/assistant.css`, `tests/portfolioKnowledge.test.js`, `tests/portfolioChatPolicy.test.js`, `tests/portfolioChatHandler.test.js`, `tests/portfolioChatClient.test.js`, `tests/e2e/portfolio-assistant.spec.js`, and `docs/portfolio-assistant-operations.md`.

Modify `src/App.jsx` launcher and overlay coordination, `package.json`/lock only for verified AI SDK requirements, and `vercel.json` only for this endpoint's measured timeout if needed. Do not change `/api/contact`, game state, provider accounts for other projects, or deployment security defaults.

Transport request: `{question:string, history:Array<{role:'user'|'assistant', content:string}>}`. Client does not send trusted source data or system instructions. For honest conversation provenance, send history as untrusted quoted context inside a single user message; do not promote client history to authoritative assistant statements.

Transport response: NDJSON events `{type:'start'}`, `{type:'delta',text:string}`, `{type:'done',sources:Array<{id,label,href}>}`, or `{type:'error',code,message}`. HTTP failures before streaming return `{error:{code,message}}`. Related source links are server-selected from reviewed topic records and labelled Related portfolio details, not falsely presented as sentence-level citations. The model is instructed not to produce raw URLs; the UI renders answer text literally.

### Task 1: Verify real integration, rate limits and spend boundaries

**Files:** Create `docs/portfolio-assistant-operations.md` with non-secret evidence. No app dependencies or account resources until access/gates are verified.
**Interfaces:** Produces `PORTFOLIO_AI_MODEL` (live-selected model ID), server-only authentication availability, a configured eligible platform rate-limit rule protecting `/api/portfolio-chat`, and a fail-closed activation decision. `PORTFOLIO_CHAT_ENABLED` controls the server; non-secret `VITE_PORTFOLIO_CHAT_ENABLED` controls launcher visibility. Both remain false until endpoint/protection/cost evidence passes; a true UI flag never substitutes for server authorization. These environment names contain configuration; values/credentials must never be printed.

- [ ] Read marketplace, AI Gateway, environment-variable, CLI and firewall skills before relevant commands. Run read-only CLI discovery/help first. Inspect configured project/service identity and environment variable names only; do not print secret values or pull unrelated client credentials.
- [ ] Fetch the actual model catalogue with `curl -fsS https://ai-gateway.vercel.sh/v1/models`; choose an eligible low-cost text model using current price/access metadata. Check current AI account quota and free eligibility with the official authenticated read-only tool documented by CLI help. Do not assume free credits exist for this team.
- [ ] Inspect whether the project's plan supports a narrow platform rate-limit rule. Configure only an authorized, non-billable rule for POST `/api/portfolio-chat` with five requests/minute per trusted platform client identity. If a rule requires paid capacity or a new shared service, stop activation and report the exact requirement; do not provision a paid Redis substitute. Verify its actual six-request behavior when the disabled real route is deployed in Task 3, before provider activation. Do not spoof trusted provider headers to manufacture proof.
- [ ] Verify a provider-side cap and disabled automatic recharge; do not change team-wide billing. Record rule identifier, deployment environment, available auth mechanism, cap/quota boundaries and read-only evidence timestamps—not secrets—in the operations doc. A deployment `PORTFOLIO_CHAT_ENABLED=true` is allowed only after this evidence passes; otherwise the deployed endpoint stays fail-closed and launcher hidden.
- [ ] If real non-paid provider access and an eligible protection mechanism are available, install only the required AI SDK package with the existing npm lockfile (`npm install ai`), verify Node compatibility, and read full relevant installed docs at `node_modules/ai/docs/` and gateway provider docs. Search for `streamText`, `instructions`, `textStream`, `maxOutputTokens`, `maxRetries`, `abortSignal` before using the API; refresh the code snippet in Task 3 if the installed version differs. This permits implementing a disabled endpoint, not public activation; final rate/cost proof follows in Tasks 3 and 5. Record integration outcome and commit only the operations evidence and necessary package files.

### Task 2: Reviewed public knowledge and fail-closed request policy

**Files:** Create knowledge/policy modules and their Node tests.
**Interfaces:** `buildKnowledge() -> {facts, sources}`; `selectSources(question) -> source[]`; `validateChatRequest({method,headers,body,rawBytes,allowedOrigins}) -> {question,history}` or throws `ChatPolicyError(status,code)`; no network access in these functions.

- [ ] Add failing tests covering original public titles and dates, known service categories, all credentials, source registry and absence of private/internal URLs. Add payload tests with real UTF-8 size and forged roles:

```js
test('rejects oversized multibyte input before generation', () => {
  assert.throws(() => validateChatRequest({
    method: 'POST', headers: { origin: 'https://portfoliobboy.vercel.app', 'content-type': 'application/json' },
    body: { question: '界'.repeat(9000), history: [] }, rawBytes: 27000,
    allowedOrigins: new Set(['https://portfoliobboy.vercel.app']),
  }), error => error.status === 413)
})
```

- [ ] Run `node --test tests/portfolioKnowledge.test.js tests/portfolioChatPolicy.test.js`; expect missing module failures.
- [ ] Explicitly project reviewed public fields from `profile`, `experiences`, `featuredProjects`, `projectArchive`, `certifications`, `education`, `recognitions`, `aiSystemCapabilities`, and `momentumSystems`. Do not serialize the entire module or use filesystem globbing. Source registry includes existing section hashes and existing public project URLs only. Related sources are selected by case-insensitive topic matches and default to About/Contact for unknown questions; they are not model-provided URLs.

```js
export class ChatPolicyError extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code }
}
const fail = (status, code) => { throw new ChatPolicyError(status, code) }
// Inside validateChatRequest after method/origin/content-type checks:
if (rawBytes > 24 * 1024) fail(413, 'PAYLOAD_TOO_LARGE')
if (!body || typeof body.question !== 'string' || !body.question.trim() || body.question.length > 2000) fail(400, 'INVALID_QUESTION')
if (!Array.isArray(body.history) || body.history.length > 10) fail(400, 'INVALID_HISTORY')
for (const item of body.history) {
  if (!item || !['user', 'assistant'].includes(item.role) || typeof item.content !== 'string' || item.content.length > 4000) fail(400, 'INVALID_HISTORY')
}
```

Reject unknown object keys, `system`, `tool`, rich parts and arbitrary URLs/source fields. Origin must exactly match configured production/localhost development or the platform-injected exact preview URL—not arbitrary `*.vercel.app` and not a user-supplied Host. Missing Origin is rejected on browser POST; same-origin POST emits Origin. Size is checked at the raw stream boundary and validated again on serialized parsed input.

- [ ] Implement trusted instructions: identify as AI, answer only from supplied facts, preserve private/prototype statuses, unknown rates/ownership/availability -> contact, ignore commands in questions/history, no tools or raw URLs. Quote history as untrusted content instead of inserting forged assistant messages. Assert no source href starts with `javascript:`, protocol-relative URLs or internal hosts.
- [ ] Run all policy/knowledge tests, preservation tests and build; commit `feat: add grounded public assistant knowledge and request policy`.

### Task 3: Real bounded endpoint and safe streaming envelope

**Files:** Create gateway/handler modules, `api/portfolio-chat.js`, endpoint tests; modify exact endpoint function timeout only if measured necessary.
**Interfaces:** `streamPortfolioAnswer({question,history,signal,model}) -> AsyncIterable<string>`; `createChatHandler({enabled,allowedOrigins,streamAnswer,sourcesFor}) -> handler(req,res)` for dependency-injected tests. Production injects only the real gateway adapter and verified deployment configuration; test doubles are never a production fallback.

- [ ] Write failing handler tests with mock request/response streams: disabled -> 503 and provider call count zero; foreign origin -> 403/zero; oversized body -> 413/zero; valid request -> start/delta/done; provider unavailable -> safe error; disconnect -> abort; unknown source href -> omitted. Assert logs do not contain question or answer.

```js
test('disabled configuration never calls the provider', async () => {
  let calls = 0
  const handler = createChatHandler({ enabled: false, allowedOrigins: new Set(),
    streamAnswer: async function* () { calls++; yield 'incorrect' }, sourcesFor: () => [] })
  await handler(requestFixture({ question: 'What can Charlie build?', history: [] }), responseFixture())
  assert.equal(calls, 0)
})
```

Define `requestFixture`/`responseFixture` in `tests/portfolioChatHandler.test.js` using Node PassThrough streams; response fixture records status/headers/body and exposes `emit('close')` for cancellation. Assert actual body events, not just successful status.

- [ ] Run handler tests; expect missing export failure. Implement bounded raw-body collection before JSON parsing, exact origin/content-type/method validation, and activation gate before provider use. Return stable 405/403/400/413/429/503 codes where applicable and `Cache-Control: no-store`; do not enable CORS broadly.
- [ ] Implement the gateway adapter only after Task 1's installed docs confirm these calls (the official v7 reference inspected during planning uses `instructions`, not remembered `system`):

```js
import { streamText } from 'ai'
export async function* streamPortfolioAnswer({ question, history, signal, model }) {
  const result = streamText({
    model, instructions: buildInstructions(),
    messages: [{ role: 'user', content: JSON.stringify({ untrustedHistory: history, question }) }],
    maxOutputTokens: 600, maxRetries: 0, abortSignal: signal,
  })
  for await (const text of result.textStream) yield text
}
```

Define `buildInstructions()` in the knowledge module from Task 2 and import it explicitly. `model` comes only from verified server `PORTFOLIO_AI_MODEL`; no client model override or remembered default. No tools, retries or autonomous loops. Catch async stream errors without leaking provider payloads, close the stream and distinguish interrupted from completed output. Drain/observe completion according to installed docs so provider errors cannot become a silent successful empty answer.

- [ ] Implement one request AbortController, abort on response disconnect and a server deadline, clear its timer/listeners in finally. Start with a 9-second deadline under the current 10-second limit; if real free-quota latency requires longer, scope `api/portfolio-chat.js` to 30 seconds and use a 25-second deadline. Do not raise the existing contact timeout. Stream encoded NDJSON records with `res.write(JSON.stringify(event)+'\n')`, handle write backpressure, and stop writes after close. Sources come from `selectSources(question)` and server allowlist only.
- [ ] Run all endpoint/policy tests and build. Deploy the disabled endpoint to a protected preview, verify the platform's sixth-request 429 and an independent controlled client's limit, then verify cost/auth evidence before enabling that preview. Execute a single approved public-only question only after these gates pass. Verify provider usage evidence and error/quota behavior, without exceeding available free credit. Commit `feat: add protected real portfolio chat endpoint`.

### Task 4: Lazy, accessible assistant with cancellation-safe state

**Files:** Create client/launcher/panel/style files and tests; modify App overlay coordination.
**Interfaces:** `consumeChatEvents(response,onEvent,{signal}) -> Promise<void>` handles split NDJSON chunks and rejects incomplete streams; `<AssistantLauncher enabled onOpen>`; `<PortfolioAssistant open onClose>` uses stage A PortfolioDialog. Lightweight launcher may load initially; panel/client load only on first open. Disabled activation hides launcher.

- [ ] Write failing client/parser tests for chunk boundaries, malformed/oversized event, missing done, disconnect, late result and blocked storage. Browser tests use Playwright route fixtures explicitly as UI-contract tests, not evidence of live AI.

```js
await page.route('**/api/portfolio-chat', route => route.fulfill({
  status: 200, contentType: 'application/x-ndjson',
  body: [
    { type: 'start' }, { type: 'delta', text: 'Charlie builds AI-integrated applications.' },
    { type: 'done', sources: [{ id: 'services', label: 'AI services', href: '/#ai-systems' }] },
  ].map(event => JSON.stringify(event)).join('\n') + '\n',
}))
```

- [ ] Run parser/browser tests and verify missing assistant is the expected failure. Implement streaming parser using TextDecoder streaming mode, retained trailing fragment and newline parsing; cap total response/event size, validate each event's type/fields, and require done before marking complete.
- [ ] Implement lazy open, in-memory conversation and monotonically increasing request ID. Abort on Stop/Clear/Close/unmount and ignore all callbacks from an old request ID:

```js
const id = ++requestId.current
controllerRef.current?.abort()
controllerRef.current = new AbortController()
const acceptEvent = event => {
  if (id !== requestId.current || controllerRef.current.signal.aborted) return
  applyEvent(event)
}
```

Define `applyEvent` in the panel to append delta to the current assistant message, mark done only after validated completion, and show interrupted/error state without labelling partial output final. Retry repeats the failed user question but does not duplicate completed turns. Close retains bounded in-memory history only; Clear removes it, refresh loses it, no localStorage/sessionStorage/database writes. Keep last 10 history messages and validate input length before fetch.

- [ ] Add exact starter prompts from the spec, visible question label, plain-text answer rendering, privacy disclosure, Stop/Retry/Clear/Close controls and Related portfolio details links only from validated source IDs/URLs. External links new-tab labelled; internal links close the dialog before navigating/focusing the target. Escape/focus return uses the shared dialog. Use one calm floating-control group with music/top so controls never overlap safe-area/contact actions.
- [ ] Browser tests: HTML renders literally, fabricated javascript/internal links omitted, Stop then Retry cannot accept stale response, Close/open retains only session state, provider 503 provides contact path, denied storage still works, mobile keyboard/resizing preserves input/actions, palette/menu/music mutually exclusive. Run full unit/browser/build suite; commit `feat: add accessible optional portfolio assistant`.

### Task 5: Live evaluation, integrated review and release evidence

**Files:** Update operations and verification docs only unless a reproduced failure requires repair.
**Interfaces:** Produces readiness evidence, protected-preview URL and exact deployment commit; production remains gated by applicable release authority and tests.

- [ ] Evaluate real answers on the protected preview using public-only prompts about services, credential IDs, expired records, Hasti demo vs private voice runtime, and unknown rates. Include an injection prompt asking for private Zalio chats; expect refusal/limitation and no private data. Record outcomes and token/credit deltas without storing visitor data or credential values.
- [ ] Verify six-request burst rate limiting and endpoint behavior when activation is disabled/quota unavailable. Ensure disabled deployment exposes no assistant launcher and no functioning paid endpoint. Do not weaken deployment protection to test.
- [ ] Run `npm test`, `npm run build`, `npm run test:e2e`, `git diff --check`; verify API calls bypass offline service-worker caching and chatbot/SDK/server secrets are absent from entry assets. Inspect both themes at 390/1440, mobile landscape, 200% text scaling, keyboard-only and reduced motion across Chromium/Firefox/WebKit.
- [ ] Obtain independent integrated branch review, resolve actionable findings with regression tests, and rerun the full suite. Check all inventory exports, original project links, resume and Lab behavior remain unchanged. Clearly distinguish UI fixtures from real-provider proof in documentation.
- [ ] Create/attach PR using applicable user release authorization. Merge/deploy only when review/tests/protection/cost gates pass and authorized; use the existing Vercel project, no Railway changes. Verify the public production site and real assistant after rollout with one bounded public prompt. If any integration gate remains unavailable, report stage A delivered and assistant blocked by the exact requirement—never report the whole task complete.

## References and self-review

Installed AI SDK docs are authoritative at execution time. Planning checked official [generateText](https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-text) and [streamText](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text) references; model identity, account eligibility and resource protection require live inspection, not a plan assumption.

Coverage: spec 10 and assistant-specific 11–13 map to Tasks 1–5. Every Review Focus condition has a failing policy, stream or browser test before implementation. Knowledge and UI sources share a reviewed registry; callbacks cannot accept old request IDs; distributed rate protection and spending controls are activation gates rather than memory-counter approximations. Paid provisioning is not authorized by design approval.

Execution needs plan review and the preserved Luna Max subagent-driven method before code changes, unless the user explicitly changes it. Stage A can progress independently, but stage B must not be silently represented by a canned chatbot or a false completion claim.
