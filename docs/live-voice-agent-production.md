# Live voice agent: production setup and verification

Source readiness: **integration implemented; provider account status must be checked separately.** The site's
"Talk to My AI" (Voice Studio) and "Talk to Alex" (assistant) controls depend
on the public agent ID configured at build time. An unset ID keeps live voice unavailable. Creating or publishing the
agent needs the owner's separate approval because it spends money per minute.

## How it plugs in

- `src/components/LiveAgentPanel.jsx` reads one public value,
  `VITE_ELEVENLABS_AGENT_ID`. When it is empty, nothing live renders and both
  buttons stay disabled.
- `src/components/LiveAgentSession.jsx` loads `@elevenlabs/react` (pinned
  1.19.0) only when a visitor presses Start. It:
  - asks for the microphone first, so it can explain a denial clearly;
  - shows connecting, listening and speaking states, with mute and end
    controls;
  - shows time remaining and a progress indicator, with readable controls in
    both themes and on narrow screens;
  - immediately ends the session when a final visitor transcript is a short
    farewell such as “goodbye” or “thank you, goodbye Alex.” Questions and
    negations mentioning goodbye keep the session open;
  - explicitly uses the SDK's WebSocket audio transport. On 2026-11-26 the
    deployed agent's WebRTC room disconnected before its greeting; the same
    agent delivered its greeting over WebSocket under the production CSP;
  - handles provider disconnect callbacks as well as startup errors, so a
    dropped connection or a hangup before the greeting offers a clear retry.
- `LIVE_SESSION_LIMIT_SECONDS` (60) is the **website's voice deadline**.
  A monotonic clock and a deadline stop the browser's call at one minute,
  including delayed timer updates. Account-wide limits must be enforced by
  ElevenLabs on the agent (see below).
  The owner requested website-only work for the November 27 update, so this
  release does not change or verify the provider's separate usage settings.
- No API key is used in the browser. Never put an ElevenLabs API key in a
  `VITE_` variable: Vite bundles every `VITE_` value into public JavaScript.

## Live transcript and project enquiries

The existing voice session includes a bounded in-memory transcript (latest 80
messages, up to 2,000 characters each). Final visitor/agent events and agent
corrections update it without duplicating SDK IDs or echoed starter questions.
Messages are escaped text; scrolling follows new turns only while the visitor
is already near the bottom of the transcript.

Three starter buttons explicitly send a question to the current voice agent.
They are disabled outside an active connection. Local public case-study data
provides up to three project cards with documented contributions and status;
provider claims are never treated as portfolio evidence. Opening a case study
ends the call and opens a new tab so the transcript remains in the original.

Preparing an enquiry ends audio and creates an editable subject/message from
the visitor's words, with unconfirmed scope, budget and timeline marked for
discussion. AI replies are excluded from visitor notes. New turns and retries
do not overwrite draft edits. Replacing a draft requires an explicit button.
Review in contact form stages the edited text through the existing contact
handoff, including from project routes; it does not submit an email and keeps
an existing contact draft available for manual merging.

End conversation, goodbye, timeout and connection errors retain the open
workspace for review. Close (including closing Alex or returning to its text
guide) discards that voice workspace. No transcript, draft or audio recording
is added to browser storage or a new backend by this feature; audio still uses
the external provider under the existing disclosure.

## Environment variables

| Variable | Where | Value | Secret? |
| --- | --- | --- | --- |
| `VITE_ELEVENLABS_AGENT_ID` | Vercel → Project → Environment Variables (Production, and Preview if wanted) | The agent ID, `agent_…` | No, it ships to the browser |
| `ELEVENLABS_API_KEY` | Vercel, server-only (no `VITE_` prefix) | Only if signed URLs are added later (see Hardening) | **Yes** |

Locally, put `VITE_ELEVENLABS_AGENT_ID` in `.env.local`. `.gitignore`
ignores `.env*` except `.env.example`.

## Agent configuration (ElevenLabs → Agents)

- **Name:** Alex, Charlie's portfolio assistant.
- **Voice:** a built-in voice such as Sarah. Voice Library voices with Live
  Moderation enabled (for example Joel) **cannot** be used in agents.
- **First message:** "Hi, I'm Alex, Charlie's AI assistant. Ask me about his
  projects, AI and automation work, or how to get in touch."
- **System prompt (draft):**
  - You are Alex, a concise, friendly assistant on Charlie James Abejo's
    portfolio.
  - Only use facts from the knowledge base.
  - If you don't know something, say so and suggest contacting Charlie at the
    email in the knowledge base.
  - Never invent projects, clients, metrics or prices.
  - Never collect payment or sensitive personal data.
  - Keep answers under three sentences.
- **Knowledge base:** public portfolio facts only. Export them from
  `src/data/portfolioData.js`: profile, experience summaries, public systems,
  skills, contact. Include no private client details.
- **Tools:** none at launch. No booking or webhooks until reviewed.

## Access control: domain restriction

- In the agent's **Security** tab, enable authentication restrictions and add
  the allowed hostnames: `portfoliobboy.vercel.app` and any custom domain
  (up to 10).
- Add `localhost` only temporarily, while testing.
- Test that the agent refuses to connect from an origin that isn't listed.

## Server-side usage limits (enforced by ElevenLabs, not the browser)

Set these on the agent before going public, then verify each one by testing:

| Limit | Recommended launch value | Why |
| --- | --- | --- |
| Maximum conversation duration | 60 s | Matches the on-site clock; caps each call's cost |
| Concurrency limit | 1–2 | Prevents a traffic spike from multiplying cost |
| Daily call limit | 10–20 | Hard daily ceiling on spend |

These exist as agent settings (call limits and conversation duration). Check the
exact field names in the current dashboard. If a limit cannot be set, **do not
enable** the live agent.

## Microphone permission (required for production)

`vercel.json` currently permits `microphone=(self)` and blocks camera and geolocation.
Verify the deployed Permissions-Policy matches the tracked configuration before enabling a live agent.
A permitted microphone header does not establish that an external agent or usage limits are configured.

## Estimated costs

ElevenLabs bills agent call time per minute. LLM tokens are billed on top. As
of 2026, third-party summaries put the Starter plan at about **US$0.08 per
minute**, after a May 2026 cut from US$0.10. **Confirm on the live pricing page
before launch.**

| Scenario | Minutes per day | Approx. per day | Approx. per month (30 days) |
| --- | --- | --- | --- |
| Daily limit 10 × 2 min | 20 | ~US$1.60 | ~US$48 (worst case) |
| Daily limit 20 × 2 min | 40 | ~US$3.20 | ~US$96 (worst case) |
| Typical portfolio traffic (estimate) | 5–10 | ~US$0.40–0.80 | ~US$12–24 |

These are ceilings set by the limits, plus LLM usage. The recorded accent
previews cost nothing to replay: they are static files.

## Activation checklist (owner approval required)

1. Create the agent with the configuration above. **Approval needed: billable.**
2. Set the domain allowlist and the three usage limits, then test each one.
3. Set `VITE_ELEVENLABS_AGENT_ID` in Vercel, and in `.env.local` for testing.
4. Verify the deployed header permits only `microphone=(self)` and retains the other restrictions.
5. Test on desktop and phone:
   - microphone granted and denied;
   - connect, mute and end;
   - the 1-minute cut-off;
   - disconnect handling;
   - a blocked origin.
6. Watch the first week's usage in the ElevenLabs dashboard and set an alert.

## Hardening (optional, later)

For a private agent, add a Vercel function that uses `ELEVENLABS_API_KEY` to
request a short-lived **signed URL** (valid for 15 minutes to start a session).
Rate-limit that function per IP, and start sessions with the signed URL instead
of the public agent ID. ElevenLabs' docs disagree on whether signed URLs should
be combined with an allowlist on the same agent, so check the current guidance
first. This is not implemented yet.

Sources:
- [ElevenLabs agent authentication](https://elevenlabs.io/docs/agents-platform/customization/authentication)
- [ElevenLabs pricing summary, HappyRobot](https://www.happyrobot.ai/hub/elevenlabs-pricing)
- [Agents pricing explained, Macha](https://www.getmacha.com/blog/elevenlabs-agents-pricing-explained)
- [Agents price cut, May 2026](https://www.usagepricing.com/blueprint/activity/elevenlabs-2026-05-07-conversational-ai-price-cut)

## Evidence context, fallback and outcome counts

Every established connection receives one public evidence contextual update via
the installed SDK. It includes the current portfolio identity, dated roles, all
20 case studies, documented contribution/technology/status and published booking
facts. Unknown prices, availability, delivery guarantees and unsupported skill
depth must be confirmed with Charlie. This does not replace provider-side
instructions or guarantee all spoken claims; see [the audit](alex-evidence-audit.md).

If microphone access is denied or a connection fails, Continue in text ends
audio and retains the current transcript and draft. Questions then use the local
portfolio answer engine, with no voice-provider requests. Try voice again is
explicit. Draft review and existing-contact-text protection continue to work.

Optional outcome counts are described in [analytics setup](analytics/README.md).
They are configured for the owner's separate Charlie Abejo Portfolio project. No voice
content, conversation ID, enquiry fields or visitor identity is included in
analytics. The browser enable flag and server ingestion configuration must be
set for the selected project before deployment/rebuild.
