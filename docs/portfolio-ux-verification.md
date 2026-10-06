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
- Playwright's package is installed, but its managed Chromium executable is absent; evidence was captured with `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` and should be regenerated with the managed browser when available for cross-browser implementation checks.
