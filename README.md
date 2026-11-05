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

## Bboy AI Voice Studio

The voice section follows the hero and has a primary navigation link. It offers eight pre-recorded accent previews: American, British, Australian, Filipino, Canadian, Irish, Indian, and South African English. Each is a short (about 20–30 seconds) fictional business conversation between a visitor and an AI assistant, generated with ElevenLabs (Eleven v4, multi-speaker Text to Speech) under the Starter plan's commercial license. Voices, scripts, credit usage, and Voice Library notes are recorded in `docs/voice-gallery-plan.md`.

The recordings are `src/assets/audio/accents/*.mp3` (44.1 kHz mono, 128 kbps) and are emitted with content hashes, so replaying them makes no provider request and spends no credits. Transcripts and descriptions live in `src/data/voiceAccents.js`. Waveforms are measured from the audio by `node scripts/build-voice-peaks.mjs` (requires ffmpeg) into `src/data/voicePeaks.json`; re-run it whenever a recording changes.

The custom player uses the `<audio>` element as its source of truth: play/pause with a progress ring, a seekable waveform, volume and mute, and loading, finished, and error states. Switching accents stops and resets playback. Transcripts are static because no word-level timestamps exist. Everything is labelled as sample conversations performed by AI voices; none are real customer calls.

"Talk to My AI" stays disabled until a real ElevenLabs agent exists with server-side usage limits and `VITE_ELEVENLABS_AGENT_ID` is set. Production also needs `microphone=(self)` in the `Permissions-Policy` header in `vercel.json`. Until then the section links to Alex, the live voice agent on hasti.com.au.

## Alex, the portfolio assistant

A floating assistant in the bottom-left corner greets first-time visitors once (remembered in `localStorage`), never plays audio, and never asks for the microphone. Its chat panel answers from `src/data/portfolioData.js` through a local answer engine in `src/lib/assistantAnswers.js`: no model, no network request, and no credits. Unknown questions get an honest fallback that points to contact. The panel is lazy-loaded, sits below the navbar, and hides inside the Voice Studio and during games. "Talk to Alex" (voice) stays disabled until the live agent above is configured.

## Verification

Run `npm test`, `npx playwright test --project=chromium`, and `npm run test:production`. Browser checks need `npx playwright install chromium` once. The Python checks use the standard library and verify that resume exports preserve the supplied PDF. Contact browser tests intercept requests so they do not send real email.

## Recommended next content

- Add approved screenshots for the remaining case studies.
- The authenticated Momentum review found 34 private repositories. Members, Campaigns, and Drive are candidates for deeper case studies beyond their current group-level mentions; confirm personal contribution and public-safe screenshots before expanding the published copy. Some other repositories still have starter-template READMEs, so repository existence alone should not be presented as a delivered product.
- Add measured outcomes with supporting evidence and client-approved testimonials.
- Configure and test a live ElevenLabs agent with server-side usage limits before enabling "Talk to My AI" and "Talk to Alex".
