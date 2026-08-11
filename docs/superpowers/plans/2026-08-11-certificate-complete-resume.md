# Complete Certificate Resume Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change Rooche Digital Company to Oct-Dec 2025 everywhere and publish a resume containing all 23 portfolio certification records.

**Architecture:** Keep the portfolio's existing data-driven certificate gallery as the visual proof source. Update the three duplicated Rooche date consumers, then extend the ReportLab resume generator with a compact text-only certification inventory that is verified through the generated PDF rather than source-text assertions.

**Tech Stack:** React data modules, Node test runner, Python 3, ReportLab, Poppler, Vite, Git, Vercel CLI

## Global Constraints

- Rooche Digital Company must display exactly `Oct 2025 - Dec 2025` in the portfolio, game, and resume.
- The resume must contain all 23 certificate and training records from `src/data/portfolioData.js`.
- The five uploaded Anthropic certificate images remain in the portfolio and are not embedded into the PDF.
- No existing technology skill is removed.
- PDF text remains selectable, searchable, ATS-readable, and professionally legible.
- Prefer two pages; permit a clean third page instead of unreadably small text.

---

### Task 1: Lock the portfolio contract with a failing regression test

**Files:**
- Modify: `tests/portfolioData.test.js`
- Test: `tests/portfolioData.test.js`

**Interfaces:**
- Consumes: `experiences`, `certifications`, and game `EXPERIENCE` arrays.
- Produces: Regression coverage for the public Rooche date and five authentic image-backed Anthropic records.

- [ ] **Step 1: Write the failing test**

Add this test using literal expectations:

```js
test('publishes the corrected Rooche dates and authentic Anthropic certificates', () => {
  const portfolioRooche = experiences.find((item) => item.company === 'Rooche Digital Company')
  const gameRooche = EXPERIENCE.find((item) => item.id === 'rooche')
  assert.equal(portfolioRooche?.period, 'Oct 2025 - Dec 2025')
  assert.equal(gameRooche?.period, 'Oct 2025 - Dec 2025')

  const uploadedAnthropicTitles = certifications
    .filter((credential) => credential.issuer === 'Anthropic' && credential.image)
    .map((credential) => credential.title)
  assert.deepEqual(uploadedAnthropicTitles, [
    'Introduction to Model Context Protocol',
    'Teaching the AI Fluency Framework',
    'Claude 101',
    'Building with the Claude API',
    'AI Fluency: Framework & Foundations',
  ])
})
```

- [ ] **Step 2: Run the test to verify RED**

Run: `npm test`

Expected: FAIL because the portfolio Rooche period is still `Jan 2026 - Mar 2026`.

- [ ] **Step 3: Do not edit production data yet**

Keep the failure visible until Task 3 so the implementation proves the regression test.

### Task 2: Lock the generated resume contract with a failing PDF test

**Files:**
- Create: `tests/test_resume.py`
- Modify: `package.json`
- Test: `tests/test_resume.py`

**Interfaces:**
- Consumes: `scripts/generate_resume.py` command-line interface and Poppler `pdftotext`.
- Produces: A generated-PDF integration test invoked by `npm test`.

- [ ] **Step 1: Add the PDF integration test**

Create a `unittest.TestCase` that generates a temporary PDF, extracts normalized text using `pdftotext -layout`, and asserts the literal Rooche date plus these 23 titles:

```python
EXPECTED_CERTIFICATES = [
    "Model Context Protocol: Advanced Topics",
    "Introduction to Agent Skills",
    "AI Fluency for Builders",
    "Introduction to Model Context Protocol",
    "AI Capabilities and Limitations",
    "Claude Code in Action",
    "Introduction to Subagents",
    "Teaching the AI Fluency Framework",
    "Claude 101",
    "Building with the Claude API",
    "AI Fluency: Framework & Foundations",
    "Java SE 8 Programmer I",
    "Go Programming",
    "Programming in HTML5 with JavaScript and CSS3",
    "Full-Stack Web Development Certification",
    "Databases with SQL",
    "Manage AD DS Domain Controllers & FSMO Roles",
    "Windows Server 2012 Training",
    "Active Directory",
    "MongoDB Database Training",
    "PHP for Web Development",
    "JavaScript Programming",
    "HTML and CSS",
]
```

Use `" ".join(extracted.split())` before assertions so line wrapping cannot create false failures.

- [ ] **Step 2: Include the PDF test in the normal test command**

Change `package.json` to:

```json
"test": "node --test && python3 -m unittest discover -s tests -p 'test_*.py'"
```

- [ ] **Step 3: Run the PDF test to verify RED**

Run: `python3 -m unittest tests.test_resume -v`

Expected: FAIL because the generated resume still has the old Rooche date and only five selected certification lines.

### Task 3: Update dates and the complete resume certification inventory

**Files:**
- Modify: `src/data/portfolioData.js`
- Modify: `src/data/gameData.js`
- Modify: `scripts/generate_resume.py`
- Test: `tests/portfolioData.test.js`
- Test: `tests/test_resume.py`

**Interfaces:**
- Consumes: Existing ReportLab styles and `experience()` helper.
- Produces: Corrected public date data and a generated resume containing all 23 certifications.

- [ ] **Step 1: Correct both portfolio date records**

Set the Rooche `period` in both JavaScript data modules to:

```js
period: 'Oct 2025 - Dec 2025',
```

- [ ] **Step 2: Correct the resume experience date**

Set the Rooche date passed to `experience()` to:

```python
"Oct 2025 - Dec 2025",
```

- [ ] **Step 3: Replace Selected Certifications with the complete inventory**

Create two literal lists in `build_story()`: 11 Anthropic records with `Anthropic, Jul 2026` and 12 technical/professional records with their exact portfolio issuers and available issue dates. Render them under `Certifications & Technical Training` using category labels and compact wrapped paragraphs or a two-column table built from existing ReportLab primitives.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `npm test`

Expected: all Node and Python tests pass with zero failures.

### Task 4: Generate and visually inspect the release PDF

**Files:**
- Modify: `output/pdf/ABEJO_CHARLIE_JAMES_RESUME.pdf`
- Modify: `ABEJO_CHARLIE_JAMES_RESUME.pdf`
- Generated by build: `dist/charlie-james-abejo-resume.pdf`

**Interfaces:**
- Consumes: Updated ReportLab generator.
- Produces: Final local, output, and deployed resume assets with identical bytes.

- [ ] **Step 1: Generate and synchronize the PDF**

Run: `python3 scripts/generate_resume.py`

Copy `output/pdf/ABEJO_CHARLIE_JAMES_RESUME.pdf` to `ABEJO_CHARLIE_JAMES_RESUME.pdf`.

- [ ] **Step 2: Extract and verify text**

Run `pdftotext -layout` and verify `Oct 2025 - Dec 2025`, all 23 certificate titles, and absence of `Jan 2026 - Mar 2026`.

- [ ] **Step 3: Render every page**

Run: `pdftoppm -png output/pdf/ABEJO_CHARLIE_JAMES_RESUME.pdf tmp/pdfs/resume`

Inspect every generated PNG at original detail. Require no clipping, overlap, broken wrapping, black glyphs, or unreadable text.

- [ ] **Step 4: Run the final local gate**

Run: `npm test && npm run build && git diff --check`

Verify `shasum -a 256` matches for the root PDF, output PDF, and `dist/charlie-james-abejo-resume.pdf`.

### Task 5: Commit, publish, and verify production

**Files:**
- Commit all changed source, test, PDF, and plan files.

**Interfaces:**
- Consumes: Verified local build output and linked `.vercel/project.json`.
- Produces: GitHub `main` revision and Vercel production release.

- [ ] **Step 1: Commit the implementation**

Run:

```bash
git add package.json tests/portfolioData.test.js tests/test_resume.py src/data/portfolioData.js src/data/gameData.js scripts/generate_resume.py ABEJO_CHARLIE_JAMES_RESUME.pdf output/pdf/ABEJO_CHARLIE_JAMES_RESUME.pdf docs/superpowers/plans/2026-08-11-certificate-complete-resume.md
git commit -m "feat: publish complete certificate resume"
```

- [ ] **Step 2: Push GitHub main**

Run: `git push origin main`

- [ ] **Step 3: Build and deploy production**

Run:

```bash
vercel pull --yes --environment=production
vercel build --prod
vercel deploy --prebuilt --prod --yes
```

- [ ] **Step 4: Verify the public release**

Check the Vercel deployment is `READY`, the stable alias returns HTTP 200, the live JavaScript contains `Oct 2025 - Dec 2025`, and the live resume PDF hash matches the verified local PDF.
