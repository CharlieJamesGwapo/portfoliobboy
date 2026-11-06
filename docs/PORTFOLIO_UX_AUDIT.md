# Portfolio UX audit — 2026-11-06

Audit of the live site, https://portfoliobboy.vercel.app/ (production build
`3b8dc60`, main after PR #15), followed by the fixes on branch
`feat/premium-ux-audit`.

## How it was measured

- **Rendered pages, not source.** I drove the production site in Chrome
  (Playwright, Chrome channel) at **320, 375, 390, 430, 768, 1024, 1280, 1440
  and 1920 px**, scrolling the full page at each width. I took full-page and
  per-section screenshots in **light and dark** themes and opened every
  disclosure (`<details>`) for the contrast pass.
- **Measured, not estimated.** The scripts collected:
  - horizontal overflow
  - controls smaller than 24 × 24 px
  - fixed-position overlaps
  - console errors
  - duplicate IDs and unnamed controls
  - text contrast against solid backgrounds (WCAG AA thresholds)
  - FCP, LCP and CLS via `PerformanceObserver`
  - transfer sizes per resource type
- **Throttling.** Mobile metrics use 4× CPU throttling plus a ~1.6 Mbps,
  150 ms RTT network.
- **No Lighthouse score is quoted.** Lighthouse was not installed and I did not
  add it as a dependency.
- **Interactions.** I checked Alex (greeting, launcher, panel, Escape and focus
  return), the mobile menu, and the ⌘K palette at 390 and 1440 px.

Screenshots referenced below are in `docs/screenshots/ux-audit/`.

## Baseline: what already works

These were checked and are **not** problems, so I left them alone:

- **Performance:** LCP **1.04 s** on throttled mobile and 0.41 s on desktop.
  CLS **0**. **405 KB** total transfer and **12 requests** on first load. Audio
  uses `preload="metadata"`, and games, music and imagery are lazy.
- **Errors and overflow:** **0 console errors** at all nine widths. **No
  horizontal page scroll** at any width (some decorative children exceed the
  viewport but are clipped).
- **Markup:** no unnamed buttons or links, no duplicate IDs, one `<h1>`.
- **Links:** every `target="_blank"` has `rel`.
- **SEO:** title, description, canonical, Open Graph image and JSON-LD are
  present. `sitemap.xml` lists 23 routes, and each case-study route has its
  own canonical.
- **Alex:** the panel is a labelled dialog. Focus moves to the input on open,
  and Escape returns focus to the launcher. The greeting waits until the hero
  is scrolled away, so it never covers the hero.
- **Case studies** already follow Problem → My role → Architecture →
  Implementation → Workflows → Engineering → Outcome, with links. **PadSplit
  has no verified, publishable material in this repository, so it was not
  added.** No results or testimonials were invented.

## Findings

Severity:

- **P0:** broken, or loses visitors.
- **P1:** a serious usability or credibility problem.
- **P2:** a clear, measurable improvement.
- **P3:** polish.

"Observed" findings are reproducible on the live site. "Preference" findings
are design judgement and are labelled as such.

| ID | Area | Problem (observed) | User impact | Sev. | Fix | Complexity | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UX-01 | Voice Studio | Two full studios are stacked (8-accent player, then Multilingual). The Spanish call is only reachable after scrolling past the whole accent studio. The section is **2,533 px** tall at 390 px. | The newest, most distinctive demo is easy to miss. Mobile visitors scroll through ~3 screens. | P1 | `English Accents \| Multilingual Conversations` segmented tabs (ARIA tabs, arrow/Home/End keys). Shows real availability: "8 recordings" and "1 recorded · 1 planned". A deep link `/#voice-multilingual` opens the second tab. Switching pauses hidden audio. | Medium | **Fixed.** Section is now ~1,620 px at 390 px. `before/after-voice-390.jpg`, `before/after-voice-1440.jpg` |
| UX-08 | Voice engineering (light theme) | When "Explore the voice engineering" is opened, the ladder labels (`INVITE`, `200 OK`, …) are **1.07:1** (invisible) and details are **2.26:1**. The light theme recoloured text that sits on a panel that stays dark. | The technical deep-dive is unreadable in light mode. | P1 | Light-on-dark colours restored inside the voice section. | Low | **Fixed.** Re-measured at 0 failures. |
| UX-02 | Positioning / conversion | No section says what a client can hire for. The only summary is the "What I build" ribbon link, which jumped to the engineering-oriented AI Systems grid. | Business visitors have to infer services from skills and project lists. | P1 | New **"What can I build for you?"** section: AI Agents, Automation, Web & Mobile, Backend Systems. Each card has a link to **existing evidence** on the site and a "Start a project" link that pre-selects a contact subject (never overwriting typed text). | Medium | **Added.** `after-services-1440.jpg`, `after-services-dark-1440.jpg`, `after-services-390.jpg` |
| UX-13 | Hero CTAs | The CTAs were "Explore projects" and "View resume", plus small links. There was no direct path to the AI demos in the button row. | The two strongest proofs (work, AI) were not equal first choices. | P2 | Primary: **Explore my work**. Secondary: **Experience my AI**. Support links: **Let's work together** and **View resume** (PDF, new tab, announced). | Low | **Fixed** |
| UX-06 | Mobile hero | The 300 × 320 portrait stacked above the name, so the `<h1>` started at **562 px** at 390 px. The support links ("Get in touch", voice demo) were below the fold. | First screen on phones is mostly photo. | P2 | Portrait kept at its reviewed minimum (164 × 184, 184 × 204 from 420 px) but placed **beside** the name. The headline, intro, both buttons and both support links now fit in 844 px. | Low | **Fixed.** `before/after-hero-390.jpg` |
| UX-09 | Dark theme contrast | 16 text elements at **2.46–3.16:1**: case-study index numbers, archive numbers and labels, "Explore the systems", capability numbers. They use `--mint-deep` on dark surfaces. | Small labels fail WCAG AA in dark mode. | P2 | They now use the theme accent or muted tokens. | Low | **Fixed.** 0 failures at 390 and 1440 px in both themes. |
| UX-11 | AI Automations | Arrows were pinned to each node's right edge. When a 4-step chain wrapped, an arrow **dangled at the end of a row** and the next step started a new line (6 of 8 cards). | Workflows read as broken diagrams. | P2 | Steps share one row with text wrapping inside each node. The result sits on its own row. Phones keep the vertical chain. | Low | **Fixed.** `before/after-automations-1440.jpg` |
| UX-12 | Independent products | The section heading started flush against the last client case-study card (no top spacing). | The two sections visually merge. | P2 | Added `--space-9` (`--space-8` on phones). | Low | **Fixed** |
| UX-14 | Navigation CTAs | The navbar "Let's talk" and the mobile "Start a conversation" were `mailto:` links. They opened a mail client (or nothing, on machines without one) and skipped the contact form and its paths. | A lost or confusing primary conversion action. | P2 | Both go to `#contact`. The email address stays visible there. | Low | **Fixed** |
| UX-16 | Mobile menu | 13 items in primary-then-"More" order: Contact was 6th, Voice demo 10th (it is the 2nd section). | The menu order contradicts the page. | P2 | Listed in page order, with Contact and Resume last. Services added. | Low | **Fixed** |
| UX-17 | Contact | Only two paths ("Hire me", "Build with me"), with nothing specific to automation, web or mobile, and no route for reviewers. On phones the cards stacked above the form. | Clients self-classify poorly. Mobile visitors scroll past large cards. | P2 | Four paths: Hire me, AI automation, Web application, Mobile app. Each pre-fills an editable subject. A quiet "Browse the case studies" link for reviewers. A 2 × 2 grid on phones (descriptions stay as accessible descriptions). | Low | **Fixed.** `after-contact-390.jpg` |
| UX-15 | Touch targets | Desktop nav links were **23 px** tall. "Explore the systems" was **21 px**, "Discuss your workflow" **19 px**, "What I build" **20 px**. All are below WCAG 2.2's 24 px minimum. | Hard to hit, especially on touch laptops and tablets. | P2 | Nav links min 32 px; the inline links min 44 px. | Low | **Fixed** |
| UX-18 | Alex: honesty | The header said "AI Portfolio Assistant" and the greeting says "Charlie's AI assistant", while the footer note says "No AI model". | Mixed signals about what Alex is. | P2 | The panel subtitle now reads "Portfolio assistant · instant answers". **The greeting text was kept as previously approved; changing "AI assistant" is an owner decision** (see Open decisions). | Low | **Partly fixed** |
| UX-19 | Alex on phones | While the panel slides in, page text shows through it (`before-alex-390.jpg`). The final surface was a 98% gradient. | The first moments of the conversation are hard to read. | P3 | Solid surface on phones. | Low | **Fixed.** `after-alex-390.jpg` |
| UX-20 | Alex answers | The voice answer linked only to the Voice Studio top. | The bilingual call needed another click to find. | P3 | Adds "Hear the bilingual call" (`/#voice-multilingual`) only while a recording is ready. | Low | **Fixed** |
| UX-21 | Audio volume slider | The range input is **4 px** tall (the thumb is larger). | Fiddly on touch. Play, pause and seek are fine. | P3 | A larger hit area means restyling the custom player's range track across browsers. | Medium | **Open** |
| UX-22 | Page length (preference) | The homepage is **~30,000 px** on phones. Automations alone is ~5,700 px (8 full cards). | Long scroll, mitigated by nav, ⌘K and collapsed archives. | P3 | Show 4 workflows and a "Show all 8" disclosure, or a filtered carousel. I did not change this: the filters already exist and collapsing hides work. | Medium | **Recommended** |
| UX-23 | Section order (preference) | The Voice Studio sits before the client work. Hiring managers usually want work first. | Possibly slower path to evidence. | P3 | An existing test pins the studio as the first section after the hero, so that was a deliberate decision. I kept it and placed Services between the studio and the work, so the work is one section closer. | Low | **Kept by design** |
| UX-24 | SEO (homepage body) | The routes `/projects` and `/projects/*` are prerendered with content. The homepage body is client-rendered (its meta tags and JSON-LD are static). | Crawlers that don't run JS see the homepage metadata but not its text. | P3 | Prerender the homepage, which is a larger build change. | High | **Recommended** |

## Design system

See `docs/DESIGN_SYSTEM.md`.

- **Identity unchanged:** emerald, mint and coral, with the ink/paper
  surfaces.
- **New tokens:** spacing, radius, type, elevation and touch-target scales
  are now named tokens in `src/index.css`.
- **New code uses only tokens:** the services section, the Voice Studio tabs,
  and every refinement in `src/components/refinements.css`.
- **Why fixes live in one stylesheet:** they are scoped to the finding they
  fix and loaded last, rather than restyled across the ~20 existing
  stylesheets. That kept the change reviewable and avoided regressions in
  sections that already work.

## Measured comparison

Production (`portfoliobboy.vercel.app`, before) vs this branch's production
build served locally (`vite preview`, after). Same scripts and throttling.

| Metric | Before | After |
| --- | --- | --- |
| Mobile LCP (4× CPU, slow network) | 1,044 ms | 908 ms¹ |
| CLS (mobile and desktop) | 0 | 0 |
| First-load requests / transfer | 12 / 405 KB | 12 / 402 KB¹ |
| Main JS (gzip) | 68.6 KB | 70.3 KB (+1.7 KB) |
| Main CSS (gzip) | 55.2 KB | 56.8 KB (+1.6 KB) |
| Contrast failures (light / dark, all disclosures open) | 14 / 16 | **0 / 0** |
| Controls under 24 px (1440 px, excluding the volume range) | 8 | 0 |
| Voice Studio height at 390 px | 2,533 px | 1,619 px |
| Hero `<h1>` top at 390 px | 562 px | 367 px |
| Horizontal overflow, 320–1920 px | none | none |
| Console errors | 0 | 0 |

¹ The after build is served from localhost rather than Vercel's edge, so small
timing and transfer differences are not attributable to this change. The size
deltas come from the built assets themselves.

## Tests

- **Unit** (`node --test`): 51/51 (2 new), plus 2/2 Python.
- **Browser** (Chrome, dev server): 121/121.
  - New `ux-refresh.spec.js` covers the hero CTAs above the fold, services
    evidence links and contact pre-fill, the no-overwrite rule, the ARIA tabs
    keyboard model, the multilingual deep link, and overflow at 320, 768, 1024
    and 1920 px.
  - Existing specs were updated for the new CTA names, the four contact paths,
    and the tabbed multilingual panel (which now also checks that switching
    tabs pauses audio).
- **Production build plus production specs** (Chrome, `vite preview`): 15/15.
- **`npm audit`:** 0 vulnerabilities.
- **Not run:** Firefox and WebKit (only Chrome is installed locally for
  Playwright).
- **Pre-existing flake:** on a cold Vite dependency cache, the Arcade spec can
  fail with "Failed to fetch dynamically imported module". It passes after a
  `--force` restart and is unrelated to this change.

## Open decisions for the owner

1. **Alex's greeting** still says "Charlie's AI assistant". It answers from
   predefined portfolio content, so "portfolio assistant" would be more exact.
   I left it as previously approved.
2. Whether to **collapse Automations** to four cards on phones (UX-22).
3. Whether to **move the work before the Voice Studio** (UX-23). That would
   reverse the earlier "Voice Studio first" decision.
4. **Homepage prerendering** for SEO (UX-24).

No audio was generated, no credits were spent, live voice stays disabled, and
nothing was merged or deployed.
