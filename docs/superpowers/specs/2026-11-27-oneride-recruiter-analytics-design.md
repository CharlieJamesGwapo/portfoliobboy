# OneRide evidence, recruiter export and action tracking

The user authorized improving OneRide first, adding a downloadable recruiter summary, tracking brief downloads and booking clicks, then testing, pushing and deploying.

## Design

OneRide keeps its current route, screenshots and factual stack. Add a responsive, manually controlled walkthrough of the three official customer-app screenshots, clear contribution bullets and an evidence/delivery panel. Label the empty orders screen accurately. Use existing documented architecture and public evidence; do not invent performance, adoption, revenue, business metrics, private screenshots, video or customer endorsements. Preserve all other case-study routes.

Recruiter summaries are generated locally from the exact displayed role comparison. Include each requirement, its documented/partial/unverified status, explanation and public evidence links, plus an absolute résumé link. Preserve mixed qualifications and truncation notices. Offer copy, UTF-8 download and native Save as PDF using the existing safe printable-document pipeline. No job description is uploaded or persisted, and exports make no hiring verdict. Reuse export controls with document-specific wording and filenames.

Track `portfolio_brief_downloaded` only after the text-download helper returns, `portfolio_brief_print_opened` only after a printable tab opens, and `portfolio_booking_clicked` for primary/keyboard/middle activation of a configured scheduler link. Fixed surface and booking identifiers only; no document text, requirements, URLs or visitor IDs. A download request is not proof of a saved file, a print view is not proof of PDF creation, and a booking click is not a confirmed appointment. Preserve Do Not Track/GPC behavior and nonblocking failures. Do not track recruiter content or exports.

Extend the existing private personal PostHog dashboard (project 769787, dashboard 2416983) with three native count tiles. Preserve existing insights, sharing and proposed metric governance. No changes to the Zalio organization, sign-ins, notification subscriptions or real email/appointment creation.

## Implementation choices

A guided screenshot walkthrough is backed by available evidence; an unprovided video or fabricated interactive trip would misrepresent the product. Existing native print supports multilingual selectable PDF text without new dependencies. Action counts retain the established anonymous, per-event identifier model and cannot be interpreted as attributed conversions.

## Verification

Test OneRide step selection and failure fallback, small screens and both themes; recruiter Unicode, long/qualified requirements, uncertainty, links, truncation and exact displayed results; clipboard/popup failures; analytics schemas, allowed surfaces, suppressed/failed exports, right-click versus middle-click and privacy signals. Run full unit, production Chromium and development Chromium suites plus focused Firefox/WebKit checks. Render the recruiter PDF. Review independently, push, verify production and real ingestion without sending emails or booking appointments.
