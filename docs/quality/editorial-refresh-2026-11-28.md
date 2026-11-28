# Hero and project-cover refresh — 28 November 2026

## Scope

The approved refresh improves the hero introduction, four project covers (BBOY, EasyAppy, AgentForge and Zalio), and their motion and interaction details. Existing project status, public-media labels and private-work boundaries remain visible.

OneRide is outside the change scope. Before implementation, SHA-256 baselines were recorded for its featured carousel, carousel styles, product preview component/styles, walkthrough styles, preview data and six official screenshot assets. Existing gallery and keyboard navigation are included in browser verification.

## Verification

- Unit checks: 255 Node tests and 2 Python tests passed.
- Configured production suite: 89/89 Chromium checks passed, including Alex, voice cleanup, brief downloads, booking, privacy, contact handoffs and mobile performance. Voice transport and contact/network boundaries use the existing test fixtures; no visitor enquiry or paid voice call was sent.
- Dependency audit: zero vulnerabilities. Read-only live security audit: 17/17 checks passed before release.
- Visual review: desktop and narrow mobile layouts in both themes, the homepage, BBOY cover and Zalio case study. A 320px BBOY diagram clipping issue was found and corrected with scoped minimum heights and compact artwork. Regression checks cover all four BBOY surfaces across browser engines.
- Independent final review: no remaining blockers. All new styles are scoped to the left hero copy or explicit cover wrappers.
- OneRide boundary: eleven protected files/assets match their original checksums. The shared product-preview file adds only the Zalio branch/import; the OneRide preview implementation remains byte-for-byte identical. Canonical project data and OneRide walkthrough source also remain identical.

Final caption markup: configured production rebuild passed (23 routes), followed by 13/13 focused production visual/performance checks and 19/19 consumer unit checks. The 108-case Chromium/Firefox/WebKit run passed 103 checks initially; five Firefox portrait assertions reported 181.9999847px against a 182px threshold (or the equivalent width rounding). A 0.1px assertion tolerance corrects test precision without changing application styling. The complete affected Firefox carousel suite then passed 10/10 checks. All selected browser scenarios are covered by the passing initial checks and this targeted rerun.

## Release

- Source commit: `19e30add3494f1d21308e02b2574fe80dacd087e`, pushed to `origin/main`.
- GitHub Security checks run `46110320815`: completed successfully.
- Matching production deployment: `portfoliobboy-qeqlabmfd-charlie-james-projects.vercel.app`, READY. Vercel metadata matches the full source commit; `portfoliobboy.vercel.app` resolves to that deployment.
- Post-release read-only security audit: 17/17 checks passed.
- Normal-browser production check: updated hero/workflow rendered, BBOY architecture cover rendered, and returning to the OneRide tab restored its official Stores screenshot. No microphone or enquiry submission was used.

This report is a documentation follow-up to that verified source release.
