# Portfolio visual and usability upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing portfolio professional, theme-aware and easier to browse without losing any verified content or games.

**Architecture:** Retain Vite/React and the current data exports. Add a theme controller, accessible reusable dialog, pure collection selectors, and concise featured views; keep detailed content accessible on demand. This is stage A; the independently gated assistant is in the companion plan.

**Tech Stack:** React 18, Vite, existing CSS/Lucide/Three.js, Node test runner, Playwright Chromium/Firefox/WebKit.

**Spec:** `docs/superpowers/specs/2026-10-06-portfolio-ux-upgrade-design.md` (user approved 2026-10-06).

## Global Constraints

- Preserve every original project and Momentum system, all 23 learning records, both academic recognitions, education dates, resume, experience records, contact channels, optional music, and nine Lab games.
- Preserve existing public section anchors, including `#home`, `#about`, `#experience`, `#ai-systems`, `#momentum-work`, `#projects`, `#skills`, `#education`, `#lab`, and `#contact`.
- Preserve the ink, warm-paper, mint, and coral brand direction and self-hosted Inter.
- No deletion of source files, credentials, personal media, or existing worktrees.
- Default to System until an explicit preference exists. Normal text targets WCAG AA contrast of at least 4.5:1; large text and meaningful UI boundaries target at least 3:1.
- Use consistent 150–300 ms micro-interactions. Do not accidentally preload Lab or Three.js in the entry bundle.
- No modification of internal.zalio.ai or other client applications. No private-system credentials or database access in the public portfolio or assistant.
- Use apply_patch for file edits. Work only in the clean isolated branch `codex/portfolio-ux-upgrade`; preserve the primary checkout.

## Review Focus

- Storage denied or corrupt theme preference: the page still renders and theme selection works for the current session (Task 2).
- Collapse or filtering removes the trigger of an open dialog: closing restores focus to a still-present collection control (Task 3).
- A query targets a non-featured credential or private system: search/filter inspects the complete inventory (Tasks 4 and 5).
- Competing overlays or mobile keyboard: only the intended dialog owns focus and body scroll (Task 3; assistant companion Task 4).
- Old deep links after section reordering and content expansion: the correct heading remains below the sticky header (Tasks 6 and 7).

## File map and contracts

New files: `src/lib/theme.js`, `src/components/ThemeProvider.jsx`, `src/components/ThemeSelector.jsx`, `src/styles/theme.css`, `src/components/PortfolioDialog.jsx`, `src/styles/dialog.css`, `src/lib/portfolioCollections.js`, `src/components/CredentialExplorer.jsx`, `src/styles/credentials.css`, `src/components/MomentumShowcase.jsx`, `src/components/SystemDetail.jsx`, `src/components/ZalioWorkspaceOverview.jsx`, `src/styles/portfolio-ux.css`, and focused tests named in each task.

Modified files: `index.html` boot colors; `src/main.jsx` provider/style mounting; `src/App.jsx` order/overlay arbitration; `src/components/Navbar.jsx`, `Hero.jsx`, `AISystems.jsx`, `Education.jsx`, `Projects.jsx`, `Skills.jsx`, `CommandPalette.jsx`; `src/components/ai-systems.css` semantic surface colors; `package.json` browser-test glob; existing browser assertions whose eight-card default intentionally becomes three featured cards.

Do not change original data exports except adding separate presentation exports if necessary. Do not refactor game code. Keep the existing hero renderer controllers unchanged unless measurements demonstrate a specific visual defect.

### Task 1: Lock preservation and baseline evidence

**Files:** Create `tests/portfolioPreservation.test.js`; modify `package.json` test:e2e only; inspect existing tests and build output.
**Interfaces:** Produces regression coverage comparing existing public facts with baseline main; no application interface changes.

- [ ] Add a preservation test using the original module from Git, not a hand-written abbreviated snapshot:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import * as current from '../src/data/portfolioData.js'
const source = execFileSync('git', ['show', 'edbcbc2f0d84b170b74ef70db4ef9870d1daf16f:src/data/portfolioData.js'], { encoding: 'utf8' })
const baseline = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
test('original data exports remain unchanged', () => {
  for (const [name, value] of Object.entries(baseline)) assert.deepEqual(current[name], value, name)
})
```

- [ ] Run `npm test` and `npm run build`; save test counts and emitted entry/chunk sizes in `docs/portfolio-ux-verification.md` using apply_patch. This preservation test should pass initially; the feature-specific tests in later tasks must fail before their implementation.
- [ ] Expand the existing script to `"test:e2e": "playwright test"`, so the new spec files are not silently excluded.
- [ ] Capture current hero, work and credentials screenshots at 390 and 1440 px; use the existing Playwright installation, no private screenshot uploads. Record screenshot paths and initial credentials section height in the verification document.
- [ ] Run `git diff --check`; stage only `tests/portfolioPreservation.test.js`, `package.json`, and `docs/portfolio-ux-verification.md`; commit `test: lock portfolio preservation baseline`.

### Task 2: Theme preference, first paint and semantic tokens

**Files:** Create theme files from the file map, `tests/theme.test.js`, `tests/e2e/portfolio-theme.spec.js`; modify `index.html`, `src/main.jsx`, `src/index.css`, `src/components/ai-systems.css`, and theme-facing components.
**Interfaces:** `THEME_KEY = 'portfolio:theme:v1'`; `resolveTheme(preference, systemDark) -> 'light'|'dark'`; `readTheme(storage) -> 'light'|'dark'|'system'`; `useTheme() -> {preference, resolvedTheme, setPreference}`. Provider emits `portfolio:theme-change` with the resolved theme for optional hero consumers.

- [ ] Write failing pure and browser tests for valid modes, corrupt storage, denied storage, reload persistence, OS changes only in System, and computed colors in navigation/cards/errors/dialogs.

```js
test('denied storage falls back without preventing rendering', () => {
  assert.equal(readTheme({ getItem() { throw new Error('denied') } }), 'system')
  assert.equal(resolveTheme('system', true), 'dark')
  assert.equal(resolveTheme('light', true), 'light')
})
```

- [ ] Run `node --test tests/theme.test.js`; expect a missing module/export failure. Run the new browser test and verify that the missing labelled theme selector is the failure, not a startup issue.
- [ ] Implement the pure controller and use the same resolution rule in a small pre-paint inline script:

```js
export const THEME_KEY = 'portfolio:theme:v1'
export const resolveTheme = (preference, systemDark) =>
  preference === 'light' || preference === 'dark' ? preference : systemDark ? 'dark' : 'light'
export function readTheme(storage) {
  try { const value = storage.getItem(THEME_KEY); return ['light', 'dark', 'system'].includes(value) ? value : 'system' }
  catch { return 'system' }
}
```

Provider effects must clean up media-query and storage listeners. Catch both localStorage access and writes, keep state usable after a write fails, set `data-theme`/`colorScheme`, and update the theme-color meta tag. Use a visible native select labelled Color theme with Light/Dark/System; desktop and mobile share provider state.

- [ ] Add semantic tokens. Start with paired surfaces, then replace actual component foreground/background usages—not a blanket variable inversion:

```css
:root, :root[data-theme="light"] {
  --surface-page: #f3f0e9; --surface-card: #fffdfa; --text-primary: #0b2528;
  --text-muted: #56696a; --border-ui: #8b9c99; --accent-action: #0b6b58;
  --on-accent: #fffdfa; --focus-ring: #0b6b58; --scrim: rgb(0 0 0 / .55);
}
:root[data-theme="dark"] {
  --surface-page: #0b2024; --surface-card: #163236; --text-primary: #f3f0e9;
  --text-muted: #bacbc7; --border-ui: #688580; --accent-action: #67e0c1;
  --on-accent: #0b2528; --focus-ring: #67e0c1; --scrim: rgb(0 0 0 / .65);
}
```

Keep an ink-backed hero visual island for the authored mint/coral renderer; theme the surrounding hero copy and surfaces. Inventory raw component colors and status colors with `rg -n '#[0-9a-fA-F]{3,8}|rgba?\(' src/index.css src/components/ai-systems.css`; inspect every interactive foreground/surface pair. Boot backgrounds use the resolved theme before React mounts.

- [ ] Run theme unit tests, browser tests in all three engines, `npm test`, and build. Assert AA contrast pairs numerically and inspect screenshots. Commit `feat: add persistent accessible portfolio themes` with exact theme files and affected consumers.

### Task 3: Accessible detail dialog and overlay arbitration

**Files:** Create `PortfolioDialog.jsx`, dialog CSS and `tests/e2e/portfolio-dialog.spec.js`; modify `App.jsx` coordination and existing overlay entry points only as needed.
**Interfaces:** `<PortfolioDialog open title onClose returnFocusRef fallbackFocusRef>{children}</PortfolioDialog>`; emits `portfolio:detail-open` before taking focus. Existing menu/music/palette close when another modal owns focus; Lab entry closes portfolio details. Use native `<dialog>` with `showModal()` rather than adding a third-party focus library.

- [ ] Write a failing browser test using the credential detail trigger once Task 4 mounts it; add an isolated React SSR test for labelled dialog structure to run now. Browser test: Tab/Shift+Tab stay within open detail, Escape closes, close restores trigger or fallback, switching to mobile menu does not leave the page inert.

```js
await page.getByRole('button', { name: 'Open details: Building with the Claude API' }).click()
await expect(page.getByRole('dialog', { name: 'Building with the Claude API' })).toBeVisible()
await page.keyboard.press('Escape')
await expect(page.getByRole('button', { name: 'Open details: Building with the Claude API' })).toBeFocused()
```

- [ ] Run the structure test and verify missing dialog implementation fails. Retain the pending integration test to execute after Task 4; do not report it as passed.
- [ ] Implement native dialog lifecycle with ref-driven `showModal()`/`close()`, `onCancel` preventing native state divergence and calling `onClose`, a visible Close details button, title ID, scrollable content sized `max-height: calc(100dvh - 32px)`, safe-area padding, and cleanup:

```js
const restoreFocus = () => {
  const trigger = returnFocusRef?.current
  const fallback = fallbackFocusRef?.current
  if (trigger?.isConnected) trigger.focus({ preventScroll: true })
  else if (fallback?.isConnected) fallback.focus({ preventScroll: true })
}
```

Background inertness is owned by native modal semantics. Body scroll locks use one shared reference-counted owner helper rather than unrelated unconditional removals; an overlay cleanup must not unlock another open overlay. Add Escape cleanup tests and prevent simultaneous modal/palette/menu controls from competing for focus.

- [ ] Run SSR structure tests and all currently runnable browser regressions; run full dialog tests after Task 4 and again after assistant integration. Commit `feat: add accessible portfolio detail dialog`.

### Task 4: Compact searchable credential explorer

**Files:** Create `portfolioCollections.js`, `CredentialExplorer.jsx`, credential CSS, `tests/portfolioCollections.test.js`, `tests/e2e/portfolio-credentials.spec.js`; modify `Education.jsx` to mount the explorer instead of duplicate gallery/lists.
**Interfaces:** `selectCredentials(records, {query='', category='all', expanded=false}) -> records[]`; category is `all|ai|technical`; featured titles are the six named in the approved spec. Dialog receives the existing credential object; no separate lossy data copies.

- [ ] Write failing tests for six initial results, 23 expanded records, all-inventory query/category matching, whitespace/case normalization, IDs and missing images. Pin Review Focus with a non-featured query:

```js
test('queries search beyond the featured six', () => {
  const result = selectCredentials(certifications, { query: ' active DIRECTORY ' })
  assert.deepEqual(result.map(item => item.title), ['Active Directory'])
})
```

- [ ] Run `node --test tests/portfolioCollections.test.js`; expect missing selector failure.
- [ ] Implement selector normalization, category and query first, featured limiting last. A query or non-all category always searches all records:

```js
const needle = query.trim().toLocaleLowerCase('en')
const matches = records.filter(record =>
  (category === 'all' || (category === 'ai') === (record.issuer === 'Anthropic')) &&
  `${record.title} ${record.issuer} ${record.credentialId || ''}`.toLocaleLowerCase('en').includes(needle))
return expanded || needle || category !== 'all' ? matches : matches.filter(record => featuredTitles.has(record.title))
```

Define `featuredTitles` with the six exact spec titles in this module. The explorer owns query/category/expanded/selected-record state. Label Search credentials; controls All, AI & Anthropic, Technical & Professional; View all 23 records / Show featured. Each item opens details containing original metadata, image if supplied, and explicit No uploaded certificate image otherwise. Open original certificate uses only existing `credential.image`, never an invented verification URL. Keep expiry labels honest.

- [ ] Add browser tests for query/filter/counts, empty state Clear search, six-to-23 expansion, five existing image URLs, expired Full-Stack record, Escape/focus fallback and mobile no overflow. Assert credential height in the default view is below baseline while all records remain reachable. Run unit/browser tests and build.
- [ ] Commit `feat: make credentials compact searchable and inspectable` with exact explorer, selector, Education and test files.

### Task 5: Featured Momentum work and truthful detailed views

**Files:** Create `MomentumShowcase.jsx`, `SystemDetail.jsx`, `ZalioWorkspaceOverview.jsx`; modify `AISystems.jsx`, system CSS, selectors/tests, and existing systems browser tests.
**Interfaces:** `selectSystems(records,{category='All systems',expanded=false}) -> records[]`; verified existing initial IDs are `hasti`, `zalio`, `gymfactories`. `<MomentumShowcase />` owns `#momentum-work` and collection state; `<AISystems />` retains `#ai-systems` and all six service categories. Export both components separately so App can position Work before Services.

- [ ] Write failing selector tests: default three; expanded eight; Voice yields Hasti and private AI Voice Runtime even if not expanded; original data unchanged. Browser tests preserve public links and private statuses.

```js
test('filters search private systems outside the featured three', () => {
  const result = selectSystems(momentumSystems, { category: 'Voice' })
  assert.equal(result.length, 2)
  assert.ok(result.some(item => item.id === 'voice-runtime' && !item.url))
})
```

- [ ] Run the selector test; expect failure until the function exists. Update old eight-card default assertions to click View all systems first; never simply weaken them to any positive count.
- [ ] Split current work markup out of AISystems into MomentumShowcase. Implement selection by category over all records, then default featured limit. Render the existing image, type/status/title/summary/live URL and an Open case study button. SystemDetail shows verified summary/contribution/stack and public URL only when supplied. Keep real links new-tab labelled and private cards without internal demo URLs.

```jsx
<button type="button" aria-label={`Open case study: ${system.title}`} onClick={() => setSelected(system)}>
  Engineering details
</button>
{system.url && <a href={system.url} target="_blank" rel="noreferrer">Open live experience</a>}
```

Use existing status-specific wording (Hasti demo, Zalio product site, HSIE prototype), not the same demo label for every URL. Keep all six service categories visible as concise summaries; move their existing outcomes and stack into native details. Preserve four engineering groups in a collapsed Behind the products disclosure.

- [ ] Add Zalio's code-native architecture overview with these labels only: CRM; Agents; Operations; Roster; Library; Team chat. Caption Architecture overview · Private authenticated workspace. Use semantic lists/connections with no private screenshots, names, contact fields, task counts or operational records. Browser test verifies all six labels, private status and absence of `internal.zalio.ai` public links.
- [ ] Run all collection/unit/browser tests, verify every existing Momentum URL is reachable in the expanded collection, and inspect desktop/mobile screenshots. Commit `feat: curate live systems and private workspace case studies`.

### Task 6: Navigation, density, original projects and motion polish

**Files:** Modify App/Navbar/Hero/RotatingTitle/Projects/Skills/CommandPalette and CSS; create `portfolio-ux.css` and `tests/e2e/portfolio-journey.spec.js`; add separate presentation navigation exports without changing original navigation.
**Interfaces:** `primaryNavigation` five entries; `secondaryNavigation` existing Experience/Projects/Skills/Lab plus resume/music actions. Command palette consumes the original full navigation and new Work/Services commands. Hero primary work CTA targets `#momentum-work`.

- [ ] Add failing journey tests for five primary destinations, all old sections, old deep-link entry, mobile secondary links, eight project tabs/16 total builds, and a smaller hero role summary with complete role details.

```js
await page.goto('/#education')
await expect(page.locator('#education')).toBeVisible()
await expect(page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link')).toHaveCount(5)
await expect(page.locator('#projects [role="tab"]')).toHaveCount(8)
```

- [ ] Run journey tests and identify expected missing destinations before implementation.
- [ ] Apply approved order in App: Hero, MomentumShowcase, AISystems, About, Experience, Projects, Skills, Education, Lab, Contact. All existing anchor IDs remain unique. Navbar observes all relevant primary/secondary IDs sorted by measured document position and remeasures on expansion using its existing ResizeObserver.

```js
export const primaryNavigation = [
  { label: 'Work', href: '#momentum-work' }, { label: 'Services', href: '#ai-systems' },
  { label: 'About', href: '#about' }, { label: 'Credentials', href: '#education' },
  { label: 'Contact', href: '#contact' },
]
```

Retain complete `professionalTitles` through a native details list; replace constantly typing presentation with the concise profile role. Reduce heading sizes to `clamp(2rem,4vw,3.75rem)` in sections, body copy at least 16px, max text width 68ch, section padding `clamp(48px,6vw,88px)`. Keep buttons at least 44px. Do not shrink all text globally or cut original project copy.

- [ ] In original Projects, keep tab semantics and keyboard arrows; make tabs wrap/readable on mobile rather than require precise horizontal dragging. Keep overview/live link visible; move existing narrative/architecture/features to explicitly labelled native details. Collapse the eight-item archive initially with View all 8 earlier builds. Skills remain six groups with readable labels and expandable full token lists. Scope theme-specific styling and don't alter game HUD dimensions.
- [ ] Refine existing 3D presentation using a stable visual frame, labelled layers and the existing idle/WebGL fallback. Keep the renderer's mint/coral scene in its dark visual island. Set UI transition tokens to 180/240ms, reduced-motion overrides to no decorative animation, pause decorative role cycling rather than adding more continuous effects. Run no-WebGL/reduced-motion journey tests, contact validation and music/palette/Lab entry-exit tests without sending real emails.
- [ ] Run all tests/build, inspect theme variants at mobile/desktop, and commit `feat: polish portfolio navigation hierarchy and motion` with exact changed files.

### Task 7: Stage A verification and preview handoff

**Files:** Extend browser specs and `docs/portfolio-ux-verification.md`; only repair code associated with a demonstrated failing test/visual defect.
**Interfaces:** Produces a reviewed working UI stage and the public section/source IDs required by the assistant companion plan.

- [ ] Add parametrized viewport tests with real assertions:

```js
for (const width of [320, 390, 768, 1024, 1440, 1920]) {
  test(`no overflow at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/#momentum-work')
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await page.getByRole('button', { name: 'View all systems' }).click()
    await expect(page.locator('.momentum-card')).toHaveCount(8)
  })
}
```

- [ ] Add mobile landscape, 200% text scaling/zoom, both themes, reduced motion, storage denial, focus, touch-size and all-old-anchor tests. Visit each lazy screenshot before asserting its decoded width, rather than forcing offscreen decode in Firefox.
- [ ] Run `npm test`, `npm run build`, `npm run test:e2e`, and `git diff --check`; record exact results. Check entry imports/asset requests do not preload arcade, assistant or Three.js. Measure repeatable baseline/new load timings without inventing a performance score.
- [ ] Request an independent whole-stage review under the review skill. Resolve findings with failing regression tests, rerun the affected/full suite, inspect screenshots, and retain original public-data preservation comparisons.
- [ ] If applicable release authorization covers preview creation, deploy a protected preview to the existing Vercel project, verify mobile/desktop behavior and public links, and report stage A separately from chatbot readiness. Do not call the overall task finished. Commit verification evidence; continue to the assistant plan after its integration gate. No production deploy solely because documentation is approved.

## Plan self-review and handoff

Coverage: spec 1–9 and 11–12 map to Tasks 1–7; assistant/privacy/backend requirements map to the companion plan. Pure helpers are tested before React wiring, exact original exports are preserved, old eight-card browser tests are updated for explicit expansion, and overlay integration tests are rerun after both stages. Review Focus conditions each have an owning task.

Execution needs plan review before product edits. Preserve the user's earlier explicit Luna Max execution request: subagent-driven execution, with task implementers using the available `gpt-5.6-luna` at `max` effort, small isolated task briefs and independent review gates. This does not switch the primary orchestrator's model; do not claim that it does. If the user changes the method, preserve that newest choice.
