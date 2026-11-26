# Alex public evidence audit

Date: 2026-11-26. Scope: deterministic text answers and the public contextual evidence supplied to a connected portfolio voice session. No billable calls, provider prompt overrides, production requests, or private project inspection were used for this audit.

## Evidence and context contract

`buildVoiceEvidenceContext()` in `src/lib/voiceEvidence.js` returns a plain string, currently 5,205 characters, with a hard maximum of 7,000. Callers can send it with the SDK's `sendContextualUpdate(text)` once per connected call. It performs no network or environment access.

Sources are the same public `profile`, `experiences`, and `bookingOptions` data rendered by the portfolio, all 20 `caseStudies`, and the three `selectedCaseStudies`. The context includes every case-study name and portfolio route, published status, a short stack, and the first external project link where published. It gives additional personal-contribution evidence to Alex/Hasti, Zalio CRM, and OneRide. Longer future project descriptions share the remaining budget; the final output is capped.

The portfolio's Alex voice session uses ElevenLabs (`LiveAgentSession.jsx`). The separately published Alex/Hasti project uses LiveKit Agents, GPT-Live and Twilio SIP. Fictional accent and bilingual preview recordings establish neither real client conversations nor proof of delivery.

The featured Zalio/Momentum engagement ended in September 2026. The independent freelance role is explicitly dated `2023 – Present`; these must not be conflated. Public project links and statuses are editorial evidence, not an uptime, ownership, or current commercial-availability verification.

## Findings and changes

| Finding | Resulting behavior |
| --- | --- |
| Voice and AI answers only pointed to Hasti for live voice | Explain the current portfolio voice experience and distinguish the separate Hasti runtime. Voice availability remains conditional. |
| A named project could take precedence over its price question | Price checks run before project matching; unpublished project prices and rates require Charlie's confirmation. |
| Booking keywords could beat a price question and return a free-call answer | Commercial questions never infer a free project from a free introductory call. |
| Services claimed US/Australian business-hour overlap without a public source | Remove the overlap assertion; ask Charlie to confirm availability. |
| Date and delivery questions could return generic projects or greetings | Explicitly state that the detail is unconfirmed and link to contact. |
| Named case studies were missing or reduced to generic system summaries | Match public case-study titles/routes and include documented responsibilities and status. |
| Finished featured role could obscure ongoing independent work | Keep the completed dates and separately disclose the ongoing freelance role. |
| Local identity claimed replies could never make anything up | Disclose the limits of deterministic keyword matching. |
| Booking wording could imply a reservation | A meeting request does not reserve a calendar event; Charlie confirms the time and invite. |

## Tested inputs and boundaries

`tests/voiceEvidence.test.js` executes real modules through Vite SSR for the answer engine's audio imports. The context builder is also imported directly through Node. Tests were written and observed failing before their corresponding changes.

| Inputs | Verified behavior |
| --- | --- |
| `What does Zalio CRM cost?`; `What is his hourly rate for React?` | No invented price or free-project implication; Charlie must confirm. |
| `How much to book a project discovery meeting and build an app?` | Price uncertainty takes precedence over overlapping booking words. |
| `Can he deliver a CRM in two weeks?`; `What is the delivery timeline for OneRide?`; `Can he guarantee a launch next month?`; `How long would it take to build a CRM?`; `Can he ship it in two days?` | Delivery timing stays unconfirmed. |
| `When can Charlie start?`; `Is he available next Monday for a meeting?`; `Can he start tomorrow?`; `Is Charlie free Monday?` | No inferred calendar availability. |
| `Tell me about his voice work`; `Talk to Alex`; `ElevenLabs`; AI suggestion | Both Alex experiences are distinguished, including their different technologies. |
| `Book a free call` | Published 15-minute intro and 30-minute discovery remain free; no reservation is claimed. |
| `Who is Charlie?` | Ended Zalio engagement and ongoing independent role remain distinct. |
| `Tell me about AutoFlow AI Pro`; `Tell me about Zalio CRM` | Planned integrations and private-module status are retained; links go to the actual case studies. |
| `Does he have 10 years of React experience?`; spelled-out `ten years`; expert Python; senior React; AWS certification; `Has he increased revenue 30%?`; guaranteed revenue growth | Matching a skill does not establish seniority, years, certification, or business outcomes. |
| Services suggestion | No unsupported business-hour overlap assertion. |
| Context builder | All 20 names and routes, planned/private statuses, selected contribution evidence, published URLs, booking facts, dated roles, and uncertainty rules fit the size bound. |

Focused verification: 37 tests passed with `node --test tests/voiceEvidence.test.js tests/voiceDemo.test.js tests/assistantWorkflows.test.js`. The existing basic contact, React skill lookup, unknown-topic fallback, and published call behavior remain covered by the adjoining tests.

## Confidence and remaining limits

Confidence is high for the exact deterministic cases and current public evidence inventory covered by these tests. Keyword matching does not understand arbitrary phrasing, negation, or every mixed intent; unclear questions can still receive an irrelevant public answer. Specific commercial promises must continue to go through Charlie.

Sourced context reduces the risk of unsupported spoken answers; it does not guarantee all spoken answers. The external agent can retain separately configured instructions or knowledge, ignore a contextual update, or produce a claim outside the evidence. This audit does not establish that a provider received or followed the update, and includes no acoustic, speech-recognition, live-agent, or external-project uptime verification. Integration and fallback/browser behavior are verified separately by their owning implementation.
