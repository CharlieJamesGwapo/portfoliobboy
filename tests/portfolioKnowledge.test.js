import test from 'node:test'
import assert from 'node:assert/strict'

import { buildInstructions, buildKnowledge, selectSources } from '../server/portfolioKnowledge.js'

const unsafeHref = (href) => /^(?:javascript:|\/\/|https?:\/\/(?:localhost|127\.0\.0\.1|internal\.|.*\.internal(?:\.|$)))/i.test(href)

test('projects the original public titles, dates, service categories, and credentials', () => {
  const { facts } = buildKnowledge()

  assert.equal(facts.profile.name, 'Charlie James Z. Abejo')
  assert.equal(facts.profile.role, 'AI Developer & Full-Stack Engineer')
  assert.equal(facts.experiences.length, 10)
  assert.equal(facts.experiences.find((item) => item.company === 'Rooche Digital Company')?.period, 'Jan 2026 – Mar 2026')
  assert.equal(facts.experiences.find((item) => item.company === 'MOIST Alumni Online Tracking System')?.period, 'Jan 2025 - Aug 2025')

  assert.equal(facts.featuredProjects.length, 8)
  assert.equal(facts.featuredProjects.find((item) => item.id === 'one-ride-balingasag')?.title, 'One Ride Balingasag (OMJI)')
  assert.equal(facts.featuredProjects.find((item) => item.id === 'one-ride-balingasag')?.eyebrow, 'Started Apr 2026 · Live on Google Play · Balingasag')
  assert.equal(facts.featuredProjects.find((item) => item.id === 'omji-billing')?.eyebrow, 'Apr–Jun 2026 · Internet access and billing')
  assert.equal(facts.projectArchive.length, 8)
  assert.ok(facts.projectArchive.some((item) => item.title === 'ReflectiCSS'))

  assert.deepEqual(facts.aiSystemCapabilities.map((item) => item.title), [
    'Custom AI agents',
    'Voice agents & reception',
    'Automation & integrations',
    'Custom CRM & operations',
    'AI modeling & workflow design',
    'GoHighLevel & n8n workflows',
  ])
  assert.deepEqual(facts.momentumSystems.map((item) => item.title), [
    'Hasti',
    'Zalio',
    'GymFactories',
    'Momentum Strength',
    'HSIE Site Scoring',
    'AI Voice Runtime',
    'Gym Analytics & Retention',
    'Agent & Platform Operations',
  ])

  assert.equal(facts.certifications.length, 23)
  assert.equal(facts.recognitions.length, 2)
  assert.equal(facts.certifications.find((item) => item.title === 'Claude 101')?.credentialId, '8smsowpqtnzg')
  assert.equal(facts.certifications.find((item) => item.title === 'Full-Stack Web Development Certification')?.expired, 'Jul 2025')
  assert.equal(facts.certifications.find((item) => item.title === 'Java SE 8 Programmer I')?.expires, 'Dec 2035')
  assert.equal(facts.education.period, '2022 — 2026')
})

test('does not serialize private media, internal URLs, or unreviewed fields', () => {
  const knowledge = buildKnowledge()
  const encodedFacts = JSON.stringify(knowledge.facts)

  assert.equal('phoneHref' in knowledge.facts.profile, false)
  assert.equal('image' in knowledge.facts.certifications[0], false)
  assert.equal('thumb' in knowledge.facts.certifications[0], false)
  assert.doesNotMatch(encodedFacts, /internal\\.zalio\\.ai/i)
  assert.doesNotMatch(encodedFacts, /private client database/i)

  for (const source of knowledge.sources) {
    assert.deepEqual(Object.keys(source).sort(), ['href', 'id', 'label', 'topics'])
    assert.equal(unsafeHref(source.href), false, source.href)
    assert.ok(source.href.startsWith('/#') || source.href.startsWith('https://'), source.href)
    assert.equal(source.href.includes('internal.zalio.ai'), false)
  }

  const privateRuntime = knowledge.facts.momentumSystems.find((item) => item.id === 'voice-runtime')
  assert.equal(privateRuntime?.status, 'Private engineering case study')
  assert.equal(privateRuntime?.href, undefined)
  const publicHasti = knowledge.facts.momentumSystems.find((item) => item.id === 'hasti')
  assert.equal(publicHasti?.url, 'https://hasti.com.au/')
  assert.equal(knowledge.facts.featuredProjects.find((item) => item.id === 'one-ride-balingasag')?.url, 'https://play.google.com/store/apps/details?id=com.oneridebalingasag.app&hl=en')
  assert.ok(knowledge.sources.some((source) => source.id === 'project-one-ride-balingasag'))
})

test('selects reviewed sources by case-insensitive topics and defaults to About and Contact', () => {
  const services = selectSources('SHOW AI and AUTOMATION work')
  assert.ok(services.some((source) => source.id === 'ai-systems'))
  assert.ok(services.some((source) => source.id === 'momentum-work'))

  const project = selectSources('Can I see the ReflectiCSS project?')
  assert.ok(project.some((source) => source.id === 'project-reflecticss'))
  assert.equal(project.some((source) => source.href === 'javascript:alert(1)'), false)

  const fallback = selectSources('What is the moon made of?')
  assert.deepEqual(fallback.map((source) => source.id), ['about', 'contact'])
})

test('buildInstructions establishes a grounded, non-impersonating assistant boundary', () => {
  const instructions = buildInstructions()

  assert.match(instructions, /identify yourself as an AI assistant/i)
  assert.match(instructions, /supplied public portfolio facts/i)
  assert.match(instructions, /private|prototype/i)
  assert.match(instructions, /rates|availability/i)
  assert.match(instructions, /contact/i)
  assert.match(instructions, /untrusted/i)
  assert.match(instructions, /do not .*raw URLs|raw URLs.*do not/i)
  assert.match(instructions, /no tools/i)
  assert.match(instructions, /HTML/i)
})
