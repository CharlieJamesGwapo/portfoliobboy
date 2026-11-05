# Voice gallery: voices, scripts, and credit budget

Status: **generated 2026-11-06** with the approved voices and a 6,000-credit
cap. Credits used went from 1,108 to 3,950 of 40,000, so the run consumed
**2,842 credits**, exactly one per script character. No regenerations were
needed.

| File (`src/assets/audio/accents/`) | Length | Size |
| --- | --- | --- |
| american-english.mp3 | 27.4 s | 455 KB |
| british-english.mp3 | 24.2 s | 404 KB |
| australian-english.mp3 | 21.8 s | 366 KB |
| filipino-english.mp3 | 21.0 s | 353 KB |
| canadian-english.mp3 | 21.2 s | 355 KB |
| irish-english.mp3 | 21.6 s | 363 KB |
| indian-english.mp3 | 20.7 s | 348 KB |
| south-african-english.mp3 | 21.2 s | 357 KB |

All are 44.1 kHz mono MP3 at 128 kbps, Eleven v4, default voice settings
(stability 50, similarity 75). Each file's length matches its script size,
so none was cut short. **A human listening pass is still needed** to confirm
pronunciation and that each take matches its transcript.

Voice IDs were not recorded: the browser automation masks ID-like strings.
Display names are listed below and are unique in the library. The IDs can be
read from ElevenLabs → Voices if needed.

Voice Library notes: Joel (Filipino) has Live Moderation enabled, which is
fine for TTS but means it **cannot be used in an ElevenLabs agent**.

All earlier `edge-tts` recordings were removed on 2026-11-06:
`src/assets/audio/voice-{us,au}-professional-v7.m4a`, the eight unreferenced
`public/audio/voice-*` files (which were still deployed at `/audio/…`), their
`README.txt`, `voiceSamples.js`, and `VoiceSamplePlayer.jsx`. Git history
holds them if a rollback is ever needed.

## Account (checked 2026-11-06 in the ElevenLabs dashboard)

- Plan: Starter ($6/mo), commercial license for speech included.
- Credits: 1,108 used of 40,000; renews December 1.
- Custom voice slots: 10 (Library voices you add count toward these; none used today).
- Conversational agents: none exist yet.
- Model: Eleven v4 (the dashboard default; it supports multi-speaker dialogue
  in one generation).

## Existing recordings

`src/assets/audio/voice-us-professional-v7.m4a` (79 s) and
`voice-au-professional-v7.m4a` (95 s) are **not ElevenLabs audio**. The README
records that they were made with Microsoft neural voices through the
unofficial `edge-tts` client. That client has no published commercial license,
so they should be replaced. They stay in place until the new files are
verified.

## Proposed voices

The AI assistant voice carries the accent. The visitor uses an ElevenLabs
built-in voice, which costs no voice slot.

| Accent | AI assistant voice (candidates, first is preferred) | Source | Visitor voice |
| --- | --- | --- | --- |
| American | Sarah – Mature, Reassuring, Confident · alt: Eric – Smooth, Trustworthy | Built-in | Chris |
| British | Alice – Clear, Engaging Educator · alt: Lily – Velvety Actress | Built-in | Will |
| Australian | Charlie – Deep, Confident, Energetic | Built-in (only Australian built-in) | Jessica |
| Filipino | Joel – English Filipino Accent · alt: Joseph B, Isla – American Filipino | Voice Library | Roger |
| Canadian | Sarah – Canadian · alt: Matthew – Calm Canadian, Jeff – Smooth Canadian | Voice Library | River |
| Irish | Sineád – Confident Irish Sales · alt: Cleo – Youthful Irish | Voice Library | Eric |
| Indian | Navya Kannan – Conversational · alt: Shlok – Warm, Indian, Conversational | Voice Library | Laura |
| South African | Travis – South African English Male · alt: Charlotte – Warm South African | Voice Library | Matilda |

Chosen from accent tags, "conversational" use case, descriptions, and usage
counts. **Claude cannot hear audio**, so a human listening pass on the
previews is needed before generation.

## Scripts (target 20–40 s each)

### 1. American English: a customer asking about a service
- **Visitor:** Hey, quick question. Do you help businesses automate their customer inquiries?
- **AI:** Yeah, absolutely. Are you thinking website messages, phone calls, or both?
- **Visitor:** Probably both. We get a lot of the same questions every day.
- **AI:** Got it. We'd set up an assistant that answers the common ones, takes down the customer's details, and sends everything straight to your CRM. Anything tricky goes to your team.
- **Visitor:** Okay, that sounds like exactly what we need.

### 2. British English: scheduling a consultation
- **Visitor:** Hi, I'd like to book a call to talk about a new booking app.
- **AI:** Lovely, happy to help. Would mornings or afternoons suit you better?
- **Visitor:** Afternoons, ideally. Is Thursday any good?
- **AI:** Thursday at two works. It's a thirty-minute video call, and I'll send the link to your email now. Anything you'd like us to look at beforehand?
- **Visitor:** Just a rough idea of cost, really.
- **AI:** Perfect, I'll make a note of that.

### 3. Australian English: answering a pricing question
- **Visitor:** G'day. Roughly how much does a voice assistant for a small clinic cost?
- **AI:** Good question. It depends on call volume and what it needs to connect to. For most small clinics it's a one-off setup fee, then a monthly amount for the calls it handles.
- **Visitor:** Is there a minimum contract?
- **AI:** No lock-in. If it isn't saving you time after the first month, you can stop.

### 4. Filipino English: responding to a customer inquiry
- **Visitor:** Hello, I sent a message last night about my order but nobody replied.
- **AI:** Sorry about that, and thanks for following up. Can I get your order number so I can check it for you?
- **Visitor:** It's four-five-two-one.
- **AI:** Thank you. I can see it's packed and will be picked up by the courier this afternoon. I'll text you the tracking link as soon as it's out.
- **Visitor:** Great, salamat.

### 5. Canadian English: helping a website visitor
- **Visitor:** Hi, I'm on your site but I can't find whether you build mobile apps.
- **AI:** We do, yes. Mostly cross-platform apps for iPhone and Android, built alongside a web dashboard.
- **Visitor:** Could you show me an example?
- **AI:** Sure. There's a project section just below. I can also send a couple of case studies to your inbox if that's easier.
- **Visitor:** Email would be great, thanks.

### 6. Irish English: explaining an automation solution
- **Visitor:** So what would an automation actually do for a small gym like ours?
- **AI:** Good question. Say someone fills in your website form at eleven at night. Straight away they get a friendly text, a link to book a free session, and a reminder the day before.
- **Visitor:** And if they don't show up?
- **AI:** Then it sends a gentle follow-up to rebook, and lets your staff know. Nobody has to chase it by hand.

### 7. Indian English: following up on a booking request
- **AI:** Hi, this is a quick follow-up on the demo you requested yesterday. Is now a good time?
- **Visitor:** Yes, go ahead.
- **AI:** Thanks. We have Tuesday at eleven or Wednesday at four available. Which would you prefer?
- **Visitor:** Wednesday at four works.
- **AI:** Done. You're booked for Wednesday at four, and a calendar invite is on its way. Looking forward to it.

### 8. South African English: answering a technical service question
- **Visitor:** Can your system connect to the CRM we already use?
- **AI:** Most likely, yes. If your CRM has an API or supports webhooks, we can connect to it directly. Which one do you use?
- **Visitor:** HubSpot.
- **AI:** Then that's straightforward. New contacts and call notes sync automatically, and we'd test it with a few sample records before anything goes live.

## Credit budget

- Total script length: 2,842 characters (measured).
- Eleven v4 is estimated at roughly 1 credit per character. This is inferred
  from the plan's "~30 min for 30k credits"; the real deduction will be checked
  after the first sample.
- **Estimate: about 2,850 credits** for one pass of all eight.
- **Requested cap: 6,000 credits**, which leaves room for one regeneration of
  each sample. Generation stops if the cap would be exceeded.
- Expected balance afterwards: about 32,900–36,000 of 38,892 remaining.

## Live agent (not created)

Prepared but **not created or published**. It needs your approval because it
uses credits per minute of conversation and is reachable by the public.

- Name: Bboy AI Voice Studio assistant. Voice: the approved American AI voice.
- First message: "Hi, I'm Charlie's AI assistant. Ask me about his work, AI
  agents, automations, or how to get in touch."
- Knowledge: only public portfolio facts from `src/data/portfolioData.js`.
  It has no private client data and must not invent projects.
- Limits to set on the agent, which ElevenLabs enforces server-side:
  - maximum call length 3 minutes
  - concurrency limit 1–2
  - a daily conversation cap
  - allowed origins: the Vercel domain only
- The website reads only the public agent ID from `VITE_ELEVENLABS_AGENT_ID`.
  No API key is used.
- **Production blocker:** `vercel.json` sends
  `Permissions-Policy: microphone=()`, which blocks microphone access on the
  live site. It must become `microphone=(self)` before the live agent can work
  there.
