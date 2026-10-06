# AI systems portfolio additions

Approved scope: add capability and Momentum product sections while preserving all existing resume, experience, projects, credentials, contact, and arcade content.

## Public content

- Six service areas: custom AI agents, voice agents, automation/integrations, custom CRM including AI agent workflows, AI context/prompt/tool modeling, and GoHighLevel/n8n workflows.
- Eight curated system cards: Hasti, Zalio, GymFactories, Momentum Strength, HSIE, voice runtime, gym analytics, and agent/platform operations.
- Public URLs point to available product sites or prototypes. Private backends and operational tools have no public source or internal dashboard links.
- AI modeling refers to prompt/context/tool contracts and scenario evaluation; it does not assert foundation-model training.
- GoHighLevel evidence supports contact imports, mapping, reconciliation, and integration workflows. No unsupported native GHL campaign results or metrics are published.
- Hasti has a public AI callback dialog; opening it was verified without submitting a callback or creating a call. Underlying private voice code is presented separately as engineering work.
- Screenshots are real browser captures, with no customer data or personal browser chrome. Refresh with `node scripts/capture-portfolio-projects.mjs`.

## Repository research

The authenticated organization inventory contains 33 private repositories. Read-only inspection used descriptions, READMEs, product docs, and selected implementation files. Product readiness was checked against public sites rather than inferred from repository names.

Grouped inventory:

- AI/voice/agent tooling: gtm-call-backend, inbound-gtm-call-backend, paperclip-zalio, zalio-agent-dashboard, zalio-cc-next.
- Revenue/CRM/marketing: zalio-crm, gym-gtm-engine-next, hasti, momentum-signup, zalio-campaigns, marketing, marketing-module, waitlist, zalio-lander.
- Gym/data/products: zalio, pgm-analytics, gymfactories, zalio-members, zalio-train, Zalio-pm, momentum-strength.
- Platform/shared/exploratory: momentum-uptime, zalio-session-hub, zalio-ui, zalio-control, drive-module-tanstack, zalio-website2, storyshare, HSIE-Tanstack, health-dev, expo-encore-template, nextjs-template, tanstack-start-template.

StoryShare's listed deployment returned 404 and was excluded. Authenticated/internal dashboards are excluded from public demo links. Private source code, secrets, internal endpoints, and operational runbooks are not published.

## Hosting

These additions are frontend content and need no new backend, paid integration, or Railway service. The existing Vite portfolio is linked to the Vercel project `portfoliobboy`. A future backend feature needs its intended Railway project/service and public API origin, with credentials configured in provider settings.

## Verification

- `npm test` checks the existing portfolio and corrected resume contracts.
- `npm run test:e2e` checks filtering, keyboard expansion, public links, existing sections, image loading, touch targets, and overflow at 320, 390, 768, 1024, and 1440 pixels in Chromium, Firefox, and WebKit.
- `npm run build` checks the production bundle.

The public callback form has not been submitted and provider voice-call completion has not been tested as part of this portfolio task.
