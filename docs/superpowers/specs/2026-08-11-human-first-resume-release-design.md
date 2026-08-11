# Human-First Resume and Portfolio Release

## Goal

Publish a consistent hiring package that presents Charlie as a human, product-minded full-stack engineer with two years of professional experience. Restore the MOIST Alumni Tracking System with its corrected 2025 dates, add the two 2026 OMJI projects to the resume, and deploy the portfolio and downloadable resume.

## Chosen approach

Use a concise two-page, ATS-readable resume rather than preserving the current three-page AI-heavy document. The portfolio keeps its established visual design and data-driven case studies; only factual content, project counts, and the downloadable resume asset change.

This is preferred over two alternatives:

- Keeping the existing three-page resume would preserve layout most closely but remain too long and AI-dominant for two years of experience.
- Creating a highly designed graphical resume would be visually distinctive but less reliable for applicant-tracking systems and text extraction.

## Resume content design

- Title: `Full-Stack Web & Mobile Developer`.
- Summary: exactly two years of professional experience, centered on web/mobile delivery, APIs, integrations, real-time systems, databases, and collaboration.
- AI is supporting evidence, not the identity: retain a brief developer-tools mention and optional LLM API capability, but remove the AI-focused role-fit row, dedicated AI Engineering block, custom-agent details, and repeated Claude Code claims.
- Preserve the verified core technology breadth: TypeScript, React, Next.js, React Native, Go, Python, Node.js, .NET, PHP/Laravel, PostgreSQL, MySQL, Firebase, Docker, AWS Lambda, CI/CD, WebSockets, and APIs.
- Keep the three professional roles, with the Australian contract title simplified to `Full-Stack Developer (Contract)`.
- Add a clear `Selected Projects` section:
  - `One Ride Balingasag (OMJI)` - Started Apr 2026; include the supplied Google Play URL and concise full-stack/mobile scope.
  - `OMJI Internet Access & Billing System` - Apr-Jun 2026; describe ISP/cafe billing, vouchers, MikroTik integration, reporting, and TypeScript/Go delivery.
  - `MOIST Alumni Tracking System` - Jan-Aug 2025; preserve Laravel, MySQL, RBAC, audit trails, and OTP/2FA.
- Retain earlier work in a compact additional-projects line so it remains visible without overwhelming the recent work.
- Preserve education, selected certifications, availability, and contact links.

## Portfolio correction

- Restore the Alumni Tracking System experience entry with `Jan 2025 - Aug 2025`.
- Restore the Alumni featured case study with `Jan-Aug 2025`.
- Place the restored entry chronologically after the 2024-2025 SocietyOne role and before earlier 2021-2023 project engagements.
- Update totals to 10 roles/engagements, 8 case studies representing 9 core products, 8 archived builds, and `17+` total products/client builds.
- Keep the One Ride and OMJI Billing case studies and their 2026 dates unchanged.

## PDF production and asset flow

- Build the resume from a versioned generator script so future edits are reproducible.
- Generate the final PDF at `output/pdf/ABEJO_CHARLIE_JAMES_RESUME.pdf`.
- Replace the user-supplied root PDF and the portfolio's public resume asset with the verified output.
- Use Letter pages, clean sans-serif typography, strong section hierarchy, selectable text, clickable links, and no clipped or overlapping content.
- Render every page to PNG and visually inspect the final output before publishing.

## Verification and release

- Test the restored Alumni entry, corrected dates, revised counts, and retained OMJI projects.
- Extract the final PDF text and assert the two-year wording, all three selected projects, dates, and reduced AI repetition.
- Run the full test suite and Vite production build.
- Push the committed `main` branch to its configured GitHub remote.
- Build and deploy production with Vercel, then verify the live page and downloadable resume URL.
