import test from 'node:test'
import assert from 'node:assert/strict'
import { recommendProjects, assessRole, buildProjectBrief } from '../src/lib/assistantWorkflows.js'

test('CRM follow-up needs recommend real client work with personal contribution evidence', () => {
  const result = recommendProjects('I need a CRM with automated follow-ups')
  assert.equal(result.projects[0].href, '/projects/zalio-crm')
  assert.match(result.projects[0].contribution, /Led the CRM module/)
  assert.match(result.projects[0].reason, /CRM|automation/i)
  assert.ok(result.projects.length <= 3)
  assert.match(result.enquiry.message, /I need a CRM with automated follow-ups/)
})

test('unrelated requests do not invent project recommendations', () => {
  const result = recommendProjects('I need an underwater archaeology expedition')
  assert.deepEqual(result.projects, [])
  assert.match(result.text, /no.*match|could not.*match/i)
})

test('mobile recommendations link to OneRide and preserve evidence status', () => {
  const result = recommendProjects('A mobile app with live rider tracking')
  assert.equal(result.projects[0].href, '/projects/oneride')
  assert.match(result.projects[0].contribution, /mobile|rider/i)
  assert.ok(result.projects[0].status)
})

test('a named project gets a readable explanation even without a topic keyword', () => {
  const result = recommendProjects('OneRide')
  assert.equal(result.projects[0].href, '/projects/oneride')
  assert.doesNotMatch(result.projects[0].reason, /:\s*\./)
  assert.match(result.projects[0].reason, /name|OneRide/)
})

test('a tool that appears only in a planned stack is not presented as established experience', () => {
  const requirement = assessRole('Maestro').requirements[0]
  assert.equal(requirement.status, 'unverified')
  assert.match(requirement.evidence[0].text, /planned|in development/i)
  assert.equal(requirement.evidence[0].href, '/projects/autoflow-ai-pro')
})

test('role assessment separates supported skills from undocumented requirements', () => {
  const result = assessRole('React\nPython\nKubernetes\n10 years of React experience\nAWS Solutions Architect certification')
  const react = result.requirements.find(row => row.requirement === 'React')
  assert.equal(react.status, 'documented')
  assert.match(react.evidence[0].text, /React/)
  assert.ok(react.evidence.some(item => item.href.startsWith('/projects/')))
  assert.equal(result.requirements.find(row => row.requirement === 'Python').status, 'documented')
  assert.equal(result.requirements.find(row => row.requirement === 'Kubernetes').status, 'unverified')
  assert.equal(result.requirements.find(row => /10 years/.test(row.requirement)).status, 'partial')
  assert.equal(result.requirements.find(row => /certification/.test(row.requirement)).status, 'unverified')
})

test('mixed and qualified requirements never become fully satisfied through one keyword', () => {
  for (const input of ['React and Kubernetes', 'React Kubernetes', 'expert React', 'React 99', 'React without supervision']) {
    const result = assessRole(input)
    assert.ok(result.requirements.some(row => row.status !== 'documented'), input)
  }
})

test('shared years and negative qualifiers apply to every skill in the same requirement', () => {
  const years = assessRole('5 years of React and Python experience').requirements
  assert.equal(years.length, 1)
  assert.equal(years[0].status, 'partial')
  const negative = assessRole('No React and Python experience required').requirements
  assert.equal(negative.length, 1)
  assert.equal(negative[0].status, 'unverified')
  assert.deepEqual(negative[0].evidence, [])
  assert.equal(assessRole('5 years of React, Python & TypeScript').requirements[0].status, 'partial')
})

test('role matching respects technology boundaries and negative wording', () => {
  const result = assessRole('JavaScript\nDjango\nReact Native\nNo React experience required')
  const javascript = result.requirements[0]
  assert.ok(javascript.evidence.every(item => !/^Java(?:\s|$)/.test(item.text)))
  const django = result.requirements[1]
  assert.ok(django.evidence.every(item => !/^Go(?:\s|$)/.test(item.text)))
  const native = result.requirements[2]
  assert.ok(native.evidence.some(item => /React Native/.test(item.text)))
  assert.equal(result.requirements[3].status, 'unverified')
  // Native mobile experience must not be cited as the proof of web React.
  assert.ok(assessRole('React').requirements[0].evidence.every(item => item.href !== '/projects/oneride'))
})

test('empty or excessively long pasted requirements are handled explicitly', () => {
  assert.deepEqual(assessRole('  ').requirements, [])
  const result = assessRole('React\n'.repeat(1000))
  assert.ok(result.truncated)
  assert.ok(result.requirements.length <= 30)
})

test('brief assembly retains visitor wording and leaves unanswered details open', () => {
  const brief = buildProjectBrief({ idea: 'CRM for our clinic', users: '3 receptionists', features: 'Reminders\nLead inbox', delivery: 'Budget not decided; September target' })
  assert.match(brief.subject, /CRM for our clinic/)
  assert.match(brief.message, /3 receptionists/)
  assert.match(brief.message, /Reminders\nLead inbox/)
  assert.match(brief.message, /Budget not decided; September target/)
  assert.doesNotMatch(brief.message, /guaranteed|fixed price|approved/i)
  assert.match(buildProjectBrief({ idea: 'A website' }).message, /To discuss/)
})
