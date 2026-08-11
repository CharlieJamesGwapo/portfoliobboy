# Hiring Portfolio Content Update

## Goal

Make the portfolio accurate, concise, and ready for hiring review. The site will present two years of professional experience, preserve the supplied technology breadth, remove the Alumni Tracking System, and add two recent OMJI products with realistic dates.

## Chosen approach

Use a selective, hiring-focused portfolio timeline. This keeps the established page structure and case-study format while correcting claims and replacing the removed alumni case study with stronger recent work.

Two alternatives were considered:

- A minimal copy-only edit would be faster, but it would leave project counts and case-study coverage inconsistent.
- Rebuilding the experience timeline around every project would overstate project work as employment and make the page harder to scan.

The selective approach is preferred because it improves credibility without changing the visual system or inventing employment history.

## Content changes

### Experience positioning

- Replace every user-facing claim of five or more years with exactly `2 years`, using `2` in numeric proof cards and natural prose elsewhere.
- Remove `current` phrasing from portfolio copy and replace it with outcome-oriented wording.
- Keep the professional roles and verified technology stacks intact.
- Remove the MOIST Alumni Online Tracking System experience entry completely.
- Recalculate visible role and engagement counts after removal.

### Technology inventory

- Preserve all listed technology stacks and project-specific technologies.
- Remove only the MongoDB entry from the general skills inventory because it is the portfolio's explicit NoSQL database skill.
- Keep Firebase where it documents real mobile and real-time project experience.

### Featured projects

- Remove the MOIST Alumni Tracking case study completely.
- Add `One Ride Balingasag (OMJI)` as a featured full-stack/mobile product with `Started Apr 2026` and a live Google Play link.
- Describe its verified architecture: React Native/Expo mobile app, React/TypeScript web and admin clients, Go/Gin API, PostgreSQL/GORM, JWT, maps, and WebSocket real-time tracking.
- Summarize the four primary service areas: Pasugo, Pasabay, Pasundo, and local store delivery. Include representative operational features without copying the full source README.
- Add `OMJI Internet Access & Billing System` as a featured full-stack/network operations product dated `Apr–Jun 2026`.
- Describe time-based billing, vouchers, multi-station management, reports, MikroTik integration, mobile/web administration, Docker deployment, and the supplied TypeScript/Go stack.
- Mark private source code as private. Only One Ride receives a public product link because that URL was supplied.

### Counts and hiring copy

- Recalculate featured and total project counts after removing one project and adding two; the seven case studies represent eight core products, plus eight archived builds, for `16+` products and client builds.
- Keep calls to action focused on hiring, roles, and project discussions.
- Avoid inflated claims, repository exposure claims, download counts, or business outcomes that were not supplied.

## Implementation boundaries

- Update content data, the few components containing duplicated experience/count copy, and data tests.
- Do not redesign the page, remove unrelated projects, remove supplied tech stacks, or alter certificate/education records.
- Do not modify the newly supplied résumé PDF as part of this content task.

## Verification

- Add assertions for the two-year positioning, removal of alumni entries and MongoDB, the two new project date labels, and the exact Google Play URL.
- Update inventory counts in tests.
- Search the source for stale five-year, alumni, MongoDB, and `Current product` copy.
- Run the automated tests and production build.
