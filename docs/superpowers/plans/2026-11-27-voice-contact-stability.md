# Voice, Contact and Browser Stability Plan

**Goal:** Finish the portfolio's remaining voice-provider safeguards, contact bot verification and cross-browser stability fixes under the user's authorization to improve, test, push and deploy.

**Approach:** Use Vercel BotID Basic only for contact POSTs. Diagnose the existing WebKit lazy-image and offline-PDF failures before changing browser/cache behavior. Use the dispatching-parallel-agents skill for independent implementation scopes, then one fresh review. The user subsequently requested website-only work when Chrome could not connect: ElevenLabs account settings are excluded from this release.

## Constraints

- Preserve Alex's text/voice, booking, briefs, recruiter exports and tracking.
- Voice: provider-side 60-second maximum (user updated the request to a one-minute public demo); exact portfolio production hostname; retain necessary existing trusted hostnames after inspection. Start with one concurrent conversation and ten daily calls, retaining stricter existing values. Do not enable paid burst/overage modes, purchase a plan, alter unrelated agents or workspace-wide billing.
- Contact: free Basic bot checks before mail provider access; local development remains usable; unavailable verification must preserve the enquiry and offer the existing email fallback. Automated suites send no real email. The owner's follow-up normal-browser acceptance request was checked with one clearly labelled test enquiry to the existing portfolio inbox.
- No live microphone conversations, load tests, credential output, destructive cleanup or source-file deletion.
- Existing WAF bot/contact observation and legacy rate-limit rules remain unchanged. Paid Deep Analysis is excluded.
- Capture real failure evidence, verify fixes across engines and distinguish website bugs from automation limitations. Do not weaken assertions or silently skip failures.

## Ownership and checks

- Root: ElevenLabs UI settings, integration/release, documentation, production checks and any necessary final review.
- Contact agent: BotID dependency and client/server setup, contact error handling/deadlines, associated tests and any narrowly required CSP/config changes. Notify the stability agent after dependency installation; do not build concurrently with its build.
- Browser agent: project archive/media mounting, service worker/offline behavior and relevant regression tests. Use a dedicated server port and coordinate builds. Do not edit contact/BotID/provider files.

## Completion

- [x] Set and test the website's one-minute voice deadline. Provider settings deferred at the user's explicit request for website-only work.
- [x] Implement and verify contact bot protection with no-provider-access failure paths. Hosted challenge routing and automated-client rejection checked; normal-browser admission and provider acceptance passed on November 27 at 10:07:50 PHT.
- [x] Diagnose and fix WebKit image-loading/offline-PDF failures with useful regressions.
- [x] Integrate changes, run unit/security/browser checks and obtain independent review.
- [x] Push, confirm GitHub CI and Vercel READY, verify live security and relevant interactions. Release `27097c8`, security run `45925174366`, all 16 live security checks and four deployed voice regressions passed. The subsequent normal-browser contact submission returned HTTP 200 without weakening protection.

Starting commit: 30ab0ca7808f7b6a646d860cf46c5e5fad3e7595; checkout clean on main. Authorization includes the user's current request and prior test/push/deploy instructions. Private sign-ins stay with the user.
