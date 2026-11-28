# GitHub activity implementation plan

Spec: `docs/superpowers/specs/2026-11-28-github-activity-design.md`. Execution is already authorized by the owner; independent server and UI work is delegated using the parallel development skill.

- [x] Feed: `server/githubActivity.js`, `api/github-activity.js`, `tests/githubActivity.test.js`. Red/green tests for full-year parsing, invalid markup/counts, fixed URL/no credentials, response/body deadlines, public-only fields, hourly caching/coalescing, stale age, method/query restrictions. Response: `{ username, profileUrl, year, updatedAt, stale, publicRepositories, total, days: [{date,count,level}] }`.
- [x] Calendar: `src/components/GitHubActivity.jsx`, `src/github-activity.css`, `src/lib/githubCalendar.js`, matching unit/browser tests. Native calendar, safe validation, lazy same-origin fetch, abort/race handling, year controls, accessible day inspection, scoped mobile scrolling and both themes. Stable section id `github`.
- [x] Integration: `src/App.jsx`, portfolio data, Navbar, command palette, Alex answers, `vite.config.js`. Set owner-provided 70+ Custom builds; mount calendar after featured work; provide navigation/Alex links; adapt the exact API route in local dev/preview for review. Test Alex links and the updated hero consumer.
- [x] Verify/review: run `npm test`, configured production build, new calendar browser cases across Chromium/Firefox/WebKit, relevant navigation/mobile regressions and production suite. Independently review parser trust boundaries, cache headers, keyboard behavior, date/timezone alignment and stale/error fallbacks. Fix concrete findings.
- [ ] Release: commit/push, confirm CI and matching READY production deployment, inspect live normalized feed/headers/years and browser calendar, run read-only security audit, record evidence and update CODEBASE.md. Verify final local/pushed/live SHAs and keep the live calendar open.

Review focus: source HTML cannot become executable content; future/year-boundary dates remain aligned; old-year responses cannot overwrite a new selection; errors cannot be cached as live data; confidential APIs stay no-store.
