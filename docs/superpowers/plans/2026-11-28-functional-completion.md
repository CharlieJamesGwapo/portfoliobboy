# Functional completion implementation plan

**Goal:** Complete Alex discovery-to-enquiry actions and fix demonstrated arcade failures.
**Spec:** `docs/superpowers/specs/2026-11-28-functional-completion-design.md`
**Architecture:** Reuse the lightweight public shortlist store and existing contact-intent flows; keep chat reset in panel memory. Isolate pure leaderboard validation/ranking helpers as needed. No new providers or dependencies.

- [x] Audit/reproduce — record subject overwrite, race ranking and corrupt-score failures with regression evidence; inspect existing voice/booking/navigation paths.
- [x] Recommendations — safe text/voice shortlist buttons using canonical allowlisted routes; pass existing close/stop lifecycle callbacks on navigation. Test maximum count, unknown URLs and route/call behavior.
- [x] Alex privacy/enquiries — preserve existing subjects in text and voice; add New chat that cancels pending replies, clears private panel state, releases voice and restores text focus. Test fresh state after reset, close/reopen, pending reply and independent contact/shortlist preservation.
- [x] Arcade — correct ascending lap ranking and time formatting; bounded local-data validation/read/write failure recovery; visitor-facing fallback. Mock remote data, no database writes during QA.
- [x] Verify/review — full unit suite, production build, affected cross-browser scenarios and full production browser suite; independent code review and normal-browser checks. Record results in CODEBASE.MD and a dated quality note.
- [x] Release — commit/push, verify CI and matching READY production alias, run live read-only security checks, exercise public features without sending messages or opening a real microphone session, record release evidence and leave the updated portfolio open.
