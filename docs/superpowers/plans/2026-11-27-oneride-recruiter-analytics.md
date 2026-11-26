# OneRide, recruiter export and tracking implementation plan

> **For agentic workers:** Execute inline using superpowers:executing-plans and obtain a fresh final review.

**Goal:** Improve OneRide evidence, provide local recruiter reports and expose privacy-preserving export/booking action counts in the existing personal dashboard.

**Architecture:** OneRide-specific story data and component extend the common case-study page. Generic local document helpers retain project-brief compatibility and power recruiter export. The existing strict analytics contract gains three event schemas; the existing dashboard gains three total-count tiles.

**Tech Stack:** React 18, Vite, browser Blob/Clipboard/print, Node, Playwright, native PostHog Trends.

**Spec:** docs/superpowers/specs/2026-11-27-oneride-recruiter-analytics-design.md

## Global constraints

- No invented OneRide metrics, private screens or recordings.
- No recruiter requirements or brief content in network, storage or analytics payloads.
- Native print is explicitly labelled Save as PDF; no claim of completed OS file saving.
- Booking clicks do not imply a reserved appointment. Respect privacy flags and analytics outages.
- Only the existing personal PostHog project 769787/dashboard 2416983 may be updated. Sharing stays private.
- Do not delete files or generated directories as cleanup.

## Review focus

- Mixed/negated recruiter requirements must retain uncertainty in exported content.
- Malicious text and long Unicode documents must render safely across multiple print pages.
- Blocked exports and right-click menus must not report successful export/booking actions.
- Voice and text-fallback actions must use the right fixed surface and retain microphone cleanup.
- OneRide screenshots must remain legible and correctly described at 320px and in dark mode.

### Task 1: Evidence and local exports

- [x] Add and run failing tests for recruiter report content and strict new event schemas; add official-asset story and export-safety checks.
- [x] Implement OneRide walkthrough/contributions/evidence and recruiter export with shared document actions; preserve existing project-brief APIs and labels.
- [x] Verify unit and focused browser tests, Unicode/multipage PDF and mobile layouts.

### Task 2: Tracking and private dashboard

- [x] Add strict event schemas and fixed booking IDs; verify malformed/private payloads are rejected.
- [x] Wire successful brief text requests, opened print views and real scheduling-link activations with correct surfaces; preserve privacy and failure behavior.
- [x] Inspect catalog/dashboard, validate typed count queries, add three native insights and proposed catalog definitions, and preserve all existing tiles.
- [x] Update the local dashboard manifest and documentation with exact IDs and event boundaries.

### Task 3: Release

- [x] Run complete unit/production/development Chromium checks and focused Firefox/WebKit checks.
- [x] Obtain fresh review and resolve material findings with regressions.
- [ ] Commit, push, wait for production and verify the live page, exports, microphone cleanup and actual PostHog ingestion.

## Verification evidence

- Public Google Play listing and product website fetched on 27 November 2026. Service labels corrected against those sources; the site’s beta status and the screenshot’s empty orders state are explicit. No fabricated performance or adoption results were added.
- Recruiter/schema tests failed before implementation, then passed. Review identified native 4,000-character paste truncation and loss of Unicode qualifiers. Both were reproduced with failing tests and corrected. A trailing-whitespace paste regression was also observed failing in Chromium before preserving the raw input boundary; it now passes across browser engines.
- Final unit suite: 134 Node and two Python checks. Final production Chromium suite: 56 checks. Final focused Firefox/WebKit suite: 16 checks. Recruiter PDF rendered across two A4 pages, retaining Unicode and displaying markup as text. Mobile/dark walkthrough captures inspected.
- The final development Chromium suite passed all 137 checks after the raw-input coverage correction. All required local checks passed before commit.
- Personal dashboard retains all nine original tiles and adds three count tiles at row 16, for twelve tiles total. Eleven native insights and eight proposed catalog definitions are present; public sharing remains disabled. All three new fresh pre-release count queries returned zero.
- No review findings were deferred. Native browser middle-click creates a background page without an opener; tests observe the browser context rather than assuming an opener-linked popup.
