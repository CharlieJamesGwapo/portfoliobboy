# GitHub activity release verification — November 28, 2026

## Behavior

- Hero shows **70+ Custom builds**, explicitly supplied by the owner, separate from public repositories/contributions and the selected case-study inventory.
- `/#github` displays the current/previous UTC calendar years with actual totals, intensity levels, daily details, one calendar tab stop, arrow/Home/End navigation, a 44px date inspector, internal phone scrolling, both themes, profile links and timestamps. Navigation, command search and Alex link here; Alex does not invent live totals. GitHub Actions questions retain deployment answers and commercial claims retain their guard.
- The same-origin feed uses fixed anonymous GitHub URLs. No tokens, visitor cookies, private repository metadata, browser embeds, injected HTML, CSP expansion or new dependencies.
- Full-year/date/count/sum validation, bounded bodies, six-second deadlines, hourly coalescing/cache, failure backoff and at-most-24-hour last-good data with unchanged timestamp. Only fresh public data is CDN-cacheable. Stale/error responses override all three cache headers with no-store; other APIs remain unchanged.

## Verification before publication

- Final `npm test`: **228 Node + 2 Python passed**. Staged repository/header/feed/helper checks: **25 passed**.
- Configured build passed; **23 prerendered routes**, entry bundle about **321 kB uncompressed**.
- Production Chromium: **83/83 passed**, including Alex lifecycle, transcript, brief/booking/contact drafts, health reporting, privacy and performance. After the final reserved-space CSS, **15 affected calendar/mobile/performance checks passed**. After the End-key ES2020 compatibility adjustment, **2 built-calendar checks passed** again on the final bundle.
- Cross-browser source mobile accessibility/theme/navigation/project-showcase/calendar matrix: **122/123 initially passed**. The sole failure was a new loading-space test reusing the same hash/document at its second viewport and retaining loaded state. The test now forces a fresh document per viewport; the corrected scenario passed across all three engines, including an independent root rerun of the previously failing Chromium case. No remaining failing scenario.
- Independent calendar tests: **12 behavior + 3 reserved-space checks passed** across Chromium, Firefox and WebKit.
- Independent code review resolved stale-CDN age extension, rejected-body cleanup and undersized touch inspection; final review found no actionable issues. End-key navigation works without Array.findLastIndex; its compatibility regression was observed failing and passing after correction.
- Anonymous GitHub reads verified **10,316 contributions / 365 days for 2026**, **75 / 365 for 2025**, and **70 public repositories** at verification time. A normal browser displayed both real totals and both themes. Independent 320px touch smoke confirmed date inspection, contained scrolling, year switching and no page errors.

## Limits

GitHub's public contribution HTML is an upstream dependency. Markup changes/outages fail closed into retry/profile fallback. Published activity can include anonymized private counts when enabled by the owner; private repository names/code are never fetched. GitHub may take up to 24 hours to publish eligible activity ([GitHub documentation](https://docs.github.com/en/account-and-profile/how-tos/contribution-settings/troubleshooting-missing-contributions)). Refresh is on demand about hourly, not an event stream in an already-open page. Physical-device and full screen-reader certification were not performed.

## Publication

- Source commit **5bf00ea07d47753571e3dddc77ee7d7b562963be** pushed to `origin/main`.
- [Security CI 46090502239](https://github.com/CharlieJamesGwapo/portfoliobboy/actions/runs/46090502239) completed successfully, including the new feed/helper gate.
- Matching Git deployment **portfoliobboy-10equz5md-charlie-james-projects.vercel.app** reached **READY** with the public `portfoliobboy.vercel.app` alias. Metadata listed the exact source SHA; deployment inspection confirmed the production target and aliases.
- The public feed returned **10,318 / 365 days for 2026** and **75 / 365 for 2025**, with **70 public repositories**, at **2026-11-28 00:56 UTC**. The changed 2026 count demonstrates an upstream refresh rather than a hard-coded screenshot. Both totals matched their daily sums and the response contained only the documented aggregate fields.
- Repeat public-feed GET was an actual **Vercel CDN HIT**. Successful cache headers override the global no-store defaults only on this function. Extra query keys returned **400/no-store** and POST returned **405/no-store**.
- `npm run audit:site-security` passed **17/17** read-only live checks, including the unchanged private contact/analytics/health cache boundaries and origin restrictions.
- Normal-browser production verification showed the **70+ Custom builds** hero, **10,318** current-year calendar and **75** prior-year calendar. Year switching was exercised and the public calendar was left open at `https://portfoliobboy.vercel.app/#github`.
- Only the root-owned local dev/preview servers were stopped. No real visitor enquiry, booking, microphone session, alert email or private repository access was needed for these release checks.
