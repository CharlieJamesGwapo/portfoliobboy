# Live voice agent: production setup (not activated)

Status: **prepared, not activated.** No billable agent exists. The site's
"Talk to My AI" (Voice Studio) and "Talk to Alex" (assistant) buttons stay
disabled until every step below is done and tested. Creating or publishing the
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
  - shows a session clock.
- `LIVE_SESSION_LIMIT_SECONDS` (180) is a **display and courtesy limit only**.
  The real limits must be enforced by ElevenLabs on the agent (see below).
- No API key is used in the browser. Never put an ElevenLabs API key in a
  `VITE_` variable: Vite bundles every `VITE_` value into public JavaScript.

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
| Maximum conversation duration | 180 s | Matches the on-site clock; caps each call's cost |
| Concurrency limit | 1–2 | Prevents a traffic spike from multiplying cost |
| Daily call limit | 10–20 | Hard daily ceiling on spend |

These exist as agent settings (call limits and conversation duration). Check the
exact field names in the current dashboard. If a limit cannot be set, **do not
enable** the live agent.

## Microphone permission (required for production)

`vercel.json` currently sends `Permissions-Policy: microphone=()`, which blocks
the microphone on the deployed site. In the same change that sets the agent ID,
change only that directive to `microphone=(self)`. Leave camera and geolocation
blocked.

## Estimated costs

ElevenLabs bills agent call time per minute. LLM tokens are billed on top. As
of 2026, third-party summaries put the Starter plan at about **US$0.08 per
minute**, after a May 2026 cut from US$0.10. **Confirm on the live pricing page
before launch.**

| Scenario | Minutes per day | Approx. per day | Approx. per month (30 days) |
| --- | --- | --- | --- |
| Daily limit 10 × 3 min | 30 | ~US$2.40 | ~US$72 (worst case) |
| Daily limit 20 × 3 min | 60 | ~US$4.80 | ~US$144 (worst case) |
| Typical portfolio traffic (estimate) | 5–10 | ~US$0.40–0.80 | ~US$12–24 |

These are ceilings set by the limits, plus LLM usage. The recorded accent
previews cost nothing to replay: they are static files.

## Activation checklist (owner approval required)

1. Create the agent with the configuration above. **Approval needed: billable.**
2. Set the domain allowlist and the three usage limits, then test each one.
3. Set `VITE_ELEVENLABS_AGENT_ID` in Vercel, and in `.env.local` for testing.
4. Change `microphone=()` to `microphone=(self)` in `vercel.json`.
5. Test on desktop and phone:
   - microphone granted and denied;
   - connect, mute and end;
   - the 3-minute cut-off;
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
