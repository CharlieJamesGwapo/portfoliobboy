# Portfolio Security, Traffic and Cache Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline, then one fresh code review.

**Goal:** Harden the current portfolio's API boundary and cache freshness, add repeatable security checks, and prepare traffic protection within the existing plan.

**Architecture:** Share exact API-origin validation between contact and analytics. Keep hashed bundles immutable but revalidate stable font/media names. Preserve private API responses and use the existing Vercel CDN/firewall and GitHub security features.

**Tech Stack:** React/Vite, Node APIs, service worker, Vercel Hobby, GitHub Actions, Node tests and Playwright.

## Constraints and design

- Preserve Alex, voice, contact, booking, exports, SEO and offline resume access.
- No real email, appointment, voice session, load test, secret disclosure, paid upgrade or additional CDN.
- Canonical production and explicitly configured deployment origins only on hosted APIs; loopback origins remain development-only.
- Only content-hashed bundles use permanent browser caching. Stable media/fonts refresh, and private responses never enter offline caches.
- Preserve the existing rate-limit rule. Hobby has one rate-limit slot; stage a contact POST observation rule and bot observation without weakening existing enforcement.
- Firewall changes remain drafts until the user approves the concrete diff, as required by the Vercel firewall skill. No site-wide challenges or Attack Mode.
- GitHub CI uses read-only permissions, pinned official actions and no production secrets. Dependency updates create reviewable PRs, never automatic merges.

## Review focus

- Hosted localhost-origin bypass and preview-origin exactness.
- Stable cached font updates and offline fallback; private responses excluded.
- No analytics/contact content in cache or traffic reports.
- Security checks reproducible without credentials or sending requests to providers.
- Firewall draft preserves prior controls and does not block legitimate visitors.

## Steps

- [x] Add failing regressions for hosted origins, cache freshness and private-cache exclusion.
- [x] Share origin policy, correct cache headers/service-worker policy, add API no-index headers.
- [x] Add pinned security CI, dependency update configuration and reusable live header/origin audit.
- [x] Prepare and inspect firewall observation draft; verify GitHub security settings.
- [x] Run unit, build, production/browser checks, with independent review; live acceptance follows deployment.
- [x] Commit, push and verify production; obtain separate firewall publication approval and verify active configuration.

## Baseline evidence

- Starting revision: 5e95e09551ffc5ece2f59aa41d19c884280e97bc; checkout clean.
- Vercel firewall enabled, Attack Mode off, no existing draft. Existing rule protects POST /api/chat and /api/portfolio-chat at 5 requests/IP/60 seconds; neither path is a current source endpoint. Preserve it for older deployments.
- Snapshot period 2026-11-26 00:00 UTC to 2026-11-27 01:00 UTC: approximately 1,550 allowed HTTP requests, not unique visitors; no mitigations recorded. This does not establish absence of attacks or prove load capacity.
- Live CDN HIT observed for root and hashed bundle; API errors have no-store headers; static documents use revalidation.
- npm production dependency audit: 0 reported advisories. Stable /fonts names currently use one-year immutable browser caching and service-worker cache-first.

## Verification and operational handoff

- RED/GREEN: hosted localhost origin acceptance, stable font cache-first behavior, private response caching, and missing font fingerprints were demonstrated by failing tests before fixes. A review found incomplete CORS auditing; its false-positive fixture failed before the header checks were added.
- Final local checks: 146 Node checks, 2 Python checks and all 56 production Chromium checks passed. Additional Firefox/WebKit checks passed 6/8. Both WebKit failures reproduce on the currently deployed 5e95e09 baseline as well as the new build: hidden archive images are fetched, and offline PDF fetch reports Load failed despite a populated resume cache. These are documented pre-existing limitations, not claimed as passing or fixed. The exact CI security command passed 43 checks. Build emitted metadata for 23 routes; all-dependency and production-only npm audits reported zero known advisories.
- Font URLs now carry checked SHA256 prefixes, with the preload matching CSS. This bypasses previously immutable stable URLs while keeping offline update activation under the visitor's control.
- Independent review found no remaining material findings after the CORS audit correction and font fingerprint changes.
- Read-only live audit before release reproduced the old font/media TTLs, missing API no-index headers and permissive localhost preflights. Its HEAD/OPTIONS requests did not submit mail or record analytics events.
- GitHub vulnerability alerts and Dependabot security fixes enabled and verified; existing secret scanning and push protection remain enabled. New scheduled/push/PR CI uses pinned official actions, no persisted checkout credential, read-only permissions and no production secrets.
- Firewall draft contains exactly two observation changes: POST /api/contact logging and managed Bot Protection log mode. Legacy 5/IP/minute rule is unchanged. Publishing awaits specific user approval; log mode does not block bots or replace distributed rate limiting. The Hobby one-rate-limit constraint and direct ElevenLabs provider controls remain documented limits.
- Built-in firewall/request metrics and existing sanitized outcome analytics are retained; no paid custom-metric or observability upgrade was added.
- Release accepted: source commit 1d8dc787eb5eed92157cb8b1a2ed1c8b231d2558 deployed READY, GitHub Security checks run 45920155237 succeeded, all 16 live header/cache/origin checks passed and versioned live fonts returned HTTP 200.
- The user explicitly approved publishing both monitoring settings. Rechecked that the draft still contained exactly the reviewed changes, published firewall version 3, verified contact POST logging and managed Bot Protection log mode active, preserved the original rate-limit action/conditions and confirmed no remaining draft. All 16 live checks passed again after publication.
