# Security

Report a portfolio vulnerability privately to **capstonee2@gmail.com** or use this repository's private vulnerability reporting when available. Include the affected URL, a description and safe reproduction steps. Do not post credentials, visitor messages or exploitable details in a public issue.

The supported website is https://portfoliobboy.vercel.app and the current `main` branch. Security fixes are released to that branch and deployed through Vercel.

## Maintainer checks

- `npm audit --omit=dev` checks published dependency advisories.
- `npm test` exercises repository protections, API validation, privacy, caching and portfolio behavior.
- `npm run audit:site-security` checks live headers, cache policy and origin preflights without sending mail or recording events.
- GitHub's security workflow repeats targeted tests and dependency auditing on pushes, pull requests and weekly. Dependabot proposes dependency/action updates for review; updates are not automatically merged.

## Traffic and provider limits

Vercel supplies CDN delivery and automatic DDoS mitigation. Contact and analytics handlers have bounded per-instance rate-limit backstops; these are not distributed counters. Inspect and approve project firewall changes separately. The Hobby plan allows one rate-limit rule per project, so preserve existing rules and inspect their scope before modifying them.

As of November 27, 2026, approved firewall version 3 records contact-form POSTs and runs managed Bot Protection in log mode. Monitoring does not block bots. The original rate-limit rule still covers legacy AI paths; this release does not add a distributed rate limit to the current contact or analytics endpoints. Review real traffic before tightening controls or reallocating the Hobby rate-limit slot.

The two-minute voice deadline in the browser is a UX limit, not a provider-side spending control. Keep the ElevenLabs agent's allowed domains, maximum conversation duration, concurrency and account budget configured in ElevenLabs. Those provider settings were not changed by this repository release.

Browser profiles, offline storage, API origins and CDN caching are separate layers. API/private responses never enter the portfolio's service-worker caches. Hashed bundles cache permanently; stable fonts/media refresh in the background; the stable resume and HTML prefer fresh network data. Service-worker upgrades wait for the visitor's update action to preserve drafts.

## Verified scope and remaining browser limitations

The release passed 146 Node checks, 2 Python checks, all 56 production Chromium checks, GitHub's security workflow and 16 live security checks before and after firewall publication. Full and production-only npm audits reported no known advisories. This records the checks performed, not a comprehensive penetration test.

Two additional WebKit checks fail on both the prior live version and this release: hidden archive images load eagerly, and the automated offline PDF fetch reports `Load failed` despite a populated resume cache. These existing behaviors were reproduced and remain documented limitations; they are not reported as passing. The online resume and Chromium/Firefox offline checks passed.
