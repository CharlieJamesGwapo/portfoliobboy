# Portfolio outcome analytics

## Current activation state

Personal workspace: **Charlie Abejo Portfolio**, project **769787** (Default project).

[Open the private Portfolio Enquiry Outcomes dashboard](https://us.posthog.com/project/769787/dashboard/2416983).

The eleven prepared insights are saved in this personal project, with private sharing and a 30-day default range. Its project reporting timezone remains UTC. Production is configured with the personal ingestion key (server-only Secret), regional ingestion host and browser enable flag. A deployment rebuild applies these values; the earlier Zalio project remains unchanged.

The [dashboard definition](portfolio-dashboard.json) records actual insight/tile IDs and the private dashboard URL. Eight catalog count definitions are proposed and linked to their saved insights; they are not claimed as human-approved business metrics. New collection does not backfill earlier visits. Initial action counts include controlled setup verification, including one labelled contact enquiry on November 27 that the owner confirmed receiving.

The separate private [Portfolio Health dashboard](../health/README.md) adds fixed operational-error categories and independent synthetic uptime results to the same personal project. The eight product-action events below retain their original contract. Operational reports contain no enquiry or voice content; their email alerts go only to the owner-selected inbox.

## What is counted

| Event | Recorded boundary | Permitted properties |
| --- | --- | --- |
| `portfolio_voice_started` | SDK reports an established connection | fixed `surface` |
| `portfolio_starter_used` | A named starter is submitted to voice or the local text guide | fixed `surface`, `starter_id` |
| `portfolio_project_opened` | Visitor selects a published evidence card | fixed `surface`, canonical `project_id` |
| `portfolio_enquiry_reviewed` | Visitor explicitly transfers an edited enquiry to contact | fixed `surface` |
| `portfolio_contact_submitted` | Contact API receives successful acceptance from the email provider | `surface: contact`; server only |
| `portfolio_brief_downloaded` | Brief text-download helper returns after requesting a download | fixed guide/voice `surface` |
| `portfolio_brief_print_opened` | A local printable brief tab opens successfully | fixed guide/voice `surface` |
| `portfolio_booking_clicked` | Primary, keyboard or middle activation of an external scheduler link | fixed `surface`, `booking_id` (`intro`, `discovery`, `consult`) |

The public analytics endpoint cannot report contact success. Validation failures, honeypots, failed provider requests, and opening a draft do not count as accepted contact submissions. Provider acceptance does not confirm inbox delivery or receipt by Charlie.

Brief downloads count requests, not operating-system file completion. A print view is not proof that a PDF was saved. Booking selections are not confirmed appointments. Blocked export APIs and right-click menu openings do not produce these events; native browser menu selections cannot be observed reliably. Repeated actions count. Recruiter-summary actions and document contents are not tracked. Voice actions use the fixed home/panel surface; the local text fallback uses `text_guide`.

## Privacy and limits

- Eight explicit events; no client analytics SDK, autocapture, session replay, pageview or typed-content collection.
- Never forward audio, transcripts, draft text, form fields, names, email, phone, URL/query strings, cookies, referrers, visitor IP or user agent to analytics.
- Each event gets a fresh random ingestion identifier. It cannot link two events to a visitor. No person profiles or GeoIP processing are requested.
- Browser requests omit credentials and referrers and respect Do Not Track and Global Privacy Control. Contact capture independently checks the request's privacy headers.
- The endpoint keeps only ephemeral salted IP hashes for a bounded per-instance abuse backstop (60 requests per ten minutes, at most 1,000 entries). They are never forwarded or written to persistent storage. This is not a distributed quota.
- Capture is best effort, with a 1.5-second server timeout; missing configuration or errors never block portfolio actions or turn an accepted email into an error.
- Counts include repeated actions and may undercount because of privacy preferences, blockers or outages. Do not call these unique visitors, attributed enquiries, or a conversion funnel. All dashboard queries use total event counts.

## Configuration and maintenance

1. Use only the personal project above unless the owner explicitly changes the destination. Read its `api_token` and regional `api_host` from PostHog's project settings; never use a personal/admin key for ingestion.
2. Configure Vercel production environment values `POSTHOG_PROJECT_KEY` and `POSTHOG_API_HOST`. The host must be `https://us.i.posthog.com` or `https://eu.i.posthog.com`. Then set `VITE_PORTFOLIO_ANALYTICS_ENABLED=true` and rebuild. Keeping the browser flag false and server ingestion values unset leaves collection off.
3. In the selected project, inspect existing dashboards and approved catalog definitions before creating duplicates. The local definitions are proposed action counts, not catalog-approved business metrics. Consult relevant native dashboard templates.
4. Run each typed Trends query from the definition, save its native query under an InsightVizNode, and add it to the owner dashboard. Use its provided 12-column layouts; hide repeated tile descriptions. Do not enable public sharing or expose a data-query/admin credential in the website.
5. Check the saved dashboard and native query results. New deployments have no historical events to backfill. Verify a controlled action and distinguish verification activity from real visitor activity when interpreting initial counts.

Source guidance: [PostHog capture API](https://posthog.com/docs/api/capture), [anonymous events](https://posthog.com/docs/data/anonymous-vs-identified-events), and the connected PostHog dashboard/querying skills used during implementation.
