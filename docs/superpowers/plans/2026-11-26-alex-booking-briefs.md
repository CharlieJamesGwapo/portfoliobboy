# Alex booking and briefs implementation plan

> **For agentic workers:** Execute inline using superpowers:executing-plans; obtain a fresh final review.

**Goal:** Add reusable booking, editable brief exports and accessible mobile controls to text and voice Alex, then verify and release.

**Architecture:** Small client-only booking/export helpers and shared components reuse existing contact intents. Visual viewport sizing is scoped to the floating panel. No backend, tracking contract or provider changes.

**Tech Stack:** React 18, Vite, native Clipboard/Blob/print APIs, Node tests, Playwright.

**Spec:** docs/superpowers/specs/2026-11-26-alex-booking-briefs-design.md

## Global constraints

- No visitor text in remote calls, analytics, booking URLs or browser storage.
- Public scheduler URL remains owner supplied. Requests never claim a reserved slot.
- Stop voice before booking; retain contact edits; no automatic sends.
- UTF-8 text download and browser-native Save as PDF preserve reviewed content.
- Do not delete files or generated directories during this task.

## Review focus

- Malicious or credential-bearing scheduler links must be rejected.
- Unicode and HTML-like visitor text must survive export as plain text.
- Popup or clipboard denial must leave an actionable fallback.
- Keyboard resizing must leave the editor and close control reachable.
- Voice booking during a pending microphone prompt must cancel late connection.

### Task 1: Shared booking and export primitives

Files: src/lib/booking.js, src/lib/projectBriefExport.js, tests/projectBriefExport.test.js, tests/booking.test.js.

- [x] Write and run failing URL, booking draft, Unicode and print escaping tests.
- [x] Implement `getBookingUrl(value)`, `resolveBookingConfiguration(value)`, `buildBookingRequest(option, brief)` and export helpers that preserve edits and use no storage/network.
- [x] Run focused Node tests to green.

### Task 2: Integrate text and voice; improve mobile layout

Files: shared assistant components, AssistantPanel.jsx, BriefReview.jsx, VoiceConversation.jsx, LiveAgentSession.jsx, portfolioData.js and scoped CSS.

- [x] Add shared booking selector and export actions, visible error/status messages and appropriate microphone cleanup.
- [x] Add native print document with explicit Save as PDF guidance and text-download fallback.
- [x] Add visual viewport sizing and wrapping 44px controls.
- [x] Verify downloads, exact edits, malicious text, nested-route handoff, clipboard/popup denial, scheduler navigation, voice cleanup and mobile geometry in Playwright.

### Task 3: Verify and release

- [x] Run complete unit tests, production browser tests and development Chromium tests; exercise new features in Firefox/WebKit.
- [x] Render and inspect mobile and printable artifacts. Run fresh review and address material findings.
- [x] Update CODEBASE.MD and environment documentation with actual booking readiness and export behavior.
- [ ] Commit, push, verify Vercel production build and run live smoke checks without real emails or appointments.

## Execution evidence

- Initial helper tests failed for missing modules, then passed after implementation.
- Fresh reviewer identified configuration leakage, landscape viewport anchoring, alternative new-tab microphone cleanup, subject preservation, local hostnames, and short Unicode exports. Configuration is now validated before bundling. Every reported behavior was addressed; four browser regression tests were observed failing before the fixes and passing afterward. No review findings were deferred.
- 128 Node and two Python checks passed. The full development Chromium suite passed 137 tests. The default production configuration passed 45 tests with the configured-scheduler case tested separately, and Firefox/WebKit passed 20 cases with their configured-scheduler cases subsequently exercised against the real configured URL in intercepted browser tests.
- Owner authorized Google Calendar setup through computer use and selected Monday–Friday, 9 AM–5 PM, Asia/Manila. Created a separate 15-minute Google Meet schedule, verified it signed out, and configured its public URL in Vercel production. No appointment or contact email was submitted by verification.
- Final configured build passed all 46 production Chromium tests and all 22 focused Firefox/WebKit tests, including actual configured-link behavior with intercepted scheduling responses. All nine contact-flow checks across Chromium, Firefox and WebKit also passed.
