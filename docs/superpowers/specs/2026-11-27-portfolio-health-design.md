# Portfolio health monitoring

The owner requested uptime/error alerts, a simple health dashboard, no private messages in reports, and tested push/deployment.

## Approach

Use the existing personal PostHog project 769787 for a separate private Portfolio Health dashboard. A GitHub Actions monitor runs about every five minutes, independently of the portfolio host and the owner's Mac. It checks only the canonical homepage, its entry bundle, contact/analytics preflights and a minimal readiness endpoint. It posts fixed synthetic results directly to PostHog so an unavailable portfolio can still be recorded. GitHub scheduling is best effort, not an uptime SLA.

The owner selected email to `capstonee2@gmail.com`. GitHub sends fixed availability-check alerts independently of the website, deduplicated by Resend within each UTC hour. PostHog's native threshold alert checks fixed technical-error reports on the selected cadence and calls a fixed email destination. No alert is subscribed to a different connected account address. Email messages contain static summaries and dashboard links only; no event bodies are templated into them. A separate sending-only key, encrypted in GitHub and PostHog, requires the connected-browser policy's confirmation before creation. No Codex notification automation is needed for this email destination.

Alternatives considered: a new external monitoring service would require another account; Vercel paid observability would require a plan change. Preserve existing services and avoid either dependency.

## Privacy and interfaces

- `shared/healthTelemetry.js` defines strict `normalizeHealthEvent(event, properties, { allowServer = false, allowUptime = false } = {})`.
- `portfolio_health_error`: exactly `{surface, code}`. Client surfaces `app`, `voice_home`, `voice_panel`. App codes `app_unhandled`, `app_unhandled_rejection`, `asset_load_failed`; voice codes `voice_start_failed`, `voice_connection_lost`, `voice_send_failed`. Server-only contact codes `contact_verification_unavailable`, `contact_config_missing`, `contact_mail_rejected`, `contact_mail_timeout`, `contact_mail_failed` on surface `contact`. Public callers cannot claim contact failures.
- `portfolio_uptime_checked`: exactly `{target, status, latency_bucket, source}`. Targets `homepage`, `entry_bundle`, `contact_api`, `analytics_api`, `health_api`; status `up`, `down`; latency bucket `fast`, `slow`, `timeout`; source `github_actions` or `manual_check`. Requires `allowUptime` and is rejected by the public analytics endpoint.
- No free text, raw errors/stacks, form fields, audio, transcript, names, email, IP, user agent, request IDs, URL/query strings, cookies or referrers in health events. Use fresh event IDs and existing no-person-profile/GeoIP flags. Browser/server visitor reports honor DNT/GPC; no replay or autocapture.
- Browser reporting is best effort, bounded and deduplicated per page/session; failures never interrupt an enquiry or voice flow. Permission refusal and intentional ending are not service failures.
- `api/health.js` serves GET/HEAD readiness with no caching or indexing, fixed status/check enums and no secret values or environment dumps. It does not send emails, start voice or claim to verify provider delivery.
- Monitor ingestion uses the same personal project ingestion token stored as a GitHub Actions secret; no personal/admin API key, new provider account or paid plan.
- Dashboard displays observed homepage availability, monitoring coverage, failed checks, error categories, accepted enquiries and their trends. Missing data is not proof of health; browser reports are untrusted and may undercount.

## Acceptance

Prove privacy rejection, server-only event boundaries, DNT/GPC, bounded failure behavior, readiness without secret leakage, monitor outage/retry/capture behavior, and voice cleanup/dedup. Run repository/security tests, production browser checks, a real safe cloud monitor run and native dashboard queries. Test alerts using an isolated fixture/dry run, not a real outage or fabricated production error spike. Preserve contact BotID, one-minute voice duration, existing analytics and provider settings. Push and deploy, then verify the live health route and scheduled monitor configuration.
