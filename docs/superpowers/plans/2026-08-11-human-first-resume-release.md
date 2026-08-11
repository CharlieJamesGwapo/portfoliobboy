# Human-First Resume and Portfolio Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the Alumni Tracking System with corrected dates, create a two-page human-first resume containing the three requested projects, publish it through the portfolio, and deploy the verified release.

**Architecture:** Keep portfolio content in the existing JavaScript data model and generate the resume through a versioned ReportLab script. Vite's verified-asset plugin will serve the new root PDF at the stable resume URL; GitHub and Vercel receive the same committed artifact.

**Tech Stack:** React 18, Vite, Node.js tests, Python 3, ReportLab, pdfplumber, Poppler, GitHub, Vercel

## Global Constraints

- Show exactly `2 years` of professional experience.
- Present Charlie as a full-stack web and mobile engineer; AI is a supporting tool/capability, not the resume identity.
- Restore `MOIST Alumni Tracking System` with `Jan 2025 - Aug 2025` in experience data and `Jan-Aug 2025` in the featured case study.
- Keep `One Ride Balingasag (OMJI)` as `Started Apr 2026` with the supplied Google Play URL.
- Keep `OMJI Internet Access & Billing System` as `Apr-Jun 2026`.
- Preserve the supplied technology breadth and project facts.
- Produce a two-page Letter PDF with selectable text and clickable links.
- Do not push or deploy until tests, PDF text checks, visual page review, and the Vite build pass.

---

### Task 1: Restore the Alumni project and recalculate portfolio inventory

**Files:**
- Modify: `tests/portfolioData.test.js`
- Modify: `src/data/portfolioData.js`
- Modify: `src/components/Experience.jsx`
- Modify: `src/components/Projects.jsx`

**Interfaces:**
- Consumes: existing `experiences`, `featuredProjects`, and `proofPoints` arrays
- Produces: 10 experience entries, 8 featured case studies, a `17+` product proof, and the restored `moist-alumni` record

- [ ] **Step 1: Change tests to express the corrected requirement**

Update the portfolio inventory test to require:

```js
assert.equal(featuredProjects.length, 8)
assert.equal(projectArchive.length, 8)
assert.equal(experiences.length, 10)

const alumniExperience = experiences.find((item) => item.company === 'MOIST Alumni Online Tracking System')
assert.equal(alumniExperience?.period, 'Jan 2025 - Aug 2025')

const alumniProject = featuredProjects.find((item) => item.id === 'moist-alumni')
assert.equal(alumniProject?.eyebrow, 'Jan-Aug 2025 · Secure records platform')
```

Change the product proof expectation to `value: '17+'` and `numericValue: 17`.

- [ ] **Step 2: Run the tests and confirm the corrected requirement fails**

Run: `npm test`

Expected: FAIL because Alumni is absent and the current counts are 7, 9, and 16+.

- [ ] **Step 3: Restore the portfolio records**

Add the experience entry after SocietyOne:

```js
{
  role: 'Full-Stack Developer',
  company: 'MOIST Alumni Online Tracking System',
  location: 'Balingasag, Philippines',
  period: 'Jan 2025 - Aug 2025',
  summary: 'Created a secure records platform for alumni registration, profile management, and administrative reporting.',
  achievements: [
    'Implemented role-based access control and auditable administrative workflows.',
    'Added OTP/2FA verification over SMS and email for sensitive account actions.',
    'Centralized alumni records and reporting in a maintainable relational data model.',
  ],
  stack: ['PHP', 'Laravel', 'MySQL', 'JavaScript', 'RBAC', 'OTP / 2FA'],
},
```

Add the featured case study after SocietyOne:

```js
{
  id: 'moist-alumni',
  categories: ['SaaS', 'Full Stack'],
  title: 'MOIST Alumni Tracking System',
  eyebrow: 'Jan-Aug 2025 · Secure records platform',
  overview: 'A secure alumni registration, profile, records, and administrative reporting platform.',
  context: 'The institution needed one maintainable system for verified alumni records and administrative reporting.',
  implementation: 'Laravel and MySQL application with role-aware administrative workflows and SMS/email account verification.',
  architecture: ['Laravel application', 'MySQL', 'RBAC', 'Audit trail', 'SMS + email OTP'],
  features: ['Alumni profiles', 'Administrative dashboard', 'Reporting and analytics', 'OTP/2FA'],
  engineering: 'Role-based access, audit trails, relational data modeling, analytics, and OTP/2FA over SMS and email.',
  delivered: 'A centralized system for alumni records, secure account actions, and administrative reporting.',
  stack: ['Laravel', 'MySQL', 'JavaScript', 'RBAC', 'OTP / 2FA'],
  private: true,
},
```

Set the product proof to `17+`, move the earlier-project chapter marker from index 3 to index 4, change the summary strip to 10 engagements, and change the Projects heading to eight detailed case studies.

- [ ] **Step 4: Run tests and commit the corrected inventory**

Run: `npm test`

Expected: all tests pass.

```bash
git add tests/portfolioData.test.js src/data/portfolioData.js src/components/Experience.jsx src/components/Projects.jsx
git commit -m "fix: restore alumni project with corrected dates"
```

### Task 2: Generate and verify the human-first resume

**Files:**
- Create: `scripts/generate_resume.py`
- Create: `output/pdf/ABEJO_CHARLIE_JAMES_RESUME.pdf`
- Replace: `ABEJO_CHARLIE_JAMES_RESUME.pdf`
- Modify: `vite.config.js`

**Interfaces:**
- Consumes: verified resume facts from the design spec and portfolio data
- Produces: `build_resume(output_path: Path) -> None`, a two-page Letter PDF, and Vite's stable `/charlie-james-abejo-resume.pdf` route sourced from the new root PDF

- [ ] **Step 1: Create the ReportLab generator**

Create a generator with reusable heading, paragraph, bullet, skills-row, experience, and project helpers. Use Letter pages, 0.55-inch side margins, Helvetica typography, dark charcoal text, and teal section accents. The visible section order must be:

```text
Header
Professional Summary
Core Skills
Professional Experience
Selected Projects
Education
Selected Certifications
Availability
```

The summary must begin:

```text
Full-stack web and mobile developer with 2 years of professional experience building production applications, APIs, integrations, and real-time systems.
```

The selected projects must include exact visible date labels:

```text
One Ride Balingasag (OMJI) | Started Apr 2026
OMJI Internet Access & Billing System | Apr-Jun 2026
MOIST Alumni Tracking System | Jan-Aug 2025
```

Mention Claude Code/Copilot once under developer tools; do not create an AI section or use an AI-first job title.

- [ ] **Step 2: Generate the PDF and validate its text contract**

Run: `python3 scripts/generate_resume.py`

Extract text with `pdftotext` and require:

```text
Pages: 2
2 years of professional experience
One Ride Balingasag (OMJI)
Started Apr 2026
OMJI Internet Access & Billing System
Apr-Jun 2026
MOIST Alumni Tracking System
Jan-Aug 2025
```

Require no `5+ years`, `AI Full-Stack Developer`, `AI Engineering`, `custom agents`, `subagents`, or `MCP servers` phrase.

- [ ] **Step 3: Render and inspect both pages**

Run:

```bash
pdftoppm -png -r 160 output/pdf/ABEJO_CHARLIE_JAMES_RESUME.pdf tmp/pdfs/final-resume-page
```

Inspect both PNGs at original detail. There must be no clipped text, overlaps, orphan headings, black boxes, or unreadable links.

- [ ] **Step 4: Publish the verified PDF through Vite**

Copy the verified PDF to `ABEJO_CHARLIE_JAMES_RESUME.pdf`. In `vite.config.js`, change the verified asset source from:

```js
resolve(process.cwd(), 'CHARLIE_JAMES_ABEJO_RESUME (1).pdf')
```

to:

```js
resolve(process.cwd(), 'ABEJO_CHARLIE_JAMES_RESUME.pdf')
```

Run `npm run build`, then compare SHA-256 hashes of the root PDF and `dist/charlie-james-abejo-resume.pdf`; they must match.

- [ ] **Step 5: Commit the resume generator and verified artifact**

```bash
git add scripts/generate_resume.py output/pdf/ABEJO_CHARLIE_JAMES_RESUME.pdf ABEJO_CHARLIE_JAMES_RESUME.pdf vite.config.js
git commit -m "feat: publish human-first full-stack resume"
```

### Task 3: Release and live verification

**Files:**
- Verify: repository and Vercel project configuration

**Interfaces:**
- Consumes: committed `main`, passing tests/build, verified PDF artifact
- Produces: updated GitHub `main`, a production Vercel deployment, and live URL verification

- [ ] **Step 1: Run the complete pre-release gate**

Run: `npm test && npm run build && git diff --check && git status --short`

Expected: tests and build pass; only intentionally ignored temporary files may remain.

- [ ] **Step 2: Push the committed main branch**

Run: `git push origin main`

Expected: the remote accepts the new commits without a force push.

- [ ] **Step 3: Build and deploy production through Vercel**

Use the repository's linked Vercel project. Run the Vercel prebuilt production workflow prescribed by the deployment skill, then deploy with `--prod`.

- [ ] **Step 4: Verify the production release**

Confirm the production deployment is ready, the homepage responds successfully, the new portfolio content is present, and `/charlie-james-abejo-resume.pdf` returns the verified two-page PDF.
