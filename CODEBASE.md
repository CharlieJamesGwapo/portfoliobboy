# CODEBASE.md — portfoliobboy

Audit snapshot taken **2026-11-21** on `main` @ `b6572f4` (in sync with `origin/main`).
This document covers how the project is put together and what the audit found.

---

## 1. Health check (results of this audit)

| Check | Result |
|---|---|
| `npm ci --ignore-scripts` | ✅ installs cleanly |
| `npm audit --omit=dev` | ✅ 0 vulnerabilities |
| `npm run build` (Vite + prerender) | ✅ builds in ~1.4s, emits metadata for 23 routes |
| `node --test` (unit tests) | ✅ **51 / 51 pass** (1 failed before Finding A was fixed) |
| Python tests (`tests/test_resume.py`) | ✅ 2 / 2 pass |
| Playwright e2e | not run in this audit |
| Malware / injected-code scan on `main` | ✅ clean (details in §2) |
| Malware scan on all 13 remote branches | ✅ clean |

### Findings, in order of priority

**A. ✅ FIXED — `.gitignore` no longer ignored `.env*` or `.vscode/*` (security, failing test)**
Commit `9a0cb1b` (#16, "UX audit…") deleted both lines from `.gitignore`. That breaks
`tests/repoSecurity.test.js` and means a plain `.env` file (for example one holding
`RESEND_API_KEY`) would be picked up by `git add .`. `.env.local` is still covered
by `*.local`. Removing `.vscode/*` matters because earlier infections in this repo
shipped `.vscode` payloads (see §2). An unrelated UX commit has no reason to touch
these lines, so treat the change as suspect. **Fixed** by restoring both lines:

```gitignore
.vscode/*
!.vscode/extensions.json
...
.env*
!.env.example
```

**B. The live ElevenLabs voice agent is blocked by the site's own headers**
`vercel.json` sends `Permissions-Policy: microphone=()`, which makes every
`getUserMedia` call fail. Its CSP `connect-src` allows only `'self'` and Supabase,
so the ElevenLabs WebSocket/WebRTC connections are refused too. Right now this only
matters when `VITE_ELEVENLABS_AGENT_ID` is set: without it, `LiveAgentPanel` stays
hidden and the recorded demo is shown instead. **Fix if you turn the live agent on:**
switch to `microphone=(self)` and add the ElevenLabs hosts (`https://api.elevenlabs.io`,
`wss://api.elevenlabs.io`, plus the LiveKit/WebRTC hosts the SDK uses) to `connect-src`.

**C. Arcade sound files are never deployed**
`.vercelignore` excludes `public/audio/*`, but `src/components/game/AudioManager.jsx`
requests `/audio/dungeon_ambient.mp3`, `/audio/sword_swing.wav` and other files from
there. In production those requests return 404 and the dungeon game has no sound,
unless the synth fallback in `src/lib/synthAudio.js` covers every cue. Either remove
that line from `.vercelignore` or confirm that the silence is intended.
(Voice Studio audio is fine: it lives in `src/assets/audio/` and is bundled by Vite.)

**D. Dead cloud-save path (low)**
`saveGameCloud()` in `src/lib/supabase.js` still inserts into `game_saves`, but
migration `20261026000000_private_game_saves.sql` revokes all access to that table
for `anon`/`authenticated`. Nothing calls the function today. Delete it, or keep it
until owner-scoped RLS exists.

**E. Root-directory clutter (housekeeping)**
The root holds two resume PDFs (`ABEJO_CHARLIE_JAMES_RESUME.pdf` is the one the build
serves; `CHARLIE_JAMES_ABEJO_RESUME (1).pdf` is unused), five certificate `.jpg` scans,
`image.png`, and three legacy `.txt` notes (`COMPLETE_SUMMARY.txt`,
`DEPLOYMENT_CHECKLIST.txt`, `INSTALL_INSTRUCTIONS.txt`). They are already excluded from
deploys, but they make the repository harder to scan. Consider moving them to `docs/`
or `assets-src/`.

---

## 2. Security history and current state

The repository was hit by a supply-chain style loader **more than once**
(around Oct 30 – Nov 21, 2026):

- `589668e`: removed a `fa-brand-400.orc` loader injected on 2026-10-30
- `ad1a68e` … `2e71ed4`: removed an injected loader, hidden padded code, and `.vscode` payloads
- `16b2d25` … `b6572f4` (9 commits, all titled "security: remove injected malware loader"):
  removed an extensionless `init` file, `node init &&` prefixes on npm scripts, a
  `createRequire` shim in `tailwind.config.js`, and code hidden after long runs of spaces

What this audit checked on `main`, with no hits:

- lines with ≥60 consecutive spaces/tabs, or longer than 800 characters (apart from the data file `voicePeaks.json`)
- `eval(`, `new Function(`, `createRequire`, `execSync`, `spawn(`, `fromCharCode`, `\x..` escape chains, `_0x` obfuscation
- `child_process`: used only by `scripts/build-voice-peaks.mjs` (runs `ffmpeg`, benign) and by the security test
- extensionless tracked files, npm `install`/`prepare` lifecycle scripts, git hooks
- every `resolved` URL in `package-lock.json` points at `registry.npmjs.org`
- committed secrets (`sk-…`, JWTs, AWS keys): none

The guard test `tests/repoSecurity.test.js` covers the padded-code trick and the
ignore rules. Keep it green (Finding A).

**Because the injection keeps coming back, also do these outside the repo:**
rotate the GitHub token/SSH keys and the Resend, Supabase and ElevenLabs keys; review
GitHub → Settings → Applications/Deploy keys; turn on branch protection for `main`
(no force-push); and check the local machine for whatever has been pushing.

---

## 3. What the project is

A personal portfolio for **Charlie James Z. Abejo** (full-stack / AI developer),
deployed to Vercel at `https://portfoliobboy.vercel.app`. It is a single-page React
app with a few path routes, prerendered metadata for SEO, an AI voice showcase, a
scripted on-page assistant ("Alex"), and a code-split arcade of browser games.

### Stack

| Layer | Tech |
|---|---|
| UI | React 18, Vite 8 (rolldown), Tailwind 3 plus about 10k lines of hand-written CSS |
| 3D / canvas | three.js 0.169, @react-three/fiber 8 (hero scene and arcade) |
| Voice | `@elevenlabs/react` (optional live agent) and recorded MP3 demos |
| Data | Supabase (optional leaderboard and tutorials, with a localStorage fallback) |
| Email | Resend, called from the Vercel function `api/contact.js` |
| Audio | howler.js (arcade), Web Audio synth fallback |
| Tests | `node:test` unit tests, Playwright e2e (Chromium/Firefox/WebKit), Python unittest for the resume |
| Hosting | Vercel (static `dist/` plus one Node function) |

Size: about 21.7k lines of JS/JSX and 9.9k lines of CSS under `src/`.

---

## 4. Directory map

```
api/contact.js            Vercel function: POST contact form → Resend email
index.html                Shell, meta tags, theme-init script
public/                   Static files: sw.js, offline.html, manifest, robots, sitemap,
                          profile images, certificates (WebP), project screenshots, audio/
scripts/
  prerender_routes.mjs    Post-build: writes dist/<route>/index.html with per-route meta + sitemap
  build-voice-peaks.mjs   ffmpeg → src/data/voicePeaks.json (waveform bars)
  generate_resume.py      Builds the resume PDF
  capture-/measure-/verify-*.mjs   Playwright helpers for screenshots and perf checks
src/
  main.jsx                Entry: arms entrance animations, renders <App>, registers the SW
  App.jsx                 Shell: router, scroll progress, ⌘K palette, music player, sections
  components/             Page sections (Hero, Services, Experience, AISystems, Automations,
                          VoiceAgentDemo, Skills, Education, Contact …) plus their CSS
    assistant/            "Alex" scripted portfolio assistant (no network, no mic)
    voice/                Voice Studio: accent gallery, multilingual conversations, tabs
    game/                 Arcade lobby and games (Dungeon, SpaceShooter, Racing, Snake,
                          FlappyDev, BlockBlast, WhackABug, CodeRacer, NeonCircuit)
  data/                   All content: portfolioData, caseStudies, routeMetadata,
                          voiceAccents, voiceConversations, automations, gameData …
  lib/                    Routing, metadata, prefetch, SW registration, Supabase client,
                          hero renderers (2D/WebGL), game engines, credential filter
  assets/audio/           Bundled voice demo MP3s
supabase/                 config.toml, schema.sql, migrations (leaderboard, tutorials, saves lockdown)
tests/                    Unit tests (*.test.js), e2e/ and production/ Playwright specs
docs/                     Design system, UX audit, plans and specs
```

---

## 5. How it works

### Routing
There is no router library. `src/lib/portfolioRoute.js` intercepts same-origin clicks
on `/`, `/projects`, `/projects/:slug` and `/lab`, then uses `history.pushState` and
re-renders. `App.jsx` lazy-loads `ProjectsPage`, `CaseStudyPage` (about 25 case
studies in `src/data/caseStudies.js`) and `LabPage`. Hash links (`/#contact`) are
re-resolved after mount, because the anchor does not exist until React renders.

### SEO / prerender
`npm run build` = `vite build && node scripts/prerender_routes.mjs`. The script copies
`dist/index.html` into `dist/<route>/index.html` with the route's title, OG/Twitter
tags, canonical URL and JSON-LD, then writes `sitemap.xml`. `vercel.json` rewrites
`/projects/:slug`, `/projects` and `/lab` to those files.

### Performance choices
- Vendor chunks pinned with rolldown `advancedChunks`: `react-vendor`, `three-vendor` (~675 kB), `r3f-vendor`
- three.js, the arcade, the music player and the live agent (~620 kB) load only on demand
- Scroll progress writes `transform` directly instead of setting a CSS variable on `:root`
- The service worker (`public/sw.js`) registers after `load`, so it only helps repeat visits

### Contact API (`api/contact.js`)
Exact-origin allowlist (production domain, localhost, and the current Vercel
preview URL), JSON-only, 32 KB body cap, per-field length limits, honeypot field
`company`, per-instance rate limit (5 per 10 minutes per hashed IP), HTML-escaped
email body, CR/LF stripped from the subject, 8s timeout on the Resend call. It sends
to `capstonee2@gmail.com` from `onboarding@resend.dev`.

### Supabase (`src/lib/supabase.js`)
Optional. It validates the URL before calling `createClient`, so a bad env value
cannot crash the arcade chunk. After the first network failure it marks the backend
down for the session, and it always falls back to a localStorage leaderboard.

### Voice
- **Recorded demos:** `src/data/voiceAccents.js` and `voiceConversations.js` import MP3s from `src/assets/audio/`; waveform bars come from `voicePeaks.json`.
- **Live agent:** `LiveAgentPanel` renders only when `VITE_ELEVENLABS_AGENT_ID` is set. Sessions are capped at 180s, and the mic permission is requested up front so a denial gets a clear message. Currently blocked by headers (Finding B).

### Hosting headers (`vercel.json`)
Strict CSP (scripts from self and YouTube only), HSTS preload, `nosniff`,
`X-Frame-Options: SAMEORIGIN`, a restrictive Permissions-Policy, `no-store` on
`/api/*`, immutable caching for `/assets/*`, and revalidation for HTML and `sw.js`.

---

## 6. Environment variables

| Name | Where | Required | Purpose |
|---|---|---|---|
| `RESEND_API_KEY` | Vercel (server) | for the contact form | Resend API auth |
| `VITE_SUPABASE_URL` | client build | optional | Leaderboard and tutorials |
| `VITE_SUPABASE_ANON_KEY` | client build | optional | Supabase public anon key |
| `VITE_ELEVENLABS_AGENT_ID` | client build | optional | Shows the live voice agent (public ID, not an API key) |

Put local values in `.env.local`. Every `.env*` file except `.env.example` is git-ignored.

---

## 7. Commands

```bash
npm ci                    # install (Node >=20.19 <21 or >=22.12)
npm run dev               # Vite dev server (:5173)
npm run build             # production build + route prerender → dist/
npm run preview           # serve dist/ (:4173), mirrors the Vercel rewrites
npm test                  # node unit tests, then Python resume tests
npm run test:e2e          # Playwright: AI systems spec (dev server on :5175)
npm run test:production   # build + Playwright production config
npm run deploy            # vercel build --prod && vercel deploy --prebuilt --prod
```

---

## 8. Tests

- **Unit (`tests/*.test.js`, 51 tests):** contact API hardening, hosting headers, repo security, service worker caching, credential filter, portfolio data integrity, voice and multilingual data, product studio, UX refresh, resume asset
- **E2E (`tests/e2e/`, 13 specs):** arcade lobby, case studies, hero carousel, assistant, theme/navigation, voice languages, and more
- **Production (`tests/production/`):** full upgrade, performance budgets, additional projects
- **Python:** `tests/test_resume.py` checks the generated resume PDF

---

## 9. Conventions

- Content lives in `src/data/*`. Components stay presentational.
- Each feature section has a co-located `.css` file. `refinements.css` loads last and wins ties.
- Comments explain *why* (performance, browser quirks, security), not *what*.
- Optional integrations (Supabase, ElevenLabs) must degrade gracefully, never crash the page.
- Heavy features are lazy-loaded and must not enter the landing page's preload graph.
