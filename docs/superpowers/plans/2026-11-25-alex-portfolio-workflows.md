# Alex portfolio workflows implementation plan

**Goal:** Add local project recommendations, recruiter assistance, and an editable project brief to the existing Alex panel, as requested.

**Architecture:** A pure local workflow module reads the public case-study and skill data. The existing lazy assistant panel displays three guided modes alongside its general chat. Contact handoff uses the existing intent event after homepage navigation has mounted the contact form.

**Constraints:** No Gemini, new provider, dependency, real email send, deployment, commit, or changes to existing voice integration. Preserve the current uncommitted crypto removal and CODEBASE.MD work. Continue in the shared checkout so all previously authorized changes remain together.

## 1. Local evidence workflows
- [x] Add behavior tests first: CRM/follow-up recommendations link to real case studies and quote public contributions; unknown requirements produce no invented matches; recruiter requirements distinguish documented skills from unverified skills, years, and qualifications; prepared briefs retain the visitor's text and required steps.
- [x] Implement `src/lib/assistantWorkflows.js` with recommendation, role-assessment, and brief-state helpers. Limit input and use whole-term matching so Java and JavaScript, Go and Django, and React and React Native are not confused.
- [x] Verify pure workflow tests and the existing unit suite.

## 2. Existing Alex panel
- [x] Add browser tests for selecting each mode, multiline job input, evidence links, guided brief questions, editable review, and contact handoff from a nested route. Test existing contact drafts are preserved and no submission occurs.
- [x] Add three mode controls and retain general chat. Show ranked project cards with contribution evidence, requirement rows with explicit uncertainty, and a short brief interview (idea, users, must-have features, timing/budget).
- [x] Keep draft input when switching modes; provide restart for brief steps. Review the assembled brief in a labelled textarea. Move to the existing contact form only after an explicit action.
- [x] Complete the contact handoff after `/#contact` has mounted, without browser storage, automatically sending email, or overwriting existing message text. Announce when the visitor needs to paste the brief manually into an existing draft.
- [x] Reuse existing visual tokens; ensure messages remain scrollable on phones and keyboards, with appropriate labels and focus.

## 3. Verification and documentation
- [x] Run unit tests, build, assistant browser tests, contact booking tests, and theme/navigation checks. Verify no external requests are made by the new flows.
- [x] Inspect a desktop and mobile screenshot of the new UI.
- [x] Update CODEBASE.MD and README with the local workflows and verification limits.
- [x] Review diff for unsupported claims, input limits, navigation races, and accidental provider calls. Preserve generated captures outside the tracked source.

## Completion evidence

- `npm test`: 62 JavaScript and 2 Python tests passed.
- `npm run build`: passed, 23 metadata routes. The existing advancedChunks deprecation warning remains.
- Development Chromium: 20 tests passed across the new workflows, existing assistant, contact booking, and theme/navigation. The six workflow tests were rerun after final evidence matching changes.
- Production-preview Chromium: 9 tests passed across full-upgrade and performance specs.
- Reviewed desktop recommendations and mobile editable-brief screenshots in the dated Codex visualization directory.
- Independent review findings on planned-only evidence and title-only explanations were fixed, covered by failing-then-passing tests, and verified by the reviewer.
- Prior crypto removal preserved. No deployment, commit, real email, or live voice session performed.
