# Alex Voice Workspace Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement the checked tasks. Independent helper and presentation work may run in parallel via dispatching-parallel-agents.

**Goal:** Add live transcripts, working starter questions, evidence-backed project cards, and editable voice-to-enquiry drafts to the existing Alex voice session, test, push, and deploy.

**Architecture:** Keep the current ElevenLabs WebSocket provider and 120-second lifecycle. A bounded in-memory transcript feeds local public-project matching and a visitor-authored enquiry template. A presentational voice workspace renders the transcript, starters, cards, and review fields; the session controller owns SDK effects, state, microphone teardown, and the existing staged contact handoff.

**Tech Stack:** React 18, installed ElevenLabs SDK, Vite, existing local portfolio helpers, Node tests, Playwright.

**Spec:** User-approved four-feature request in the current chat, with these concrete decisions: messages/drafts remain only in the open panel; no Gemini/new model; manual End retains the workspace, Close dismisses it; opening a project ends the call and opens its published case study in a separate tab to retain the transcript; preparing an enquiry ends audio; transferring an edited draft requires a separate click and contact form submission.

## Global Constraints

- Preserve WebSocket, 120-second monotonic deadline, goodbye handling, stale-callback cancellation, and lazy SDK loading.
- Do not record or persist audio/transcripts in localStorage, logs, analytics, or a new backend.
- Use existing public project data; do not turn AI-generated claims into portfolio evidence or enquiry facts.
- All email sending remains the visitor's explicit contact-form action.
- No secrets, new dependencies, provider account changes, or real email submissions.

## Review Focus

- Repeated SDK transcript events/corrections and retries must not duplicate or rewrite unrelated messages.
- Late callbacks after end/close must never append or send starter questions.
- Draft edits must survive new messages and call completion until explicit replacement or Close.
- Nested-route contact handoff must preserve existing contact text and release microphone.
- Long text, literal HTML, and 320px/short screens must remain readable with reachable controls.

## Task 1: Transcript and evidence helpers

**Files:** create `src/lib/voiceConversation.js`, `tests/voiceConversation.test.js`.
**Interfaces:** export `voiceStarters` ({id,label,prompt}[]), `mergeVoiceTranscript(messages,event,sessionId)` -> bounded {id,source,text}[], `getVoiceProjects(messages)` -> existing public project card shape[], `buildVoiceEnquiry(messages,projects)` -> {subject,message} or null. Handle incoming source user/ai, event_id dedupe and client-side starter echoes; reject invalid input. Only visitor statements form draft notes; retain unconfirmed scope explicitly.
- [x] Write failing tests, implement, verify Node tests and review helper behavior.

## Task 2: Voice workspace presentation

**Files:** create `src/components/voice/VoiceConversation.jsx`, `src/components/voice/voice-conversation.css`.
**Interfaces:** default component props `{messages,projects,connected,draft,onAsk,onPrepareDraft,onDraftChange,onReviewEnquiry,onOpenProject}`. `onAsk(prompt)` sends an explicit starter only while connected. `onDraftChange(nextDraft)` preserves controlled edits; prepare label must disclose replacement if draft already exists. Unique labelled subject/message fields, role=log, escaped message text, local privacy copy, no network/storage/SDK operations. Public project anchors target=_blank rel=noopener noreferrer, onClick=onOpenProject.
- [x] Implement within the existing mint/dark design, bounded transcript scroll and responsive fields. Verify through task 3 browser checks.

## Task 3: Session integration and browser regression coverage

**Files:** modify `LiveAgentSession.jsx`, `assistant/AssistantPanel.jsx`, `tests/production/live-agent.spec.js`; add a focused production spec for workspace flows if appropriate.
- [x] Write failing tests for real-SDK mocked signalling: transcript both roles, starters sent once, cards link to public case studies, editable enquiry handoff and no POST, old callbacks ignored, goodbye retains transcript, deadline retains transcript, controls reachable on narrow screens.
- [x] Integrate helper and presentation APIs; keep drafts controlled and retain transcripts across retries. Add correction callback support. Stop audio before preparing/handoff/project actions. Update manual End to retain workspace; explicit Close dismisses.
- [x] Run unit suite, build, production suite and development Chromium suite; inspect rendered desktop/mobile and focused assistant behavior.

## Task 4: Review and release

**Files:** update `CODEBASE.MD`, `docs/live-voice-agent-production.md`.
- [x] Independent code review and fix important findings.
- [ ] Commit, fast-forward main, push to authorized origin, verify Vercel correct project and production commit READY.
- [ ] Verify deployed flows with simulated microphone/provider signalling and no real email. Report actual checks and live URL.
