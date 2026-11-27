# Portfolio Health

[Open the private health dashboard](https://us.posthog.com/project/769787/dashboard/2419841).

The dashboard belongs to **Charlie Abejo Portfolio**, project **769787**, alongside the existing enquiry-outcomes dashboard. It shows observed homepage availability, monitoring coverage, failed checks, fixed error categories, accepted enquiries and trends. The default range is 24 hours; reporting timezone is UTC. These are observational metrics, not approved business definitions or a continuous-uptime guarantee.

## Checks and alerts

GitHub's `Portfolio health` workflow runs about every five minutes (offset from the top of the hour). It checks the canonical homepage, its validated same-origin entry bundle, contact and analytics preflights, and `/api/health`. Requests have deadlines and one failed-probe retry. It never sends a contact enquiry, starts voice, or probes a visitor-supplied URL. Readiness checks configuration, not live provider delivery. GitHub scheduling may be delayed or disabled after repository inactivity; missing check data means unknown coverage.

Each result is sent directly to PostHog from GitHub, so an unavailable portfolio can still be recorded. The ingestion key is an encrypted repository secret named `PORTFOLIO_MONITOR_POSTHOG_KEY`. Approximately 1,440 synthetic samples are produced per day at the intended cadence. This public repository uses GitHub-hosted runners; no paid monitoring plan was enabled.

The owner selected **capstonee2@gmail.com** for email alerts:

- Confirmed availability-check failures or failed monitor capture send a fixed summary through Resend. Repeated attempts use an identical UTC-hour idempotency key and body, limiting delivery to one outage message per UTC hour. A persistent problem may produce another message in the next hour. Recovery emails are not implemented.
- PostHog checks technical-error reports **hourly**, firing above zero in the current hourly interval. Its internal destination sends a fixed summary to the same inbox when the alert enters Firing. No other connected-account email is subscribed.
- `workflow_dispatch` with `test_email=true` sends one labelled setup test without fabricating an incident. Setup test retries reuse a daily idempotency key. Routine scheduled runs do not send setup tests.

The dedicated Resend key **Portfolio health alerts** has Sending access only. It is stored in `PORTFOLIO_MONITOR_RESEND_KEY` on GitHub and encrypted `secret_headers` on the PostHog destination. The existing contact-form key is unchanged. Keys are never committed, put in URLs, included in summaries, or added to the browser bundle.

Native configuration:

- Error insight: `14710422` / `laovJVD3`.
- Hourly alert: `01a21b39-2ec1-7f69-bdf4-c9f0c4ad247f`.
- [Fixed email destination settings](https://us.posthog.com/project/769787/functions/01a21b3b-4ef8-0000-0959-e9212f430584).
- [Dashboard definition and layouts](dashboard.json).

## Privacy and trust

`portfolio_health_error` contains only fixed `surface` and `code` values. `portfolio_uptime_checked` contains only fixed target/status/latency-bucket/source values. No messages, transcripts, audio, form fields, names, emails, IP addresses, URLs, user agents, raw exceptions or stack traces enter these reports. The public endpoint rejects synthetic uptime and server-contact error claims. Browser reports remain untrusted observations, not proof of a service outage.

Browser reporting respects the existing analytics enable flag, Do Not Track and Global Privacy Control. It sends at most eight unique categories per page and never queues private data. Server contact reports also respect privacy headers and deduplicate each fixed failure category to at most once per minute per function instance. Counts can undercount; they are not exact failed-enquiry totals. Contact/voice actions remain usable if monitoring fails. Permission refusal, deliberate endings, goodbye and demo duration limits are excluded from service-error reporting.

Email bodies are constant summaries with private-dashboard and workflow links. The PostHog webhook explicitly replaces the default event/person body, encrypts its Authorization header and leaves debug logging off. A mocked invocation with private canaries verified that no canary reached the outgoing body.

## Verification and maintenance

Run `npm test`, `npm run build`, production browser suites, and `npm run audit:site-security`. The audit now includes the uncached health endpoint (17 safe checks total). Monitor and email tests use fake networks and never send real mail. Test real delivery only with the explicit setup-test input; do not manufacture a production outage or ingest fake visitor errors.

Inspect the Actions workflow and the latest dashboard samples after deployment. Keep `POSTHOG_API_HOST` on its existing regional allowlist and both monitor credentials as repository secrets. A failing monitor job remains failed even when its notification email is accepted. Email-provider acceptance does not prove inbox placement; confirm any live setup email separately.

### Release verification — 27 November 2026

Application release: `f9cd08dad11d125dd26e37a6a33d862448743955`, pushed to `main` and deployed READY at [the public portfolio](https://portfoliobboy.vercel.app/).

- All 197 Node tests and two Python tests passed. The production Chromium suite passed 75 cases with one optional scheduler case skipped; that remaining case then passed separately with the configured public scheduling link.
- The production build, dependency audit (zero vulnerabilities), and all 17 safe live security checks passed. [Release CI](https://github.com/CharlieJamesGwapo/portfoliobboy/actions/runs/45940110819) succeeded.
- The first [independent cloud monitor run](https://github.com/CharlieJamesGwapo/portfoliobboy/actions/runs/45940158609) succeeded. All five actual probes reported `up` / `fast`, and the private dashboard queries received these results without warnings. This is an initial observation, not evidence of a full day of uptime.
- The live readiness endpoint returned HTTP 200 and fixed `configured` states for contact, analytics and voice. No actual voice session or contact submission was required by these probes.
- Resend reported the labelled setup email **Delivered** to the selected inbox. The PostHog destination also completed a real setup transport invocation successfully, using the same fixed setup body and daily idempotency key to avoid an extra message. The saved production destination retained its technical-error summary.
- The hourly alert was enabled with no other account-email subscribers and was **Not firing** when checked. Its mock privacy test excluded private canaries from the outgoing request. No outage or visitor error was fabricated in production.

The sending-only key creation and encrypted GitHub/PostHog storage were explicitly approved by the owner. Delivery status above is the provider's confirmation; the owner has not yet confirmed reading this new setup message.
