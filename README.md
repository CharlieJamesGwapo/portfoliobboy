# Charlie James Z. Abejo — Portfolio

Portfolio for Charlie James Z. Abejo, Lead Full-Stack Developer | AI, Web & Mobile. The site presents resume-aligned experience, project engineering, skills, credentials, and contact details while preserving the interactive arcade and optional music player.

## Stack

- React 18 and Vite 8
- Tailwind CSS plus a project-specific CSS design system
- Three.js through React Three Fiber for the hero systems network and arcade visuals
- Supabase for optional published tutorials and game leaderboards when configured
- Resend through the existing `/api/contact` serverless endpoint

The project intentionally remains React + Vite + Tailwind. Three.js, the arcade, individual games, and the music player are code-split so they do not inflate the main application module.

## Local development

```bash
npm install
npm run dev
```

The development server prints the available local URL. A production build can be verified with:

```bash
npm run build
npm run preview
```

## Content architecture

Core portfolio content lives in `src/data/portfolioData.js`, including:

- Personal details and professional titles
- Navigation and statistics
- Experience and project case studies
- Project filters and archive entries
- Skill groups, education, credentials, and recognition
- Interactive game and music metadata

Game-specific narrative content remains in `src/data/gameData.js` because it drives the dungeon experience.

The hiring homepage follows the portrait and six-project hero carousel → compact voice demo → three selected client case studies → independent products → about, experience and capabilities. `src/data/selectedCaseStudies.js` curates OneRide, Zalio CRM, and Alex/Hasti from the existing project and resume records. Each study makes personal contribution and delivered capability visible, with problem, engineering approach, and technical scope in a disclosure. Outcomes describe verified functionality; no business-performance metrics are invented. Zalio's imagery is explicitly labelled as its public website, not the private CRM interface.

The full project collection lives inside the collapsed `#full-project-archive` disclosure beneath selected work. It retains the eight original case studies, twelve additional builds, thirteen Momentum systems, live product links, search, filters, and optional systems visualization. Fragment links and the command palette reveal archived destinations before scrolling or transferring focus. The older anonymous Enterprise CRM Platform record remains distinct from the named Zalio CRM case study.

## Routes, themes, and project evidence

- `/` — refreshed homepage, authentic prominent portrait, manual six-project carousel, AI/voice engineering, and five independent products.
- `/projects` — complete project explorer with URL-persisted search/category/technology filters.
- `/projects/:slug` — fifteen case studies with architecture, engineering challenges, contribution, outcomes, and clearly labelled authentic or concept media.
- `/lab` — all nine original games behind an explicit launch control.
- `/charlie-james-abejo-resume.pdf` — the supplied updated resume, copied without rewriting it.

Project data is separated into `independentProducts.js`, `selectedCaseStudies.js`, and `caseStudies.js`. AgentForge is described as a CLI; its GUI artwork is a concept. ContextPilot's proposed voice experience and AutoFlow's planned integrations are clearly distinguished from current features. Missing private app screenshots use honest explanatory diagrams rather than invented screens.

The light/dark system uses semantic CSS variables, system preference, persistent manual selection, and a CSP-compatible script before first paint. Builds emit route-specific HTML metadata and a sitemap; client navigation updates titles, canonical URLs, and structured data. These static documents provide metadata rather than server-rendered React content.

See [the implementation and verification report](docs/portfolio-upgrade-report.md) for delivery details and deployment requirements.

## Preserved interactive features

- Accessible rotating professional titles
- Nine-game Interactive Lab
- Optional YouTube playlist music player with no autoplay
- Searchable project case studies and archive, with category filters and empty-state recovery
- A featured receptionist/customer conversation with native playback controls, transcript, and audio-error recovery
- Official OneRide screenshots in the project case study
- Compact expandable project archive and credential lists
- Project, experience, and credential statistics
- Active sticky navigation and accessible mobile menu
- Validated contact form using the existing real submission endpoint
- Clean, build-emitted resume route at `/charlie-james-abejo-resume.pdf`

## Performance and accessibility

- The Three.js scene is lazy-loaded with a CSS/WebGL fallback, capped device pixel ratio, reduced mobile detail, visibility-aware rendering, and reduced-motion behavior.
- Games and music load only after explicit user interaction.
- Navigation, project tabs, experience accordions, arcade dialog, music controls, and form states use keyboard-accessible controls and descriptive labels.
- Global reduced-motion rules remove nonessential animation.
- Responsive layouts are maintained from 320px through wide desktop sizes without horizontal overflow.

## Environment variables

The portfolio can render without optional service configuration. When used:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `RESEND_API_KEY` for the serverless contact endpoint

Do not send test contact submissions during QA.

## Missing media

Five authentic Anthropic certificate images are included and shown in the credentials gallery. Official OneRide app screenshots and public Momentum product previews are included. Other project case studies still need authentic screenshots, images for the remaining text-only credentials, individual repository URLs for private or unlinked work, or real dungeon audio. The UI reports unavailable media honestly and does not substitute stock images, dummy credentials, or fabricated links.

## Voice samples

The player offers two complete fictional studio enquiries: US English (about 79 seconds) and Australian English (about 95 seconds). Each has 16 turns with consistent receptionist and customer voices. The caller asks about joining and beginner guidance, negotiates an after-work tour, gives a name, agrees to a confirmation text, asks what to bring, and receives a clear recap. No real appointment is made.

The recordings use Microsoft neural voices through the generation-only [edge-tts client](https://github.com/rany2/edge-tts): Emma and Andrew for US English, William Multilingual and Natasha for Australian English. The voices use their native regional presets and unmodified speaking tempo and pitch. Only leading/trailing padding, short turn-taking gaps, fades at joins, and gentle speaker volume balancing are applied. No cloned voices, laugh effects, added breaths, music, or telephone filters are used.

The selected files are `src/assets/audio/voice-us-professional-v7.m4a` and `src/assets/audio/voice-au-professional-v7.m4a`, exported as mono AAC at 96 kbps. Voice identifiers, processing details, durations, and checksums are in `public/audio/README.txt`. Scripts and accent tags are in `src/data/voiceSamples.js`. Visitors load local, content-hashed files; there is no runtime speech API, account, provider request, or model download. Temporary generation tooling and intermediates are removed after verification.

The compact voice section follows the hero and has a primary navigation link. The real call trace is inside an “Explore the voice engineering” disclosure. Vite emits content-hashed audio URLs so previously failed cached URLs are bypassed. A failed recording offers Retry audio and a direct audio link. Native controls use `preload="metadata"` and never autoplay. Switching accents stops the previous sample and updates the transcript. All voices are synthetic, not human recordings, real client calls, or Alex recordings. Vocal naturalness requires listening feedback; browser checks verify playback and interactions. For authentic Alex audio, replace the files with approved, redacted recordings and update the transcripts and disclosure together.

## Verification

Run `npm test`, `npx playwright test --project=chromium`, and `npm run test:production`. Browser checks need `npx playwright install chromium` once. The Python checks use the standard library and verify that resume exports preserve the supplied PDF. Contact browser tests intercept requests so they do not send real email.

## Recommended next content

- Add approved screenshots for the remaining case studies.
- The authenticated Momentum review found 34 private repositories. Members, Campaigns, and Drive are candidates for deeper case studies beyond their current group-level mentions; confirm personal contribution and public-safe screenshots before expanding the published copy. Some other repositories still have starter-template READMEs, so repository existence alone should not be presented as a delivered product.
- Add measured outcomes with supporting evidence and client-approved testimonials.
- Replace illustrative voice scripts with an approved Alex recording when available.
