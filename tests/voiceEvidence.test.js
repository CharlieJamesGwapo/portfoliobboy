import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

let server, answerQuestion, answerSuggestion
before(async () => {
  server = await createServer({ envDir: 'tests', server: { middlewareMode: true, hmr: false, ws: false } })
  ;({ answerQuestion, answerSuggestion } = await server.ssrLoadModule('/src/lib/assistantAnswers.js'))
})
after(async () => { await server?.close() })

for (const input of [
  'What does Zalio CRM cost?',
  'How much to book a project discovery meeting and build an app?',
  'What is his hourly rate for React?',
  'Can he deliver a CRM in two weeks?',
  'When can Charlie start?',
  'Is he available next Monday for a meeting?',
  'What is the delivery timeline for OneRide?',
  'Can he guarantee a launch next month?',
  'How long would it take to build a CRM?',
  'Can he start tomorrow?',
  'Is Charlie free Monday?',
  'Can he ship it in two days?',
]) {
  test(`unconfirmed commercial details stay unconfirmed: ${input}`, () => {
    const result = answerQuestion(input)
    assert.match(result.text, /confirm.*Charlie|Charlie.*confirm/i)
    assert.match(result.text, /not (?:published|confirmed)|unconfirmed/i)
    assert.doesNotMatch(result.text, /free|\$\d|guaranteed delivery/i)
    assert.ok(result.actions.some(action => action.href === '/#contact'))
  })
}

for (const input of ['Tell me about his voice work', 'Talk to Alex', 'ElevenLabs']) {
  test(`voice answer identifies both Alex experiences: ${input}`, () => {
    const result = answerQuestion(input)
    assert.match(result.text, /portfolio.*Alex|Alex.*portfolio/i)
    assert.match(result.text, /ElevenLabs/)
    assert.match(result.text, /separate.*Hasti|Hasti.*separate/i)
    assert.match(result.text, /LiveKit.*Twilio/)
    assert.match(result.text, /when.*available|when.*configured/i)
  })
}

test('AI suggestion includes the portfolio experience and separate published Hasti evidence', () => {
  assert.match(answerSuggestion('ai').text, /ElevenLabs/)
  assert.match(answerSuggestion('ai').text, /LiveKit.*Twilio/)
})

test('free call stays a published call option and does not reserve a calendar event', () => {
  const result = answerQuestion('Book a free call')
  assert.match(result.text, /15-minute intro call \(free\)/i)
  assert.match(result.text, /30-minute project discovery \(free\)/i)
  assert.match(result.text, /request.*does not reserve/i)
  assert.doesNotMatch(result.text, /confirmed booking|reserved for you/i)
})

test('about distinguishes the ended featured role from ongoing freelance work', () => {
  const result = answerQuestion('Who is Charlie?')
  assert.match(result.text, /Most recently.*Zalio.*Sep 2026/)
  assert.match(result.text, /Freelance.*2023.*Present/)
  assert.doesNotMatch(result.text, /currently.*Zalio/i)
})

test('named public projects expose their own documented status and contribution', () => {
  const autoFlow = answerQuestion('Tell me about AutoFlow AI Pro')
  assert.match(autoFlow.text, /In development.*Planned integrations/)
  assert.equal(autoFlow.actions[0].href, '/projects/autoflow-ai-pro')
  const crm = answerQuestion('Tell me about Zalio CRM')
  assert.match(crm.text, /Led the CRM module/)
  assert.match(crm.text, /Private product module/)
  assert.equal(crm.actions[0].href, '/projects/zalio-crm')
})

test('undocumented years and proficiency do not become a yes from a matching skill', () => {
  for (const input of ['Does he have 10 years of React experience?', 'Does he have ten years of React experience?', 'Is he an expert in Python?', 'Is he senior in React?', 'Does he hold an AWS certification?', 'Has he increased revenue 30%?', 'Does he guarantee 99% revenue growth?']) {
    assert.match(answerQuestion(input).text, /not (?:published|confirmed)|unconfirmed|cannot verify/i)
    assert.doesNotMatch(answerQuestion(input).text, /^Yes:/)
  }
})

test('services do not invent working-hour availability', () => {
  assert.doesNotMatch(answerSuggestion('services').text, /overlaps US|Australian business hours/)
})

test('voice evidence context covers all 20 published case-study names, routes and status without private context', async () => {
  const evidenceModule = await import('../src/lib/voiceEvidence.js').catch(() => ({}))
  assert.equal(typeof evidenceModule.buildVoiceEvidenceContext, 'function', 'bounded public evidence builder must exist')
  const context = evidenceModule.buildVoiceEvidenceContext()
  assert.ok(context.length <= 7000)
  for (const [name, slug] of [
    ['Alex / Hasti', 'alex-hasti'], ['Zalio CRM', 'zalio-crm'], ['OneRide Balingasag', 'oneride'],
    ['AutoFlow AI Pro', 'autoflow-ai-pro'], ['EasyAppy', 'easyappy'], ['BBOY', 'bboy'],
    ['AgentForge', 'agentforge'], ['ContextPilot', 'contextpilot'],
    ['OMJI Internet Access & Billing System', 'omji-billing'], ['Enterprise CRM Platform', 'fitness-crm'],
    ['Fintech Lending Platform Modernization', 'fintech-lending'], ['MOIST Alumni Tracking System', 'moist-alumni'],
    ['Filtra Coffee POS', 'filtra-pos'], ['E-Cycle Hub', 'ecycle-hub'],
    ['Jolly Ride & Massage Booking Apps', 'mobile-booking'], ['Scale With Accounting', 'scale-with-accounting'],
    ['St. John Baptist High School', 'st-john-baptist'], ['FreelancePath', 'freelancepath'],
    ['IdeaLink', 'idealink'], ['ZERO → HERO DEV', 'zero-to-hero-dev'],
  ]) {
    assert.ok(context.includes(name), name)
    assert.ok(context.includes(`/projects/${slug}`), slug)
  }
  assert.match(context, /In development · Planned integrations/)
  assert.match(context, /Private product module/)
  assert.match(context, /https:\/\/hasti.com.au\//)
  assert.match(context, /https:\/\/zalio.ai\//)
  assert.match(context, /https:\/\/play.google.com\/store/)
  assert.match(context, /Led the CRM module/)
  assert.match(context, /self-hosted voice runtime/)
  assert.doesNotMatch(context, /process\.env|API_KEY|agent_id|Bearer|secret/i)
})

test('voice evidence states identity, dated roles and explicit uncertainty boundaries', async () => {
  const evidenceModule = await import('../src/lib/voiceEvidence.js').catch(() => ({}))
  assert.equal(typeof evidenceModule.buildVoiceEvidenceContext, 'function')
  const context = evidenceModule.buildVoiceEvidenceContext()
  assert.match(context, /ElevenLabs/)
  assert.match(context, /separate.*Alex.*Hasti/i)
  assert.match(context, /Jun 2026 – Sep 2026/)
  assert.match(context, /2023 – Present/)
  assert.match(context, /do not invent/i)
  assert.match(context, /prices.*availability.*years.*metrics/i)
  assert.match(context, /confirm.*Charlie/i)
  assert.match(context, /request.*does not reserve/i)
  assert.match(context, /15-minute Intro call: Free/)
  assert.match(context, /60-minute Technical deep-dive: By arrangement/)
})
