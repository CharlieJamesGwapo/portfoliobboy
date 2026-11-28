# Project shortlist implementation plan

**Goal:** Let recruiters and clients select, compare, share and discuss up to three documented projects.
**Architecture:** Public case-study data and pure helpers; one shared session selection hook; inline comparison and existing document/contact flows. No new backend or provider.
**Spec:** `docs/superpowers/specs/2026-11-28-project-shortlist-design.md`

- [x] Pure model — `src/lib/projectShortlist.js`, `tests/projectShortlist.test.js`: normalization, max-three toggling, strict shared query parsing, canonical safe URL, document and enquiry generation. Write/run red tests, implement and verify green.
- [x] Interface — `src/lib/useProjectShortlist.js`, `src/components/ProjectShortlist.jsx`, `src/components/ShortlistButton.jsx`, `src/project-shortlist.css`, `tests/e2e/project-shortlist.spec.js`: shared session state with safe fallback, inline comparison, copy fallback, exports, enquiry staging, mobile/theme/keyboard behavior and action announcements. Test failure modes and stable focus.
- [x] Integration — Projects card controls and comparison, case-study controls, Alex and command search actions. Preserve existing project filtering/history, contact drafts and route loading. Add integration regressions and a built-bundle acceptance case.
- [x] Verification/review — full unit suite, configured build, new cross-browser scenarios and affected production regressions; independent review/fix loop. Record concrete results in CODEBASE.MD and quality notes.
- [ ] Publication — commit and push, confirm security CI and matching READY Vercel alias, exercise the public comparison/enquiry preparation without submission, record release evidence and verify clean/pushed/live state.

Review focus: shared links cannot contain private input; selections cannot smuggle arbitrary links or HTML; old contact drafts are retained; the three-project limit is consistent across tabs/routes; unavailable storage/clipboard must remain usable.
