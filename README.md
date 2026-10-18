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

The player offers exactly two English demos: US English and Australian English. Both selected recordings are now freshly generated with Resemble AI's free, open-source [Chatterbox Turbo](https://huggingface.co/ResembleAI/chatterbox-turbo), run locally through MLX Audio 0.5.9 using the [MLX 4-bit conversion](https://huggingface.co/mlx-community/chatterbox-turbo-4bit). The base model is MIT-licensed; the conversion's model card specifies Apache 2.0. The hosted demo failed to produce audio, so local generation was used. There is no paid provider account or runtime speech API dependency.

The selected files are `src/assets/audio/voice-us-chatterbox-v5.m4a` and `src/assets/audio/voice-au-chatterbox-v5.m4a`, exported as mono AAC at 128 kbps. Both conversations were generated anew, rather than using a tempo adjustment of an earlier recording. Synthetic US reference voices came from the prior Kokoro conversation; synthetic AU reference voices came from the prior Qwen conversation. No actual person's recording was used for voice conditioning. Generation used temperature 0.8, top-p 0.95, repetition penalty 1.2, and connected speech for each complete turn. There are no forced laughs or added breath effects. Detailed provenance is in `public/audio/README.txt`.

Scripts and accent tags are in `src/data/voiceSamples.js`. Visitors load only local audio files; model weights and generation tools are outside the app. Older English recordings remain as unused alternatives. Filipino has been removed from the selector and its public audio files have been removed.

The voice section follows the hero and has a primary navigation link. Vite emits content-hashed audio URLs so previously failed cached URLs are bypassed. A failed recording offers Retry audio and a direct audio link. Native controls use `preload="metadata"` and never autoplay. Switching accents stops the previous sample and updates the transcript. All voices are synthetic, not human recordings, real client calls, or Alex recordings. Vocal naturalness requires listening feedback; browser checks verify playback and interactions. For authentic Alex audio, replace the files with approved, redacted recordings and update the transcripts and disclosure together.

## Verification

Run `npm test`, `npm run build`, and `npx playwright test`. Browser checks need `npx playwright install` once. The Python resume check needs ReportLab and `pdftotext`; use the bundled Codex Python runtime if the system Python lacks ReportLab. Contact browser tests intercept requests so they do not send real email.

## Recommended next content

- Add approved screenshots for the remaining case studies.
- The authenticated Momentum review found 34 private repositories. Members, Campaigns, and Drive are candidates for deeper case studies beyond their current group-level mentions; confirm personal contribution and public-safe screenshots before expanding the published copy. Some other repositories still have starter-template READMEs, so repository existence alone should not be presented as a delivered product.
- Add measured outcomes with supporting evidence and client-approved testimonials.
- Replace illustrative voice scripts with an approved Alex recording when available.
