# Hiring Portfolio Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition the portfolio around two years of professional experience, remove the alumni system and MongoDB skill, and add two realistic OMJI product case studies.

**Architecture:** Keep the existing data-driven React structure. Put factual inventory changes in `portfolioData.js`, keep the interactive game's duplicate biography and database skills consistent in `gameData.js`, and update only the components that contain duplicated user-facing counts or `current` wording.

**Tech Stack:** React 18, Vite, JavaScript ES modules, Node.js test runner

## Global Constraints

- Show `2 years` or `2+ years`; never show a five-year claim.
- Remove the MOIST Alumni Tracking System from experience and projects.
- Preserve supplied technology stacks and remove only MongoDB from general skill inventories.
- Add One Ride Balingasag with `Started Apr 2026` and the supplied Google Play URL.
- Add OMJI Internet Access & Billing System with `Apr–Jun 2026`.
- Do not invent downloads, revenue, adoption, or public repository claims.
- Do not modify `ABEJO_CHARLIE_JAMES_RESUME.pdf`.

---

### Task 1: Portfolio inventory and project case studies

**Files:**
- Modify: `tests/portfolioData.test.js`
- Modify: `src/data/portfolioData.js:37-315`
- Modify: `src/data/portfolioData.js:330-355`
- Modify: `src/data/gameData.js:97-126`
- Modify: `src/data/gameData.js:213-217`

**Interfaces:**
- Consumes: existing exported arrays `proofPoints`, `experiences`, `featuredProjects`, `skillGroups`, `SKILL_CATEGORIES`, and `BIO_SCROLL`
- Produces: featured project objects using the existing `id`, `categories`, `title`, `eyebrow`, `overview`, `context`, `implementation`, `architecture`, `features`, `engineering`, `delivered`, `stack`, `url`, and `private` fields

- [ ] **Step 1: Write failing inventory tests**

Extend the imports in `tests/portfolioData.test.js` with `proofPoints` and `skillGroups`, and import `BIO_SCROLL` and `SKILL_CATEGORIES` from `src/data/gameData.js`. Replace the inventory test with assertions equivalent to:

```js
test('keeps the requested hiring-focused experience and project inventory', () => {
  assert.equal(featuredProjects.length, 7)
  assert.equal(projectArchive.length, 8)
  assert.equal(experiences.length, 9)
  assert.equal(new Set(featuredProjects.map((project) => project.id)).size, featuredProjects.length)
  assert.equal(experiences.some((item) => /alumni/i.test(item.company)), false)
  assert.equal(featuredProjects.some((item) => /alumni/i.test(item.title)), false)
})

test('positions the portfolio around two years without a MongoDB skill claim', () => {
  const experienceProof = proofPoints.find((item) => item.label === 'Years shipping production software')
  assert.deepEqual(experienceProof, {
    value: '2+',
    label: 'Years shipping production software',
    numericValue: 2,
    suffix: '+',
  })
  assert.equal(skillGroups.flatMap((group) => group.skills).includes('MongoDB'), false)
  assert.equal(SKILL_CATEGORIES.flatMap((group) => group.skills).includes('MongoDB'), false)
  assert.equal(BIO_SCROLL.some((line) => /5\+|five years/i.test(line)), false)
})

test('publishes the supplied OMJI projects with realistic dates', () => {
  const oneRide = featuredProjects.find((project) => project.id === 'one-ride-balingasag')
  assert.equal(oneRide.eyebrow, 'Started Apr 2026 · Live on Google Play · Balingasag')
  assert.equal(oneRide.url, 'https://play.google.com/store/apps/details?id=com.oneridebalingasag.app&hl=en')
  assert.ok(oneRide.stack.includes('React Native'))
  assert.ok(oneRide.stack.includes('Go'))

  const billing = featuredProjects.find((project) => project.id === 'omji-billing')
  assert.equal(billing.eyebrow, 'Apr–Jun 2026 · Internet access and billing')
  assert.ok(billing.stack.includes('TypeScript'))
  assert.ok(billing.stack.includes('Go'))
})
```

- [ ] **Step 2: Run the tests and confirm the new expectations fail**

Run: `npm test`

Expected: FAIL because the old counts, alumni entries, five-year proof, MongoDB skills, and missing OMJI projects do not satisfy the assertions.

- [ ] **Step 3: Implement the data changes**

In `portfolioData.js`:

- Change the product proof to `15+` because removing one featured case study and adding two changes the total from 14 to 15.
- Change the experience proof to `{ value: '2+', numericValue: 2, suffix: '+' }`.
- Change the fitness CRM period from `2026 — Present` to `2026` and its eyebrow from `Current product` to `Multi-club fitness operations`.
- Delete the complete MOIST Alumni experience and featured-project objects.
- Remove only `'MongoDB'` from the `Data & infrastructure` skill group.
- Add these two featured-project records before the older case studies:

```js
{
  id: 'one-ride-balingasag',
  categories: ['Mobile', 'Full Stack', 'Backend', 'API'],
  title: 'One Ride Balingasag (OMJI)',
  eyebrow: 'Started Apr 2026 · Live on Google Play · Balingasag',
  overview: 'A unified ride-hailing, delivery, pickup, and local-store platform built for everyday transport and errands in Balingasag.',
  context: 'Passengers, riders, families, and local stores need one service for transport, parcel delivery, scheduled pickup, and local shopping.',
  implementation: 'React Native mobile delivery backed by a Go and Gin API, PostgreSQL data, real-time WebSocket tracking, maps, plus React web and admin clients.',
  architecture: ['React Native + Expo', 'React + TypeScript web', 'Go + Gin API', 'PostgreSQL + GORM', 'JWT authentication', 'Maps + WebSockets'],
  features: ['Pasugo delivery', 'Pasabay motorcycle rides', 'Pasundo scheduled pickup', 'Local store delivery', 'Live tracking and fare estimates', 'Rider, store, and admin operations'],
  engineering: 'OTP and JWT authentication, distance-based fares, scheduled and recurring bookings, real-time rider tracking, multiple payment methods, ratings, SOS, and operational dashboards.',
  delivered: 'A live Google Play customer app supported by rider, store, web, and administrative workflows for the Balingasag service area.',
  stack: ['React Native', 'Expo', 'TypeScript', 'Go', 'Gin', 'PostgreSQL', 'GORM', 'WebSockets'],
  url: 'https://play.google.com/store/apps/details?id=com.oneridebalingasag.app&hl=en',
  private: true,
},
{
  id: 'omji-billing',
  categories: ['SaaS', 'Backend', 'Full Stack', 'API'],
  title: 'OMJI Internet Access & Billing System',
  eyebrow: 'Apr–Jun 2026 · Internet access and billing',
  overview: 'A web-based operations system for internet cafés, hotspots, and small ISPs combining prepaid access, billing, network control, and reporting.',
  context: 'Small internet operators need a practical way to manage timed access, vouchers, customer sessions, connected stations, and daily revenue.',
  implementation: 'TypeScript and Go services with web, mobile, and endpoint-agent clients, MikroTik RouterOS integration, and Docker-based deployment.',
  architecture: ['TypeScript services', 'Go services', 'Web + mobile clients', 'Endpoint agent', 'MikroTik RouterOS', 'Docker Compose'],
  features: ['Time-based prepaid billing', 'Voucher generation', 'Multi-station management', 'Revenue reports and analytics', 'MikroTik access control', 'Tablet-ready administration'],
  engineering: 'Usage-ledger billing, plan changes, voucher workflows, per-account permissions, network integration, database migrations, and repeatable container deployment.',
  delivered: 'A private operational platform covering access control, billing, reporting, administration, and multi-branch network support.',
  stack: ['TypeScript', 'Go', 'React', 'Docker', 'MikroTik RouterOS', 'Web + mobile'],
  private: true,
},
```

In `gameData.js`, remove `'MongoDB'` only from `SKILL_CATEGORIES` and change the biography line to:

```js
"2 years forging secure, scalable web, API, and mobile applications across Python, Go, .NET, Node.js, and PHP."
```

Keep the MongoDB certificate record because it is a supplied credential, not a general technology claim.

- [ ] **Step 4: Run the tests and confirm the data task passes**

Run: `npm test`

Expected: PASS for project counts, OMJI records, alumni removal, experience positioning, link validation, and credential preservation.

- [ ] **Step 5: Commit the data task**

```bash
git add tests/portfolioData.test.js src/data/portfolioData.js src/data/gameData.js
git commit -m "feat: refresh hiring portfolio project inventory"
```

### Task 2: Hiring-focused component copy

**Files:**
- Modify: `tests/portfolioData.test.js`
- Modify: `src/components/About.jsx:18-27`
- Modify: `src/components/Experience.jsx:73-78`
- Modify: `src/components/Projects.jsx:43-47`
- Modify: `src/components/RotatingTitle.jsx:68-74`

**Interfaces:**
- Consumes: the updated counts from Task 1: 7 featured projects, 8 archived projects, and 9 experience entries
- Produces: consistent hiring-facing prose with no five-year or `currently working as` claims

- [ ] **Step 1: Write failing source-copy regression tests**

At the top of `tests/portfolioData.test.js`, import `readFileSync` from `node:fs`, read the four component sources, and add:

```js
test('keeps duplicated component copy aligned with the hiring positioning', () => {
  assert.match(aboutSource, /Across two years of professional work/)
  assert.doesNotMatch(aboutSource, /five years|currently/i)
  assert.match(experienceSource, /<strong>2<\/strong><span>Years shipping<\/span>/)
  assert.match(experienceSource, /<strong>9<\/strong><span>Roles and engagements<\/span>/)
  assert.match(projectsSource, /Seven detailed case studies.*eight additional/i)
  assert.match(rotatingTitleSource, />Open to roles in</)
})
```

- [ ] **Step 2: Run the tests and confirm component-copy expectations fail**

Run: `npm test`

Expected: FAIL because the components still contain five-year, current-role, and old inventory copy.

- [ ] **Step 3: Update the duplicated component copy**

Use these exact replacements:

```jsx
// About.jsx
Across two years of professional work, I’ve delivered applications across web, iOS, and Android.
My strongest work lives where AI-integrated product features, backend architecture, polished UI,
and third-party systems meet.

My recent work includes an Australian multi-club fitness platform built end-to-end: member and payment
data, event-driven CRM sync, retention dashboards, and Twilio calling—replacing scattered tools with
a single dependable workflow.

// Experience.jsx
<div><strong>2</strong><span>Years shipping</span></div>
<div><strong>9</strong><span>Roles and engagements</span></div>

// Projects.jsx
description="Seven detailed case studies, plus eight additional client and independent builds across web, mobile, and operations."

// RotatingTitle.jsx
<span className="rotating-title-label" aria-hidden="true">Open to roles in</span>
```

- [ ] **Step 4: Run tests and production build**

Run: `npm test`

Expected: PASS.

Run: `npm run build`

Expected: Vite production build completes successfully.

- [ ] **Step 5: Commit the component task**

```bash
git add tests/portfolioData.test.js src/components/About.jsx src/components/Experience.jsx src/components/Projects.jsx src/components/RotatingTitle.jsx
git commit -m "fix: align portfolio copy with hiring positioning"
```

### Task 3: Full consistency verification

**Files:**
- Verify: `src/`
- Verify: `tests/`

**Interfaces:**
- Consumes: completed content and component tasks
- Produces: evidence that all requested changes are consistent and buildable

- [ ] **Step 1: Scan for stale claims and removed inventory**

Run:

```bash
rg -n -i "5\+ years|five years|current product|currently building|currently working as|alumni|MongoDB" src tests
```

Expected: only the MongoDB certificate/training credential may remain; there must be no stale experience claim, alumni entry, `current` marketing copy, or MongoDB general skill.

- [ ] **Step 2: Confirm the new project link and dates**

Run:

```bash
rg -n "one-ride-balingasag|Started Apr 2026|com\.oneridebalingasag\.app|omji-billing|Apr–Jun 2026" src tests
```

Expected: both case studies, both dates, and the exact Play Store URL appear in the data and tests.

- [ ] **Step 3: Run final verification**

Run: `npm test && npm run build && git diff --check`

Expected: all tests pass, Vite builds successfully, and no whitespace errors are reported.
