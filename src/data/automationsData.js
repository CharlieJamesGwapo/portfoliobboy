// Automation workflows shown in the Automations section.
//
// Every entry describes a workflow pattern Charlie builds. Outcomes are kept
// qualitative on purpose: add a real metric only when it comes from a real
// deployment. Entries marked `draft: true` still need Charlie's review before
// they are treated as published claims (the flag is not rendered).

export const automationPlatforms = ['All', 'n8n', 'GoHighLevel', 'Make / Zapier', 'AI Agents']

export const automationWorkflows = [
  {
    id: 'n8n-lead-qualification',
    platform: 'n8n',
    title: 'AI lead qualification & routing',
    summary:
      'Every new enquiry is scored by an LLM against the business’s ideal-customer rules, then routed to the right person or nurture track.',
    trigger: 'New form / Facebook lead',
    steps: ['Enrich contact', 'LLM scores intent', 'Route by score'],
    outcome: 'Hot leads reach a person in seconds; the rest enter nurture',
    tools: ['n8n', 'OpenAI', 'Webhooks', 'CRM API', 'Slack'],
    draft: true,
  },
  {
    id: 'n8n-voice-to-crm',
    platform: 'n8n',
    title: 'Voice call → CRM → follow-up',
    summary:
      'When an AI voice call ends, the transcript is summarised, the CRM record is updated, and a personalised follow-up email is sent.',
    trigger: 'Voice agent call ended',
    steps: ['Summarise transcript', 'Update CRM record', 'Draft follow-up'],
    outcome: 'No call notes to type, and every caller hears back the same day',
    tools: ['n8n', 'LiveKit', 'ElevenLabs', 'Gmail API', 'PostgreSQL'],
    draft: true,
  },
  {
    id: 'n8n-booking-sync',
    platform: 'n8n',
    title: 'Booking, reminders & no-show recovery',
    summary:
      'Bookings sync to Google Calendar, reminders go out by SMS and email, and no-shows get an automatic rebook offer.',
    trigger: 'Appointment booked',
    steps: ['Sync calendar', 'Schedule reminders', 'Detect no-show'],
    outcome: 'Fewer missed appointments without manual chasing',
    tools: ['n8n', 'Google Calendar', 'Twilio', 'Gmail API'],
    draft: true,
  },
  {
    id: 'ghl-missed-call',
    platform: 'GoHighLevel',
    title: 'Missed-call text-back with AI booking',
    summary:
      'A missed call triggers an instant SMS. An AI assistant answers questions in the thread and books the caller straight into the calendar.',
    trigger: 'Missed inbound call',
    steps: ['Instant SMS reply', 'AI answers questions', 'Books calendar slot'],
    outcome: 'Missed calls become booked appointments instead of lost leads',
    tools: ['GoHighLevel', 'Workflows', 'Conversation AI', 'Calendars'],
    draft: true,
  },
  {
    id: 'ghl-pipeline-nurture',
    platform: 'GoHighLevel',
    title: 'Pipeline nurture & stage automation',
    summary:
      'Leads move through pipeline stages automatically, with timed SMS and email nurture and task creation for staff when a lead goes quiet.',
    trigger: 'Lead enters pipeline',
    steps: ['Tag & assign owner', 'SMS + email sequence', 'Stale-lead task'],
    outcome: 'Consistent follow-up on every lead, with nothing left in limbo',
    tools: ['GoHighLevel', 'Pipelines', 'SMS', 'Email', 'n8n'],
    draft: true,
  },
  {
    id: 'make-form-to-crm',
    platform: 'Make / Zapier',
    title: 'Form → CRM → team alert',
    summary:
      'For clients already on Make or Zapier: form submissions are cleaned, de-duplicated, written to the CRM, and announced to the team.',
    trigger: 'Website form submitted',
    steps: ['Validate & de-dupe', 'Create CRM contact', 'Notify team'],
    outcome: 'Clean CRM data and an instant heads-up for the sales team',
    tools: ['Make', 'Zapier', 'Google Sheets', 'HubSpot / GHL', 'Slack'],
    draft: true,
  },
  {
    id: 'ai-knowledge-bot',
    platform: 'AI Agents',
    title: 'Knowledge-base chatbot (RAG)',
    summary:
      'A website and internal assistant that answers only from the business’s own documents, cites its sources, and hands off to a human when unsure.',
    trigger: 'Visitor asks a question',
    steps: ['Search company docs', 'Answer with sources', 'Human handoff'],
    outcome: 'Common questions answered 24/7 without inventing answers',
    tools: ['OpenAI / Claude', 'Vector search', 'Insighto.ai', 'n8n'],
    draft: true,
  },
  {
    id: 'ai-messenger-agent',
    platform: 'AI Agents',
    title: 'Messenger & WhatsApp AI agent',
    summary:
      'An AI agent replies to Facebook Messenger and WhatsApp enquiries, captures contact details, and books or escalates inside the CRM.',
    trigger: 'New Messenger / WhatsApp message',
    steps: ['AI replies in context', 'Capture details', 'Book or escalate'],
    outcome: 'Social enquiries answered in seconds, day or night',
    tools: ['Meta Messenger', 'WhatsApp', 'Insighto.ai', 'GoHighLevel'],
    draft: true,
  },
]

// Platforms strip. Names only, no third-party logos (avoids trademark asset
// issues and keeps the strip lightweight).
export const automationToolbox = [
  'n8n',
  'GoHighLevel',
  'Make',
  'Zapier',
  'ElevenLabs',
  'LiveKit',
  'Insighto.ai',
  'OpenAI',
  'Claude',
  'Twilio',
]
