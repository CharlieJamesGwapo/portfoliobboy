# Public GitHub activity and custom-build count

Display the owner's requested **70+ Custom builds** in the hero. This is an owner-supplied count, distinct from public repository and contribution totals. The selected case studies remain evidence for individual projects, rather than the full inventory.

Add a native, branded GitHub contribution calendar at `/#github`, inspired by the supplied GitHub screenshot. Show current/previous UTC calendar years, the actual public total, month/day labels, a green intensity legend, keyboard/touch day details, public repository count when available, fetch timestamp and direct profile link. Fetch on approach to the section, preserve a stable anchor and contained horizontal scrolling at 320px. Respect existing themes, reduced motion, focus navigation and media performance.

Use anonymous, fixed GitHub public URLs through a same-origin GET/HEAD function. No credentials, private repository details, external browser requests or injected HTML. Validate and normalize upstream calendar data, bound requests and bodies, coalesce fetches and cache successes hourly. Only this public response can use CDN caching; contact, analytics and health remain private/no-store. Failures show a useful retry/profile fallback. Last-good fallback must retain its original timestamp and say it is stale.

The public contribution HTML is an upstream dependency with no stable API contract; fail closed if markup changes. GitHub controls which contributions it publishes, including anonymous private counts if the owner enables them. Published activity is not a quality score or a count of delivered projects. No hard-coded screenshot total, organizational badges or private/client metadata.

Add navigation and Alex links to the calendar without teaching the local assistant to invent live totals. Test data parsing, bounded failures, query/method restrictions, cache freshness, year races, mobile/keyboard/theme interactions and existing conversion paths. Push and deploy under the user's standing release authorization after verification.
