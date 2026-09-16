import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import {
  resumeUrl,
  profile,
  navigation,
  proofPoints,
  caseStudies,
  experienceTimeline,
  earlierWork,
  capabilityGroups,
  education,
  credentials,
  supplementalProjects,
  labItems,
} from '../src/data/portfolioData.js'
import { BIO_SCROLL, EXPERIENCE, SKILL_CATEGORIES } from '../src/data/gameData.js'

const canonicalHash = 'ffe82da88e664d43d931bcf7f96f620b3efb58cc32d9bd35c18dffc33f18ff60'
const forbiddenPublicTerms = [
  ['Multi', 'Club Fitness Group'].join('-'),
  ['Perfect', 'Gym'].join(''),
]
const publicText = () => JSON.stringify({
  profile, navigation, proofPoints, caseStudies, experienceTimeline, earlierWork,
  capabilityGroups, education, credentials, supplementalProjects, labItems,
})

test('publishes the canonical identity and proof points', () => {
  assert.equal(profile.name, 'Charlie James Z. Abejo')
  assert.equal(profile.role, 'Full-Stack Web & Mobile App Developer')
  assert.equal(profile.location, 'Misamis Oriental, Philippines (Remote)')
  assert.equal(profile.availability, 'Available immediately - remote only')
  assert.equal(profile.headline, 'Full-stack product engineer for reliable web, mobile, and CRM systems.')
  assert.equal(proofPoints.length, 4)
  assert.equal(proofPoints[0].value, '5+ years')
  assert.doesNotMatch(publicText(), /\b2 years\b/i)
})

test('keeps exactly the canonical roles and periods', () => {
  assert.deepEqual(experienceTimeline.map(({ company, period }) => ({ company, period })), [
    { company: 'Australian Client', period: '2026' },
    { company: 'Rooche Digital Company', period: 'Jan 2026 - Mar 2026' },
    { company: 'Robustech IT / SocietyOne (Australia)', period: 'Jan 2024 - Dec 2025' },
  ])
  assert.deepEqual(earlierWork.map((item) => item.title), [
    'Jolly Ride & Massage Booking Apps',
    'MOIST Alumni Tracking System',
    'Filtra Coffee POS',
    'E-Cycle Hub',
  ])
})

test('keeps primary content counts and case-study shape exact', () => {
  assert.equal(caseStudies.length, 3)
  assert.equal(earlierWork.length, 4)
  assert.equal(capabilityGroups.length, 6)
  assert.equal(credentials.length, 6)
  assert.equal(labItems.length, 9)
  for (const study of caseStudies) {
    assert.ok(study.context)
    assert.ok(study.responsibilities.length)
    assert.ok(study.system.nodes.length)
    assert.ok(study.system.edges.length)
    assert.ok(study.reliability.length)
    assert.ok(study.delivered)
    assert.ok(study.stack.length)
    assert.match(study.confidentiality, /^(private|public)$/)
  }
})

test('limits primary navigation and preserves privacy', () => {
  assert.deepEqual(navigation, [
    { label: 'Work', href: '#work' },
    { label: 'Experience', href: '#experience' },
    { label: 'Capabilities', href: '#capabilities' },
    { label: 'Credentials', href: '#credentials' },
    { label: 'Contact', href: '#contact' },
  ])
  for (const term of forbiddenPublicTerms) assert.equal(publicText().includes(term), false)
  assert.doesNotMatch(JSON.stringify({ BIO_SCROLL, EXPERIENCE }), /Oct 2025 - Dec 2025|Jan 2026 - Apr 2026|\b2 years\b/i)
  assert.equal(SKILL_CATEGORIES.flatMap((group) => group.skills).includes('MongoDB'), true)
})

test('uses the canonical public resume asset', () => {
  assert.equal(resumeUrl, '/charlie-james-abejo-resume.pdf')
  const digest = createHash('sha256')
    .update(readFileSync(new URL('../public/charlie-james-abejo-resume.pdf', import.meta.url)))
    .digest('hex')
  assert.equal(digest, canonicalHash)
})

test('keeps supplemental project links explicit and verifiable', () => {
  const linkedProjects = supplementalProjects.filter((item) => item.url)
  assert.ok(linkedProjects.length > 0)
  linkedProjects.forEach((item) => assert.match(item.url, /^https:\/\//))
  supplementalProjects
    .filter((item) => !item.url)
    .forEach((item) => assert.match(item.status, /^(Private|Archived)$/))
})
