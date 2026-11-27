# Mobile performance, motion and accessibility

The owner approved improving mobile speed, scrolling animations and accessibility, followed by testing, push and deployment. The existing visual identity and working Alex, booking, downloads, contact, privacy and monitoring flows remain the constraints.

## Approach

Use the current React/Vite implementation and measure the built site before and after. Prefer smaller assets, deferring optional work, short transform/opacity effects, robust reduced-motion handling, and focused keyboard/touch/contrast corrections. A wholesale redesign would exceed this task; removing all motion would undermine the requested showcase. These implementation choices are the builder's call within the approved scope.

## Acceptance

- Initial mobile loads avoid unnecessary optional features/media and preserve readable hero content and route metadata.
- Scroll effects remain progressive enhancements: content and focused controls are immediately available, including dynamically enabled reduced-motion settings.
- Main navigation and Alex retain keyboard, small-screen, booking and download usability; selected accessibility findings have regression coverage.
- Record measured byte/request differences and verification limits without claiming real-user performance or complete WCAG certification.
- No private data in reports, secrets in source, real voice calls, test enquiries, destructive cleanup, new paid services or changed alert settings.

Inspect representative routes at small/mobile and desktop sizes. Run relevant browser regressions, the full Node/Python suite, production build and live security checks. Obtain a fresh review, push the tested changes, confirm CI and production readiness, then verify the deployed flows without submitting an enquiry or booking.
