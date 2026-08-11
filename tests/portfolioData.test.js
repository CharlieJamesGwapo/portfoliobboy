import test from 'node:test'
import assert from 'node:assert/strict'
import {
  certifications,
  experiences,
  featuredProjects,
  interactiveGames,
  navigation,
  professionalTitles,
  proofPoints,
  projectArchive,
  recognitions,
  resumeUrl,
  skillGroups,
} from '../src/data/portfolioData.js'
import { BIO_SCROLL, SKILL_CATEGORIES } from '../src/data/gameData.js'

test('preserves the verified professional positioning and identity features', () => {
  assert.equal(professionalTitles.length, 8)
  assert.equal(professionalTitles[0], 'AI Developer')
  assert.equal(interactiveGames.length, 8)
  assert.equal(new Set(interactiveGames.map((game) => game.id)).size, interactiveGames.length)
  assert.ok(navigation.some((item) => item.href === '#lab'))
})

test('keeps the requested hiring-focused experience and project inventory', () => {
  assert.equal(featuredProjects.length, 7)
  assert.equal(projectArchive.length, 8)
  assert.equal(experiences.length, 9)
  assert.equal(new Set(featuredProjects.map((project) => project.id)).size, featuredProjects.length)
  assert.equal(experiences.some((item) => /alumni/i.test(item.company)), false)
  assert.equal(featuredProjects.some((item) => /alumni/i.test(item.title)), false)
})

test('positions the portfolio around two years without a MongoDB skill claim', () => {
  const productProof = proofPoints.find((item) => item.label === 'Genuine products and client builds')
  const experienceProof = proofPoints.find((item) => item.label === 'Years shipping production software')
  assert.deepEqual(productProof, {
    value: '16+',
    label: 'Genuine products and client builds',
    numericValue: 16,
    suffix: '+',
  })
  assert.deepEqual(experienceProof, {
    value: '2',
    label: 'Years shipping production software',
    numericValue: 2,
    suffix: '',
  })
  assert.equal(skillGroups.flatMap((group) => group.skills).includes('MongoDB'), false)
  assert.equal(SKILL_CATEGORIES.flatMap((group) => group.skills).includes('MongoDB'), false)
  assert.equal(BIO_SCROLL.some((line) => /5\+|five years/i.test(line)), false)
})

test('publishes the supplied OMJI projects with realistic dates', () => {
  const oneRide = featuredProjects.find((project) => project.id === 'one-ride-balingasag')
  assert.equal(oneRide?.eyebrow, 'Started Apr 2026 · Live on Google Play · Balingasag')
  assert.equal(oneRide?.url, 'https://play.google.com/store/apps/details?id=com.oneridebalingasag.app&hl=en')
  assert.ok(oneRide?.stack.includes('React Native'))
  assert.ok(oneRide?.stack.includes('Go'))

  const billing = featuredProjects.find((project) => project.id === 'omji-billing')
  assert.equal(billing?.eyebrow, 'Apr–Jun 2026 · Internet access and billing')
  assert.ok(billing?.stack.includes('TypeScript'))
  assert.ok(billing?.stack.includes('Go'))
})

test('keeps the original credential inventory and clean resume route', () => {
  assert.equal(certifications.length, 23)
  assert.equal(recognitions.length, 2)
  assert.equal(certifications.length + recognitions.length, 25)
  assert.equal(certifications.filter((credential) => credential.image).length, 5)
  assert.equal(certifications.filter((credential) => credential.title === 'Claude 101').length, 1)
  assert.equal(resumeUrl, '/charlie-james-abejo-resume.pdf')
})

test('only exposes explicitly configured project links', () => {
  const linkedProjects = [...featuredProjects, ...projectArchive].filter((project) => project.url)
  assert.ok(linkedProjects.length > 0)
  linkedProjects.forEach((project) => assert.match(project.url, /^https:\/\//))
})
