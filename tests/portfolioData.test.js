import test from 'node:test'
import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import {
  certifications,
  education,
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

const renderConsumers = async () => {
  const server = await createServer({
    configFile: resolve(process.cwd(), 'vite.config.js'),
    server: { middlewareMode: true },
  })
  try {
    const [{ default: About }, { default: Experience }, { default: Projects }] = await Promise.all([
      server.ssrLoadModule('/src/components/About.jsx'),
      server.ssrLoadModule('/src/components/Experience.jsx'),
      server.ssrLoadModule('/src/components/Projects.jsx'),
    ])
    return [About, Experience, Projects]
      .map((Component) => renderToStaticMarkup(createElement(Component)).replace(/\s+/g, ' '))
  } finally {
    await server.close()
  }
}

test('preserves the verified professional positioning and identity features', () => {
  assert.equal(education.period, '2022 — 2026')
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

test('shows careful building-and-shipping experience wording in page consumers', async () => {
  const [aboutMarkup, experienceMarkup] = await renderConsumers()
  const productProof = proofPoints.find((item) => item.label === 'Genuine products and client builds')
  const experienceProof = proofPoints.find((item) => item.label === 'Years building and shipping software')
  assert.deepEqual(productProof, {
    value: '17+',
    label: 'Genuine products and client builds',
    numericValue: 17,
    suffix: '+',
  })
  assert.deepEqual(experienceProof, {
    value: '5+',
    label: 'Years building and shipping software',
    numericValue: 5,
    suffix: '+',
  })
  assert.equal(skillGroups.flatMap((group) => group.skills).includes('MongoDB'), false)
  assert.equal(SKILL_CATEGORIES.flatMap((group) => group.skills).includes('MongoDB'), false)
  assert.match(BIO_SCROLL[1], /5\+ years building and shipping software/i)
  assert.match(aboutMarkup, /5\+ years building and shipping software/i)
  assert.match(experienceMarkup.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '), /5\+ Years building and shipping software/i)
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

test('keeps public client wording anonymous and aligns every visible role timeline', async () => {
  const consumerMarkup = await renderConsumers()
  const australianExperience = experiences.find((item) => item.role === 'AI Full-Stack Developer')
  const societyExperience = experiences.find((item) => item.company === 'Robustech IT / SocietyOne')
  const roocheExperience = experiences.find((item) => item.company === 'Rooche Digital Company')
  assert.equal(australianExperience?.company, 'Australian client')
  assert.equal(australianExperience?.period, '2026 – Present')
  assert.equal(roocheExperience?.period, 'Jan 2026 – Mar 2026')
  assert.equal(societyExperience?.period, 'Jan 2024 – Dec 2025')

  const fitnessProject = featuredProjects.find((item) => item.id === 'fitness-crm')
  const societyProject = featuredProjects.find((item) => item.id === 'societyone')
  assert.equal(fitnessProject?.title, 'Enterprise CRM Platform')
  assert.equal(fitnessProject?.eyebrow, '2026 – Present · Australian client · Enterprise CRM platform')
  assert.equal(societyProject?.eyebrow, 'Jan 2024 – Dec 2025 · Regulated fintech · Australia')

  const gameSocietyExperience = EXPERIENCE.find((item) => item.id === 'robustech')
  const gameRoocheExperience = EXPERIENCE.find((item) => item.id === 'rooche')
  assert.equal(gameRoocheExperience?.period, 'Jan 2026 – Mar 2026')
  assert.equal(gameSocietyExperience?.period, 'Jan 2024 – Dec 2025')

  const publicContent = [
    JSON.stringify({ experiences, featuredProjects, skillGroups, BIO_SCROLL }),
    ...consumerMarkup,
  ].join(' ')
  assert.doesNotMatch(publicContent, /Multi-Club Fitness Group|PerfectGym/i)
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
  assert.equal(portfolioRooche?.period, 'Jan 2026 – Mar 2026')
  assert.equal(gameRooche?.period, 'Jan 2026 – Mar 2026')

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
