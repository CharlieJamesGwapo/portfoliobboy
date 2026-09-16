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
import { BIO_SCROLL, EXPERIENCE, SKILL_CATEGORIES } from '../src/data/gameData.js'

test('preserves the verified professional positioning and identity features', () => {
  assert.equal(professionalTitles.length, 8)
  assert.equal(professionalTitles[0], 'AI Developer')
  assert.equal(interactiveGames.length, 9)
  assert.equal(new Set(interactiveGames.map((game) => game.id)).size, interactiveGames.length)
  assert.ok(navigation.some((item) => item.href === '#lab'))
})

test('keeps the requested hiring-focused experience and project inventory', () => {
  assert.equal(featuredProjects.length, 8)
  assert.equal(projectArchive.length, 8)
  assert.equal(experiences.length, 10)
  assert.equal(new Set(featuredProjects.map((project) => project.id)).size, featuredProjects.length)

  const alumniExperience = experiences.find((item) => item.company === 'MOIST Alumni Online Tracking System')
  assert.equal(alumniExperience?.period, 'Jan 2025 - Aug 2025')

  const alumniProject = featuredProjects.find((item) => item.id === 'moist-alumni')
  assert.equal(alumniProject?.eyebrow, 'Jan-Aug 2025 · Secure records platform')
})

test('positions the portfolio around two years without a MongoDB skill claim', () => {
  const productProof = proofPoints.find((item) => item.label === 'Genuine products and client builds')
  const experienceProof = proofPoints.find((item) => item.label === 'Years shipping production software')
  assert.deepEqual(productProof, {
    value: '17+',
    label: 'Genuine products and client builds',
    numericValue: 17,
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

test('uses the corrected 2026 SocietyOne and Multi-Club timeline everywhere', () => {
  const fitnessExperience = experiences.find((item) => item.company === 'Multi-Club Fitness Group')
  const societyExperience = experiences.find((item) => item.company === 'Robustech IT / SocietyOne')
  assert.equal(fitnessExperience?.period, 'May 2026 - Jul 2026')
  assert.equal(societyExperience?.period, 'Jan 2026 - Apr 2026')

  const fitnessProject = featuredProjects.find((item) => item.id === 'fitness-crm')
  const societyProject = featuredProjects.find((item) => item.id === 'societyone')
  assert.equal(fitnessProject?.eyebrow, 'May-Jul 2026 · Multi-club fitness operations · Australia')
  assert.equal(societyProject?.eyebrow, 'Jan-Apr 2026 · Regulated fintech · Australia')

  const gameSocietyExperience = EXPERIENCE.find((item) => item.id === 'robustech')
  assert.equal(gameSocietyExperience?.period, 'Jan 2026 - Apr 2026')
})

test('keeps the original credential inventory and clean resume route', () => {
  assert.equal(certifications.length, 23)
  assert.equal(recognitions.length, 2)
  assert.equal(certifications.length + recognitions.length, 25)
  assert.equal(certifications.filter((credential) => credential.image).length, 5)
  assert.equal(certifications.filter((credential) => credential.title === 'Claude 101').length, 1)
  assert.equal(resumeUrl, '/charlie-james-abejo-resume.pdf')
})

test('publishes the corrected Rooche dates and authentic Anthropic certificates', () => {
  const portfolioRooche = experiences.find((item) => item.company === 'Rooche Digital Company')
  const gameRooche = EXPERIENCE.find((item) => item.id === 'rooche')
  assert.equal(portfolioRooche?.period, 'Oct 2025 - Dec 2025')
  assert.equal(gameRooche?.period, 'Oct 2025 - Dec 2025')

  const uploadedAnthropicTitles = certifications
    .filter((credential) => credential.issuer === 'Anthropic' && credential.image)
    .map((credential) => credential.title)
  assert.deepEqual(uploadedAnthropicTitles, [
    'Introduction to Model Context Protocol',
    'Teaching the AI Fluency Framework',
    'Claude 101',
    'Building with the Claude API',
    'AI Fluency: Framework & Foundations',
  ])
})

test('only exposes explicitly configured project links', () => {
  const linkedProjects = [...featuredProjects, ...projectArchive].filter((project) => project.url)
  assert.ok(linkedProjects.length > 0)
  linkedProjects.forEach((project) => assert.match(project.url, /^https:\/\//))
})
