# Project shortlist release — November 28, 2026

## Delivered behavior

- Visitors can shortlist up to three published case studies from project cards, case pages or the comparison selector at `/projects#project-shortlist`. Alex, command search and featured work link here.
- Comparison shows the actual role, responsibilities, stack, outcome and published status. Private-source and development caveats remain intact. All 20 case studies can be selected, including Alex/Hasti and Zalio CRM.
- Public selections survive same-tab route navigation/reload in bounded sessionStorage, with an in-memory fallback. Share links contain only validated canonical project slugs. Existing query text, contact data and visitor notes are excluded from copied links.
- Text/print exports reuse existing safe document tools. Preparing an enquiry stages an editable draft without sending it and preserves existing subject/message text for manual merging.
- Fixed existing loss of unsent contact drafts during internal browsing. Bounded private fields stay in page memory, never browser storage/URLs/telemetry. Send start clears the navigation copy; version checks protect newer edits from old request failures and old successes do not erase newer drafts. Full page reload clears private draft memory.
- No new dependency, backend endpoint, provider or analytics event. The full comparison, exporter and detailed study data are lazy; homepage entry grew from approximately 321.08 to 325.88 kB uncompressed.

## Verification

- `npm test`: **245 Node + 2 Python passed**.
- Configured production build passed with metadata for **23 routes**. Comparison (~8 kB), document tools (~5.4 kB) and detailed study data (~22.4 kB) remain separate lazy chunks.
- Root-owned source matrix: **60/60 passed** across Chromium, Firefox and WebKit. Includes maximum selection, cross-route/reload persistence, shared-link normalization/history, filters, denied/malformed/oversized storage, clipboard denial/races, exports, 320px both themes, focus after removal/clear, contact draft preservation, slow/blocked contact sends and old success/failure versus newer draft races. No real contact message was delivered.
- Final production browser suite: **85/85 passed**, including two new comparison/export/private-draft flows and existing voice transcript, enquiry, booking, health, privacy, media/performance, GitHub calendar and recruiter-summary checks.
- Independent review found and resolved one clipboard race: returning to an earlier selection could revive a permanently pending copy button. Its regression failed before the selection-change reset and passed after correction. Review also confirmed the private draft cache boundaries and stale-request version checks. No remaining actionable finding.
- Normal-browser final build verified real project content, three-column comparison, native selector add/remove and light/dark presentation. Automated phone coverage is browser-based; no physical-device or full screen-reader certification is claimed.

## Publication

- Source **3c1b7f56717689275b94c59db73960af2b10eee2** pushed to `origin/main`.
- [Security CI 46091943167](https://github.com/CharlieJamesGwapo/portfoliobboy/actions/runs/46091943167) passed, including the new public-sharing/private-draft boundary gate.
- Matching production deployment **portfoliobboy-5yriz5abl-charlie-james-projects.vercel.app** reached **READY**. Deployment metadata matched the exact source SHA; inspection of `portfoliobboy.vercel.app` resolved to that deployment and confirmed the alias.
- Live `/projects?compare=alex-hasti,zalio-crm,oneride` document, entry bundle and lazy comparison chunk returned **200**. A normal browser displayed all three projects and exercised remove/add back to a complete selection. The comparison was left open for the owner.
- In a separate temporary public tab, **Prepare an enquiry** opened the editable contact message containing Zalio CRM and its canonical case link within the 5,000-character limit. **Send message was never clicked**; the temporary tab was closed afterward, discarding that generated draft.
- The live read-only security audit passed **17/17** checks. Only root-owned local dev/preview servers were stopped. No real enquiry, booking, voice call, alert email, credentials or private repository data was needed.
- Staged repository/header/sharing/private-cache checks also passed **25/25** before the source commit.
