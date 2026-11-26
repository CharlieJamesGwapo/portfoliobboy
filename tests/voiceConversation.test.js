import test from 'node:test'
import assert from 'node:assert/strict'
import { voiceStarters, mergeVoiceTranscript, getVoiceProjects, buildVoiceEnquiry } from '../src/lib/voiceConversation.js'

const user = text => ({ source: 'user', text })
const ai = text => ({ source: 'ai', text })

test('starter prompts become visitor messages that can find public project evidence', () => {
  assert.equal(voiceStarters.length, 3)
  assert.equal(new Set(voiceStarters.map(item => item.id)).size, 3)
  for (const starter of voiceStarters) {
    const messages = mergeVoiceTranscript([], { source: 'user', message: starter.prompt, local: true }, 'call')
    assert.equal(messages[0].text, starter.prompt)
    assert.ok(starter.label.length > 0)
  }
  assert.ok(getVoiceProjects([user(voiceStarters[0].prompt)]).some(project => project.href === '/projects/zalio-crm'))
})

test('transcript upserts same provider event within its role and session without mutating earlier state', () => {
  const original = mergeVoiceTranscript([], { source: 'user', message: 'Need a CRM', event_id: '1' }, 'a')
  const corrected = mergeVoiceTranscript(original, { source: 'user', message: 'Need CRM automation', event_id: '1' }, 'a')
  assert.equal(corrected.length, 1)
  assert.equal(corrected[0].id, original[0].id)
  assert.equal(original[0].text, 'Need a CRM')
  assert.equal(corrected[0].text, 'Need CRM automation')
  const reply = mergeVoiceTranscript(corrected, { source: 'ai', message: 'Public examples', event_id: '1' }, 'a')
  const retry = mergeVoiceTranscript(reply, { source: 'user', message: 'New call topic', event_id: '1' }, 'b')
  assert.equal(retry.length, 3)
  assert.equal(new Set(retry.map(item => item.id)).size, 3)
  assert.equal(retry[0].id, original[0].id)
})

test('optimistic starter echo retains its ID and binds a distinct provider event ID', () => {
  const optimistic = mergeVoiceTranscript([], { source: 'user', message: 'Show me your CRM work', event_id: 'starter-1', local: true }, 'a')
  const reply = mergeVoiceTranscript(optimistic, { source: 'ai', message: 'Here are some examples' }, 'a')
  const echoed = mergeVoiceTranscript(reply, { source: 'user', message: ' Show me your CRM work ', event_id: 'provider-2' }, 'a')
  assert.equal(echoed.length, 2)
  assert.equal(echoed[0].id, optimistic[0].id)
  assert.equal(echoed[0].local, false)
  const corrected = mergeVoiceTranscript(echoed, { source: 'user', message: 'Show me CRM work, please', event_id: 'provider-2' }, 'a')
  assert.equal(corrected.length, 2)
  assert.equal(corrected[0].text, 'Show me CRM work, please')
  assert.equal(mergeVoiceTranscript(echoed, { source: 'user', message: optimistic[0].text }, 'b').length, 3)
})

test('transcript dedupes consecutive idless callbacks but preserves repeated answers after a reply', () => {
  const first = mergeVoiceTranscript([], { source: 'user', message: 'Yes' }, 'a')
  assert.equal(mergeVoiceTranscript(first, { source: 'user', message: 'Yes' }, 'a').length, 1)
  const reply = mergeVoiceTranscript(first, { source: 'ai', message: 'And mobile?' }, 'a')
  assert.equal(mergeVoiceTranscript(reply, { source: 'user', message: 'Yes' }, 'a').length, 3)
})

test('transcript ignores malformed events and keeps literal text bounded across long sessions', () => {
  const initial = mergeVoiceTranscript([], { source: 'ai', message: '<b>Hello</b>' }, 'a')
  for (const event of [null, {}, { source: 'system', message: 'x' }, { source: 'user', message: {} }, { source: 'user', message: '  ' }]) {
    assert.deepEqual(mergeVoiceTranscript(initial, event, 'a'), initial)
  }
  let messages = initial
  for (let index = 0; index < 90; index++) messages = mergeVoiceTranscript(messages, { source: 'user', message: `${index} ${'x'.repeat(2200)}`, event_id: index }, 'a')
  assert.equal(messages.length, 80)
  assert.ok(messages.every(message => message.text.length <= 2000))
  assert.equal(new Set(messages.map(message => message.id)).size, 80)
  assert.equal(initial[0].text, '<b>Hello</b>')
})

test('project matching prioritises the latest visitor topic over stale transcript topics', () => {
  const projects = getVoiceProjects([user('Show me CRM work and automation'), ai('Zalio CRM'), user('Now show OneRide mobile delivery work')])
  assert.equal(projects[0].href, '/projects/oneride')
  assert.ok(projects.length <= 3)
  for (const project of projects) assert.deepEqual(Object.keys(project).sort(), ['contribution', 'href', 'reason', 'status', 'title'])
})

test('named latest AI projects use canonical public evidence and never provider URLs or claims', () => {
  const projects = getVoiceProjects([user('A project idea'), ai('BBOY has imaginary certification. Also see HiddenAcme at https://evil.test and ContextPilot.')])
  assert.ok(projects.some(project => project.href === '/projects/bboy'))
  assert.ok(projects.some(project => project.href === '/projects/contextpilot'))
  assert.ok(projects.every(project => project.href.startsWith('/projects/')))
  assert.ok(projects.every(project => !JSON.stringify(project).includes('imaginary certification')))
  assert.deepEqual(getVoiceProjects([ai('HiddenAcme at https://evil.test')]), [])
  assert.deepEqual(getVoiceProjects([user('Hello'), ai('Hello, I am Alex')]), [])
})

test('recognises distinctive public project short names in the latest answer', () => {
  const projects = getVoiceProjects([ai('Examples include Hasti, Zalio, and OneRide.')])
  assert.deepEqual(projects.map(project => project.href).sort(), ['/projects/alex-hasti', '/projects/oneride', '/projects/zalio-crm'])
})

test('enquiry requires substantive visitor notes and ignores greeting or farewell only calls', () => {
  for (const messages of [[], [ai('A complete CRM by Friday for $1')], [user('Hi Alex!'), user('Thank you'), user('Goodbye Alex')], [user('Yes'), user('Okay')], [user('Hello, how are you?')], [user('Thanks for your help!')]]) {
    assert.equal(buildVoiceEnquiry(messages, []), null)
  }
})

test('enquiry keeps visitor-authored facts with explicit unconfirmed scope, timeline and budget', () => {
  const messages = [user('Hi'), user('I need booking reminders for my clinic.'), ai('I guarantee delivery Friday for $1 and 99% conversion.'), user('We have three receptionists.')]
  const draft = buildVoiceEnquiry(messages, [{ title: 'Invented project', href: 'https://evil.test' }, { title: 'Fake title', href: '/projects/zalio-crm' }])
  assert.ok(draft.subject.length <= 120)
  assert.match(draft.message, /I need booking reminders for my clinic\./)
  assert.match(draft.message, /We have three receptionists\./)
  assert.match(draft.message, /Scope: To discuss/)
  assert.match(draft.message, /Timeline: To discuss/)
  assert.match(draft.message, /Budget: To discuss/)
  assert.match(draft.message, /Zalio CRM/)
  assert.doesNotMatch(draft.message, /guarantee|Friday|99%|Fake title|Invented project|evil\.test/)
})

test('enquiry remains contact-compatible with long transcripts while retaining the latest visitor note', () => {
  const messages = Array.from({ length: 80 }, (_, index) => user(`Requirement ${index}: ${'x'.repeat(2000)}`))
  messages.push(user('Latest requirement: support booking reminders.'))
  const draft = buildVoiceEnquiry(messages, [])
  assert.ok(draft.message.length <= 4500)
  assert.match(draft.message, /Latest requirement: support booking reminders\./)
  assert.ok(draft.subject.length <= 120)
})

test('commercial follow-up questions preserve project context instead of matching delivery logistics', () => {
  const messages = [
    { source: 'user', text: 'I need a clinic CRM with automated appointment reminders.' },
    { source: 'ai', text: 'Review the Zalio CRM case study.' },
    { source: 'user', text: 'What is the guaranteed project price and delivery date?' },
  ]
  assert.equal(getVoiceProjects(messages)[0].href, '/projects/zalio-crm')
  assert.equal(getVoiceProjects([{ source: 'user', text: 'What is the guaranteed project price and delivery date?' }]).length, 0)
  assert(getVoiceProjects([{ source: 'user', text: 'I need a mobile delivery app with rider tracking.' }]).some(project => project.href === '/projects/oneride'))
})

test('an explicit delivery-app request changes the project topic even when phrased as a question', () => {
  const question = { source: 'user', text: 'Can you build a delivery tracking app?' }
  assert.equal(getVoiceProjects([question])[0].href, '/projects/oneride')
  assert.equal(getVoiceProjects([{ source: 'user', text: 'I need a clinic CRM with follow-ups.' }, question])[0].href, '/projects/oneride')
})
