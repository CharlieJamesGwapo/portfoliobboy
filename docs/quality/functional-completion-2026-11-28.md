# Functional completion release — November 28, 2026

## Changes

- Alex's text/voice evidence cards save canonical published projects to the shared maximum-three shortlist. Saving preserves the active call; View shortlist closes the mobile assistant and releases voice before navigation. Only public slugs are stored, never conversation text.
- Fixed text and voice enquiry reviews overwriting an existing contact subject. Both subject and message now remain for manual merging with the prepared draft.
- New chat clears private panel messages, mode drafts, edited briefs and used suggestions, cancels pending replies, unmounts voice and focuses fresh text input. Separate contact drafts and public shortlist selections remain intact. No new telemetry or browser persistence for private input.
- Middle-clicking voice evidence now releases audio; right-click leaves the call active.
- Fixed Pixel Racer ranking slower laps first. Racing uses ascending positive lap milliseconds and readable `m:ss.mmm`; point-based games retain highest-first ranking.
- Local leaderboard shape/row/size validation prevents corrupt JSON/data from throwing or leaving an endless spinner. Denied/quota-limited storage keeps a usable in-memory board. Remote scoreboard failures/timeouts fall back locally, with an eight-second bound and per-game retention. Developer environment setup copy is replaced with visitor-facing local-score information.
- Existing project claims, 70+ owner-supplied custom builds, GitHub feed, booking links, security headers and one-minute browser voice limit are unchanged. No new dependencies, credentials, schema or provider configuration.

## Validation

- Full `npm test`: **255 Node + 2 Python passed**.
- Configured production build passed; **23 metadata routes**, homepage entry **325.94 kB uncompressed**, versus 325.88 kB before this pass. Voice/game chunks remain lazy.
- Root source matrix: **63/63 passed** across Chromium, Firefox and WebKit. Covers new reset/privacy/pending-reply behavior, recommendation saving, shared limits, mobile navigation/focus, enquiry subject preservation, arcade recovery/ranking and existing assistant/arcade layouts.
- Full built production browser suite: **89/89 passed**, covering mocked voice permission/cleanup, late grant after New chat, save versus navigation audio lifecycle, subject/manual-merge flow, transcript, booking, downloads, shortlist, GitHub, health, privacy, performance and route regressions.
- Independent review found no actionable issues. Independently ran **10/10** affected route-validation/scoreboard mock tests and checked installed Supabase query-builder compatibility.
- Normal-browser built preview verified text recommendations, save state, readable controls in the fixed dark assistant on both page themes, and New chat feedback/focus with no remaining visitor messages.
- An early existing WebKit leaderboard focus scenario failed once; its focused rerun and the final root cross-browser matrix passed. No production code was bypassed for the test.

## Verification limits

Voice SDK and Supabase scenarios used isolated mocks, fake microphone tracks and local score fixtures. No real provider call, remote score write, enquiry, booking or alert email was sent. Provider quotas/availability and real-device audio are separate operational checks. The middle-click test verifies canonical href, new background-tab creation, transcript retention and released audio; headless Chromium independently opened background links as `about:blank`, so final middle-tab destination is not asserted. Existing left-click evidence tests still verify the actual case-study URL. No physical-device or full screen-reader certification is claimed.

## Publication

- Source **f7db80cf43c57b252a1a929cba55779fa1aa87a0** pushed to `origin/main`.
- [Security CI 46099109633](https://github.com/CharlieJamesGwapo/portfoliobboy/actions/runs/46099109633) passed, including the new recommendation allowlist/scoreboard recovery gate. Staged repository/header/affected mock tests passed **20/20** before commit.
- Matching deployment **portfoliobboy-gd8o9qpx8-charlie-james-projects.vercel.app** reached **READY**. The exact source SHA appeared in deployment metadata; public-alias inspection resolved `portfoliobboy.vercel.app` to this production deployment.
- Normal-browser public verification showed New chat clearing fresh test conversation state and focusing the general input, then Find projects rendering CRM recommendations with shared shortlist saved/add controls and View shortlist links. Alex was left open for the owner. No user-entered private history was cleared: the live test began after a fresh page reload with a public test prompt.
- Read-only live security audit passed **17/17**. Voice/Supabase service behavior remains covered by mocks rather than a production provider transaction; no real enquiry, call, remote score or booking was sent.
- Only root-owned dev/preview servers were stopped; temporary verification tabs were closed. No source/personal files, credentials, browser history or databases were deleted.
