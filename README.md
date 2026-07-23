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
- Eight-game Interactive Lab
- Optional YouTube playlist music player with no autoplay
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

Five authentic Anthropic certificate images are included and shown in the credentials gallery. The repository still does not contain authentic project screenshots, images for the remaining text-only credentials, individual repository URLs for private or unlinked work, or real dungeon audio. The UI reports unavailable media honestly and does not substitute stock images, dummy credentials, or fabricated links.
