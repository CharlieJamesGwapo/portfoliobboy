import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import * as portfolioData from '../src/data/portfolioData.js'
import {
  aiCapabilityRibbon,
  aiSystemCapabilities,
  certifications,
  education,
  experiences,
  featuredProjects,
  interactiveGames,
  liveLinks,
  momentumEngineeringGroups,
  momentumSystems,
  navigation,
  professionalTitles,
  proofPoints,
  projectArchive,
  recognitions,
  resumeUrl,
  skillGroups,
  voiceCallFlow,
  profile,
} from '../src/data/portfolioData.js'
import { BIO_SCROLL, EXPERIENCE, OWNER, SKILL_CATEGORIES } from '../src/data/gameData.js'
import { independentProducts } from '../src/data/independentProducts.js'

const renderConsumers = async () => {
  const server = await createServer({
    configFile: resolve(process.cwd(), 'vite.config.js'),
    server: { middlewareMode: true, hmr: false, ws: false },
  })
  try {
    const [{ default: Hero }, { default: About }, { default: Experience }, { default: Projects }] = await Promise.all([
      server.ssrLoadModule('/src/components/Hero.jsx'),
      server.ssrLoadModule('/src/components/About.jsx'),
      server.ssrLoadModule('/src/components/Experience.jsx'),
      server.ssrLoadModule('/src/components/Projects.jsx'),
    ])
    const [hero, about, experience, projects] = [Hero, About, Experience, Projects]
      .map((Component) => renderToStaticMarkup(createElement(Component)).replace(/\s+/g, ' '))
    return { hero, about, experience, projects }
  } finally {
    await server.close()
  }
}

test('aligns public profile identity, role, location, and education with the supplied resume', () => {
  assert.equal(profile.role, 'Lead Full-Stack Developer | AI, Web & Mobile')
  assert.equal(profile.location, 'Cebu City, Philippines')
  assert.equal(profile.linkedin, 'https://www.linkedin.com/in/charlie-james-abejo-2b625a3a5/')
  assert.equal(OWNER.linkedin, profile.linkedin)
  assert.equal(education.period, '2022 — May 2026')
  assert.equal(professionalTitles.length, 8)
  assert.equal(professionalTitles[0], 'Lead Full-Stack Developer')
  assert.equal(interactiveGames.length, 9)
  assert.equal(new Set(interactiveGames.map((game) => game.id)).size, interactiveGames.length)
  assert.ok(navigation.some((item) => item.href === '#lab'))
  assert.ok(navigation.some((item) => item.href === '#live-projects' && item.label === 'Live'))
  assert.equal(new Set(navigation.map((item) => item.href)).size, navigation.length)
})

test('keeps the original featured and archived projects while prepending independent products', () => {
  assert.equal(featuredProjects.length, independentProducts.length + 8)
  assert.deepEqual(featuredProjects.slice(0, independentProducts.length).map((project) => project.id),
    independentProducts.map((project) => project.id))
  assert.deepEqual(featuredProjects.slice(independentProducts.length).map((project) => project.id), [
    'one-ride-balingasag', 'omji-billing', 'fitness-crm', 'fintech-lending',
    'moist-alumni', 'filtra-pos', 'ecycle-hub', 'mobile-booking',
  ])
  assert.equal(projectArchive.length, 12)
  assert.equal(experiences.length, 12)
  assert.equal(new Set(featuredProjects.map((project) => project.id)).size, featuredProjects.length)
  assert.deepEqual(projectArchive.slice(0, 8).map((project) => project.title), [
    'Luxury Construction Utah', 'G2 POS System', 'ReflectiCSS', 'Study Pulse',
    'Shayne & DR', 'Vince Lloyd Portfolio', 'Laarni Portfolio', 'Librewry Bistro POS',
  ])

  const alumniExperience = experiences.find((item) => item.company === 'MOIST Alumni Online Tracking System')
  assert.equal(alumniExperience?.period, 'Jan 2025 - Aug 2025')

  const alumniProject = featuredProjects.find((item) => item.id === 'moist-alumni')
  assert.equal(alumniProject?.eyebrow, 'Jan-Aug 2025 · Secure records platform')
})

test('shows current independent work and role count in the page consumers', async () => {
  const { hero: heroMarkup, about: aboutMarkup, experience: experienceMarkup } = await renderConsumers()
  const productProof = proofPoints.find((item) => item.label === 'Genuine products and client builds')
  const experienceProof = proofPoints.find((item) => item.label === 'Development')
  assert.deepEqual(productProof, {
    value: '22+',
    label: 'Genuine products and client builds',
    numericValue: 22,
    suffix: '+',
  })
  assert.deepEqual(experienceProof, {
    value: 'Hands-on',
    label: 'Development',
  })
  assert.equal(skillGroups.flatMap((group) => group.skills).includes('MongoDB'), false)
  assert.equal(SKILL_CATEGORIES.flatMap((group) => group.skills).includes('MongoDB'), false)
  assert.equal(BIO_SCROLL[1], 'Hands-on development across Python, Go, .NET, Node.js, and PHP.')
  assert.match(heroMarkup.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '), /Lead Full-Stack/)
  assert.match(heroMarkup, /AI, web &amp; mobile\./)
  assert.match(heroMarkup, /OneRidePhone|one-ride|oneRide/i)
  assert.match(aboutMarkup, /At Zalio, I led/i)
  assert.match(aboutMarkup, /AutoFlow AI Pro/i)
  assert.match(aboutMarkup, /EasyAppy/i)
  assert.match(aboutMarkup, /AgentForge/i)
  assert.match(aboutMarkup, /BBOY/i)
  assert.match(experienceMarkup.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '), /12 Roles and engagements/i)
  assert.match(experienceMarkup, /Earlier project engagements/i)
})

test('adds the supplied mobile and desktop engineering skills', () => {
  const skills = new Set(skillGroups.flatMap((group) => group.skills))
  for (const skill of [
    'Expo', 'Expo Router', 'NativeWind', 'Reanimated', 'Expo SQLite',
    'Electron', 'Swift', 'AppKit', 'macOS Keychain', 'Gmail OAuth', 'GitHub Actions',
  ]) {
    assert.ok(skills.has(skill), `missing skill ${skill}`)
  }
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

test('publishes the supplied work history with completed dates and synchronized game data', async () => {
  const consumerMarkup = await renderConsumers()
  const zalioExperience = experiences.find((item) => item.company === 'Zalio · Momentum')
  const omjiExperience = experiences.find((item) => item.company === 'OMJI')
  const freelanceExperience = experiences.find((item) => item.company === 'Independent client engagements & personal products')
  const fintechExperience = experiences.find((item) => item.company === 'Super Deal · Australian Fintech')
  const roocheExperience = experiences.find((item) => item.company === 'Rooche Digital Company')
  const freelanceEvidence = [freelanceExperience?.summary, ...(freelanceExperience?.achievements ?? [])]
    .filter(Boolean)
    .join(' ')
  assert.equal(zalioExperience?.role, 'Lead Full-Stack Developer — AI & CRM Systems')
  assert.equal(zalioExperience?.period, 'Jun 2026 – Sep 2026')
  assert.match(zalioExperience?.summary ?? '', /^Led /)
  assert.equal(omjiExperience?.role, 'Founding Engineer & Lead Full-Stack Developer')
  assert.equal(omjiExperience?.period, 'Mar 2024 – May 2026')
  assert.match(JSON.stringify(omjiExperience), /MikroTik|RFID|Google Play|Piso Wi-Fi/i)
  assert.equal(freelanceExperience?.role, 'Freelance Full-Stack Developer')
  assert.equal(freelanceExperience?.period, '2023 – Present')
  assert.match(freelanceEvidence, /EasyAppy.*AgentForge.*BBOY.*AutoFlow AI Pro/i)
  assert.equal(fintechExperience?.period, 'Jan 2024 – Dec 2025')
  assert.equal(roocheExperience?.period, 'Jan 2026 – Mar 2026')
  assert.ok(fintechExperience?.summary && !/Modernizing|Building/i.test(fintechExperience.summary))
  assert.equal(OWNER.linkedin, profile.linkedin)
  assert.equal(EXPERIENCE.find((item) => item.id === 'fintech-lending')?.company, 'Super Deal · Australian Fintech')

  const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')
  const manifest = JSON.parse(readFileSync(resolve(process.cwd(), 'public/manifest.json'), 'utf8'))
  assert.match(html, /Lead Full-Stack Developer/)
  assert.match(html, /Cebu City/)
  assert.match(html, /2b625a3a5/)
  assert.match(manifest.description, /Lead Full-Stack Developer/i)

  const fitnessProject = featuredProjects.find((item) => item.id === 'fitness-crm')
  assert.equal(roocheExperience?.period, 'Jan 2026 – Mar 2026')
  assert.equal(fitnessProject?.title, 'Enterprise CRM Platform')
  assert.equal(fitnessProject?.eyebrow, 'Jun–Sep 2026 · Australian client · Enterprise CRM platform')
  const fintechProject = featuredProjects.find((item) => item.id === 'fintech-lending')
  assert.equal(fintechProject?.title, 'Fintech Lending Platform Modernization')
  assert.equal(fintechProject?.eyebrow, 'Jan 2024 – Dec 2025 · Regulated fintech · Australia')

  const gameRoocheExperience = EXPERIENCE.find((item) => item.id === 'rooche')
  assert.equal(gameRoocheExperience?.period, 'Jan 2026 – Mar 2026')
  assert.equal(EXPERIENCE.find((item) => item.id === 'fintech-lending')?.period, 'Jan 2024 – Dec 2025')

  const publicContent = [
    JSON.stringify({ experiences, featuredProjects, skillGroups, BIO_SCROLL }),
    ...Object.values(consumerMarkup),
  ].join(' ')
  assert.doesNotMatch(publicContent, /Multi-Club Fitness Group|PerfectGym/i)
})

test('preserves earlier portfolio experience records and historical project identities', () => {
  const knownEarlierCompanies = [
    'MOIST Alumni Online Tracking System', 'Filtra Coffee POS System', 'Librewry Bistro POS System',
    'E-Cycle Hub', 'Jolly Ride App', 'Massage Booking App', 'Personal Portfolio Website',
  ]
  for (const company of knownEarlierCompanies) {
    assert.ok(experiences.some((item) => item.company === company), `missing experience record ${company}`)
  }
  assert.deepEqual(
    featuredProjects.slice(independentProducts.length).map((project) => project.id),
    ['one-ride-balingasag', 'omji-billing', 'fitness-crm', 'fintech-lending', 'moist-alumni', 'filtra-pos', 'ecycle-hub', 'mobile-booking'],
  )
  assert.equal(projectArchive.length, 12)
  assert.deepEqual(portfolioData.projectCategories.includes('Desktop'), true)
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

test('adds evidence-backed AI, automation, voice, CRM, and integration positioning', () => {
  assert.deepEqual(aiCapabilityRibbon, [
    'Custom AI agents',
    'Voice agents',
    'Workflow automation',
    'Custom CRM',
    'n8n',
    'GoHighLevel',
  ])

  assert.deepEqual(
    aiSystemCapabilities.map((capability) => capability.title),
    [
      'Custom AI agents',
      'Voice agents & reception',
      'Automation & integrations',
      'Custom CRM & operations',
      'AI modeling & workflow design',
      'GoHighLevel & n8n workflows',
    ],
  )

  const capabilityCopy = JSON.stringify(aiSystemCapabilities)
  assert.match(capabilityCopy, /tool calling/i)
  assert.match(capabilityCopy, /human handoff/i)
  assert.match(capabilityCopy, /idempotency/i)
  assert.match(capabilityCopy, /GoHighLevel/i)
})

test('curates Momentum systems with honest readiness and only verified public links', () => {
  assert.equal(momentumSystems.length, 13)
  assert.equal(momentumEngineeringGroups.length, 4)

  const hasti = momentumSystems.find((system) => system.id === 'hasti')
  assert.equal(hasti?.status, 'Live AI demo')
  assert.equal(hasti?.url, 'https://hasti.com.au/')

  const alex = momentumSystems.find((system) => system.id === 'alex')
  assert.equal(alex?.status, 'Live AI demo')
  assert.equal(alex?.url, 'https://hasti.com.au/')
  assert.equal(alex?.linkLabel, 'Talk to Alex')

  assert.equal(momentumSystems.some((system) => system.id === 'voice-runtime'), false)

  const gtmEngine = momentumSystems.find((system) => system.id === 'gtm-engine')
  assert.equal(gtmEngine?.status, 'Private engineering case study')
  assert.equal(gtmEngine?.url, undefined)

  momentumSystems
    .filter((system) => system.url)
    .forEach((system) => assert.match(system.url, /^https:\/\//))

  const privateSystemCopy = JSON.stringify(momentumEngineeringGroups)
  assert.match(privateSystemCopy, /Agent orchestration/i)
  assert.match(privateSystemCopy, /campaigns/i)
  assert.match(privateSystemCopy, /Control-plane monitoring/i)
  assert.doesNotMatch(privateSystemCopy, /github\.com\/momentum-au/i)
})

test('renders the additive AI systems section without replacing existing project inventory', async () => {
  const server = await createServer({
    configFile: resolve(process.cwd(), 'vite.config.js'),
    server: { middlewareMode: true, hmr: false, ws: false },
  })
  try {
    const { default: AISystems, MomentumSystems } = await server.ssrLoadModule('/src/components/AISystems.jsx')
    const markup = [AISystems, MomentumSystems].map(Component => renderToStaticMarkup(createElement(Component))).join(' ').replace(/\s+/g, ' ')
    assert.match(markup, /AI systems &amp; automation/i)
    assert.match(markup, /Selected Momentum systems/i)
    assert.match(markup, /Live AI demo/i)
    assert.match(markup, /Private engineering case study/i)
    assert.match(markup, /https:\/\/hasti\.com\.au\//i)
  } finally {
    await server.close()
  }

  assert.equal(featuredProjects.length, independentProducts.length + 8)
  assert.equal(projectArchive.length, 12)
})

test('publishes live links with unique ids and https URLs, including Zalio and Hasti', () => {
  assert.ok(liveLinks.length >= 14)
  assert.equal(new Set(liveLinks.map((link) => link.id)).size, liveLinks.length)
  const kinds = ['AI voice demo', 'Product', 'Mobile app', 'Web app', 'Client site']
  liveLinks.forEach((link) => {
    assert.match(link.url, /^https:\/\//)
    assert.ok(kinds.includes(link.kind), `unknown kind ${link.kind}`)
    assert.ok(link.title && link.label && link.description)
  })
  assert.equal(liveLinks[0].id, 'alex-demo')
  assert.ok(liveLinks.some((link) => link.url === 'https://zalio.ai/'))
  assert.ok(liveLinks.some((link) => link.url === 'https://hasti.com.au/'))
  assert.deepEqual(
    experiences[0].links.map((link) => link.url),
    ['https://zalio.ai/', 'https://hasti.com.au/'],
  )
})

test('keeps the voice call timeline public-safe and the security projects listed', () => {
  assert.equal(voiceCallFlow.parties.length, 3)
  assert.equal(voiceCallFlow.steps.length, 7)
  voiceCallFlow.steps.forEach((step) => {
    assert.ok(step.from >= 0 && step.from < 3 && step.to >= 0 && step.to < 3)
  })
  assert.deepEqual(voiceCallFlow.stats.map((stat) => stat.value), ['15.3 s', '~84 s', 'G.722 → G.711'])
  const flowCopy = JSON.stringify(voiceCallFlow)
  assert.doesNotMatch(flowCopy, /\+?\d{9,}|\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)

  assert.ok(portfolioData.projectCategories.includes('Security'))
  const security = projectArchive.filter((project) => project.categories.includes('Security'))
  assert.equal(security.length, 4)
  security.forEach((project) => {
    assert.equal(project.personal, true)
    assert.equal(project.period, 'May–Jul 2026')
    assert.equal(project.url, undefined)
  })
})
