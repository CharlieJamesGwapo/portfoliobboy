import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildInstructions,
  buildKnowledge,
  isReviewedPublicUrl,
  isSafePublicUrl,
  selectSources,
} from '../server/portfolioKnowledge.js'

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

test('regresses the complete reviewed title, date, credential, and recognition inventory', () => {
  const { facts } = buildKnowledge()

  assert.deepEqual(
    facts.featuredProjects.map(({ id, title, eyebrow, hasPublicLink }) => ({ id, title, eyebrow, hasPublicLink })),
    [
      { id: 'one-ride-balingasag', title: 'One Ride Balingasag (OMJI)', eyebrow: 'Started Apr 2026 · Live on Google Play · Balingasag', hasPublicLink: true },
      { id: 'omji-billing', title: 'OMJI Internet Access & Billing System', eyebrow: 'Apr–Jun 2026 · Internet access and billing', hasPublicLink: false },
      { id: 'fitness-crm', title: 'Enterprise CRM Platform', eyebrow: '2026 – Present · Australian client · Enterprise CRM platform', hasPublicLink: false },
      { id: 'societyone', title: 'SocietyOne Platform Modernization', eyebrow: 'Jan 2024 – Dec 2025 · Regulated fintech · Australia', hasPublicLink: false },
      { id: 'moist-alumni', title: 'MOIST Alumni Tracking System', eyebrow: 'Jan-Aug 2025 · Secure records platform', hasPublicLink: false },
      { id: 'filtra-pos', title: 'Filtra Coffee POS', eyebrow: 'Production point of sale', hasPublicLink: false },
      { id: 'ecycle-hub', title: 'E-Cycle Hub', eyebrow: 'Waste-pickup scheduling platform', hasPublicLink: true },
      { id: 'mobile-booking', title: 'Jolly Ride & Massage Booking Apps', eyebrow: 'Cross-platform mobile products', hasPublicLink: false },
    ],
  )

  assert.deepEqual(
    facts.projectArchive.map(({ title, type, hasPublicLink }) => ({ title, type, hasPublicLink })),
    [
      { title: 'Luxury Construction Utah', type: 'Client website', hasPublicLink: false },
      { title: 'G2 POS System', type: 'Full-stack product', hasPublicLink: true },
      { title: 'ReflectiCSS', type: 'Developer tool', hasPublicLink: true },
      { title: 'Study Pulse', type: 'Learning product', hasPublicLink: true },
      { title: 'Shayne & DR', type: 'Client website', hasPublicLink: true },
      { title: 'Vince Lloyd Portfolio', type: 'Client portfolio', hasPublicLink: true },
      { title: 'Laarni Portfolio', type: 'Client portfolio', hasPublicLink: true },
      { title: 'Librewry Bistro POS', type: 'Operations product', hasPublicLink: false },
    ],
  )

  assert.deepEqual(
    facts.experiences.map(({ role, company, period }) => ({ role, company, period })),
    [
      { role: 'AI Full-Stack Developer', company: 'Australian client', period: '2026 – Present' },
      { role: 'Full-Stack Developer', company: 'Rooche Digital Company', period: 'Jan 2026 – Mar 2026' },
      { role: 'Full-Stack Developer', company: 'Robustech IT / SocietyOne', period: 'Jan 2024 – Dec 2025' },
      { role: 'Full-Stack Developer', company: 'MOIST Alumni Online Tracking System', period: 'Jan 2025 - Aug 2025' },
      { role: 'Full-Stack Developer', company: 'Filtra Coffee POS System', period: 'Jun 2023 — Dec 2023' },
      { role: 'Full-Stack Developer', company: 'Librewry Bistro POS System', period: 'Aug 2022 — Dec 2022' },
      { role: 'Full-Stack Developer', company: 'E-Cycle Hub', period: 'Mar 2022 — Jul 2022' },
      { role: 'Mobile Developer', company: 'Jolly Ride App', period: 'Oct 2021 — Feb 2022' },
      { role: 'Mobile Developer', company: 'Massage Booking App', period: 'May 2021 — Sep 2021' },
      { role: 'Full-Stack Developer', company: 'Personal Portfolio Website', period: 'Jan 2021 — Apr 2021' },
    ],
  )

  assert.deepEqual(facts.education, {
    institution: 'Misamis Oriental Institute of Science and Technology',
    degree: 'Bachelor of Science in Information Technology',
    period: '2022 — 2026',
    details: "Dean's Lister, 2nd and 3rd Year (Ranked 2) · TOPCIT participant (2024–2025)",
  })
  assert.deepEqual(facts.recognitions, [
    { title: "Dean's Lister — 2nd and 3rd Year, Ranked 2", issuer: 'MOIST', kind: 'Academic recognition' },
    { title: 'TOPCIT — Test of Practical Competency in IT', issuer: 'TOPCIT', kind: '2024–2025 participant' },
  ])

  assert.deepEqual(facts.certifications, [
    { title: 'Model Context Protocol: Advanced Topics', issuer: 'Anthropic', kind: 'Certificate of completion', issued: 'Jul 2026', credentialId: 'azpzwuk5gowu', category: 'AI & Anthropic' },
    { title: 'Introduction to Agent Skills', issuer: 'Anthropic', kind: 'Certificate of completion', issued: 'Jul 2026', credentialId: 'b5ozvc7uj6zp', category: 'AI & Anthropic' },
    { title: 'AI Fluency for Builders', issuer: 'Anthropic', kind: 'Certificate of completion', issued: 'Jul 2026', credentialId: 't3ezfyy5es9o', category: 'AI & Anthropic' },
    { title: 'Introduction to Model Context Protocol', issuer: 'Anthropic', kind: 'Certificate of completion', issued: 'Jul 2026', credentialId: 'xy5k5u4b47qi', category: 'AI & Anthropic' },
    { title: 'AI Capabilities and Limitations', issuer: 'Anthropic', kind: 'Certificate of completion', issued: 'Jul 2026', credentialId: 'sghsdrqu8hzj', category: 'AI & Anthropic' },
    { title: 'Claude Code in Action', issuer: 'Anthropic', kind: 'Certificate of completion', issued: 'Jul 2026', credentialId: '7jbexrv7sqo8', category: 'AI & Anthropic' },
    { title: 'Introduction to Subagents', issuer: 'Anthropic', kind: 'Certificate of completion', issued: 'Jul 2026', credentialId: 'bwdbd3vvajkh', category: 'AI & Anthropic' },
    { title: 'Teaching the AI Fluency Framework', issuer: 'Anthropic', kind: 'Certificate of completion', issued: 'Jul 2026', credentialId: 'fbvhx43hfmj4', category: 'AI & Anthropic' },
    { title: 'Claude 101', issuer: 'Anthropic', kind: 'Certificate of completion', issued: 'Jul 2026', credentialId: '8smsowpqtnzg', category: 'AI & Anthropic' },
    { title: 'Building with the Claude API', issuer: 'Anthropic', kind: 'Certificate of completion', issued: 'Jul 2026', credentialId: 'kwaq247cry7d', category: 'AI & Anthropic' },
    { title: 'AI Fluency: Framework & Foundations', issuer: 'Anthropic', kind: 'Certificate of completion', issued: 'Jul 2026', credentialId: 'uzgqztbht6ax', category: 'AI & Anthropic' },
    { title: 'Java SE 8 Programmer I', issuer: 'Java Developer', kind: 'Professional credential', issued: 'Jul 2024', expires: 'Dec 2035', category: 'Technical & professional' },
    { title: 'Go Programming', issuer: 'CS50', kind: 'Programming credential', issued: 'Jul 2024', expires: 'Feb 2034', category: 'Technical & professional' },
    { title: 'Programming in HTML5 with JavaScript and CSS3', issuer: 'Codemy', kind: 'Programming credential', issued: 'May 2025', expires: 'Dec 2032', category: 'Technical & professional' },
    { title: 'Full-Stack Web Development Certification', issuer: 'Codemy', kind: 'Professional credential', issued: 'Apr 2025', expired: 'Jul 2025', category: 'Technical & professional' },
    { title: 'Databases with SQL', issuer: 'Harvard CS50', kind: 'Certificate' },
    { title: 'Manage AD DS Domain Controllers & FSMO Roles', issuer: 'Microsoft', kind: 'Certificate' },
    { title: 'Windows Server 2012 Training', issuer: 'ITFreeTraining', kind: 'Technical training' },
    { title: 'Active Directory', issuer: 'ITFreeTraining', kind: 'Technical training' },
    { title: 'MongoDB Database Training', issuer: 'MongoDB', kind: 'Technical training' },
    { title: 'PHP for Web Development', issuer: 'CodeMy', kind: 'Technical training' },
    { title: 'JavaScript Programming', issuer: 'Bro Code', kind: 'Technical training' },
    { title: 'HTML and CSS', issuer: 'Telugu', kind: 'Technical training' },
  ])
})

test('does not serialize private media, internal URLs, or unreviewed fields', () => {
  const knowledge = buildKnowledge()
  const encodedFacts = JSON.stringify(knowledge.facts)
  const instructions = buildInstructions()

  assert.equal('phoneHref' in knowledge.facts.profile, false)
  assert.equal('image' in knowledge.facts.certifications[0], false)
  assert.equal('thumb' in knowledge.facts.certifications[0], false)
  assert.doesNotMatch(encodedFacts, /https?:\/\//i)
  assert.doesNotMatch(instructions, /https?:\/\//i)
  assert.doesNotMatch(encodedFacts, /internal\\.zalio\\.ai/i)
  assert.doesNotMatch(encodedFacts, /private client database/i)

  const sourcePairs = knowledge.sources.map(({ id, href }) => [id, href])
  assert.deepEqual(sourcePairs, [
    ['home', '/#home'],
    ['about', '/#about'],
    ['experience', '/#experience'],
    ['ai-systems', '/#ai-systems'],
    ['momentum-work', '/#momentum-work'],
    ['projects', '/#projects'],
    ['skills', '/#skills'],
    ['education', '/#education'],
    ['lab', '/#lab'],
    ['contact', '/#contact'],
    ['project-one-ride-balingasag', 'https://play.google.com/store/apps/details?id=com.oneridebalingasag.app&hl=en'],
    ['project-ecycle-hub', 'https://ecyclehub.vercel.app/'],
    ['project-g2-pos-system', 'https://g2possystem.vercel.app/landing'],
    ['project-reflecticss', 'https://reflecticss.vercel.app/'],
    ['project-study-pulse', 'https://study-pulse-ten.vercel.app/'],
    ['project-shayne-dr', 'https://shayneanddr.netlify.app/'],
    ['project-vince-lloyd-portfolio', 'https://vincelloyd.netlify.app/'],
    ['project-laarni-portfolio', 'https://laarni.netlify.app/'],
    ['system-hasti', 'https://hasti.com.au/'],
    ['system-zalio', 'https://zalio.ai/'],
    ['system-gymfactories', 'https://gymfactories.com/'],
    ['system-momentum-strength', 'https://momentum-strength.vercel.app/'],
    ['system-hsie-site-scoring', 'https://health-dev-three.vercel.app/'],
  ])

  for (const source of knowledge.sources) {
    assert.deepEqual(Object.keys(source).sort(), ['href', 'id', 'label', 'topics'])
    assert.ok(source.href.startsWith('/#') || source.href.startsWith('https://'), source.href)
  }

  for (const href of [
    'javascript:alert(1)',
    '//evil.example/path',
    'http://evil.example/path',
    'https://user:pass@evil.example/path',
    'https://127.0.0.1/',
    'https://0.0.0.0/',
    'https://10.1.2.3/',
    'https://100.64.0.1/',
    'https://192.168.1.8/',
    'https://172.20.0.4/',
    'https://foo.localhost/',
    'https://internal.zalio.ai/',
    'https://private.internal/',
    'https://[::1]/',
    'https://[fc00::1]/',
    'https://[fe80::1]/',
    'https://[::ffff:192.168.1.1]/',
  ]) {
    assert.equal(isSafePublicUrl(href), false, href)
    assert.equal(isReviewedPublicUrl(href), false, href)
  }
  assert.equal(isReviewedPublicUrl('https://unknown.example/'), false)
  assert.equal(isReviewedPublicUrl('https://hasti.com.au/'), true)

  const privateRuntime = knowledge.facts.momentumSystems.find((item) => item.id === 'voice-runtime')
  assert.equal(privateRuntime?.status, 'Private engineering case study')
  assert.equal(privateRuntime?.href, undefined)
  const publicHasti = knowledge.facts.momentumSystems.find((item) => item.id === 'hasti')
  assert.equal(publicHasti?.hasPublicLink, true)
  assert.equal(knowledge.facts.featuredProjects.find((item) => item.id === 'one-ride-balingasag')?.hasPublicLink, true)
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
