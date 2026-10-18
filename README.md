# Charlie James Z. Abejo — Portfolio

Production-focused portfolio for an AI Developer and Full-Stack Engineer. The site presents verified experience, projects, skills, credentials, and contact details while preserving the original interactive arcade and optional music player.

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

Verified portfolio content lives in `src/data/portfolioData.js`, including:

- Personal details and professional titles
- Navigation and statistics
- Experience and project case studies
- Project filters and archive entries
- Skill groups, education, credentials, and recognition
- Interactive game and music metadata

Game-specific narrative content remains in `src/data/gameData.js` because it drives the dungeon experience.

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

The player offers exactly two English demos: US English and Australian English. Each is a complete six-turn studio visit booking conversation with distinct receptionist and customer voices. They were generated locally using [Qwen3-TTS VoiceDesign](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign) through MLX Audio 0.5.9 and the Apache-2.0 [MLX 4-bit conversion](https://huggingface.co/mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-4bit). Voice directions specify relaxed General American or contemporary Australian English, connected speech, and conversational intonation. No person's recording or cloned voice was used.

The selected files are `src/assets/audio/voice-us-natural-v6.m4a` and `src/assets/audio/voice-au-natural-v6.m4a`, exported as mono AAC at 128 kbps. Speech keeps its generated tempo, with short turn-taking gaps and balanced speaker volume. No laugh effects, added breaths, music, or telephone filters are mixed in. Model revision, checksums, voice directions, and generation settings are in `public/audio/README.txt`.

Scripts and accent tags are in `src/data/voiceSamples.js`. Visitors load only local, content-hashed audio files; there is no runtime speech API, account, paid provider dependency, or model download. Temporary generation models and tooling are removed after verification.

The voice section follows the hero and has a primary navigation link. Vite emits content-hashed audio URLs so previously failed cached URLs are bypassed. A failed recording offers Retry audio and a direct audio link. Native controls use `preload="metadata"` and never autoplay. Switching accents stops the previous sample and updates the transcript. All voices are synthetic, not human recordings, real client calls, or Alex recordings. Vocal naturalness requires listening feedback; browser checks verify playback and interactions. For authentic Alex audio, replace the files with approved, redacted recordings and update the transcripts and disclosure together.

## Verification

Run `npm test`, `npm run build`, and `npx playwright test`. Browser checks need `npx playwright install` once. The Python resume check needs ReportLab and `pdftotext`; use the bundled Codex Python runtime if the system Python lacks ReportLab. Contact browser tests intercept requests so they do not send real email.

## Recommended next content

- Add approved screenshots for the remaining case studies.
- The authenticated Momentum review found 34 private repositories. Members, Campaigns, and Drive are candidates for deeper case studies beyond their current group-level mentions; confirm personal contribution and public-safe screenshots before expanding the published copy. Some other repositories still have starter-template READMEs, so repository existence alone should not be presented as a delivered product.
- Add measured outcomes with supporting evidence and client-approved testimonials.
- Replace illustrative voice scripts with an approved Alex recording when available.
