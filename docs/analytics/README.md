# Portfolio outcome analytics

## Current activation state

The collector and browser hooks are implemented. **Live project configuration and dashboard provisioning are pending the owner's PostHog project selection.** The connected organization observed during setup was `zalio`, with one allowed non-demo project named `Default project`. No portfolio events were sent there and no dashboards, insights, settings or subscriptions were changed.

The portable [dashboard definition](portfolio-dashboard.json) contains five outcome totals, daily action trends, and project/starter breakdowns. It is a definition ready for the selected project, not a screenshot of collected data or an already provisioned dashboard.

## What is counted

| Event | Recorded boundary | Permitted properties |
| --- | --- | --- |
| `portfolio_voice_started` | SDK reports an established connection | fixed `surface` |
| `portfolio_starter_used` | A named starter is submitted to voice or the local text guide | fixed `surface`, `starter_id` |
| `portfolio_project_opened` | Visitor selects a published evidence card | fixed `surface`, canonical `project_id` |
| `portfolio_enquiry_reviewed` | Visitor explicitly transfers an edited enquiry to contact | fixed `surface` |
| `portfolio_contact_submitted` | Contact API receives successful acceptance from the email provider | `surface: contact`; server only |

The public analytics endpoint cannot report contact success. Validation failures, honeypots, failed provider requests, and opening a draft do not count as accepted contact submissions. Provider acceptance does not confirm inbox delivery or receipt by Charlie.

## Privacy and limits

- Five explicit events; no client analytics SDK, autocapture, session replay, pageview or typed-content collection.
- Never forward audio, transcripts, draft text, form fields, names, email, phone, URL/query strings, cookies, referrers, visitor IP or user agent to analytics.
- Each event gets a fresh random ingestion identifier. It cannot link two events to a visitor. No person profiles or GeoIP processing are requested.
- Browser requests omit credentials and referrers and respect Do Not Track and Global Privacy Control. Contact capture independently checks the request's privacy headers.
- The endpoint keeps only ephemeral salted IP hashes for a bounded per-instance abuse backstop (60 requests per ten minutes, at most 1,000 entries). They are never forwarded or written to persistent storage. This is not a distributed quota.
- Capture is best effort, with a 1.5-second server timeout; missing configuration or errors never block portfolio actions or turn an accepted email into an error.
- Counts include repeated actions and may undercount because of privacy preferences, blockers or outages. Do not call these unique visitors, attributed enquiries, or a conversion funnel. All dashboard queries use total event counts.

## Activation after project selection

1. Confirm the destination project belongs to the owner and is suitable for portfolio data. Read its `api_token` and regional `api_host` from PostHog's project settings; never use a personal/admin key for ingestion.
2. Configure Vercel production environment values `POSTHOG_PROJECT_KEY` and `POSTHOG_API_HOST`. The host must be `https://us.i.posthog.com` or `https://eu.i.posthog.com`. Then set `VITE_PORTFOLIO_ANALYTICS_ENABLED=true` and rebuild. Keeping the browser flag false and server ingestion values unset leaves collection off.
3. In the selected project, inspect existing dashboards and approved catalog definitions before creating duplicates. The local definitions are proposed action counts, not catalog-approved business metrics. Consult relevant native dashboard templates.
4. Run each typed Trends query from the definition, save its native query under an InsightVizNode, and add it to the owner dashboard. Use its provided 12-column layouts; hide repeated tile descriptions. Do not enable public sharing or expose a data-query/admin credential in the website.
5. Check the saved dashboard and native query results. New deployments have no historical events to backfill. Verify a controlled action and distinguish verification activity from real visitor activity when interpreting initial counts.

Source guidance: [PostHog capture API](https://posthog.com/docs/api/capture), [anonymous events](https://posthog.com/docs/data/anonymous-vs-identified-events), and the connected PostHog dashboard/querying skills used during implementation.
