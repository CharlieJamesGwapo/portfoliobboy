# Resume-Aligned Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current gamified-first portfolio with a hiring-first, resume-accurate editorial systems-engineering portfolio whose professional page is fast, accessible, confidential, and supported by three evidence-led case studies.

**Architecture:** Keep the existing Vite/React single-page application and make `src/data/portfolioData.js` the canonical public content contract. Render the complete professional narrative as semantic HTML in the initial route, isolate supplemental projects and the arcade behind `AdditionalWork` and explicit dynamic imports, and verify content, privacy, assets, accessibility, responsive behavior, and lazy loading with Node, Python, Playwright, axe, and Lighthouse checks.

**Tech Stack:** React 18, Vite 8, JavaScript ES modules, Tailwind CSS 3 for the existing arcade, self-hosted Inter and Newsreader variable fonts, Node.js test runner, Python `unittest`, Playwright Chromium, `@axe-core/playwright`

**Spec:** `docs/superpowers/specs/2026-09-16-resume-aligned-portfolio-redesign.md`

## Global Constraints

- The canonical content source is `/Users/a1234/Downloads/ABEJO_CHARLIE_JAMES_RESUMEE.pdf`; preserve its meaning, dates, confidentiality, and level of specificity.
- Public identity is `Charlie James Z. Abejo`, resume role is `Full-Stack Web & Mobile App Developer`, location is `Misamis Oriental, Philippines (Remote)`, experience is `5+ years shipping production applications across web, iOS, and Android`, and availability is `Available immediately - remote only`.
- Hero headline is exactly `Full-stack product engineer for reliable web, mobile, and CRM systems.` and its support copy is exactly `I build production applications across web, iOS, and Android, with a focus on CRM integrations, real-time sync, secure data workflows, and AI-assisted delivery.`
- The main timeline contains exactly three roles: Australian Client (`2026`), Rooche Digital Company (`Jan 2026 - Mar 2026`), and Robustech IT / SocietyOne (`Jan 2024 - Dec 2025`), in that order.
- The earlier-work chapter is exactly `Earlier Full-Stack & Mobile Projects`, period `2021 - 2023`, with Jolly Ride & Massage Booking Apps, MOIST Alumni Tracking System, Filtra Coffee POS, and E-Cycle Hub.
- Never publish the Australian client's identifying name, locations, brand, internal identifiers, commercial CRM product name, private screenshots, customer records, source data, financial data, or inferred results. In the current repository, `Multi-Club Fitness Group` and `PerfectGym` are forbidden public strings.
- Never invent screenshots, metrics, testimonials, dates, job titles, compliance certifications, employment relationships, or sole-ownership claims.
- Selected work contains exactly three always-readable case studies: `Unified CRM & Operations Platform`, `Regulated Fintech Platform Modernization`, and `Cross-Platform Booking Applications`.
- The professional page contains exactly six capability groups and exactly six resume credentials. Remove the 23/25-credential claims from the rendered professional experience.
- Primary navigation contains exactly Work, Experience, Capabilities, Credentials, and Contact, plus the `Let's talk` mail action. Archive, lab, games, music, search, and project filters are not primary navigation.
- Preserve all existing game, music, and experimental source modules; do not delete them. They may be reached only through the optional archive/lab path.
- Initial professional-page JavaScript must exclude game engines, Three.js, React Three Fiber, Howler/music, Supabase leaderboard, game data/assets, command palette, rotating title, animated counters, and category-filter runtime.
- Do not migrate away from Vite/React and do not add a CMS, database, authentication system, or external service.
- Resume URL is exactly `/charlie-james-abejo-resume.pdf`. The deployed file must be byte-for-byte identical to the supplied PDF and have SHA-256 `ffe82da88e664d43d931bcf7f96f620b3efb58cc32d9bd35c18dffc33f18ff60` (approximately `505 KB`).
- Preserve the palette tokens exactly: ink `#0b2528`, ink-soft `#123438`, paper `#f3f0e9`, paper-deep `#e8e3da`, white `#fffdfa`, mint `#67e0c1`, mint-deep `#0f806d`, coral `#ff9c77`, slate `#56696a`, and mist `#a9b9b8`.
- Use self-hosted Newsreader variable serif for display/case-study headings and the existing self-hosted Inter variable font for body/UI; both use `font-display: swap` and metric-adjusted fallbacks. Preload only the above-the-fold font files.
- Meet WCAG 2.2 AA; preserve the skip link; use one visible H1, sequential headings, semantic landmarks, visible focus, 44x44 targets where space permits, focus restoration, semantic diagram equivalents, persistent form labels/errors, and polite live regions.
- Motion is opacity/transform only, 180-420ms. Do not hide the H1 before first paint. Disable nonessential motion and smooth scrolling for `prefers-reduced-motion: reduce`.
- Responsive verification covers 320, 390, 768, 1024, and 1440 CSS pixels with no horizontal overflow, plus 200% zoom and 400% reflow.
- Production Lighthouse targets are Performance >= 90, Accessibility >= 95, Best Practices >= 95, and SEO >= 95. Target LCP < 2.5s, CLS < 0.1, and INP < 200ms when field data exists.
- Preserve unrelated user changes and the untracked `tmp/` directory. Do not regenerate, restyle, or edit the supplied resume PDF; copy it unchanged.

---

### Task 1: Canonical resume content, privacy contract, and PDF asset

**Files:**
- Create: `public/charlie-james-abejo-resume.pdf`
- Modify: `src/data/portfolioData.js`
- Modify: `src/data/gameData.js`
- Modify: `src/components/game/ArcadeLobby.jsx`
- Modify: `vite.config.js`
- Modify: `tests/portfolioData.test.js`
- Modify: `tests/test_resume.py`

**Interfaces:**
- Consumes: the exact content in `docs/superpowers/specs/2026-09-16-resume-aligned-portfolio-redesign.md` and canonical bytes from `/Users/a1234/Downloads/ABEJO_CHARLIE_JAMES_RESUMEE.pdf`
- Produces: named exports `resumeUrl`, `profile`, `navigation`, `proofPoints`, `caseStudies`, `experienceTimeline`, `earlierWork`, `capabilityGroups`, `education`, `credentials`, `recognitions`, `supplementalProjects`, `labItems`, and optional secondary `musicPlaylists`
- Produces: case-study records with `{ id, title, label, confidentiality, confidentialityNote, context, responsibilities, system: { nodes, edges }, reliability, delivered, stack }`
- Produces: `gameData.js` exports required by the existing arcade (`EXPERIENCE`, `SKILLS`, `SKILL_CATEGORIES`, `PROJECTS`, `CERTIFICATES`, `OWNER`, `BIO_SCROLL`, and the existing game constants/functions) derived from the canonical portfolio exports instead of independent employment dates or biography claims
- Produces: a static public PDF copied by Vite's normal `public/` handling; `vite.config.js` no longer emits the old root-level generated PDF over the same route

- [ ] **Step 1: Replace the old inventory assertions with failing canonical-content tests**

Rewrite `tests/portfolioData.test.js` to import the new contract and assert exact counts, dates, privacy, navigation, schema completeness, and game-data derivation. The core assertions must include:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import {
  resumeUrl,
  profile,
  navigation,
  proofPoints,
  caseStudies,
  experienceTimeline,
  earlierWork,
  capabilityGroups,
  education,
  credentials,
  supplementalProjects,
  labItems,
} from '../src/data/portfolioData.js'
import { BIO_SCROLL, EXPERIENCE, SKILL_CATEGORIES } from '../src/data/gameData.js'

const canonicalHash = 'ffe82da88e664d43d931bcf7f96f620b3efb58cc32d9bd35c18dffc33f18ff60'
const forbiddenPublicTerms = [
  ['Multi', 'Club Fitness Group'].join('-'),
  ['Perfect', 'Gym'].join(''),
]
const publicText = () => JSON.stringify({
  profile, navigation, proofPoints, caseStudies, experienceTimeline, earlierWork,
  capabilityGroups, education, credentials, supplementalProjects, labItems,
})

test('publishes the canonical identity and proof points', () => {
  assert.equal(profile.name, 'Charlie James Z. Abejo')
  assert.equal(profile.role, 'Full-Stack Web & Mobile App Developer')
  assert.equal(profile.location, 'Misamis Oriental, Philippines (Remote)')
  assert.equal(profile.availability, 'Available immediately - remote only')
  assert.equal(profile.headline, 'Full-stack product engineer for reliable web, mobile, and CRM systems.')
  assert.equal(proofPoints.length, 4)
  assert.equal(proofPoints[0].value, '5+ years')
  assert.doesNotMatch(publicText(), /\b2 years\b/i)
})

test('keeps exactly the canonical roles and periods', () => {
  assert.deepEqual(experienceTimeline.map(({ company, period }) => ({ company, period })), [
    { company: 'Australian Client', period: '2026' },
    { company: 'Rooche Digital Company', period: 'Jan 2026 - Mar 2026' },
    { company: 'Robustech IT / SocietyOne (Australia)', period: 'Jan 2024 - Dec 2025' },
  ])
  assert.deepEqual(earlierWork.map((item) => item.title), [
    'Jolly Ride & Massage Booking Apps',
    'MOIST Alumni Tracking System',
    'Filtra Coffee POS',
    'E-Cycle Hub',
  ])
})

test('keeps primary content counts and case-study shape exact', () => {
  assert.equal(caseStudies.length, 3)
  assert.equal(earlierWork.length, 4)
  assert.equal(capabilityGroups.length, 6)
  assert.equal(credentials.length, 6)
  assert.equal(labItems.length, 9)
  for (const study of caseStudies) {
    assert.ok(study.context)
    assert.ok(study.responsibilities.length)
    assert.ok(study.system.nodes.length)
    assert.ok(study.system.edges.length)
    assert.ok(study.reliability.length)
    assert.ok(study.delivered)
    assert.ok(study.stack.length)
    assert.match(study.confidentiality, /^(private|public)$/)
  }
})

test('limits primary navigation and preserves privacy', () => {
  assert.deepEqual(navigation, [
    { label: 'Work', href: '#work' },
    { label: 'Experience', href: '#experience' },
    { label: 'Capabilities', href: '#capabilities' },
    { label: 'Credentials', href: '#credentials' },
    { label: 'Contact', href: '#contact' },
  ])
  for (const term of forbiddenPublicTerms) assert.equal(publicText().includes(term), false)
  assert.doesNotMatch(JSON.stringify({ BIO_SCROLL, EXPERIENCE }), /Oct 2025 - Dec 2025|Jan 2026 - Apr 2026|\b2 years\b/i)
  assert.equal(SKILL_CATEGORIES.flatMap((group) => group.skills).includes('MongoDB'), true)
})

test('uses the canonical public resume asset', () => {
  assert.equal(resumeUrl, '/charlie-james-abejo-resume.pdf')
  const digest = createHash('sha256')
    .update(readFileSync(new URL('../public/charlie-james-abejo-resume.pdf', import.meta.url)))
    .digest('hex')
  assert.equal(digest, canonicalHash)
})
```

Retain one link-integrity test for `supplementalProjects`: every rendered `url` starts with `https://`; items without a verified URL have `status: 'Private'` or `status: 'Archived'`.

- [ ] **Step 2: Replace the resume-generator test with a failing canonical-byte test**

Rewrite `tests/test_resume.py` so it does not run `scripts/generate_resume.py` and instead verifies the exact public asset. Add an opt-in built-asset assertion for the release suite:

```python
from __future__ import annotations

import hashlib
import os
from pathlib import Path
import unittest

REPO_ROOT = Path(__file__).resolve().parents[1]
EXPECTED_SHA256 = "ffe82da88e664d43d931bcf7f96f620b3efb58cc32d9bd35c18dffc33f18ff60"

def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

class ResumeAssetTest(unittest.TestCase):
    def test_public_resume_is_the_canonical_pdf(self) -> None:
        path = REPO_ROOT / "public" / "charlie-james-abejo-resume.pdf"
        self.assertTrue(path.is_file())
        self.assertEqual(sha256(path), EXPECTED_SHA256)
        self.assertGreater(path.stat().st_size, 500_000)

    @unittest.skipUnless(os.environ.get("VERIFY_DIST") == "1", "release build check")
    def test_built_resume_preserves_the_same_bytes(self) -> None:
        path = REPO_ROOT / "dist" / "charlie-james-abejo-resume.pdf"
        self.assertTrue(path.is_file())
        self.assertEqual(sha256(path), EXPECTED_SHA256)

if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 3: Run the new tests and verify red status**

Run:

```bash
node --test tests/portfolioData.test.js
python3 -m unittest tests/test_resume.py
```

Expected: FAIL because the new exports and canonical public PDF do not exist, the current dates/counts are stale, and the current data still contains both forbidden public strings.

- [ ] **Step 4: Copy the canonical PDF without transforming it and verify its bytes**

Run:

```bash
cp -p /Users/a1234/Downloads/ABEJO_CHARLIE_JAMES_RESUMEE.pdf public/charlie-james-abejo-resume.pdf
shasum -a 256 public/charlie-james-abejo-resume.pdf
```

Expected: exactly `ffe82da88e664d43d931bcf7f96f620b3efb58cc32d9bd35c18dffc33f18ff60  public/charlie-james-abejo-resume.pdf`.

- [ ] **Step 5: Replace `portfolioData.js` with the canonical content contract**

Define the shared identity and navigation once:

```js
export const resumeUrl = '/charlie-james-abejo-resume.pdf'

export const profile = {
  name: 'Charlie James Z. Abejo',
  shortName: 'Charlie Abejo',
  role: 'Full-Stack Web & Mobile App Developer',
  headline: 'Full-stack product engineer for reliable web, mobile, and CRM systems.',
  support: 'I build production applications across web, iOS, and Android, with a focus on CRM integrations, real-time sync, secure data workflows, and AI-assisted delivery.',
  experience: '5+ years shipping production applications across web, iOS, and Android',
  specialty: 'CRM API integrations, real-time sync, and AI-assisted delivery',
  location: 'Misamis Oriental, Philippines (Remote)',
  availability: 'Available immediately - remote only',
  email: 'capstonee2@gmail.com',
  phoneDisplay: '+63 985 612 2843',
  phoneHref: 'tel:+639856122843',
  github: 'https://github.com/CharlieJamesGwapo',
  linkedin: 'https://www.linkedin.com/in/charlie-james-abejo-26362638a/',
  portfolio: 'https://portfoliobboy.vercel.app/',
  resumeUrl,
}

export const navigation = [
  { label: 'Work', href: '#work' },
  { label: 'Experience', href: '#experience' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Credentials', href: '#credentials' },
  { label: 'Contact', href: '#contact' },
]

export const proofPoints = [
  { value: '5+ years', label: 'shipping production software' },
  { value: 'Web + iOS + Android', label: 'cross-platform delivery' },
  { value: 'CRM + API integration', label: 'sync, webhooks, and automation' },
  { value: 'Remote from the Philippines', label: 'works directly with global teams' },
]
```

Use stable ids `unified-crm-operations`, `fintech-modernization`, and `cross-platform-booking` for the three case studies. Populate every string, responsibility, node, edge, reliability item, delivered statement, and stack item exactly from the three case-study sections of the approved spec. Use `confidentiality: 'private'` and the exact confidentiality note for the Australian CRM case; use `confidentiality: 'private'` with a neutral note for SocietyOne; use `confidentiality: 'public'` and an empty note for booking applications.

Use stable ids `australian-crm-contract`, `rooche`, and `societyone` for `experienceTimeline`. Each role has `role`, `company`, `location`, `period`, `summary`, `achievements`, and `stack`; use only resume-backed wording. `earlierWork` has exactly the four approved summaries and the shared group period is exported on each record as `period: '2021 - 2023'`.

Define `capabilityGroups` in this exact order with each one-sentence statement and technology list from the approved spec: Mobile & cross-platform, CRM & integrations, Frontend, Backend & APIs, Data & infrastructure, AI engineering. Keep `MongoDB` in Data & infrastructure.

Define education and credentials with exact resume wording:

```js
export const education = {
  degree: 'BS in Information Technology',
  institution: 'Misamis Oriental Institute of Science and Technology',
  period: '2022 - 2025',
  details: "Dean's Lister, 2nd & 3rd Year (Ranked 2) · TOPCIT participant (2024-2025)",
}

export const recognitions = [
  { title: "Dean's Lister, 2nd & 3rd Year (Ranked 2)", issuer: 'Misamis Oriental Institute of Science and Technology' },
  { title: 'TOPCIT participant', issuer: 'TOPCIT', period: '2024-2025' },
]

export const credentials = [
  { title: 'AI Fluency: Framework & Foundations', issuer: 'Anthropic', issued: '2026', image: '/certificates/ai-fluency-framework-foundations.webp', thumb: '/certificates/ai-fluency-framework-foundations-thumb.webp' },
  { title: 'Claude 101', issuer: 'Anthropic Academy (Anthropic Education)', issued: 'July 2026', image: '/certificates/claude-101.webp', thumb: '/certificates/claude-101-thumb.webp' },
  { title: 'Claude Platform 101', issuer: 'Anthropic Academy (Anthropic Education)', issued: 'July 2026' },
  { title: 'Databases with SQL', issuer: 'Harvard CS50' },
  { title: 'Microsoft - Manage AD DS Domain Controllers & FSMO Roles', issuer: 'Microsoft' },
  { title: 'Windows Server & Active Directory administration training', issuer: 'Technical training' },
]
```

Rename the existing verified secondary arrays to `supplementalProjects` and `labItems`. Preserve a supplemental project's existing URL only when the repository already contains it; otherwise assign `status: 'Private'` or `status: 'Archived'`. Do not attach employment periods to supplemental projects. Keep the nine current game descriptors under `labItems` and keep playlists only as optional lab data.

- [ ] **Step 6: Derive arcade biography and resume facts from the canonical exports**

At the top of `src/data/gameData.js`, import `profile`, `experienceTimeline`, `capabilityGroups`, `credentials`, and `supplementalProjects`. Replace independent dates and biography with mappings:

```js
import {
  capabilityGroups,
  credentials,
  experienceTimeline,
  profile,
  supplementalProjects,
} from './portfolioData.js'

const enemyConfig = {
  rooche: { hp: 100, type: 'Professional role' },
  societyone: { hp: 150, type: 'Professional role' },
}

export const EXPERIENCE = experienceTimeline
  .filter((item) => enemyConfig[item.id])
  .map((item) => ({
    id: item.id,
    hp: enemyConfig[item.id].hp,
    type: enemyConfig[item.id].type,
    company: item.company,
    role: item.role,
    period: item.period,
    location: item.location,
    description: item.summary,
    achievements: item.achievements,
    technologies: item.stack,
  }))

export const SKILL_CATEGORIES = capabilityGroups.map(({ title, skills }) => ({ title, skills }))
export const SKILLS = [...new Set(capabilityGroups.flatMap((group) => group.skills))].slice(0, 14)
export const PROJECTS = supplementalProjects.slice(0, 6).map((item) => ({
  title: item.title,
  type: item.type,
  description: item.description,
  technologies: item.stack,
  liveUrl: item.url || null,
}))
export const CERTIFICATES = credentials.map((item) => ({
  title: item.title,
  issuer: item.issuer,
  type: 'Resume credential',
}))
export const OWNER = {
  name: profile.shortName,
  email: profile.email,
  github: profile.github,
  linkedin: profile.linkedin,
  portfolioContactHref: '#contact',
}
export const BIO_SCROLL = [
  `Welcome, traveler. You stand in the lab of ${profile.shortName} — ${profile.role}.`,
  `${profile.experience}, specializing in ${profile.specialty}.`,
  'Explore the optional games, then return to the professional portfolio at any time.',
]
```

Keep scoring, room, player, and skill-description constants unchanged unless a renamed import requires a mechanical update. Update `src/components/game/ArcadeLobby.jsx` to import `labItems as GAMES`.

- [ ] **Step 7: Stop Vite from overwriting the canonical public PDF**

In `vite.config.js`, remove `readFileSync`, `resolve`, `verifiedAssets`, and `verifiedAssetPlugin()`. Keep `react()` and all current build/chunk settings. The final plugin array is:

```js
plugins: [react()],
```

Vite will copy `public/charlie-james-abejo-resume.pdf` unchanged into `dist/`.

- [ ] **Step 8: Run the content and asset tests to green**

Run:

```bash
node --test tests/portfolioData.test.js
python3 -m unittest tests/test_resume.py
npm run build
VERIFY_DIST=1 python3 -m unittest tests/test_resume.py
```

Expected: all Node and Python tests PASS; Vite builds; both public and `dist` PDF hashes equal the canonical hash.

- [ ] **Step 9: Commit the canonical content task**

```bash
git add public/charlie-james-abejo-resume.pdf src/data/portfolioData.js src/data/gameData.js src/components/game/ArcadeLobby.jsx vite.config.js tests/portfolioData.test.js tests/test_resume.py
git commit -m "feat: align portfolio content with canonical resume"
```

### Task 2: Professional page composition and semantic case studies

**Files:**
- Create: `src/components/SystemDiagram.jsx`
- Create: `tests/appStructure.test.js`
- Modify: `src/App.jsx`
- Modify: `src/components/Navbar.jsx`
- Modify: `src/components/Hero.jsx`
- Modify: `src/components/Projects.jsx`
- Modify: `src/components/Experience.jsx`
- Modify: `src/components/Skills.jsx`
- Modify: `src/components/Education.jsx`
- Modify: `src/components/Contact.jsx`
- Verify retained/unmounted: `src/components/About.jsx`
- Verify retained/unmounted: `src/components/CommandPalette.jsx`
- Verify retained/unmounted: `src/components/MusicPlayer.jsx`
- Verify retained/unmounted: `src/components/RotatingTitle.jsx`
- Verify retained/unmounted: `src/components/AnimatedStat.jsx`
- Verify retained/unmounted: `src/components/UpdateBanner.jsx`

**Interfaces:**
- Consumes: all canonical exports from Task 1
- Produces: initial professional order `Navbar -> Hero -> Projects -> Experience -> Skills -> Education -> Contact -> Footer`
- Produces: section ids `home`, `work`, `experience`, `capabilities`, `credentials`, and `contact`
- Produces: `SystemDiagram({ nodes, edges, title })`, where `nodes` is `{ id, label, detail? }[]`, `edges` is `{ from, to, label? }[]`, and `title` is a non-empty accessible string
- Produces: a mobile nav that traps focus while open, closes on Escape/link activation, and restores focus to its toggle
- Produces: contact status state `idle | sending | success | error`, persistent field values on request failure, field-level errors, and an error summary linked to invalid fields

- [ ] **Step 1: Add failing source-graph and composition tests**

Create `tests/appStructure.test.js` with source-level guardrails. These do not replace browser tests; they prevent accidental reintroduction of heavy primary-shell imports before Playwright runs:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('App composes the professional narrative in the approved order', () => {
  const app = read('src/App.jsx')
  const components = ['<Hero', '<Projects', '<Experience', '<Skills', '<Education', '<Contact']
  const positions = components.map((component) => app.indexOf(component))
  assert.ok(positions.every((position) => position >= 0))
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b))
})

test('the primary shell excludes retired and heavy features', () => {
  const app = read('src/App.jsx')
  const hero = read('src/components/Hero.jsx')
  const projects = read('src/components/Projects.jsx')
  assert.doesNotMatch(app, /CommandPalette|MusicPlayer|UpdateBanner|InteractiveLab/)
  assert.doesNotMatch(hero, /RotatingTitle|AnimatedStat|Gamepad|HeroSystemsScene/)
  assert.doesNotMatch(projects, /useState|projectCategories|role="tab"|Product gallery|media pending/i)
})

test('case studies use the reusable semantic diagram', () => {
  const projects = read('src/components/Projects.jsx')
  const diagram = read('src/components/SystemDiagram.jsx')
  assert.match(projects, /caseStudies\.map/)
  assert.match(projects, /<SystemDiagram/)
  assert.match(diagram, /<ol/)
  assert.match(diagram, /aria-hidden="true"/)
  assert.match(diagram, /focusable="false"/)
})
```

- [ ] **Step 2: Run the structure test and verify red status**

Run: `node --test tests/appStructure.test.js`

Expected: FAIL because `SystemDiagram.jsx` is missing and the primary shell still imports the command palette, music, update banner, lab, rotating title, animated counts, and old project tabs/filters.

- [ ] **Step 3: Implement the reusable accessible system diagram**

Create `src/components/SystemDiagram.jsx`. Keep relationship text in semantic HTML and make SVG connectors decorative:

```jsx
const SystemDiagram = ({ nodes, edges, title }) => {
  const labels = new Map(nodes.map((node) => [node.id, node.label]))

  return (
    <figure className="system-diagram" aria-labelledby={`${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-caption`}>
      <figcaption id={`${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-caption`}>{title}</figcaption>
      <div className="system-diagram-canvas">
        <ol className="system-nodes">
          {nodes.map((node, index) => (
            <li key={node.id} data-node-id={node.id}>
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <strong>{node.label}</strong>
              {node.detail && <small>{node.detail}</small>}
            </li>
          ))}
        </ol>
        <svg className="system-connectors" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          {edges.map((edge, index) => (
            <path key={`${edge.from}-${edge.to}-${index}`} d={`M 8 ${12 + index * 14} H 92`} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
      </div>
      <ul className="system-relationships" aria-label="System relationships">
        {edges.map((edge, index) => (
          <li key={`${edge.from}-${edge.to}-${index}`}>
            <span>{labels.get(edge.from)}</span>
            <span aria-hidden="true"> -> </span>
            <span className="sr-only"> connects to </span>
            <span>{labels.get(edge.to)}</span>
            {edge.label && <small>{edge.label}</small>}
          </li>
        ))}
      </ul>
    </figure>
  )
}

export default SystemDiagram
```

Do not import portfolio data into this component.

- [ ] **Step 4: Simplify the primary shell**

Rewrite `src/App.jsx` so it imports only `Navbar`, `Hero`, `Projects`, `Experience`, `Skills`, `Education`, `Contact`, and `Footer` for this task. Keep the skip link, scroll progress indicator, cold-load hash correction, and accessible back-to-top button. Remove command-palette state/listeners, music state/imports/launcher, update banner, About, and direct InteractiveLab imports. Render:

```jsx
<Navbar />
<main id="main-content" tabIndex="-1">
  <Hero />
  <Projects />
  <Experience />
  <Skills />
  <Education />
  <Contact />
</main>
<Footer />
```

When the skip link is activated, `#main-content` must be a valid programmatic focus target. Keep back-to-top smooth behavior only when reduced motion is not requested.

- [ ] **Step 5: Rebuild the five-link navigation with one contact action**

Update `Navbar.jsx` to remove Search and music controls. Continue deriving links from `navigation`, include `Let's talk` as `mailto:${profile.email}`, and retain the current mobile focus trap/inert behavior. The mobile menu contains the same five links and one `Start a conversation` mail action; Escape and link selection close it and restore focus to the toggle.

Use section ids from data instead of a hand-written stale list:

```js
const ids = ['home', ...links.map((link) => link.href.slice(1))]
```

- [ ] **Step 6: Implement the stable hiring-first hero**

Rewrite `Hero.jsx` to consume `profile`, `proofPoints`, and `resumeUrl`; remove rotating title, animated counters, game action, canvas/system scene, prefetch code, and ambient orbits. The H1 is `profile.headline` and is visible at first paint. Render the exact support copy, availability, selected-work action (`href="#work"`), resume action (`target="_blank"`, `rel="noreferrer"`), GitHub, LinkedIn, email, portrait, location, and four proof points.

The visible resume action reads `View resume (PDF)` and its accessible name includes `505 KB`, for example:

```jsx
<a className="button button-secondary" href={resumeUrl} target="_blank" rel="noreferrer">
  View resume (PDF) <span className="sr-only">approximately 505 KB, opens in a new tab</span>
</a>
```

Keep `<img src="/profile.png" width="413" height="531" fetchpriority="high" decoding="async">` inside the WebP picture. Use visible identity text adjacent to it and `alt=""`; add an `onError` handler that hides only the image/picture so the text-led hero keeps its layout.

- [ ] **Step 7: Render all three case studies sequentially**

Rewrite `Projects.jsx` as `<section id="work">`. Map `caseStudies` to three `<article>` elements without state, filters, tabs, fake media, or placeholder screenshots. Each article renders label/title/confidentiality note, Context, Responsibility list, `SystemDiagram`, Reliability and safeguards list, Delivered, and plain inline stack metadata. Alternate a CSS modifier with `index % 2` but keep story before diagram in DOM order:

```jsx
{caseStudies.map((study, index) => (
  <article key={study.id} className={`case-study ${index % 2 ? 'case-study-reverse' : ''}`}>
    <div className="case-study-story">...</div>
    <SystemDiagram nodes={study.system.nodes} edges={study.system.edges} title={`${study.title} system map`} />
  </article>
))}
```

- [ ] **Step 8: Render experience, capabilities, education, and credentials from the canonical data**

Update `Experience.jsx` to render all three roles as always-readable articles followed by one `<aside>` titled `Earlier Full-Stack & Mobile Projects`, period `2021 - 2023`, containing the four earlier-work records. Remove the ten-role accordion and all `2 years`/`10 roles` summary copy.

Update `Skills.jsx` to use `<section id="capabilities">`, render all six `capabilityGroups`, display each `description`, and show technology labels as plain metadata separated by thin rules instead of colorful badges.

Update `Education.jsx` to use `<section id="credentials">`, render the one education record, two recognitions, and exactly six credentials. Render a certificate link only for a credential with a matching `image`; remove gallery/count copy. Add a plain download link to `resumeUrl` labeled `Download resume (PDF, approximately 505 KB)`.

- [ ] **Step 9: Make contact failure and validation states resilient**

Keep the existing honeypot and `/api/contact` request. Replace opportunity copy with the exact availability/location and web/mobile/CRM positioning. Do not clear form state in either client-validation or request-failure branches; clear only after an HTTP success.

Add a validation error summary before the fields:

```jsx
{status === 'error' && Object.keys(errors).length > 0 && (
  <div className="form-error-summary" role="alert" aria-labelledby="contact-error-title">
    <strong id="contact-error-title">Please fix the following fields:</strong>
    <ul>
      {Object.entries(errors).map(([field, error]) => (
        <li key={field}><a href={`#contact-${field}`}>{error}</a></li>
      ))}
    </ul>
  </div>
)}
```

Keep field-level `aria-invalid`/`aria-describedby`. Render request status in `<p role="status" aria-live="polite" aria-atomic="true">`. Keep direct email, GitHub, LinkedIn, location, availability, and the resume download visible even when the form fails.

Give every external link an accessible name that identifies GitHub, LinkedIn, certificate, or live-project destination when its surrounding text is not sufficient. Preserve one visible H1 and sequential H2/H3 levels across all professional sections.

- [ ] **Step 10: Run unit tests and build the professional page**

Run:

```bash
node --test
python3 -m unittest discover -s tests -p 'test_*.py'
npm run build
```

Expected: all tests PASS; the production build succeeds; `dist/assets` contains no entry dependency on ArcadeLobby, Three.js, React Three Fiber, Howler, or Supabase from the primary `index-*.js` chunk.

- [ ] **Step 11: Commit the professional components**

```bash
git add src/App.jsx src/components/Navbar.jsx src/components/Hero.jsx src/components/Projects.jsx src/components/SystemDiagram.jsx src/components/Experience.jsx src/components/Skills.jsx src/components/Education.jsx src/components/Contact.jsx tests/appStructure.test.js
git commit -m "feat: build the resume-aligned professional portfolio"
```

### Task 3: Optional archive and explicit lazy lab boundary

**Files:**
- Create: `src/components/AdditionalWork.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/InteractiveLab.jsx`
- Modify: `src/components/Footer.jsx`
- Modify: `tests/appStructure.test.js`
- Retain without primary import: `src/components/MusicPlayer.jsx`
- Retain unchanged: `src/components/game/**`
- Retain unchanged: `src/lib/supabase.js`
- Retain unchanged: `public/audio/**`

**Interfaces:**
- Consumes: `supplementalProjects`, `profile`, `navigation`, and the dynamically imported default export from `InteractiveLab.jsx`
- Produces: `AdditionalWork` section `#archive` with one disclosure containing panels `Additional project archive` and `Interactive lab`
- Produces: one explicit button named `Launch the lab`; only that click invokes `import('./InteractiveLab')`, whose mount invokes `import('./game/ArcadeLobby')`
- Produces: lab loading state, retryable import-error state, close-on-Escape behavior from ArcadeLobby, and focus restoration to the launch button
- Produces: footer link `More: archive & lab` with `href="#archive"`

- [ ] **Step 1: Extend structure tests with failing lazy-boundary assertions**

Add these tests to `tests/appStructure.test.js`:

```js
test('additional work follows contact and is absent from primary navigation', () => {
  const app = read('src/App.jsx')
  const nav = read('src/components/Navbar.jsx')
  assert.ok(app.indexOf('<AdditionalWork') > app.indexOf('<Contact'))
  assert.doesNotMatch(nav, /archive|lab|game|music/i)
})

test('the lab has one explicit dynamic import boundary', () => {
  const app = read('src/App.jsx')
  const additional = read('src/components/AdditionalWork.jsx')
  const lab = read('src/components/InteractiveLab.jsx')
  assert.doesNotMatch(app, /InteractiveLab|ArcadeLobby|MusicPlayer/)
  assert.match(additional, /import\('\.\/InteractiveLab'\)/)
  assert.match(additional, />Launch the lab</)
  assert.doesNotMatch(additional, /prefetchProps|onPointerEnter|onFocus=.*import|onTouchStart/)
  assert.match(lab, /import\('\.\/game\/ArcadeLobby'\)/)
})
```

- [ ] **Step 2: Run the structure test and verify red status**

Run: `node --test tests/appStructure.test.js`

Expected: FAIL because `AdditionalWork.jsx` is missing and the App/Footer do not expose the secondary archive.

- [ ] **Step 3: Create the archive disclosure and import-error boundary**

Create `AdditionalWork.jsx` with a controlled `<details>` whose open state initializes from `window.location.hash === '#archive'` and updates on `hashchange` and a `portfolio:open-archive` window event. The summary text is `More: archive & lab`. Inside, render two labeled panels. The archive panel maps every `supplementalProjects` record and renders its link only when `url` exists; otherwise render `Private` or `Archived` text from `status`.

Define the lazy module once:

```jsx
const InteractiveLab = lazy(() => import('./InteractiveLab'))
```

Do not attach prefetch handlers. Store the launch button ref and set `labOpen` only from its click. Wrap the lazy module in a local class error boundary whose fallback says `The interactive lab could not load. The professional portfolio is still available.` and includes a `Retry lab` button that calls `window.location.reload()`; this guarantees the retry does not reuse a browser-cached rejected module promise.

- [ ] **Step 4: Convert `InteractiveLab` into the post-click arcade boundary**

Remove the visible nine-game list, section heading, `prefetchProps`, `portfolio:open-games` event, and second launch button. On mount, render a Suspense fallback (`ArcadeSkeleton`) and lazy-load `ArcadeLobby`. Accept `onClose` and `returnFocusRef`; when ArcadeLobby closes, call `onClose()` and then focus `returnFocusRef.current` on the next frame. Preserve ArcadeLobby's Escape handling and keyboard-accessible exit.

The resulting interface is:

```jsx
export default function InteractiveLab({ onClose, returnFocusRef })
```

- [ ] **Step 5: Mount additional work after contact and link it from the footer**

Import `AdditionalWork` normally in `App.jsx` and render it immediately after `<Contact />`; importing this small disclosure must not import game modules. Update `Footer.jsx` to render compact identity, current year, the five primary links from `navigation`, GitHub/LinkedIn, and `<a href="#archive">More: archive & lab</a>`. The footer link dispatches `portfolio:open-archive` on click so it reopens the disclosure even when the URL already ends in `#archive`.

- [ ] **Step 6: Verify the bundle boundary**

Run:

```bash
node --test tests/appStructure.test.js
npm run build
find dist/assets -maxdepth 1 -type f -name '*.js' -print | sort
```

Expected: tests PASS; build succeeds; ArcadeLobby/game/Three.js/React Three Fiber/Supabase code is emitted only in dynamic chunks and is not statically imported by the main `index-*.js` module graph. Browser-level request verification is added in Task 5.

- [ ] **Step 7: Commit the optional secondary experience**

```bash
git add src/App.jsx src/components/AdditionalWork.jsx src/components/InteractiveLab.jsx src/components/Footer.jsx tests/appStructure.test.js
git commit -m "feat: move archive and arcade behind an explicit lazy boundary"
```

### Task 4: Editorial visual system, metadata, fonts, and social asset

**Files:**
- Create: `public/fonts/newsreader-var-latin.woff2`
- Create: `public/fonts/newsreader-LICENSE.txt`
- Create: `public/og-portfolio.png`
- Create: `scripts/generate_og_card.mjs`
- Create: `tests/siteMetadata.test.js`
- Modify: `src/index.css`
- Modify: `src/components/ScrollReveal.jsx`
- Modify: `index.html`
- Modify: `public/manifest.json`
- Modify: `public/robots.txt`
- Modify: `public/sitemap.xml`
- Modify: `public/offline.html`
- Modify: `public/sw.js`

**Interfaces:**
- Consumes: component class names and section ids established in Tasks 2-3
- Produces: CSS tokens from Global Constraints; `--font-display: 'Newsreader', 'Newsreader Fallback', Georgia, serif` and `--font-body: 'Inter', 'Inter Fallback', system-ui, sans-serif`
- Produces: breakpoints at 900px and 640px plus verified layouts at 320/390/768/1024/1440 pixels
- Produces: exact primary metadata, matching Open Graph/Twitter metadata, canonical origin `https://portfoliobboy.vercel.app/`, Person JSON-LD, and a 1200x630 PNG social card
- Produces: service-worker cache version `v4`, preventing a previously cached incorrect PDF from surviving this release

- [ ] **Step 1: Add failing font, metadata, social-image, and token tests**

Create `tests/siteMetadata.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path, encoding = 'utf8') => readFileSync(new URL(`../${path}`, import.meta.url), encoding)
const title = 'Charlie James Abejo | Full-Stack Web & Mobile Developer'
const description = 'Full-stack developer with 5+ years building production web, iOS, Android, CRM, API integration, and real-time systems. Based in the Philippines and available for remote work.'

test('publishes exact primary and social metadata', () => {
  const html = read('index.html')
  assert.match(html, /<title>Charlie James Abejo \| Full-Stack Web &amp; Mobile Developer<\/title>/)
  assert.match(html, new RegExp(description.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.match(html, /property="og:image" content="https:\/\/portfoliobboy\.vercel\.app\/og-portfolio\.png"/)
  assert.match(html, /"jobTitle": "Full-Stack Web & Mobile App Developer"/)
  assert.doesNotMatch(html, /AI Developer & Full-Stack Engineer/)
})

test('ships the editorial fonts and exact palette', () => {
  const css = read('src/index.css')
  assert.ok(read('public/fonts/newsreader-var-latin.woff2', null).length > 50_000)
  assert.match(css, /font-family: 'Newsreader'/)
  for (const token of ['#0b2528', '#123438', '#f3f0e9', '#e8e3da', '#fffdfa', '#67e0c1', '#0f806d', '#ff9c77', '#56696a', '#a9b9b8']) {
    assert.match(css, new RegExp(token))
  }
})

test('ships a 1200 by 630 PNG social card', () => {
  const png = read('public/og-portfolio.png', null)
  assert.equal(png.subarray(1, 4).toString(), 'PNG')
  assert.equal(png.readUInt32BE(16), 1200)
  assert.equal(png.readUInt32BE(20), 630)
})
```

- [ ] **Step 2: Run the metadata test and verify red status**

Run: `node --test tests/siteMetadata.test.js`

Expected: FAIL because the Newsreader asset, social PNG, exact metadata, and new CSS font face do not exist.

- [ ] **Step 3: Vendor the exact Newsreader variable font and license**

Run these commands using a task-specific temporary directory:

```bash
FONT_PACKAGE_DIR=$(mktemp -d)
npm pack @fontsource-variable/newsreader@5.3.0 --pack-destination "$FONT_PACKAGE_DIR"
tar -xzf "$FONT_PACKAGE_DIR/fontsource-variable-newsreader-5.3.0.tgz" -C "$FONT_PACKAGE_DIR"
cp "$FONT_PACKAGE_DIR/package/files/newsreader-latin-wght-normal.woff2" public/fonts/newsreader-var-latin.woff2
cp "$FONT_PACKAGE_DIR/package/LICENSE" public/fonts/newsreader-LICENSE.txt
```

Expected: `public/fonts/newsreader-var-latin.woff2` is 58,084 bytes and the license file is present. Do not add the font package to `package.json`; the deployed font is the vendored WOFF2.

- [ ] **Step 4: Implement the editorial stylesheet**

Refactor `src/index.css` around the mounted professional components while preserving the three Tailwind directives required by the arcade. Define both font faces, metric-adjusted fallbacks, exact palette variables, a 1180px container, `--nav-height`, and `scroll-padding-top`/section `scroll-margin-top`.

Use this typography contract:

```css
@font-face {
  font-family: 'Newsreader';
  font-style: normal;
  font-weight: 500 700;
  font-display: swap;
  src: url('/fonts/newsreader-var-latin.woff2') format('woff2-variations');
}

@font-face {
  font-family: 'Newsreader Fallback';
  src: local('Georgia');
  ascent-override: 91%;
  descent-override: 23%;
  line-gap-override: 0%;
  size-adjust: 100%;
}

:root {
  --ink: #0b2528;
  --ink-soft: #123438;
  --paper: #f3f0e9;
  --paper-deep: #e8e3da;
  --white: #fffdfa;
  --mint: #67e0c1;
  --mint-deep: #0f806d;
  --coral: #ff9c77;
  --slate: #56696a;
  --mist: #a9b9b8;
  --font-display: 'Newsreader', 'Newsreader Fallback', Georgia, serif;
  --font-body: 'Inter', 'Inter Fallback', system-ui, sans-serif;
}

h1, h2, .case-study h3, .contact-copy h2 { font-family: var(--font-display); }
h1 { font-size: clamp(3rem, 7vw, 6.5rem); line-height: 0.96; }
h2 { font-size: clamp(2.25rem, 5vw, 4.75rem); line-height: 1; }
```

Professional body copy is 16-18px, line-height 1.65-1.75, max-width 72ch. Desktop hero is a seven/five twelve-column split. Case studies use asymmetric story/map columns and alternate visual placement above 900px while maintaining story-first DOM order. At <=900px all case studies stack story before map. At <=640px container gutters are 20px, actions wrap/full-width only as needed, system maps become vertical lists, and no fixed/min-width declaration can create horizontal scroll at 320px.

Use one-pixel rules, 12-18px radii, restrained/no shadows, plain inline tech metadata, and no continuously animated orbit/cursor/parallax/count effects. Ensure `:focus-visible` has 3:1 non-text contrast and controls are at least 44px high where space permits. Ensure `main:focus` is not visually hidden. Preserve content visibility by default; `.motion-ready` may enhance section reveals only.

Set `ScrollReveal.jsx` default `duration={360}` and cap call-site durations at 420ms. Add:

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

@media (forced-colors: active) {
  :focus-visible { outline: 3px solid Highlight; }
  .button, .system-nodes li, .case-study, .additional-work details { border: 1px solid CanvasText; }
}
```

- [ ] **Step 5: Update exact SEO, social, and structured metadata**

In `index.html`, set title/description exactly to the values in `tests/siteMetadata.test.js`; make Open Graph and Twitter title/description identical; use `https://portfoliobboy.vercel.app/og-portfolio.png`; preserve the canonical URL; and set JSON-LD `jobTitle` to `Full-Stack Web & Mobile App Developer`, canonical name/address/email/sameAs, and only resume-backed `knowsAbout` values.

Preload `/profile.webp`, `/fonts/newsreader-var-latin.woff2`, and `/fonts/inter-var-latin.woff2`; do not preload below-fold images or lab chunks. Keep the boot background but remove its continuous shimmer, because the H1 must paint immediately without an animated skeleton covering it.

Update `public/manifest.json` to identify Charlie as a full-stack web/mobile developer and use the exact ink theme/background. Keep `public/robots.txt` and `public/sitemap.xml` rooted at `https://portfoliobboy.vercel.app/`. Update `public/offline.html` to the same identity and palette without external dependencies.

- [ ] **Step 6: Generate the 1200x630 editorial social card**

Create `scripts/generate_og_card.mjs` using Node `fs`, `os`, `path`, and `child_process.execFileSync`. It writes a temporary 1200x630 SVG with ink background, a thin mint routing line, `CA` monogram, `Charlie James Abejo`, `Full-Stack Web & Mobile Developer`, and `Misamis Oriental, Philippines · Remote`; it then runs `/usr/bin/sips -s format png <temp.svg> --out public/og-portfolio.png`. Use only the approved ink/paper/mint/coral colors and no fake product UI.

Run:

```bash
node scripts/generate_og_card.mjs
file public/og-portfolio.png
```

Expected: `public/og-portfolio.png` is a PNG image with dimensions 1200x630.

- [ ] **Step 7: Invalidate stale service-worker media caches**

Change `const CACHE_VERSION = 'v3'` to `const CACHE_VERSION = 'v4'` in `public/sw.js`. Keep API bypassing, same-origin rules, and navigation strategy unchanged. This forces eviction of the old cached resume bytes after activation.

- [ ] **Step 8: Run metadata tests and build**

Run:

```bash
node --test tests/siteMetadata.test.js
npm test
npm run build
```

Expected: metadata/font/social-image tests PASS, all content tests PASS, and Vite builds the complete site.

- [ ] **Step 9: Commit the visual and metadata task**

```bash
git add public/fonts/newsreader-var-latin.woff2 public/fonts/newsreader-LICENSE.txt public/og-portfolio.png scripts/generate_og_card.mjs tests/siteMetadata.test.js src/index.css src/components/ScrollReveal.jsx index.html public/manifest.json public/robots.txt public/sitemap.xml public/offline.html public/sw.js
git commit -m "feat: apply the editorial portfolio visual system"
```

### Task 5: Browser accessibility, privacy, responsive, and release verification

**Files:**
- Create: `playwright.config.js`
- Create: `tests/portfolio.e2e.spec.js`
- Modify: `.gitignore`
- Modify: `package.json`
- Modify: `package-lock.json`
- Regenerate: `artifacts/qa/mobile-390.png`
- Regenerate: `artifacts/qa/tablet-768.png`
- Regenerate: `artifacts/qa/desktop-1440.png`
- Create during verification: `artifacts/qa/lighthouse.json`

**Interfaces:**
- Consumes: final semantic page, section ids, disclosure/lab boundary, form states, and assets from Tasks 1-4
- Produces: npm scripts `test:unit`, `test:e2e`, and `test:release`; keep `npm test` as the unit/content suite
- Produces: Chromium projects `desktop-chromium` (1440x1000) and `mobile-chromium` (390x844), both against the production preview at `http://127.0.0.1:4173`
- Produces: browser evidence for deep links, focus behavior, axe, lazy loading, contact success/failure, canonical PDF, overflow, resilient failures, reduced motion/forced colors, and screenshots

- [ ] **Step 1: Install exact browser-test dependencies and Chromium**

Run:

```bash
npm install --save-dev --save-exact @playwright/test@1.63.0 @axe-core/playwright@4.13.0
npx playwright install chromium
```

Expected: `package.json` and `package-lock.json` contain the two exact dev dependency versions and Chromium installs successfully.

- [ ] **Step 2: Add scripts and Playwright production-preview configuration**

Add/replace these test scripts in `package.json` while preserving the existing `dev`, `build`, `preview`, and `deploy` scripts:

```json
{
  "test": "node --test && python3 -m unittest discover -s tests -p 'test_*.py'",
  "test:unit": "node --test && python3 -m unittest discover -s tests -p 'test_*.py'",
  "test:e2e": "npm run build && playwright test",
  "test:release": "npm test && npm run build && VERIFY_DIST=1 python3 -m unittest tests/test_resume.py && playwright test"
}
```

Create `playwright.config.js`:

```js
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.e2e.spec.js',
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'artifacts/qa/playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
})
```

Add `test-results/` and `artifacts/qa/playwright-report/` to `.gitignore`; failure traces and the generated HTML report are local diagnostics, while the three approved screenshots and Lighthouse JSON remain tracked release evidence.

- [ ] **Step 3: Write failing navigation, focus, archive, and lazy-loading browser tests**

Create `tests/portfolio.e2e.spec.js` using `@playwright/test` and `AxeBuilder`. Add tests with these exact assertions:

1. `primary navigation and cold-load deep links land on headings`: assert the five desktop links; visit each of `/#work`, `/#experience`, `/#capabilities`, `/#credentials`, `/#contact`, and `/#archive`; assert the target is visible and its top is below the fixed navbar and within 140px of it after a 450ms settle.
2. `mobile menu traps focus, closes on Escape, and restores the toggle`: on mobile, open the menu, assert `aria-expanded=true`, Tab through the menu until focus wraps, press Escape, assert `aria-expanded=false` and toggle focused.
3. `archive opens from footer and direct hash`: click `More: archive & lab`, assert the details is open and both panel headings are visible; visit `/#archive` and assert it starts open.
4. `lab code loads only after the explicit launch`: collect all request URLs; before the click assert none match `/InteractiveLab|ArcadeLobby|three-vendor|r3f-vendor|supabase|MusicPlayer|youtube|googlevideo|\.(mp3|wav)(\?|$)/i`; open the disclosure and click `Launch the lab`; assert a request matches `/InteractiveLab|ArcadeLobby/` and the arcade close/exit control becomes visible.

Run: `npm run test:e2e -- --grep "navigation|mobile menu|archive|lab code"`

Expected: FAIL until selectors/focus/lazy boundaries exactly satisfy the tests; fix implementation rather than weakening assertions.

- [ ] **Step 4: Add contact, PDF, overflow, and resilient-failure browser tests**

Add tests with these exact behaviors:

- Intercept `**/api/contact` with status 500, fill all four visible fields, submit, assert the plain-language error is in the polite status region, assert every entered value is unchanged, and assert the direct email link remains visible.
- Intercept `**/api/contact` with status 200 and JSON success, submit valid data, assert success is announced and the four visible fields are cleared.
- Request `/charlie-james-abejo-resume.pdf`, assert status 200 and `content-type` contains `application/pdf`, hash `response.body()` with Node `createHash('sha256')`, and assert the canonical hash. Assert hero link opens a new tab and contact/credentials download link points to the same route.
- For widths 320, 390, 768, 1024, and 1440, set viewport height 900, load `/`, and assert `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.
- Abort `**/profile.webp` and `**/profile.png`, reload, and assert the headline/support/availability remain visible with no horizontal overflow.
- Abort the first request matching `**/assets/InteractiveLab-*.js`, launch the lab, and assert the retryable failure message and `Retry lab` button are visible while Work, Experience, and Contact remain in the DOM.

Run: `npm run test:e2e -- --grep "contact|resume|overflow|portrait|lab import"`

Expected: all listed tests PASS after implementation adjustments.

- [ ] **Step 5: Add axe, keyboard-order, media-preference, and screenshot tests**

Add a helper:

```js
async function expectNoSeriousAxeViolations(page) {
  const results = await new AxeBuilder({ page }).analyze()
  const blocking = results.violations.filter((item) => ['critical', 'serious'].includes(item.impact))
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
}
```

Run it on the closed professional page, open mobile menu, open archive disclosure, and visible lab-launch state. Add a keyboard-only test that starts at the skip link, activates it, verifies `#main-content` focus, then Tabs through nav/contact/archive controls without an unreachable control or focus loss.

Add reduced-motion (`page.emulateMedia({ reducedMotion: 'reduce' })`) and forced-colors (`page.emulateMedia({ forcedColors: 'active' })`) checks: headings and focus indicators remain visible and the archive/lab control still works.

Add a resilience test that delays the main JavaScript bundle response by 1,500ms, asserts no splash overlay or fake product content appears while it waits, then asserts the full headline and professional sections become visible after the bundle arrives. In a second test, let JavaScript render, disable every stylesheet, and verify the DOM's headings, paragraphs, links, lists, form labels, and semantic system relationships remain in logical source order. This covers delayed JavaScript and CSS-disabled reading without relying on screenshots alone.

Capture full-page screenshots with animations disabled and archive closed:

```js
for (const [name, width, height] of [
  ['mobile-390', 390, 844],
  ['tablet-768', 768, 1024],
  ['desktop-1440', 1440, 1000],
]) {
  await page.setViewportSize({ width, height })
  await page.goto('/')
  await page.screenshot({ path: `artifacts/qa/${name}.png`, fullPage: true, animations: 'disabled' })
}
```

- [ ] **Step 6: Run the complete automated release suite**

Run:

```bash
npm run test:release
git diff --check
```

Expected: Node/Python tests PASS; Vite build succeeds; the built PDF hash test PASSes; both Playwright projects PASS with zero critical/serious axe violations; no whitespace errors.

- [ ] **Step 7: Run exact privacy and stale-content scans against source and build output**

Run:

```bash
rg -n -i --glob '!*.pdf' 'Multi-Club Fitness Group|PerfectGym|Oct 2025 - Dec 2025|Jan 2026 - Apr 2026|\b2 years\b|25 verified credentials|23 certificates' src index.html public dist
rg -n -i --glob '!*.pdf' 'Available for remote AI|Play games|Open music player|command palette|Product gallery|authentic media pending' src/App.jsx src/components/Navbar.jsx src/components/Hero.jsx src/components/Projects.jsx dist
shasum -a 256 public/charlie-james-abejo-resume.pdf dist/charlie-james-abejo-resume.pdf
```

Expected: both `rg` commands return no matches; both hashes are exactly `ffe82da88e664d43d931bcf7f96f620b3efb58cc32d9bd35c18dffc33f18ff60`.

- [ ] **Step 8: Review responsive screenshots and failure modes**

Open `artifacts/qa/mobile-390.png`, `artifacts/qa/tablet-768.png`, and `artifacts/qa/desktop-1440.png`. Confirm: one stable H1; portrait does not dominate; four proof points are readable; all three case studies are visible sequentially; diagrams are vertical at narrow widths; contact visually concludes the professional narrative; archive is quieter than contact; no clipping, overlapping fixed controls, broken words, accidental all-caps paragraphs, or empty media frames.

Use Chromium devtools or Playwright to review 200% zoom and a 320px viewport, keyboard-only traversal, slow 3G, CSS disabled, delayed JavaScript, reduced motion, forced colors, failed portrait, failed lab import, and failed contact request. Record any failure as a test or implementation fix before continuing.

- [ ] **Step 9: Run Lighthouse against the production preview**

In one terminal, run:

```bash
npm run preview -- --host 127.0.0.1
```

In a second terminal, run:

```bash
npx --yes lighthouse@13.4.1 http://127.0.0.1:4173 --only-categories=performance,accessibility,best-practices,seo --preset=desktop --chrome-flags="--headless=new --no-sandbox" --output=json --output-path=artifacts/qa/lighthouse.json
node -e "const r=require('./artifacts/qa/lighthouse.json'); for (const k of ['performance','accessibility','best-practices','seo']) console.log(k, Math.round(r.categories[k].score*100)); console.log('LCP', r.audits['largest-contentful-paint'].displayValue); console.log('CLS', r.audits['cumulative-layout-shift'].displayValue)"
```

Expected: Performance >= 90, Accessibility >= 95, Best Practices >= 95, SEO >= 95, LCP < 2.5s, and CLS < 0.1. If any threshold fails, use the named Lighthouse audit to make the smallest in-scope fix, rerun `npm run test:release`, and rerun Lighthouse.

- [ ] **Step 10: Commit verification infrastructure and final evidence**

```bash
git add .gitignore package.json package-lock.json playwright.config.js tests/portfolio.e2e.spec.js artifacts/qa/mobile-390.png artifacts/qa/tablet-768.png artifacts/qa/desktop-1440.png artifacts/qa/lighthouse.json
git commit -m "test: verify portfolio accessibility and release quality"
```

## Final release gate

Run once more from a clean terminal:

```bash
npm run test:release
rg -n -i --glob '!*.pdf' 'Multi-Club Fitness Group|PerfectGym|Oct 2025 - Dec 2025|Jan 2026 - Apr 2026|\b2 years\b|25 verified credentials|23 certificates' src index.html public dist
shasum -a 256 public/charlie-james-abejo-resume.pdf dist/charlie-james-abejo-resume.pdf
git status --short
```

Expected: release suite PASSes; privacy scan has no matches; both PDF hashes equal the canonical value; `git status --short` shows only the intended redesign commits/files plus the user's pre-existing untracked `tmp/` directory.
