# Portfolio UX upgrade: baseline verification

Date: 2026-10-06 (Asia/Manila)
Branch: `codex/portfolio-ux-upgrade`
Preservation baseline: `edbcbc2f0d84b170b74ef70db4ef9870d1daf16f` (`origin/main`)
Scope: Stage A, Task 1 only. No product UI or portfolio data was changed.

## Tests

Commands run from the worktree root:

```text
node --test tests/portfolioPreservation.test.js
  tests 1
  pass 1
  fail 0

npm test
  JavaScript tests: 13 passed, 0 failed
  Python tests: 1 passed, 0 failed (`Ran 1 test ... OK`)
```

The new preservation test imports `src/data/portfolioData.js` from the current worktree and compares every export with the original module read from the baseline Git commit. The preservation test passed before any feature implementation.

Command: `npm run test:e2e -- --list`
Result: passed discovery with 18 tests in 1 file across Chromium, Firefox, and WebKit projects. Full browser execution was not part of this baseline task; the managed Playwright Chromium executable is unavailable in this checkout (see concerns below).

## Production build baseline

Command: `npm run build`
Result: passed (`vite v8.1.5`, 0.968s). Vite emitted the existing warning that `advancedChunks` is deprecated in favor of `codeSplitting`; this did not fail the build.

Emitted entry, asset, and chunk sizes:

```text
dist/index.html                             6.12 kB
dist/charlie-james-abejo-resume.pdf       881.49 kB
dist/assets/index-Bpg8RHZI.css            118.54 kB
dist/assets/rotate-ccw-BCYmIdd6.js          0.18 kB
dist/assets/heart-Eovs5tUc.js               0.23 kB
dist/assets/volume-2-B6ol-v-r.js            0.25 kB
dist/assets/gauge-DrHLXNxz.js               0.27 kB
dist/assets/home-DxIL94g8.js                0.42 kB
dist/assets/rolldown-runtime-QTnfLwEv.js    0.69 kB
dist/assets/settings--_gticJN.js            0.71 kB
dist/assets/avatar-BiZUs8Pq.js              6.00 kB
dist/assets/heroWebgl-ATmuRDOb.js           7.10 kB
dist/assets/gameData-5A3BkbKo.js            7.21 kB
dist/assets/AvatarCustomizer-DONGPxG8.js    7.25 kB
dist/assets/MusicPlayer-Bl6m8g8W.js         7.99 kB
dist/assets/SettingsPanel-Dp90nwk4.js       9.58 kB
dist/assets/ArcadeLobby-CF4b95f7.js        10.34 kB
dist/assets/pixelRacer-ZB2VGFWF.js         11.36 kB
dist/assets/neonCircuit-BJbYxrfL.js        12.00 kB
dist/assets/NeonCircuit-CN3LFUR8.js        13.09 kB
dist/assets/SnakeGame-nMjYVwg7.js          14.52 kB
dist/assets/RacingGame-COMHxo2g.js         14.88 kB
dist/assets/CodeRacer-CarGl8Lu.js          14.89 kB
dist/assets/FlappyDev-DjCb_Ynn.js          15.51 kB
dist/assets/BlockBlast-DTm2OcCA.js         15.51 kB
dist/assets/WhackABug-CXdWI9bL.js          16.61 kB
dist/assets/SpaceShooter-nPkwBwwu.js       18.24 kB
dist/assets/GameOverlay-PsnFcmsh.js        43.22 kB
dist/assets/Leaderboard-BwI8_xlM.js        51.08 kB
dist/assets/index-CzjdSo7j.js             104.83 kB
dist/assets/r3f-vendor-DLP5qR0T.js        125.25 kB
dist/assets/react-vendor-4ZGzXClA.js      147.61 kB
dist/assets/three-vendor-B4eCXLWX.js       675.50 kB
```

## Screenshot evidence

The six baseline viewport captures were generated with the existing Playwright package and the installed Google Chrome executable because the bundled Playwright Chromium binary was not present. Each capture uses a 900px viewport height and was taken after the target anchor settled. Files are ignored generated evidence under `.superpowers/sdd/2026-10-06-portfolio-ux-upgrade/tmp/portfolio-baseline/viewport/`.

| Section | Viewport | Screenshot | PNG dimensions | File size |
| --- | ---: | --- | ---: | ---: |
| Hero (`#home`) | 390px | `.superpowers/sdd/2026-10-06-portfolio-ux-upgrade/tmp/portfolio-baseline/viewport/hero-390.png` | 390 × 900 | 81,887 bytes |
| Work (`#momentum-work`) | 390px | `.superpowers/sdd/2026-10-06-portfolio-ux-upgrade/tmp/portfolio-baseline/viewport/work-390.png` | 390 × 900 | 82,987 bytes |
| Credentials (`#education`) | 390px | `.superpowers/sdd/2026-10-06-portfolio-ux-upgrade/tmp/portfolio-baseline/viewport/credentials-390.png` | 390 × 900 | 58,689 bytes |
| Hero (`#home`) | 1440px | `.superpowers/sdd/2026-10-06-portfolio-ux-upgrade/tmp/portfolio-baseline/viewport/hero-1440.png` | 1440 × 900 | 296,871 bytes |
| Work (`#momentum-work`) | 1440px | `.superpowers/sdd/2026-10-06-portfolio-ux-upgrade/tmp/portfolio-baseline/viewport/work-1440.png` | 1440 × 900 | 195,741 bytes |
| Credentials (`#education`) | 1440px | `.superpowers/sdd/2026-10-06-portfolio-ux-upgrade/tmp/portfolio-baseline/viewport/credentials-1440.png` | 1440 × 900 | 116,336 bytes |

Initial credentials section measurements from the same run:

| Viewport | `#education` CSS width | `#education` CSS height |
| ---: | ---: | ---: |
| 390px | 390px | 5,692.796875px |
| 1440px | 1440px | 2,823.609375px |

## Changed files

Only these task files are intended for staging and commit:

- `tests/portfolioPreservation.test.js`
- `package.json` (`test:e2e` now runs the complete Playwright test directory)
- `docs/portfolio-ux-verification.md`

The temporary capture script and PNG/measurement evidence remain under ignored `.superpowers/` paths and are not part of the commit.

## Self-review and concerns

- `git diff --check` and the staged-file `git diff --cached --check` both passed after the report was formatted.
- No application components, styles, data records, assets, private systems, credentials, or deployment configuration were changed.
- The build's pre-existing `advancedChunks` deprecation warning remains.
- At the baseline date, Playwright's managed Chromium executable was absent; that historical limitation applied only to the baseline captures below. Task 7's final gate used the installed Playwright Chromium, Firefox, and WebKit engines for the complete cross-browser run.

## Stage A Task 7 final local verification

Date: 2026-10-07 (Asia/Manila)

This addendum records the final local gate for the accepted Stage A UX upgrade. It adds browser verification only; no application component, style, portfolio record, credential, asset, or deployment setting was repaired. The existing Task 1-6 preservation and browser suites remain in the full run.

### Commands and exact results

Commands were run from the worktree root:

```text
NO_COLOR=1 FORCE_COLOR=0 npm test
  JavaScript: 29 passed, 0 failed
  Python: Ran 1 test ... OK

NO_COLOR=1 FORCE_COLOR=0 npm run build
  vite v8.1.5
  1494 modules transformed
  built in 8.54s
  passed with the existing `advancedChunks` deprecation warning

NO_COLOR=1 FORCE_COLOR=0 npx playwright test --output=.superpowers/sdd/2026-10-06-portfolio-ux-upgrade/task-7-full-e2e-results-20261007-v2 --trace=retain-on-failure --reporter=line
  177 passed (4.0m)
  Chromium: 59 passed
  Firefox: 59 passed
  WebKit: 59 passed

git diff --check
  passed
```

The 177-test run includes the 14 new Task 7 cases in each of Chromium, Firefox, and WebKit. Its fresh ignored result directory is `.superpowers/sdd/2026-10-06-portfolio-ux-upgrade/task-7-full-e2e-results-20261007-v2/`; it contains no failure trace because every test passed. The earlier interrupted run remains preserved separately and is not counted: its four environment failures were caused by a stale Vite/HMR graph (`doesn't provide an export named: 'default'`) while the worktree server was blocked on dependency-file I/O. A tracked-only generated server copy with an isolated Vite cache was used for the clean retry; source and production behavior were unchanged.

### Task 7 browser coverage

`tests/e2e/portfolio-stage-a.spec.js` covers:

- Momentum featured-to-complete disclosure, no horizontal overflow, touch-size controls, and visited lazy images at 320, 390, 768, 1024, 1440, and 1920 CSS-pixel widths.
- Mobile landscape at 844 × 390, including primary and secondary navigation and the complete eight-system collection.
- Genuine 200% root text-size reflow (`font-size` computes to 32px), with no overflow and all 23 credentials reachable. This test does not use `deviceScaleFactor: 2` as a browser-zoom claim.
- Light and Dark theme controls, including a denied `localStorage` getter/setter path; reduced-motion fallback visibility and disabled orbit animation.
- All ten public anchors (`home`, `about`, `experience`, `ai-systems`, `momentum-work`, `projects`, `skills`, `education`, `lab`, and `contact`) remain unique and deep links settle below the sticky header.
- Wrapped project-tab `ArrowLeft`, `ArrowRight`, `Home`, and `End` behavior, native detail-dialog focus containment, Escape close, and focus return.
- Initial request observation with `requestIdleCallback` held: no Arcade Lobby, game, game-data, Three.js, R3F, assistant, or portfolio-chat request occurs before release. The approved post-paint hero idle callback is released only after this initial assertion; this does not claim that Three.js is never requested.

The existing suite also re-verified the approved six featured/all-23 credentials, Momentum three featured/all-eight systems, native project and skills disclosures, private-data boundaries, original anchors, and games in the same 177-test run.

### Settled public captures and current measurements

The 12 settled public captures (Light/Dark × mobile/desktop × `#home`, `#momentum-work`, `#education`) and machine-readable measurements are preserved under:

`.superpowers/sdd/2026-10-06-portfolio-ux-upgrade/tmp/task-7-captures-20261007-v2/`

The capture script waited for the requested section, scrolled it into view, waited for reveal animations to settle, and recorded the target bounds and document width. Current measurements were identical in both themes:

| Viewport | Section | CSS width | CSS height | Target top | Document width |
| --- | --- | ---: | ---: | ---: | ---: |
| 390 × 900 | `#home` | 390 | 2040.0625 | 0 | 390 |
| 390 × 900 | `#momentum-work` | 390 | 3161.875 | 86.0625 | 390 |
| 390 × 900 | `#education` | 390 | 2805.71875 | 86.328125 | 390 |
| 1440 × 900 | `#home` | 1440 | 1093.3125 | 0 | 1440 |
| 1440 × 900 | `#momentum-work` | 1440 | 2343.546875 | 96.3125 | 1440 |
| 1440 × 900 | `#education` | 1440 | 1554.203125 | 95.65625 | 1440 |

Settled Light mobile Home, Dark desktop Momentum, and Light desktop Education images were visually inspected; no visual defect was found. These are public portfolio captures only, not private Zalio screenshots.

### Repeatable load timing comparison

The benchmark in `.superpowers/sdd/2026-10-06-portfolio-ux-upgrade/tmp/task-7-benchmark-20261007/production-load-timings.json` used five fresh Playwright Chromium contexts per target, a 1440 × 900 viewport, blocked service workers, and the `/` route. The baseline was reconstructed from `edbcbc2f0d84b170b74ef70db4ef9870d1daf16f` in a separate ignored directory; no historical timing was inferred.

| Target | Median wall load | Median DOMContentLoaded | Median load event | Median response end | Median transfer |
| --- | ---: | ---: | ---: | ---: | ---: |
| Baseline | 99 ms | 21.8 ms | 22.3 ms | 1.7 ms | 2,483 bytes |
| Stage A | 84 ms | 19.6 ms | 19.9 ms | 1.9 ms | 2,907 bytes |

No Lighthouse score or synthetic performance grade is claimed. First Contentful Paint was unavailable in the recorded entries and is omitted.

### Current build and scope

The current local production build emitted a 121.95 kB entry JavaScript chunk and 152.41 kB CSS chunk, versus the preserved baseline build's 104.83 kB entry and 118.54 kB CSS. The `advancedChunks` deprecation warning remains; the runner also emitted its existing `NO_COLOR`/`FORCE_COLOR` warning. No performance conclusion is drawn from bundle size alone.

Tracked Task 7 scope is limited to this addendum and `tests/e2e/portfolio-stage-a.spec.js`. The capture/benchmark scripts, PNGs, baseline reconstruction, full-run output, and report remain ignored generated evidence. Existing QA/SDD files were retained; no files were deleted, untracked, or released externally. Root retains the independent review, push, PR, and protected-preview gate.
