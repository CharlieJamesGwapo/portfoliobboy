# Portfolio Outcome Analytics Implementation Plan

> **For agentic workers:** Execute with the planning/parallel delegation and test-first skills; keep independent server analytics and answer-audit work in separate files.

**Goal:** Add an owner analytics dashboard for explicit portfolio outcome counts, ground Alex in current public evidence, and retain a useful text experience when voice is unavailable; test, push and deploy.

**Architecture:** Browser actions send fixed enums to a small same-origin analytics endpoint; the endpoint forwards minimal server-generated anonymous events to the configured PostHog project. A successful contact event is emitted only by the contact API after a successful email-provider response. All PostHog config is environment based; no browser SDK, autocapture, replay or visitor persistence. The PostHog dashboard reports event totals, not unique visitors or attributed conversion rates. Voice receives a bounded public evidence context and exposes a local text fallback using the existing portfolio answer engine and retained workspace.

**Spec:** User said GO DO IT to the recommended analytics dashboard, spoken-answer evidence audit, and voice-unavailable fallback. The owner selected a personal project and confirmed the new workspace name Charlie Abejo Portfolio. Use only its project 769787; do not ingest into or modify the existing Zalio project.

## Constraints

- Never send conversation, form content, audio, names, email, phone, IP, referrer, URL, user agent, or a persistent visitor ID to analytics.
- Event properties contain only fixed surface/starter/project identifiers. Each event gets a new random ingestion ID; no person profiles/GeoIP.
- Capture only explicit voice connections, starter sends, evidence-card opens, enquiry review handoffs, and successful contact delivery.
- Contact analytics is server-only and failure cannot fail a successful email. Do not send real verification emails.
- Respect browser Do Not Track and Global Privacy Control. No browser storage or queue. Analytics disabled unless configured.
- Preserve two-minute voice limit, goodbye, correction/dedupe, cancellation, draft preservation and explicit contact review.

## Review Focus

- Invalid or hostile events must not leak arbitrary properties or capture contact success through the public endpoint.
- Analytics outages or missing config must never break portfolio/email/voice actions.
- StrictMode and SDK retries must not inflate a single connection event.
- Voice fallback must stop audio, retain transcript/draft, and answer locally without claiming it is still a live voice call.
- Facts/context must be sourced from published portfolio data; unknown price, dates and proficiency must remain unconfirmed.

## Tasks

- [x] Server analytics contract, capture helper and same-origin endpoint; tests for allowlists, content types, size, signals, errors and privacy.
- [x] Browser tracker and hooks in existing voice/cards/enquiry actions; contact-success capture on server; tests for correct success boundaries.
- [x] Public evidence context and stale local answer audit; table-driven tests for prices, availability and unsupported claims.
- [x] Local text fallback in the retained voice workspace; browser tests with denied microphone/provider failure and no voice restart.
- [x] Confirm user-selected PostHog project, inspect existing dashboard/metrics/templates, create/verify owner dashboard and deploy configuration.
- [ ] Unit/build/production/full Chromium checks, independent review, push main, verify deployment and live smoke without real email.

Personal activation: the owner confirmed Charlie Abejo Portfolio; organization 01a217ed-ccb1-0000-9dea-166ddfafbd6f, project 769787, private dashboard 2416983. Production ingestion uses this project. Existing Zalio resources were not changed.
