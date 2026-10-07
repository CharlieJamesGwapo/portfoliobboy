# Portfolio UX upgrade: design specification

Date: 2026-10-06 (Asia/Manila)
Branch: `codex/portfolio-ux-upgrade`
Baseline: merged main `edbcbc2f0d84b170b74ef70db4ef9870d1daf16f`
Status: proposed written specification; in-chat design direction approved by the user. Product implementation has not started. This specification requires review before implementation planning.

## 1. Intent and success criteria

Help prospective clients and employers understand Charlie's work, find a relevant live product, assess his engineering experience, and contact him without reading an overwhelming page. Improve perceived quality through readable hierarchy, focused interaction, consistent themes, and restrained motion rather than more simultaneous content.

The user approved the following direction: evolve the existing portfolio; provide Light, Dark, and System modes; simplify navigation; compact all credentials into one searchable collection; strengthen project previews and detailed case studies; add a privacy-safe Zalio workspace case study; refine the existing 3D hero; and provide a real, optional portfolio chatbot.

Success means a visitor can reach featured work from the hero, find a specific credential by title or issuer, switch and retain a theme, open a real public demo, and obtain a grounded assistant answer with a relevant portfolio link. Existing projects, records, games, public links, and verified professional history remain available.

## 2. Preservation and scope

- Keep the Vite / React application and existing deployment project. No framework migration.
- Preserve every original project and Momentum system, all 23 learning records, both academic recognitions, education dates, resume, experience records, contact channels, optional music, and nine Lab games.
- Preserve existing public section anchors, including `#home`, `#about`, `#experience`, `#ai-systems`, `#momentum-work`, `#projects`, `#skills`, `#education`, `#lab`, and `#contact`.
- Preserve the ink, warm-paper, mint, and coral brand direction and self-hosted Inter. Improve layout and density, not the user's professional identity.
- Presentation and navigation may change as approved. Removing duplicated displays does not remove their underlying records or assets.
- Do not invent clients, contribution ownership, metrics, endorsements, public access, screenshots, certification verification URLs, or production-readiness claims.
- No modification of internal.zalio.ai or other client applications. No private-system credentials or database access in the public portfolio or assistant.
- No deletion of source files, credentials, personal media, or existing worktrees.

## 3. Information architecture and visitor journey

Use five primary navigation destinations: Work, Services, About, Credentials, and Contact. Work targets `#momentum-work`; Services targets `#ai-systems`; About targets `#about`. Experience, Skills, the Lab, resume, and music remain reachable through contextual links and the existing command palette. The mobile menu contains clearly labelled secondary destinations so nothing depends on knowing a keyboard shortcut.

The hero keeps Charlie's identity, availability, positioning, resume, and profile links. Prioritize one primary action, Explore work, with resume and contact as secondary actions. Reduce the visible role list to a concise positioning line with the complete role inventory available through disclosure; do not change the underlying professional claims.

Recommended reading order: hero and proof summary; selected Momentum work; concise AI services; About and experience; original project collection; skills; credentials; optional Lab; contact. Moving modules preserves section IDs and updates the active-navigation observer to account for their new order and expandable heights.

All sections use predictable heading sizes, readable paragraph widths, and consistent vertical spacing. Do not introduce a persistent desktop app sidebar or copy Zalio's dashboard layout wholesale: this is a portfolio, not an operations workspace.

## 4. Theme system

Add a labelled theme control with Light, Dark, and System choices, accessible in desktop and mobile navigation. Default to System until an explicit preference exists.

Create semantic tokens for page background, raised surfaces, primary and muted text, borders, accent, foreground-on-accent, focus ring, scrim, and status states. Map existing component colors to those tokens instead of globally inverting the page or repurposing colors with contradictory meanings.

- Light: warm paper and off-white surfaces, dark ink text, restrained mint and coral accents.
- Dark: deep ink backgrounds, lifted charcoal/teal surfaces, soft near-white text, readable desaturated accents.
- Persist the selected mode in a namespaced local preference, with graceful fallback if browser storage is unavailable.
- Apply initial preference before first paint to avoid a bright flash. System responds to OS changes only when System is selected.
- Theme controls, overlays, contact errors, credentials, project statuses, music, and Lab entry must remain legible in both themes. Game playfields retain their authored art direction; theme changes must not rewrite gameplay colors or state.
- Keep native form controls and browser `color-scheme` consistent with the resolved theme.

Normal text targets WCAG AA contrast of at least 4.5:1; large text and meaningful UI boundaries target at least 3:1. Test computed pairs and visible UI independently in each theme.

## 5. Credentials: one compact collection

Replace the duplicated standalone image gallery and two exhaustive lists with one credential explorer below compact education and recognition cards.

Initial view shows six featured credentials selected from existing data: Building with the Claude API, Introduction to Model Context Protocol, Introduction to Agent Skills, Claude Code in Action, Model Context Protocol: Advanced Topics, and Go Programming. This is a curated display, not a ranking or claim that every record has an uploaded image.

Provide a labelled search field and category controls: All, AI & Anthropic, and Technical & Professional. Show total counts without presenting the full inventory on initial load. A View all 23 records control reveals the full collection; Show featured restores the shorter view without losing the search text unexpectedly. Entering a query or choosing a category searches the complete inventory, not only the six featured records.

Each compact item shows title and issuer, with a clear Open details affordance. Details include the supplied issue date, credential type, credential ID, expiration/expired status, and original certificate image when available. Missing images are explicitly labelled as a record without an uploaded certificate; missing external verification links are never fabricated. Preserve the expired Full-Stack record's status. Use an accessible dialog with close button, Escape, focus trapping and focus return; allow original certificate images to open in a new tab through an explicit link.

No nested scrolling list inside the page. Use progressive disclosure for height reduction, and allow normal document scrolling when the full collection is requested. Search empty states offer Clear search and useful category guidance. Counts and result changes are announced politely without excessive screen-reader chatter.

## 6. Work and live-product experience

Present three featured public systems first: Hasti, Zalio, and GymFactories. All eight existing Momentum systems remain reachable through View all systems and the existing category filters. Selecting a filter searches all systems and displays the full matching set. Preserve the original 16-build project collection separately; improve its layout, spacing and responsive controls without dropping any case study or archive entry.

Each system card should answer: what it is, what workflow it serves, what Charlie worked on where verified, and whether it is a public demo, public product site, prototype, or private engineering case study. Use readable titles, stable image aspect ratios, concise summary copy, and a single prominent live action where one genuinely exists. Do not label a marketing homepage as an authenticated app demo.

Expand case-study detail through an accessible dialog or labelled detail panel with Problem, Engineering scope, Architecture, and Available experience. Keep existing factual content and stack data; shorten only the default presentation. Preserve filter state and scroll position when returning from detail. Do not embed authenticated client apps or trigger calls, signups, bookings, or purchases from a portfolio preview.

Use existing authentic project screenshots for public products. Avoid hover-only actions and do not animate a live-demo button away from the pointer. Public links explicitly indicate that they open a new tab. Private systems have an honest Private workspace or Engineering case study label, not a broken or misleading demo button.

## 7. Zalio internal-workspace case study

Enrich the existing Zalio system with a workspace overview based on the user's supplied screenshots and read-only reference inspection. Visible modules include CRM, agents, operations, roster, library, and team chat. Their presence supports a module description, not proof of every integration's readiness, implementation ownership, or error-free production operation.

Create a code-native architecture overview with the modules and their relationships. Label it Architecture overview, not an authentic product screenshot. Keep existing actual public Zalio imagery distinct from this explanatory graphic.

Do not publish supplied browser screenshots, staff names, private messages, lead records, emails, phone numbers, task assignments, or operational timestamps. Do not expose internal routes as public demos or reuse internal session access. State that the authenticated workspace is private. Future authentic screenshots require clean, explicitly approved, sanitized product media.

## 8. Services and engineering detail

Retain all six existing AI service categories: custom agents; voice reception; automations and integrations; CRM and operations; AI modeling and workflow design; GoHighLevel and n8n workflows.

Use short, outcome-oriented summaries in the default view, with details available on demand: examples of supported workflows, engineering considerations, and existing stack evidence. Preserve the distinction between prompt/context/tool-schema modeling and training foundation models. Never imply newly deployed automations merely because the portfolio advertises a capability.

## 9. 3D, transitions and performance

Refine the existing connected-systems hero rather than introducing an unrelated stock model. Use intentional depth, readable framing, and restrained lighting; retain the current fast 2D fallback and idle-loaded WebGL upgrade. No new 3D package is required by this design.

Use consistent 150–300 ms micro-interactions for filters, themes, disclosure and overlays. Animate transform/opacity rather than layout dimensions. Do not use scroll hijacking, required animation waits, autoplay audio, flashing particles, or perpetual attention-seeking chatbot motion.

Respect reduced motion, coarse pointers, Data Saver, weak devices, background tabs, and off-screen rendering. Essential content remains readable without WebGL or animation. Images reserve dimensions and load lazily below the fold; assistant code loads only when opened. Do not accidentally preload Lab or Three.js in the entry bundle.

## 10. Optional real portfolio assistant

### Experience and boundaries

Add a dismissible, non-auto-opening Ask about Charlie launcher. Desktop uses a compact panel; mobile uses a keyboard-aware dialog sized to the dynamic viewport and safe areas. It must not overlap the existing music and back-to-top controls or obstruct contact actions.

Starter prompts: What can Charlie build?, Show AI and automation work, Which projects have live links?, and How can I contact Charlie? Users can also enter a free-text question. Provide visible input label, pending/streaming state, Stop, Retry, clear errors, Close, and Clear conversation.

Answers identify the assistant as AI and reference approved public portfolio facts only. Include relevant portfolio section or allowlisted public-product links. Do not invent rates, availability commitments, employment terms, credentials, project outcomes, or personal facts. Unknown facts produce a clear limitation and a direct contact link. The assistant does not impersonate Charlie, browse internal systems, execute actions, send email, call people, or collect leads silently.

### Data and server boundary

Keep the existing React frontend. Use a same-origin Node endpoint, `POST /api/portfolio-chat`, in the existing Vercel functions layout. A separate Railway service is not required for this bounded read-only assistant; do not provision or modify Railway as part of this design.

Compile a reviewed knowledge payload from the public portfolio data plus a small allowlisted section/product-link registry. No filesystem reads of the full repository, private screenshots, research notes, credentials, internal URLs, or live client database access. The model sees the visitor's question, bounded conversational context, and that public knowledge payload.

Use real AI through Vercel AI Gateway with server-side authentication, following the installed SDK's version-matched docs. Select an available low-cost model from live discovery during implementation, not a remembered model ID. Do not migrate the frontend framework or build a durable autonomous-agent platform for a portfolio Q&A assistant.

Validate content type, same-origin policy, message roles, body size (maximum 24 KiB), user question length (maximum 2,000 characters), and history (maximum 10 messages). Cap output at 600 tokens and allow one model generation per request, without tools or autonomous loops. Never accept client-supplied system instructions or knowledge as trusted context.

Render output as escaped text with separately validated source links; do not render raw model HTML. Resolve sources against a server-controlled allowlist, not model-invented URLs. Propagate cancellation and apply a bounded server timeout. If the existing 10-second function limit cannot support measured response latency, update only this endpoint's limit with an explicit timeout contract during planning.

### Privacy, abuse protection and cost

Do not write conversation content to an application database or browser persistent storage by default. Keep history only in the open page session; closing the panel retains that in-memory conversation until refresh or Clear conversation. Do not log raw prompts or answers. Disclose that messages go to an AI provider and advise visitors not to include sensitive data; do not claim all platform/provider retention is zero unless verified.

Before enabling the public endpoint, require enforceable rate limits (initial target: five requests per minute per client) and a verified provider spending cap. A per-process memory counter is not sufficient for distributed production protection. Prefer an existing compatible platform rule or configured shared store; do not silently add a paid service. Treat forwarded client identity only through trusted platform mechanisms.

Default financial boundary: no purchased credits, no automatic recharge, no paid plan upgrade, and no provider-key reuse from other client projects. Verify account eligibility and remaining free usage rather than assuming it. If usable credentials, quota, enforceable limits, or cost controls are unavailable, stop assistant activation and report the precise requirement. Do not substitute canned responses and advertise them as AI. The independently completed UI work may still be previewed with the assistant launcher hidden and its incomplete activation clearly reported.

## 11. Component boundaries

- Theme controller: preference, initial resolution, OS changes, semantic tokens and labelled selector.
- Credential explorer: derived featured/search/category state; detail dialog consumes one existing record.
- System showcase: featured/all/filter state; detail view consumes one existing system.
- Shared dialog primitive: Escape, focus trap, return focus, background inertness, responsive sizing; avoid conflicting overlays with navigation, music, Lab and command palette.
- Portfolio assistant: lazy UI, bounded transient conversation, request cancellation and error recovery.
- Server knowledge module: approved public facts and source registry, reusable in tests without model calls.
- Chat endpoint: validation, abuse/cost gates, real provider request and safe response envelope.

Keep global preference state separate from case-study, credential and chatbot state. Avoid adding chatbot or theme logic to the game engine. Reuse existing styling and icons where practical; no design-system package migration is required.

## 12. Verification and release gates

Baseline tests currently pass: 12 JavaScript tests and one Python resume check. That baseline does not verify any proposed new behavior.

Required implementation evidence:

1. Data-regression tests prove every original inventory record, public URL and section ID remains present. Preserve degree and role dates, resume bytes and game save behavior.
2. Unit tests cover theme precedence, denied storage, System change handling, credential full-inventory search, filters/counts, featured/all reset, missing media and expired statuses.
3. Backend tests cover invalid roles, oversized payloads, unsupported origins, allowlisted links, cancellation, provider errors, exhausted quota, rate limiting and disabled configuration without a paid request.
4. Real browser tests in Chromium, Firefox and WebKit at 320, 390, 768, 1024, 1440 and 1920 px, plus mobile landscape and 200% zoom. Verify both themes, keyboard-only navigation, modal focus return, no overflow, accessible touch targets and sticky-header anchor offsets.
5. Verify reduced motion and unavailable WebGL; confirm hero, assistant and Lab are appropriately split from initial loading. Compare production build output and Lighthouse-style load measurements to the baseline without claiming unmeasured scores.
6. Open all existing public-product links through read-only checks. Verify private systems remain labelled and internal personal data is absent from generated assets and knowledge.
7. Verify a real assistant answer on a protected preview with an approved public-only test question; prove sources, Stop/Retry, unavailable-provider behavior and cost/abuse gates. Fake test transports validate UI contracts only, not live AI readiness.
8. Preserve contact behavior and test validation/error states without sending unsolicited real messages. Smoke-test Lab entry/exit, existing command palette, music and back-to-top behavior after layout changes.
9. Review the actual diff and rendered desktop/mobile screenshots before merging. Production rollout requires the user's applicable release authorization, passing review/build/tests, and correctly scoped deployment credentials. Verify live behavior after deployment; local success alone is not completion.

## 13. Implementation sequencing and open integration gates

Deliver in two separately verifiable stages under the same approved design: (A) theme, navigation, compact credentials, curated work/services, private workspace overview and motion; (B) real assistant endpoint and UI after provider access, spending and distributed abuse controls are verified. Do not describe stage A as completion of the whole request if stage B remains blocked.

No missing design decision is left open in this specification. Provider availability, account quota, rate-limit mechanism and deployment access are integration gates to inspect during implementation planning, not assumptions to silently satisfy through paid provisioning. The next step is user review of this written specification, followed by a test-first implementation plan and explicit execution-method selection.
