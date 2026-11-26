# Alex booking and project briefs

## Intro call

Public booking page: https://calendar.app.google/By5XJkjMfuv8Ue1z9

- 15-minute intro call with Charlie Abejo, free.
- Monday through Friday, 9 AM to 5 PM, Philippine Standard Time (Asia/Manila).
- Google Meet information is generated after booking.
- Existing busy calendar times are unavailable; the page currently allows booking up to 60 days ahead with a four-hour minimum notice.
- Created through Google Calendar's UI with the owner's explicit authorization. The existing 60-minute WORKING SCHEDULE was retained.
- Verified in a signed-out private Chrome window, including the published title, duration, timezone and available 15-minute slots. No test appointment was reserved.

Set `PORTFOLIO_BOOKING_URL` in the Vercel production environment before building. It is a Config value for a public URL, not an API key. Vite normalizes and validates it before exposing the URL to the frontend. Invalid nonempty configuration fails without echoing its value. The variable intentionally has no `VITE_` prefix, so invalid input is not automatically copied to the browser environment.

The 30- and 60-minute options remain explicit contact requests. No appointment is confirmed by the portfolio itself. A visitor completes a direct booking on the scheduling page or submits a call request for confirmation. Neither path adds their brief to a scheduling URL. Opening the voice booking disclosure stops audio before revealing an external link, including for middle-click and native new-tab actions.

## Briefs

Choose Prepare a brief in Alex, answer the four questions, then review and edit the draft. Voice visitors can prepare an enquiry draft from their statements and edit it in the same workspace.

- Copy brief copies the current edited content to the clipboard.
- Download text saves a UTF-8 `.txt` file, including Unicode and line breaks.
- Save as PDF opens a locally generated printable tab. Choose Save as PDF in the browser's print destination. A visible print button remains if automatic preview does not open.
- Exports do not send email, create appointments, upload visitor content, or persist the transcript/draft in browser storage. Saving or copying a voice brief ends any active voice session.
- If copy, download or pop-up access fails, the controls explain how to use another export option. Empty drafts cannot export; short nonempty drafts can.
- Contact handoff preserves existing messages. Alex booking also preserves an existing subject and shows the prepared request for manual copying.

## Mobile behavior

The panel follows the visual viewport during mobile keyboard resize and pan, including landscape. The close control and composer remain reachable in compact layouts. Action buttons wrap and have 44px minimum touch targets. Existing text and voice drafts remain editable without horizontal page overflow.

## Release verification

Node/Python unit suites, the complete production Chromium suite, the complete development Chromium suite, and focused Firefox/WebKit export, booking and keyboard checks were run. Review regressions cover malicious/local scheduler URLs, accidental credentials, short Unicode drafts, current edits, HTML escaping, clipboard/pop-up denial, preserved contact subjects, and voice cleanup before scheduling. The generated PDF was rendered and its Unicode text extracted for inspection. External scheduling behavior was exercised with intercepted pages; the real Google page was checked signed out without reserving an appointment. Contact API tests use mocked delivery.
