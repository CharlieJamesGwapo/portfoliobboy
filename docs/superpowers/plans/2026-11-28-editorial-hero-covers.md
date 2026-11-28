# Editorial hero and project covers

Approved scope: refresh the hero and BBOY, EasyAppy, AgentForge and Zalio covers, add restrained animation and refined interactions, test, push and deploy. Leave OneRide unchanged.

Art direction: an editorial engineering studio using the existing teal, mint and paper palette, existing fonts, a clearer portrait/headline relationship and a small illustrated AI-to-API/CRM flow. Cover treatments frame existing public or explicitly conceptual media; they must not imply private CRM access or finished prototype functionality.

1. Refresh the left hero only. Preserve existing links, title meaning, proofs and featured-project carousel.
2. Add project-specific cover frames, keyed to the four approved project IDs. Preserve captions, gallery controls and image failure handling.
3. Verify mobile widths, both themes, keyboard interactions and reduced motion. Update old portrait-size assertions to match the approved composition. Check protected OneRide source/data/media hashes and existing gallery interactions.
4. Run unit tests, browser suites, configured production build and security checks. Review the resulting screenshots and code before release.
5. Commit and push, then verify GitHub CI, the matching READY Vercel deployment, public alias and live read-only checks.

The hero and covers are independent file domains and are delegated in parallel. Root owns integration, regression checks and release. No new dependencies or heavyweight animation runtime are needed.
