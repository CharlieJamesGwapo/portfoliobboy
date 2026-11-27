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

The one-minute voice deadline in the browser is a UX limit, not a provider-side spending control. Keep the ElevenLabs agent's allowed domains, maximum conversation duration, concurrency and account budget configured in ElevenLabs. Those provider settings were not changed by this repository release; the owner requested website-only work.

Contact POSTs use BotID Basic verification before accepting a message. Hosted verification failures stop delivery and leave the visitor's draft available alongside a direct email link. Only explicit, unhosted development bypasses verification. Verification, email delivery and optional analytics have bounded deadlines within the contact function's 20-second budget; the browser releases its sending state after 25 seconds even if a challenge stalls. An unchanged draft reuses a submission UUID, combined with its normalized content to produce a Resend idempotency key for retries.

Browser profiles, offline storage, API origins and CDN caching are separate layers. API/private responses never enter the portfolio's service-worker caches. Hashed bundles cache permanently; stable fonts/media refresh in the background; the stable resume and HTML prefer fresh network data. Service-worker upgrades wait for the visitor's update action to preserve drafts.

## Verified scope and remaining browser limitations

The November 27 stability update passed 159 Node checks, 2 Python checks, 56 targeted security checks and all 60 production-preview Chromium checks, including the one-minute voice deadline. All 51 contact/layout/audio checks passed across Chromium, Firefox and WebKit. Full npm audit reported no known advisories. These automated voice tests mock provider traffic and microphone input; they do not spend call credits. This records the checks performed, not a comprehensive penetration test.

A staged Vercel deployment served the real BotID challenge and rejected empty raw HTTP and headless-browser submissions with `BOT_VERIFICATION_FAILED`; those probes sent no email. Chromium and Firefox attached signed challenges with the expected route/method, and the hosted SDK read them without context errors. Deployment Protection stayed enabled throughout verification.

Normal-browser acceptance passed on November 27, 2026 at 10:07:50 PHT against release `27097c8`. After refreshing an older open tab, the real contact UI rejected empty required fields, then accepted one clearly labelled test enquiry through BotID and the email provider. The live request returned HTTP 200 (request `kqdzt-1795745270018-0072380db425`); the form displayed its success message, cleared its fields and re-enabled Send, with no browser errors. The test used the existing portfolio inbox and did not change protection settings. This confirms provider acceptance, not inbox placement or delivery for every visitor/browser configuration. Automated test suites continue to mock email delivery.

Hidden archive images now mount only after their collection opens, while project anchors remain available for navigation. All 24 browser stability checks pass across Chromium, Firefox and WebKit. The offline PDF check stops an isolated forwarding server and proves an uncached network request fails before comparing the cached PDF bytes; this avoids WebKit's offline emulator blocking service-worker dispatch. Production service-worker behavior and CSP were not weakened. Physical-device and operating-system offline acceptance remain separate from browser automation.
