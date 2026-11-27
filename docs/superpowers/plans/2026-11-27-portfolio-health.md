# Portfolio Health Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Independent monitor and browser tasks are delegated under superpowers:dispatching-parallel-agents.

**Goal:** Add privacy-safe uptime/error monitoring and a private health dashboard, then test, push and deploy.

**Architecture:** Strict event enums feed the existing personal PostHog project. GitHub runs independent safe availability probes. The owner selected email to capstonee2@gmail.com, with hourly PostHog technical-error checks and a dedicated sending-only Resend key. No private content enters telemetry.

**Tech Stack:** Node 24, React, Vercel Functions, GitHub Actions, PostHog, Resend.

**Spec:** `docs/superpowers/specs/2026-11-27-portfolio-health-design.md`

## Global constraints

Use project 769787 only; preserve existing security and privacy controls. No real email or voice session during automated tests. No new paid services, raw exception reporting, credentials in source/output, or destructive cleanup. Shared event interfaces are defined in the spec.

## Review focus

- Website outage must remain observable when its own host cannot ingest events.
- A client must never spoof server contact errors or synthetic uptime through the public analytics API.
- Error callbacks, retries and intentional voice closure must not create duplicate or false incidents.
- Monitor missing configuration and missing data must not appear healthy.
- All telemetry failures must remain bounded and nonfatal; no private fields or error messages can escape.

### Task 1: Strict contracts, server errors and readiness

Root owns `shared/healthTelemetry.js`, `server/portfolioAnalytics.js`, `api/analytics.js`, `api/contact.js`, `api/health.js`, associated Node tests and documentation. Write failing tests for strict schemas, trust boundaries, readiness and mail/verification failures; implement minimal changes; verify privacy and existing contact behavior. No provider test messages.

### Task 2: Independent cloud monitor

Monitor agent owns `scripts/monitor_portfolio_health.mjs`, `.github/workflows/portfolio-health.yml` and `tests/healthMonitor.test.js`. Implement fixed safe probes with deadlines, retry before confirming failure, no arbitrary external requests, and direct PostHog ingestion with the contract above. Expose importable functions for fake-network tests. Fail visibly when capture/configuration is unavailable. Print only fixed summaries. Use pinned official actions, least privilege and about five-minute scheduling. No credentials, builds, pushes or deployment changes by the agent.

### Task 3: Browser and voice health reports

Browser agent owns `src/lib/healthReporting.js`, `src/main.jsx`, `src/components/LiveAgentSession.jsx` and dedicated Node/browser tests. Implement a small strict reporter through `/api/analytics`, respecting the existing analytics flag/DNT/GPC and bounded per-page dedup. Only fixed codes; never inspect/send error messages, stacks, forms, transcripts or URLs. Exclude permission denial/normal termination. Verify initialization failures cannot prevent app rendering. Coordinate builds; do not edit the shared contract or server code.

### Task 4: Private dashboard and alerts

Root inspects existing templates/catalog/insights, provisions a private health dashboard with verified native queries, configures encrypted monitor credentials without exposing them, and enables the selected hourly error alert and fixed email destination. Record actual IDs, cadence and limitations in `docs/health/`. Verify an actual safe monitor run and dashboard data; exercise alert decisions against isolated fixtures and labelled setup email tests without producing fake live incidents.

### Task 5: Review, release and live verification

Obtain a fresh privacy/security review. Run complete Node/Python tests, security audit, build and relevant production/browser suites after integration. Commit/push, confirm CI and Vercel READY, verify live health/security checks and the cloud monitor. Report dashboard link, actual alert destination/cadence and remaining limitations.
