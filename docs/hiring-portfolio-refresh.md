# Hiring portfolio refresh

Approved scope: improve OneRide, Zalio CRM, Alex/Hasti; consolidate repeated project previews; keep the US/AU voice player compact directly after the hero; commit, push, deploy and verify.

1. Curate three case studies with visible ownership, delivered capability and public proof. Source: `portfolioData.js` OneRide, Zalio CRM, Alex and Hasti records, current experience, and `generate_resume.py` OneRide ownership statement. Do not invent performance metrics or equate the anonymous Enterprise CRM Platform with Zalio CRM.
2. Replace the repeated homepage previews with the three studies. Preserve all project records, live links, search, filters and engineering systems in one collapsed archive. Preserve cold and in-page fragment navigation and command-palette access to archived sections.
3. Keep the existing audio and retry behavior. Tighten player spacing, retain the synthetic-audio disclosure, and put the call timeline inside an engineering disclosure.
4. Verify case-study disclosures, archive navigation, keyboard interactions, media failure handling, audio, responsive layouts and existing portfolio features. Run Node checks, resume check, production build and browser tests. Review the final diff before committing.
5. Push the tested commit, explicitly deploy it to Vercel production (configured Git production branch is master; repository branch is main), verify deployed SHA and live mobile/desktop flows. Remove generated test output and caches.

Visual direction: retain the existing paper, dark ink and mint palette; use editorial rows with authentic public imagery, prominent contribution statements and concise delivery summaries. Detailed engineering stays available through native disclosures.

Local verification: 21 Node checks and the resume check pass; Vite production build succeeds. Browser coverage spans all 168 current test variants across Chromium, Firefox and WebKit, using the full suite plus focused reruns after scoping the project-filter selector. The final focused run passed 42/42, including cold fragments, repeated fragment navigation, command-palette focus, disclosure keyboard controls, public-image failure states and responsive touch targets. Existing contact-form checks intercept email requests. The four selected-study destination URLs returned HTTP 200. Independent review found no blockers. Desktop and 390px mobile layouts were visually reviewed.
