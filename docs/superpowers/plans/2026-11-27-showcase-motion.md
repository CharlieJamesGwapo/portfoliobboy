# Showcase Motion Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan inline, followed by one fresh code review.

**Goal:** Make project exploration feel carefully designed while keeping every route and interaction usable.

**Architecture:** Extend the existing shared reveal observer and CSS motion layer. Use local carousel direction state, native anchor scrolling and progressive view timelines; no new dependencies.

**Tech Stack:** React 18, Vite, CSS, IntersectionObserver, native View Transitions, Playwright.

**Spec:** docs/superpowers/specs/2026-11-27-showcase-motion-design.md

## Global Constraints

- Keep hero readable on first paint and entrances under 900 ms.
- No autoplay, perpetual decorative animations, additional scroll listeners or new dependencies.
- Honor reduced motion dynamically and reveal focus/deep-link targets immediately.
- Preserve voice, booking, exports, tracking, deferred media and all routes.
- Support 320 px screens and 44 px touch controls.

## Review Focus

- Preference changes during unfinished reveals must not leave invisible content.
- Keyboard focus into an offscreen card must expose its content immediately.
- Repeated carousel changes must maintain direction, selected tabs and focus.
- Cold fragments, repeated section links and history must land on visible targets.
- Motion must not introduce overflow or block project evidence and assistant controls.

### Task 1: Choreographed showcase and safe navigation

- [x] Add browser regressions for directional motion, runtime preferences, focus, section navigation and small screens; observe relevant failures.
- [x] Refine `Hero.jsx`, `HeroProjectCarousel.jsx`, `ProductStudioPreview.jsx`, `motion.css` and stylesheet ordering for hero choreography, layered project reveals, hover feedback and progressive depth.
- [x] Update `main.jsx`, `ScrollReveal.jsx`, `sectionNavigation.js` and anchor handling in `App.jsx` for preference changes and immediate focused/deep-linked content.
- [x] Adjust the existing headline content assertion and run targeted browser checks.

### Task 2: Verify, review and release

- [x] Run unit/content checks, production build and relevant full Chromium suites.
- [x] Check motion in Firefox/WebKit and inspect desktop/mobile screenshots.
- [x] Obtain one independent code review and address material findings.
- [ ] Commit, push, wait for production READY, verify the deployed build and show the updated portfolio.

## Execution ledger

- Starting commit: 31666c754dc2a78dd01d36841fcb965e1d9d8b80; checkout clean on main.
- Ruling: implement in the existing clean checkout and release under standing user authorization; no repository or generated-output deletion.
- RED: initial motion regressions failed for missing directional travel, runtime preference handling, focus visibility and the old headline (5 failures, 1 existing navigation pass).
- GREEN: all 8 initial focused checks pass after implementation and fixes; 134 Node checks plus 2 Python checks pass; production build emits all 23 routes.
- Independent review identified disclosure focus toggling, prematurely consumed section reveals, keyboard wrap direction and an instant-scroll override on case-study fragments. Fixed all four; disclosure and direction regressions observed failing before the fix. Added a case-study smooth-scroll/history regression to the full run.
- Visual inspection: desktop 1440 px, phone 390 px; project evidence and CTAs remain readable, with no added decorative autoplay.
- Final interaction ruling: capture the pointer target so focus does not snap a card between pointerdown and click. Keyboard/programmatic focus still bypasses pending entrances. The existing real-click regression failed before this guard and passed three consecutive runs afterward; independent event traces confirmed desktop click and mobile touch navigation.
- Final review: no material findings remain. Unsupported-IntersectionObserver rendering was checked directly and all reveal content stayed visible.
- Cross-browser verification: all 18 motion checks passed in Firefox and WebKit; all 20 earlier hero layout/control checks passed in those engines. Cross-engine fragment checks allow each engine's scroll-margin behavior while requiring a visible destination, focus and a single smooth-scroll request.
- Final production-preview verification: all 56 Chromium checks passed, with voice/analytics enabled and the public scheduler stubbed by the browser harness. No real call, appointment or email was created.
- Final development run: 145 checks passed; the mobile greeting expectation timed out once. The isolated check then passed three consecutive runs, and a direct mutation trace confirmed the greeting appears 1.2 seconds after leaving the hero. No greeting implementation was changed. All 146 development cases were exercised successfully across that run and its targeted reruns.
- Final unit/build verification: 134 Node and 2 Python checks passed. A presentation-only indentation adjustment produced identical tested production HTML and asset hashes.
