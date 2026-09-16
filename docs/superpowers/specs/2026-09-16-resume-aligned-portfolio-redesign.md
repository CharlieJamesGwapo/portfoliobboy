# Resume-Aligned Portfolio Redesign

## Status and source of truth

This specification defines the approved hiring-first redesign of Charlie James Z. Abejo's portfolio. It supersedes the August 2026 portfolio content specifications wherever they conflict with the supplied resume.

The canonical content source is `/Users/a1234/Downloads/ABEJO_CHARLIE_JAMES_RESUMEE.pdf`, a three-page resume created September 11, 2026. The implementation must preserve the resume's meaning, dates, confidentiality, and level of specificity. Existing portfolio content may remain only when it does not conflict with the resume and is clearly separated as supplemental project or lab material.

The design direction is a restrained editorial systems-engineering portfolio: warm, human, technically credible, and optimized for a hiring manager's first scan. It uses the strongest common patterns from professional engineering portfolios - a stable role statement, a small number of defensible case studies, readable long-form evidence, restrained navigation, and personality after credibility - without copying another portfolio's layout or language.

## Goals

1. Make the first screen answer who Charlie is, what he builds, and why a hiring manager should continue within ten seconds.
2. Match all employment history, dates, experience claims, education, and primary credentials to the supplied resume.
3. Present three strong, evidence-led case studies rather than a large filterable catalog.
4. Preserve the Australian client's anonymity and remove every public reference to the client's identity and commercial CRM product.
5. Show systems thinking through clear architecture explanations and diagrams made from verified facts, without fabricated screenshots, user counts, revenue figures, or performance metrics.
6. Keep games, music, experiments, and additional projects available as optional secondary material without letting them dominate the professional narrative or initial bundle.
7. Improve accessibility, responsive behavior, search metadata, loading performance, and content test coverage.
8. Make the resume link reliable and ensure the public PDF is byte-for-byte the supplied canonical resume.

## Non-goals

- Do not rewrite, regenerate, restyle, or edit the supplied resume PDF.
- Do not disclose the Australian client's name, locations, brand, internal identifiers, or the name of its commercial CRM.
- Do not publish private repositories, private screenshots, customer records, source data, financial data, or inferred business results.
- Do not invent screenshots, interface mockups presented as real product screens, testimonials, metrics, dates, job titles, or employment relationships.
- Do not present every project as employment.
- Do not migrate the Vite/React application to another framework or add a content management system, database, authentication system, or external service.
- Do not turn the redesign into a visual-effects showcase. Games and music are optional personality material, not the primary experience.
- Do not delete existing game, music, or experimental source modules as part of this redesign; reuse them only behind the optional lab entry point.

## Canonical content corrections

### Identity and positioning

- Name: `Charlie James Z. Abejo`
- Resume role: `Full-Stack Web & Mobile App Developer`
- Location: `Misamis Oriental, Philippines (Remote)`
- Experience statement: `5+ years shipping production applications across web, iOS, and Android`
- Primary specialty: CRM API integrations, real-time sync, and AI-assisted delivery
- Availability: `Available immediately - remote only`
- Approved hero headline: `Full-stack product engineer for reliable web, mobile, and CRM systems.`
- Approved hero support copy: `I build production applications across web, iOS, and Android, with a focus on CRM integrations, real-time sync, secure data workflows, and AI-assisted delivery.`

The stable hero headline replaces the rotating list of eight job titles. The page may describe AI-assisted delivery as a working method, but it must not replace the resume-aligned full-stack web and mobile role with an unsupported primary identity.

### Employment timeline

The main experience timeline contains exactly these three roles, in this order:

1. `AI Full-Stack Developer (Contract) - Australian Client (Remote)` with period `2026`.
2. `Full-Stack Developer - Rooche Digital Company` with period `Jan 2026 - Mar 2026`.
3. `Full-Stack Developer - Robustech IT / SocietyOne (Australia)` with period `Jan 2024 - Dec 2025`.

The current site contains incorrect dates and identity disclosures that must be removed:

- Replace `Oct 2025 - Dec 2025` for Rooche with `Jan 2026 - Mar 2026`.
- Replace `Jan 2026 - Apr 2026` for SocietyOne with `Jan 2024 - Dec 2025`.
- Replace the named Australian fitness organization with `Australian Client`.
- Replace the currently hard-coded commercial CRM product name with neutral language such as `commercial CRM`, `CRM REST API`, or `CRM REST API + webhooks`.
- Replace `2 years` and equivalent two-year statements with `5+ years`.
- Do not invent start or end months for the Australian contract; the canonical public period is `2026`.

### Earlier work

Earlier project work is not displayed as ten separate jobs. It appears under one clearly labeled chapter, `Earlier Full-Stack & Mobile Projects`, with the period `2021 - 2023`, containing:

- `Jolly Ride & Massage Booking Apps` - React Native and native Android (Java/Kotlin) scheduling and booking apps with Firebase real-time data, authentication, and push notifications.
- `MOIST Alumni Tracking System` - Laravel and MySQL records platform with RBAC, audit trails, and OTP/2FA over SMS and email.
- `Filtra Coffee POS` - production point-of-sale platform used daily by store staff, built with a Go backend and Next.js/Vue frontends for sales, payments, inventory, and reporting.
- `E-Cycle Hub` - waste-pickup scheduling platform with WebSocket/webhook updates and a Go backend over Neon Postgres.

No month-level dates are shown for these four items because the canonical resume supplies only the 2021-2023 group period.

### Education and credentials

Education is shown as:

- `BS in Information Technology - Misamis Oriental Institute of Science and Technology`
- Period: `2022 - 2025`
- Details: `Dean's Lister, 2nd & 3rd Year (Ranked 2) · TOPCIT participant (2024-2025)`

The main page shows exactly the six credentials listed in the resume:

1. `AI Fluency: Framework & Foundations - Anthropic, 2026`
2. `Claude 101 - Anthropic Academy (Anthropic Education), July 2026`
3. `Claude Platform 101 - Anthropic Academy (Anthropic Education), July 2026`
4. `Databases with SQL - Harvard CS50`
5. `Microsoft - Manage AD DS Domain Controllers & FSMO Roles`
6. `Windows Server & Active Directory administration training`

Remove the `25 verified credentials and recognitions` proof point and the 23-item certificate wall from the main experience. Only certificate images whose title and issuer match one of these six records may be linked from the corresponding credential. Other current training records are omitted from this release rather than presented as resume-backed credentials.

### Proof points

The hero proof band uses four concise, defensible statements rather than inflated inventory counts:

- `5+ years` / `shipping production software`
- `Web + iOS + Android` / `cross-platform delivery`
- `CRM + API integration` / `sync, webhooks, and automation`
- `Remote from the Philippines` / `works directly with global teams`

## Information architecture

### Primary navigation

The fixed primary navigation contains five links and one contact action:

1. `Work` -> `#work`
2. `Experience` -> `#experience`
3. `Capabilities` -> `#capabilities`
4. `Credentials` -> `#credentials`
5. `Contact` -> `#contact`
6. `Let's talk` -> email contact action

`Interactive Lab`, music, search/command palette, and project filters do not appear in primary navigation. The mobile navigation exposes the same five destinations and contact action.

### Main-page sequence

1. **Hero (`#home`)** - stable positioning, short support copy, availability, primary `View selected work` action, secondary `View resume (PDF)` action, contact links, portrait, and four proof points.
2. **Selected work (`#work`)** - three full case studies rendered sequentially in the document, not hidden behind tabs or filters.
3. **Experience (`#experience`)** - the three canonical roles followed by one compact 2021-2023 earlier-projects chapter.
4. **Capabilities (`#capabilities`)** - six focused groups derived from the resume rather than a flat keyword wall.
5. **Education and credentials (`#credentials`)** - education, two academic recognitions, and the six resume credentials.
6. **Contact (`#contact`)** - direct email, GitHub, LinkedIn, location, availability, and the existing functional contact form.
7. **Additional work (`#archive`)** - a visually quiet secondary disclosure with `Project archive` and `Interactive lab` choices. It is linked from the footer, not primary navigation.
8. **Footer** - compact identity, current year, primary links, and a `More: archive & lab` link.

The contact section remains the conclusion of the professional narrative. Additional work follows as an optional appendix and must not visually compete with the contact call to action.

## Case-study strategy

### Shared story model

Each case study is fully present in semantic HTML for search and accessibility. It uses this fixed structure:

1. **Context** - the operational problem stated without confidential detail.
2. **Responsibility** - what Charlie owned or built.
3. **System** - a concise, verified architecture description and a semantic system map.
4. **Reliability and safeguards** - the concrete engineering mechanisms used.
5. **Delivered** - the supplied outcome, described qualitatively unless a verified number exists.
6. **Stack** - only technologies named by the resume for that work.

Case studies must use first-person responsibility language only where the resume supports it. They must not imply sole ownership of employer-wide work when the resume says Charlie contributed to a broader migration.

### Case study 1: Australian CRM and management platform

- Public title: `Unified CRM & Operations Platform`
- Label: `Australian Client · Contract · Remote · 2026`
- Confidentiality note: `Private client engagement; identifying details and product screens are withheld.`
- Context: customer records, subscriptions, payments, visit history, and outreach were spread across separate tools.
- Responsibility: Next.js/React dashboards; event-driven Python sync worker; marketing attribution; Twilio Voice integration; data migration and reconciliation; direct collaboration with a non-technical business owner.
- System map: `Acquisition sources -> CRM REST API/webhooks -> Python/Celery sync -> Postgres -> Next.js operations dashboards`, with Twilio Voice connected to customer outreach.
- Reliability evidence: durable Postgres job queue, leases, idempotency keys, bounded retries, zombie-run recovery, replay-safe sync, and source-of-truth financial reconciliation.
- Stack: TypeScript, Next.js 16, React 19, TanStack Query, Python, Celery, Redis, Supabase Postgres, Docker, Linux VPS, Twilio.
- Forbidden public terms: the client name and commercial CRM product name currently in the data file, specific club names, member names, real financial amounts, or screenshots containing private data.

### Case study 2: SocietyOne platform modernization

- Public title: `Regulated Fintech Platform Modernization`
- Label: `Robustech IT / SocietyOne · Australia · Jan 2024 - Dec 2025`
- Context: a major data and platform migration in a regulated personal-lending environment.
- Responsibility: re-platform Go and Node.js microservices to .NET; build Python and .NET AWS Lambda functions; maintain partner banking and lending integrations; automate reconciliation, reporting, partner-feed processing, and email parsing.
- System map: `Partner banking/lending systems -> JSON-RPC, webhooks, and feeds -> Lambda/services -> PostgreSQL -> reconciliation/reporting`, with Buddy CI/CD across testing, staged deployment, and rollback.
- Reliability evidence: standardized logging and error handling, automated testing, staged deployments, rollbacks, and reconciliation against partner inputs.
- Stack: C#/.NET, Python, Go, Node.js, AWS Lambda, REST, GraphQL, JSON-RPC, WebSockets, webhooks, PostgreSQL, Buddy CI/CD.
- Do not invent compliance certifications, transaction volume, loan value, conversion results, or migration percentages.

### Case study 3: Cross-platform booking applications

- Public title: `Cross-Platform Booking Applications`
- Label: `Jolly Ride & Massage Booking Apps · 2021 - 2023 project chapter`
- Context: scheduling and booking workflows needed to work across web-adjacent mobile experiences, iOS, and Android.
- Responsibility: React Native cross-platform work and native Android development with Java/Kotlin; Firebase real-time data, authentication, and push notifications.
- System map: `iOS/Android client -> authentication -> booking/scheduling state -> Firebase real-time data -> notifications`.
- Reliability evidence: authenticated access, real-time status synchronization, notification-driven updates, and mobile-aware state handling. Offline-tolerant patterns may be discussed only at the portfolio-wide capability level unless directly tied to these apps by supplied evidence.
- Stack: React Native, Android, Java, Kotlin, Firebase real-time data, authentication, push notifications.
- Do not invent store ratings, download counts, booking volume, business names, or product screenshots.

### Visual evidence policy

- Do not use generic dashboards, stock device mockups, or AI-generated UI as if they are authentic product evidence.
- Private work uses editorial system maps built from HTML/CSS and simple SVG connectors. The text list remains the accessible source; SVG connectors are decorative.
- If authentic redacted screenshots are supplied later, they may replace a diagram only after visible names, identifiers, financial data, browser chrome, notifications, and metadata are reviewed for confidentiality.
- Architecture diagrams use generic nodes and verified technology labels. They do not reconstruct proprietary schemas or workflows beyond the resume.
- Outcomes use phrases such as `unified`, `standardized`, `automated`, `shipped`, and `used daily` only where those statements appear in the canonical resume. Numeric claims require a separate supplied source before publication.

## Capabilities

The skills section is reorganized into six scannable groups, each with a one-sentence capability statement and a restrained technology list:

1. **Mobile & cross-platform** - React Native, Android (Java/Kotlin), Firebase real-time data, authentication, push notifications, offline-tolerant sync patterns.
2. **CRM & integrations** - CRM REST APIs, webhooks, bidirectional sync, Twilio Voice, marketing attribution, payment data pipelines, partner webhooks, email-feed parsing.
3. **Frontend** - React 19, Next.js 16 App Router, TypeScript, TanStack Query, Zustand, Tailwind CSS, shadcn/ui, Vue.js, Angular.
4. **Backend & APIs** - Python/FastAPI/Django/Flask/Celery, Node.js/Express, C#/.NET, Go, PHP/Laravel, REST, GraphQL, WebSockets, JSON-RPC, OpenAPI, JWT, OTP/2FA, RBAC, audit trails.
5. **Data & infrastructure** - PostgreSQL, Supabase, Neon, MySQL, MongoDB, Firebase, Redis, Docker, Linux VPS, AWS Lambda, GitLab/Buddy/Jenkins CI/CD, Vercel.
6. **AI engineering** - Claude Code workflows, custom subagents, skills, hooks, MCP servers, Cursor, GitHub Copilot, Claude/OpenAI API integration, tool calling, streaming, structured output, agent instruction design.

MongoDB remains because it is explicitly present in the canonical resume. Do not omit a resume-listed technology solely because an earlier portfolio spec removed it.

## Optional project archive and interactive lab

The existing games and additional projects are preserved as secondary evidence of curiosity and breadth, with these constraints:

- The archive and lab are absent from the primary navigation and hero actions.
- A compact `More: archive & lab` footer link scrolls to `#archive` and opens the secondary disclosure when directly addressed.
- The disclosure contains two panels: `Additional project archive` and `Interactive lab`.
- Supplemental projects, including OMJI and existing independent/client work, are labeled `Supplemental project work` and never inserted into the employment timeline. Existing dates and live links may remain only when already backed by supplied project evidence; they are not used to override resume dates.
- The nine games remain available through one `Launch the lab` action. Individual game cards do not render on the main page before the disclosure is opened.
- Arcade modules, Three.js, audio, and game assets remain dynamically imported and load only after explicit visitor interaction.
- The floating music launcher is removed from the main experience. Music, if retained, is offered inside the lab and remains opt-in, muted until activated, and keyboard operable.
- The command palette and project-category filter are removed from the primary experience; five visible navigation links make them unnecessary.
- Secondary material carries no proof-point counts and is never described as professional employment.

## Component and data architecture

### Single content source

`src/data/portfolioData.js` remains the one public content source and exports these conceptual collections:

- `profile`: identity, role, location, availability, contact links, and resume URL.
- `navigation`: the five primary section links.
- `proofPoints`: the four resume-backed proof statements.
- `caseStudies`: exactly the three case studies defined above.
- `experienceTimeline`: exactly the three employment roles.
- `earlierWork`: the four 2021-2023 project summaries.
- `capabilityGroups`: the six resume-derived capability groups.
- `education`: canonical degree, school, dates, and recognitions.
- `credentials`: exactly the six resume credentials.
- `supplementalProjects`: existing verified project cards for the secondary archive.
- `labItems`: the existing nine game descriptors or an imported alias to their current data.

Every `caseStudies` record uses the same contract:

```js
{
  id: string,
  title: string,
  label: string,
  confidentiality: 'private' | 'public',
  confidentialityNote: string,
  context: string,
  responsibilities: string[],
  system: {
    nodes: { id: string, label: string, detail?: string }[],
    edges: { from: string, to: string, label?: string }[],
  },
  reliability: string[],
  delivered: string,
  stack: string[],
}
```

`SystemDiagram` consumes only `system.nodes`, `system.edges`, and an accessible title. It does not read global portfolio data or inject case-specific copy, which keeps the diagram primitive independently testable.

Employment, period labels, and professional biography strings must not be duplicated in `src/data/gameData.js` or components. The lab derives any portfolio biography or experience references from shared public data. This eliminates the current drift between the main experience, game content, tests, and resume generator.

### Page composition

`src/App.jsx` owns only page composition, progressive UI state, and global utilities. The professional page order is:

```text
Navbar
main
  Hero
  Projects (selected case studies)
  Experience
  Skills (capabilities)
  Education (education and credentials)
  Contact
  AdditionalWork (archive and lab disclosure)
Footer
```

The back-to-top control and scroll progress indicator may remain if they meet accessibility and motion requirements. Music, command palette, and update banner are not mounted in the primary shell.

### Component responsibilities

- `Navbar.jsx`: five section links, current-section state, mobile menu, focus management, and contact action.
- `Hero.jsx`: stable positioning, actions, portrait, profile links, and proof band. It has no rotating title, game action, or animated count-up.
- `Projects.jsx`: renders all three case studies as readable articles without tabs, category filters, or fake media placeholders.
- `SystemDiagram.jsx` (new): accepts semantic nodes and relationships, renders a readable ordered list plus decorative connectors, and never contains case-specific copy.
- `Experience.jsx`: renders three employment roles and one earlier-work chapter. Expansion is optional; all essential copy must remain available without pointer hover.
- `Skills.jsx`: renders six capability groups with descriptions and compact lists.
- `Education.jsx`: renders degree, two recognitions, and six credentials; matching authentic certificate links are optional enhancements.
- `Contact.jsx`: retains the working contact form and direct contact routes, with status messages announced to assistive technology.
- `AdditionalWork.jsx` (new): owns the secondary project disclosure and lazy lab/music entry points.
- `InteractiveLab.jsx`: remains responsible for lazy arcade launch and focus return, but is mounted only inside `AdditionalWork`.
- `Footer.jsx`: concise identity, primary links, and the secondary archive/lab link.

Component files for retired primary-shell features remain in the repository but are not imported by `App.jsx`; no source deletion is required for this release.

## Visual system

### Direction

The visual language is `editorial systems notebook`: a warm paper surface, deep ink sections, measured typography, thin rules, and architecture diagrams that feel annotated rather than decorative. The memorable element is the pairing of an editorial serif headline with precise systems maps and small mint routing lines.

### Color tokens

Preserve the existing palette with stricter roles:

- `--ink: #0b2528` - primary dark surface and body text.
- `--ink-soft: #123438` - secondary dark surface.
- `--paper: #f3f0e9` - primary light canvas.
- `--paper-deep: #e8e3da` - alternate light section.
- `--white: #fffdfa` - high-emphasis light surface.
- `--mint: #67e0c1` - primary accent, focus support, routes, and active states.
- `--mint-deep: #0f806d` - accessible accent text on light surfaces.
- `--coral: #ff9c77` - sparing emphasis for one secondary detail or focus contrast, never a competing primary color.
- `--slate: #56696a` and `--mist: #a9b9b8` - secondary copy where contrast remains AA compliant.

At least 70% of the page is paper/white or ink. Mint is functional emphasis. Coral appears in less than 5% of the visible interface.

### Typography

- Display and case-study headings: self-hosted `Newsreader` variable serif, weights 500-700.
- Body, navigation, metadata, buttons, and code/technology labels: the existing self-hosted `Inter` variable font, weights 400-800.
- H1: `clamp(3rem, 7vw, 6.5rem)`, line-height `0.92-0.98`, max width about 12-14 words per visual block.
- H2: `clamp(2.25rem, 5vw, 4.75rem)`, line-height near `1`.
- Body: 16-18px with 1.65-1.75 line height and maximum 68-72 characters per line.
- Metadata and eyebrows: 12-13px, uppercase used only for short labels; no long uppercase text.

Both fonts use `font-display: swap`, metric-adjusted fallbacks, and local WOFF2 assets. Only above-the-fold font files are preloaded.

### Layout and composition

- Content width: `min(1180px, calc(100% - 48px))`, reducing side gutters to 20px on narrow screens.
- Desktop composition: a twelve-column grid with a seven/five hero split and asymmetric case-study layouts.
- Main prose never spans the full container.
- Section spacing: `clamp(80px, 10vw, 144px)`.
- Cards use 12-18px corner radii and one-pixel rules; avoid oversized pill containers and excessive shadows.
- Technology labels use plain inline metadata separated by dots or thin rules, not a wall of colorful badges.
- Case studies alternate the location of story and system map on large screens and stack story before map below 900px.
- At 320-479px, actions become full-width only where necessary, diagrams become vertical lists, and no content requires horizontal scrolling.

### Motion

- Use one orchestrated hero entrance and restrained section reveals, 180-420ms, opacity/transform only.
- Do not animate the H1 from fully invisible after first paint; it is the likely LCP element.
- No parallax, custom cursor, continuous orbit animation, animated count-up, auto-rotating titles, or ambient motion in the professional page.
- Hover effects have keyboard focus equivalents.
- `prefers-reduced-motion: reduce` disables nonessential movement and smooth scrolling while preserving all content and state changes.

## Accessibility requirements

- Meet WCAG 2.2 AA for the complete professional page and the archive/lab entry experience.
- Maintain one visible H1, sequential heading levels, semantic `main`, `nav`, `section`, `article`, `aside`, and `footer` landmarks, and meaningful section labels.
- Preserve the skip link and ensure it moves focus to `#main-content` without a hidden-focus state.
- All controls are operable with keyboard alone, have visible focus, and provide at least a 44 by 44 CSS-pixel target where space permits.
- Normal text contrast is at least 4.5:1; large text and non-text UI contrast are at least 3:1.
- Mobile navigation and any disclosure/dialog correctly manage focus, close on Escape where applicable, expose `aria-expanded`/`aria-controls`, and restore focus to the trigger.
- Case-study diagrams have semantic text equivalents. Decorative connector SVGs are `aria-hidden="true"` and not focusable.
- Portrait alt text describes Charlie only if the image adds identity information; decorative portraits use empty alt text beside visible identity text.
- Contact form inputs retain persistent labels, field-level errors, an error summary when submission fails, and polite live-region status updates.
- External links indicate their destination in accessible names when the surrounding text is ambiguous.
- The page remains understandable at 200% browser zoom, at 400% reflow width, with CSS disabled, and with JavaScript delayed.
- Lab audio never auto-plays, and every game keeps an obvious keyboard-accessible exit that restores focus.

## Performance requirements

- Initial professional-page JavaScript must exclude game engines, Three.js game modules, Howler/music code, Supabase leaderboard code, and game assets. Those modules load only after the lab is launched.
- The command palette, music player, rotating title, animated counters, and category-filter runtime are removed from the initial render path.
- Keep the existing above-the-fold profile WebP with explicit width/height, `fetchpriority="high"`, and no lazy loading. All below-fold raster images use WebP/AVIF where available, explicit dimensions, lazy loading, and async decoding.
- The system maps use HTML/CSS/SVG and no charting or animation dependency.
- Preserve progressive rendering if JavaScript or IntersectionObserver fails; content is visible by default.
- Production targets on a representative mobile Lighthouse run: Performance at least 90, Accessibility at least 95, Best Practices at least 95, and SEO at least 95.
- Core Web Vitals targets: LCP below 2.5 seconds, CLS below 0.1, and INP below 200ms at the 75th percentile when field data becomes available.
- The page must not make network requests to YouTube, audio providers, Supabase, or game services before the visitor explicitly opens the relevant optional feature.

## SEO and metadata

- Document title: `Charlie James Abejo | Full-Stack Web & Mobile Developer`
- Meta description: `Full-stack developer with 5+ years building production web, iOS, Android, CRM, API integration, and real-time systems. Based in the Philippines and available for remote work.`
- Open Graph and Twitter title/description match the primary metadata.
- Canonical URL remains `https://portfoliobboy.vercel.app/` unless deployment configuration proves a different production domain.
- `Person` JSON-LD uses `jobTitle: "Full-Stack Web & Mobile App Developer"`, the canonical name/location/contact links, and only resume-backed `knowsAbout` topics.
- Provide one dedicated 1200x630 editorial social card using the name, role, ink/paper/mint palette, and portrait or monogram. It must not imitate a product screenshot.
- `robots.txt` allows the portfolio, `sitemap.xml` contains the canonical root URL, and both use the production origin consistently.
- Every case study renders in the initial professional-route DOM without a tab click, filter action, or secondary network request. Search metadata and structured data remain in `index.html`; case-study copy remains ordinary semantic page content rather than canvas-rendered text.

## Resume asset handling

1. Copy `/Users/a1234/Downloads/ABEJO_CHARLIE_JAMES_RESUMEE.pdf` unchanged to `public/charlie-james-abejo-resume.pdf` during implementation.
2. The expected SHA-256 hash of the public file is `ffe82da88e664d43d931bcf7f96f620b3efb58cc32d9bd35c18dffc33f18ff60`.
3. `resumeUrl` remains `/charlie-james-abejo-resume.pdf` and every resume link uses that export.
4. The visible action reads `View resume (PDF)`; include the approximate size (`505 KB`) in nearby accessible text or the link label.
5. Open the PDF in a new tab from the hero and provide a plain download link in the credentials/contact area.
6. Do not use either small generated `ABEJO_CHARLIE_JAMES_RESUME.pdf` currently in the repository or `output/pdf/` as the deployed asset; their hashes differ from the supplied canonical PDF.
7. Automated tests verify the public filename exists, its hash matches the value above, and the built site retains the same bytes.

## Error and resilience behavior

- If the contact form fails, preserve the visitor's entered values, show a plain-language error, announce it, and keep the direct email action visible.
- If the portrait fails to load, identity and positioning remain complete in text; no broken-image frame should determine hero height.
- If the optional lab import fails, show a retryable message inside the disclosure and keep the professional page unaffected.
- If a supplemental live-project link is unavailable, label the item `Private` or `Archived` instead of rendering a dead action.
- Deep links to `#work`, `#experience`, `#capabilities`, `#credentials`, `#contact`, and `#archive` land below the fixed navigation after cold load and font/image settling.

## Testing and QA

### Automated content tests

Update `tests/portfolioData.test.js` to assert:

- `5+` is the experience proof and no user-facing biography says `2 years`.
- The three employment roles and their exact canonical periods are present.
- Rooche is `Jan 2026 - Mar 2026`.
- SocietyOne is `Jan 2024 - Dec 2025`.
- The Australian contract is labeled `Australian Client`, has period `2026`, and exposes neither the current client name nor the currently hard-coded commercial CRM product name.
- There are exactly three primary case studies, four earlier-work entries, six capability groups, and six resume credentials.
- The main navigation has exactly five section links and does not contain lab, games, music, or credentials counts.
- The resume URL is `/charlie-james-abejo-resume.pdf` and the asset hash matches the canonical hash.
- `src/data/gameData.js` contains no independent employment periods or two-year biography.
- Each case study includes context, responsibility, system nodes, reliability evidence, delivered outcome, stack, and confidentiality classification.

Replace the current resume generator assertions in `tests/test_resume.py` with checks against the deployed canonical PDF asset. The portfolio redesign must not regenerate a different resume or preserve the current incorrect Rooche/SocietyOne expectations.

### Interaction and accessibility tests

Add Playwright coverage for Chromium at desktop and mobile dimensions:

- Primary navigation and cold-load deep links reach the correct headings.
- Mobile menu traps/restores focus and closes with Escape.
- Every interactive element is reachable in a logical keyboard order.
- The archive disclosure opens from the footer and direct `#archive` navigation.
- The lab code is absent from the initial network log and loads after `Launch the lab`.
- Contact success and failure status regions are announced and form values survive failure.
- Resume links return a PDF and the public asset is reachable.
- There is no horizontal overflow at 320, 390, 768, 1024, and 1440 CSS pixels.
- An axe scan has zero critical or serious violations on the professional page, open mobile menu, open archive, and lab launcher state.

### Visual and performance QA

- Capture and review full-page screenshots at 390x844, 768x1024, and 1440x1000.
- Review the hero at 200% zoom and the page at a 320px reflow width.
- Test reduced motion, high contrast/forced colors, keyboard-only navigation, slow 3G loading, failed portrait, failed lab import, and failed contact request.
- Run the production build and preview before Lighthouse. Record the four Lighthouse category scores and LCP/CLS observations.
- Run a source-wide content scan for the forbidden client/CRM terms, stale periods, two-year claims, and the 25-credential claim before release.

## File impact for implementation

### Create

- `src/components/SystemDiagram.jsx` - reusable accessible architecture-map primitive.
- `src/components/AdditionalWork.jsx` - optional project archive and lazy lab/music entry point.
- `public/fonts/newsreader-var-latin.woff2` - self-hosted display font.
- `public/charlie-james-abejo-resume.pdf` - byte-for-byte canonical resume asset.
- `public/og-portfolio.png` - 1200x630 editorial social card.
- `playwright.config.js` - desktop/mobile interaction test configuration.
- `tests/portfolio.e2e.spec.js` - navigation, accessibility, privacy, lazy-loading, and responsive checks.

### Modify

- `src/data/portfolioData.js` - canonical profile, proof, case studies, roles, earlier work, capabilities, credentials, and supplemental archive data.
- `src/data/gameData.js` - remove duplicated biography and employment dates; derive shared facts from portfolio data.
- `src/App.jsx` - professional page composition and removal of nonessential primary-shell features.
- `src/components/Navbar.jsx` - five-link primary navigation and simplified mobile menu.
- `src/components/Hero.jsx` - stable resume-aligned message, actions, portrait, and proof band.
- `src/components/About.jsx` - retire from page composition or convert its useful fit copy into capability introductions; it is not a separate primary section.
- `src/components/Projects.jsx` - three sequential case-study articles with `SystemDiagram`.
- `src/components/Experience.jsx` - three roles plus the earlier-work chapter.
- `src/components/Skills.jsx` - six capability groups.
- `src/components/Education.jsx` - canonical education, recognitions, and six credentials.
- `src/components/InteractiveLab.jsx` - secondary launcher context and lazy-load behavior.
- `src/components/Contact.jsx` - resume-aligned availability and resilient accessible form states.
- `src/components/Footer.jsx` - compact primary/footer navigation and archive/lab entry.
- `src/index.css` - editorial tokens, responsive layout, system maps, case studies, disclosures, focus, reduced motion, and removal of obsolete primary-shell styling.
- `src/main.jsx` - only if required to import the new display font styling or simplify motion boot behavior.
- `index.html` - title, metadata, social card, font preload, theme boot styles, and JSON-LD.
- `public/manifest.json`, `public/robots.txt`, `public/sitemap.xml`, and `public/offline.html` - consistent identity, metadata, colors, and production origin.
- `tests/portfolioData.test.js` - canonical data, privacy, counts, and asset assertions.
- `tests/test_resume.py` - validate the public canonical asset instead of a regenerated resume.
- `package.json` and `package-lock.json` - add repeatable browser/accessibility test scripts plus the test-only `@playwright/test` and `@axe-core/playwright` dependencies.

### Retain without primary-shell imports

- `src/components/CommandPalette.jsx`
- `src/components/MusicPlayer.jsx`
- `src/components/RotatingTitle.jsx`
- `src/components/AnimatedStat.jsx`
- Existing `src/components/game/` and `src/lib/` game modules

These files remain available for the optional lab or future cleanup. They are not imported in the initial professional-page graph unless explicitly needed by `AdditionalWork` after visitor interaction.

## Acceptance criteria

The redesign is complete only when all of the following are true:

1. The first viewport presents one stable full-stack web/mobile positioning statement, `5+ years`, selected-work and resume actions, availability, and no game/music action.
2. The Australian client remains anonymous everywhere in rendered copy, metadata, data files consumed by the UI, lab biography, tests, and diagrams; the commercial CRM name is absent from public output.
3. The experience timeline displays the exact three roles and periods defined in this specification, followed by the clearly separate 2021-2023 earlier-projects chapter.
4. The selected-work section contains exactly three always-readable case studies and no tabs, category filters, fake media placeholders, fabricated screenshots, or unsupported metrics.
5. The main page shows six capability groups and exactly six resume credentials, with no 23/25-credential claim.
6. Primary navigation contains only Work, Experience, Capabilities, Credentials, and Contact; archive/lab is a footer-level secondary route.
7. Games, Three.js game modules, music code, Supabase leaderboard code, and related assets do not load before explicit lab interaction.
8. The floating music control, rotating title, animated count-up, command palette control, and hero game action are absent from the professional experience.
9. `/charlie-james-abejo-resume.pdf` exists in the production build and matches SHA-256 `ffe82da88e664d43d931bcf7f96f620b3efb58cc32d9bd35c18dffc33f18ff60`.
10. The supplied exact Rooche, SocietyOne, education, credential, and 5+ years content appears consistently in visual copy, shared data, metadata, and automated assertions.
11. The page meets the accessibility, responsive, and Lighthouse thresholds in this specification and has zero critical or serious axe violations in tested states.
12. `npm test` and `npm run build` pass, the browser test suite passes, and release QA confirms no forbidden terms, stale dates, dead primary links, or horizontal overflow.
