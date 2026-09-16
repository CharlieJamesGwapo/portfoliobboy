export const resumeUrl = '/charlie-james-abejo-resume.pdf'

export const profile = {
  name: 'Charlie James Z. Abejo',
  shortName: 'Charlie Abejo',
  role: 'Full-Stack Web & Mobile App Developer',
  headline: 'Full-stack product engineer for reliable web, mobile, and CRM systems.',
  support: 'I build production applications across web, iOS, and Android, with a focus on CRM integrations, real-time sync, secure data workflows, and AI-assisted delivery.',
  experience: '5+ years shipping production applications across web, iOS, and Android',
  specialty: 'CRM API integrations, real-time sync, and AI-assisted delivery',
  location: 'Misamis Oriental, Philippines (Remote)',
  availability: 'Available immediately - remote only',
  email: 'capstonee2@gmail.com',
  phoneDisplay: '+63 985 612 2843',
  phoneHref: 'tel:+639856122843',
  github: 'https://github.com/CharlieJamesGwapo',
  linkedin: 'https://www.linkedin.com/in/charlie-james-abejo-26362638a/',
  portfolio: 'https://portfoliobboy.vercel.app/',
  resumeUrl,
}

export const navigation = [
  { label: 'Work', href: '#work' },
  { label: 'Experience', href: '#experience' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Credentials', href: '#credentials' },
  { label: 'Contact', href: '#contact' },
]

export const proofPoints = [
  { value: '5+ years', label: 'shipping production software' },
  { value: 'Web + iOS + Android', label: 'cross-platform delivery' },
  { value: 'CRM + API integration', label: 'sync, webhooks, and automation' },
  { value: 'Remote from the Philippines', label: 'works directly with global teams' },
]

export const caseStudies = [
  {
    id: 'unified-crm-operations',
    title: 'Unified CRM & Operations Platform',
    label: 'Australian Client · Contract · Remote · 2026',
    confidentiality: 'private',
    confidentialityNote: 'Private client engagement; identifying details and product screens are withheld.',
    context: 'customer records, subscriptions, payments, visit history, and outreach were spread across separate tools.',
    responsibilities: [
      'Next.js/React dashboards',
      'event-driven Python sync worker',
      'marketing attribution',
      'Twilio Voice integration',
      'data migration and reconciliation',
      'direct collaboration with a non-technical business owner',
    ],
    system: {
      nodes: [
        { id: 'acquisition-sources', label: 'Acquisition sources' },
        { id: 'crm-api', label: 'CRM REST API/webhooks' },
        { id: 'python-sync', label: 'Python/Celery sync' },
        { id: 'postgres', label: 'Postgres' },
        { id: 'operations-dashboards', label: 'Next.js operations dashboards' },
        { id: 'twilio-voice', label: 'Twilio Voice', detail: 'customer outreach' },
      ],
      edges: [
        { from: 'acquisition-sources', to: 'crm-api' },
        { from: 'crm-api', to: 'python-sync' },
        { from: 'python-sync', to: 'postgres' },
        { from: 'postgres', to: 'operations-dashboards' },
        { from: 'twilio-voice', to: 'operations-dashboards', label: 'customer outreach' },
      ],
    },
    reliability: [
      'durable Postgres job queue',
      'leases',
      'idempotency keys',
      'bounded retries',
      'zombie-run recovery',
      'replay-safe sync',
      'source-of-truth financial reconciliation',
    ],
    delivered: 'One unified system for customer records, subscriptions, payments, visit history, and outreach.',
    stack: ['TypeScript', 'Next.js 16', 'React 19', 'TanStack Query', 'Python', 'Celery', 'Redis', 'Supabase Postgres', 'Docker', 'Linux VPS', 'Twilio'],
  },
  {
    id: 'fintech-modernization',
    title: 'Regulated Fintech Platform Modernization',
    label: 'Robustech IT / SocietyOne · Australia · Jan 2024 - Dec 2025',
    confidentiality: 'private',
    confidentialityNote: 'Employer platform work; implementation details are summarized at a public level.',
    context: 'a major data and platform migration in a regulated personal-lending environment.',
    responsibilities: [
      're-platform Go and Node.js microservices to .NET',
      'build Python and .NET AWS Lambda functions',
      'maintain partner banking and lending integrations',
      'automate reconciliation, reporting, partner-feed processing, and email parsing',
    ],
    system: {
      nodes: [
        { id: 'partner-systems', label: 'Partner banking/lending systems' },
        { id: 'partner-protocols', label: 'JSON-RPC, webhooks, and feeds' },
        { id: 'lambda-services', label: 'Lambda/services' },
        { id: 'postgres', label: 'PostgreSQL' },
        { id: 'reconciliation-reporting', label: 'reconciliation/reporting' },
        { id: 'buddy-cicd', label: 'Buddy CI/CD', detail: 'testing, staged deployment, and rollback' },
      ],
      edges: [
        { from: 'partner-systems', to: 'partner-protocols' },
        { from: 'partner-protocols', to: 'lambda-services' },
        { from: 'lambda-services', to: 'postgres' },
        { from: 'postgres', to: 'reconciliation-reporting' },
        { from: 'buddy-cicd', to: 'lambda-services', label: 'testing, staged deployment, and rollback' },
      ],
    },
    reliability: [
      'standardized logging and error handling',
      'automated testing',
      'staged deployments',
      'rollbacks',
      'reconciliation against partner inputs',
    ],
    delivered: 'A modernized platform foundation for partner banking and lending integrations, reconciliation, and reporting.',
    stack: ['C#/.NET', 'Python', 'Go', 'Node.js', 'AWS Lambda', 'REST', 'GraphQL', 'JSON-RPC', 'WebSockets', 'webhooks', 'PostgreSQL', 'Buddy CI/CD'],
  },
  {
    id: 'cross-platform-booking',
    title: 'Cross-Platform Booking Applications',
    label: 'Jolly Ride & Massage Booking Apps · 2021 - 2023 project chapter',
    confidentiality: 'public',
    confidentialityNote: '',
    context: 'scheduling and booking workflows needed to work across web-adjacent mobile experiences, iOS, and Android.',
    responsibilities: [
      'React Native cross-platform work and native Android development with Java/Kotlin',
      'Firebase real-time data, authentication, and push notifications',
    ],
    system: {
      nodes: [
        { id: 'mobile-client', label: 'iOS/Android client' },
        { id: 'authentication', label: 'authentication' },
        { id: 'booking-state', label: 'booking/scheduling state' },
        { id: 'firebase-data', label: 'Firebase real-time data' },
        { id: 'notifications', label: 'notifications' },
      ],
      edges: [
        { from: 'mobile-client', to: 'authentication' },
        { from: 'authentication', to: 'booking-state' },
        { from: 'booking-state', to: 'firebase-data' },
        { from: 'firebase-data', to: 'notifications' },
      ],
    },
    reliability: [
      'authenticated access',
      'real-time status synchronization',
      'notification-driven updates',
      'mobile-aware state handling',
    ],
    delivered: 'Scheduling and booking applications for iOS and Android with real-time data, authentication, and push notifications.',
    stack: ['React Native', 'Android', 'Java', 'Kotlin', 'Firebase real-time data', 'authentication', 'push notifications'],
  },
]

export const experienceTimeline = [
  {
    id: 'australian-crm-contract',
    role: 'AI Full-Stack Developer (Contract)',
    company: 'Australian Client',
    location: 'Remote',
    period: '2026',
    summary: 'Building a production CRM / management platform that unified customer records, subscriptions, payments, visit history, and outreach into one system — revenue, retention, profiling, and re-engagement dashboards in Next.js 16, React 19, TypeScript, and TanStack Query.',
    achievements: [
      'Designed a bidirectional, event-driven CRM sync worker (Python, Celery + Redis) against the CRM REST API — durable Postgres job queue with leases, idempotency keys, bounded retries, and zombie-run recovery — deployed with Docker on a Linux VPS.',
      'Built marketing attribution and automation: lead source and campaign tracking across Meta Ads, Google Ads, and website forms, feeding a leads dashboard with autoassignment and pipeline-stage tracking.',
      'Integrated Twilio Voice browser calling directly into CRM customer panels to power outreach and re-engagement workflows.',
      'Led data migration and backfill of customer, contract, and payment history, with automated reconciliation against source-of-truth financial reports — verified line-by-line with the business owner.',
      'Ship daily with Claude Code: repo-level agent instructions, custom subagents and skills, and MCP server integrations (GitHub, Linear, shadcn, Supabase) — encoding architecture rules as prompts so AI agents produce production-quality code.',
      'Collaborate directly with a non-technical business owner — turning plain-language requirements into specs and recommending architecture improvements along the way.',
    ],
    stack: ['TypeScript', 'Next.js 16', 'React 19', 'Python', 'Celery', 'Redis', 'Supabase Postgres', 'Docker', 'Linux VPS', 'Twilio', 'Claude Code + MCP'],
  },
  {
    id: 'rooche',
    role: 'Full-Stack Developer',
    company: 'Rooche Digital Company',
    location: 'Remote',
    period: 'Jan 2026 - Mar 2026',
    summary: 'Delivered client dashboards and web apps with Node.js and Python (FastAPI) backends and React, Next.js, and Angular frontends.',
    achievements: [
      'Built FastAPI microservices with Pydantic validation, async endpoints, and OpenAPI-documented REST contracts; shipped REST and GraphQL APIs for internal tooling.',
      'Integrated Firebase and Supabase for auth, row-level security, and real-time multi-user sync; built WebSocket and webhook integrations for live dashboard updates.',
      'Maintained CI/CD on GitLab, Buddy, and Bitbucket with preview deploys and pytest gates.',
    ],
    stack: ['Python (FastAPI)', 'Node.js', 'React', 'Next.js', 'Angular', 'PostgreSQL', 'Firebase', 'Supabase', 'Docker', 'GitLab CI'],
  },
  {
    id: 'societyone',
    role: 'Full-Stack Developer',
    company: 'Robustech IT / SocietyOne (Australia)',
    location: 'Australia · Remote',
    period: 'Jan 2024 - Dec 2025',
    summary: 'Executed a major data and platform migration in a regulated fintech: re-platformed Golang and Node.js microservices to .NET (C#), standardising logging, error handling, and deployments.',
    achievements: [
      'Built AWS Lambda functions (Python and .NET) for event-driven workflows and third-party integrations with partner banking and lending systems.',
      'Owned JSON-RPC, WebSocket, and webhook integrations; wrote Python automation for reconciliation, reporting, and partner-feed / email parsing (httpx, Pandas).',
      'Maintained Buddy CI/CD pipelines for automated testing, staged deployments, and rollbacks.',
    ],
    stack: ['C#/.NET', 'Python', 'Go', 'Node.js', 'AWS Lambda', 'REST', 'GraphQL', 'PostgreSQL', 'Buddy CI/CD'],
  },
]

export const earlierWork = [
  {
    title: 'Jolly Ride & Massage Booking Apps',
    period: '2021 - 2023',
    summary: 'React Native and native Android (Java/Kotlin) scheduling and booking apps with Firebase real-time data, authentication, and push notifications.',
    stack: ['React Native', 'Android', 'Java', 'Kotlin', 'Firebase real-time data', 'authentication', 'push notifications'],
  },
  {
    title: 'MOIST Alumni Tracking System',
    period: '2021 - 2023',
    summary: 'Laravel and MySQL records platform with RBAC, audit trails, and OTP/2FA over SMS and email.',
    stack: ['Laravel', 'MySQL', 'RBAC', 'audit trails', 'OTP/2FA', 'SMS', 'email'],
  },
  {
    title: 'Filtra Coffee POS',
    period: '2021 - 2023',
    summary: 'Production point-of-sale platform used daily by store staff, built with a Go backend and Next.js/Vue frontends for sales, payments, inventory, and reporting.',
    stack: ['Go', 'Next.js', 'Vue.js', 'sales', 'payments', 'inventory', 'reporting'],
  },
  {
    title: 'E-Cycle Hub',
    period: '2021 - 2023',
    summary: 'Waste-pickup scheduling platform with WebSocket/webhook updates and a Go backend over Neon Postgres.',
    stack: ['WebSockets', 'webhooks', 'Go', 'Neon Postgres'],
  },
]

export const capabilityGroups = [
  {
    title: 'Mobile & cross-platform',
    description: 'Builds cross-platform mobile products with React Native and native Android, backed by authenticated real-time data and notification workflows.',
    skills: ['React Native', 'Android (Java/Kotlin)', 'Firebase real-time data', 'authentication', 'push notifications', 'offline-tolerant sync patterns'],
  },
  {
    title: 'CRM & integrations',
    description: 'Connects CRM, marketing, payment, partner, and communication systems through reliable APIs, webhooks, and synchronization.',
    skills: ['CRM REST APIs', 'webhooks', 'bidirectional sync', 'Twilio Voice', 'marketing attribution', 'payment data pipelines', 'partner webhooks', 'email-feed parsing'],
  },
  {
    title: 'Frontend',
    description: 'Builds responsive product interfaces with modern React and component systems for clear, maintainable workflows.',
    skills: ['React 19', 'Next.js 16 App Router', 'TypeScript', 'TanStack Query', 'Zustand', 'Tailwind CSS', 'shadcn/ui', 'Vue.js', 'Angular'],
  },
  {
    title: 'Backend & APIs',
    description: 'Designs typed services and integration layers across Python, Node.js, .NET, Go, PHP, and modern API protocols.',
    skills: ['Python/FastAPI/Django/Flask/Celery', 'Node.js/Express', 'C#/.NET', 'Go', 'PHP/Laravel', 'REST', 'GraphQL', 'WebSockets', 'JSON-RPC', 'OpenAPI', 'JWT', 'OTP/2FA', 'RBAC', 'audit trails'],
  },
  {
    title: 'Data & infrastructure',
    description: 'Shapes durable data models and repeatable deployments across relational databases, queues, containers, serverless functions, and CI/CD.',
    skills: ['PostgreSQL', 'Supabase', 'Neon', 'MySQL', 'MongoDB', 'Firebase', 'Redis', 'Docker', 'Linux VPS', 'AWS Lambda', 'GitLab/Buddy/Jenkins CI/CD', 'Vercel'],
  },
  {
    title: 'AI engineering',
    description: 'Uses AI-assisted engineering workflows and model integrations with tool calling, streaming, structured output, and instruction design.',
    skills: ['Claude Code workflows', 'custom subagents', 'skills', 'hooks', 'MCP servers', 'Cursor', 'GitHub Copilot', 'Claude/OpenAI API integration', 'tool calling', 'streaming', 'structured output', 'agent instruction design'],
  },
]

export const education = {
  degree: 'BS in Information Technology',
  institution: 'Misamis Oriental Institute of Science and Technology',
  period: '2022 - 2025',
  details: "Dean's Lister, 2nd & 3rd Year (Ranked 2) · TOPCIT participant (2024-2025)",
}

export const recognitions = [
  { title: "Dean's Lister, 2nd & 3rd Year (Ranked 2)", issuer: 'Misamis Oriental Institute of Science and Technology' },
  { title: 'TOPCIT participant', issuer: 'TOPCIT', period: '2024-2025' },
]

export const credentials = [
  { title: 'AI Fluency: Framework & Foundations', issuer: 'Anthropic', issued: '2026', image: '/certificates/ai-fluency-framework-foundations.webp', thumb: '/certificates/ai-fluency-framework-foundations-thumb.webp' },
  { title: 'Claude 101', issuer: 'Anthropic Academy (Anthropic Education)', issued: 'July 2026', image: '/certificates/claude-101.webp', thumb: '/certificates/claude-101-thumb.webp' },
  { title: 'Claude Platform 101', issuer: 'Anthropic Academy (Anthropic Education)', issued: 'July 2026' },
  { title: 'Databases with SQL', issuer: 'Harvard CS50' },
  { title: 'Microsoft - Manage AD DS Domain Controllers & FSMO Roles', issuer: 'Microsoft' },
  { title: 'Windows Server & Active Directory administration training', issuer: 'Technical training' },
]

export const supplementalProjects = [
  {
    id: 'one-ride-balingasag',
    title: 'One Ride Balingasag (OMJI)',
    type: 'Supplemental project work',
    categories: ['Mobile', 'Full Stack', 'Backend', 'API'],
    description: 'A unified ride-hailing, delivery, pickup, and local-store platform built for everyday transport and errands in Balingasag.',
    stack: ['React Native', 'Expo', 'TypeScript', 'Go', 'Gin', 'PostgreSQL', 'GORM', 'WebSockets'],
    url: 'https://play.google.com/store/apps/details?id=com.oneridebalingasag.app&hl=en',
  },
  {
    id: 'omji-billing',
    title: 'OMJI Internet Access & Billing System',
    type: 'Supplemental project work',
    categories: ['SaaS', 'Backend', 'Full Stack', 'API'],
    description: 'A web-based operations system for internet cafés, hotspots, and small ISPs combining prepaid access, billing, network control, and reporting.',
    stack: ['TypeScript', 'Go', 'React', 'Docker', 'MikroTik RouterOS', 'Web + mobile'],
    status: 'Private',
  },
  {
    id: 'luxury-construction-utah',
    title: 'Luxury Construction Utah',
    type: 'Supplemental project work',
    categories: ['Full Stack'],
    description: 'Responsive construction company website with service showcases and contact integration.',
    stack: ['React', 'Tailwind CSS'],
    status: 'Archived',
  },
  {
    id: 'g2-pos-system',
    title: 'G2 POS System',
    type: 'Supplemental project work',
    categories: ['SaaS', 'Backend', 'Full Stack'],
    description: 'Point-of-sale dashboard for order processing, sales tracking, inventory, and operational reporting.',
    stack: ['Go', 'Next.js', 'PostgreSQL', 'Docker'],
    url: 'https://g2possystem.vercel.app/landing',
  },
  {
    id: 'reflecticss',
    title: 'ReflectiCSS',
    type: 'Supplemental project work',
    categories: ['Full Stack'],
    description: 'Interactive interface for exploring and generating CSS styles.',
    stack: ['React', 'CSS', 'JavaScript'],
    url: 'https://reflecticss.vercel.app/',
  },
  {
    id: 'study-pulse',
    title: 'Study Pulse',
    type: 'Supplemental project work',
    categories: ['Full Stack'],
    description: 'Study planning and progress-tracking experience for organizing sessions and reviewing performance.',
    stack: ['React', 'Tailwind CSS', 'JavaScript'],
    url: 'https://study-pulse-ten.vercel.app/',
  },
  {
    id: 'shayne-and-dr',
    title: 'Shayne & DR',
    type: 'Supplemental project work',
    categories: ['Full Stack'],
    description: 'Custom client website with responsive layout and modern UI presentation.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    url: 'https://shayneanddr.netlify.app/',
  },
  {
    id: 'vince-lloyd-portfolio',
    title: 'Vince Lloyd Portfolio',
    type: 'Supplemental project work',
    categories: ['Full Stack'],
    description: 'Professional portfolio designed to present a client’s work and profile across device sizes.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    url: 'https://vincelloyd.netlify.app/',
  },
  {
    id: 'laarni-portfolio',
    title: 'Laarni Portfolio',
    type: 'Supplemental project work',
    categories: ['Full Stack'],
    description: 'Clean, responsive personal portfolio centered on readable content and accessible navigation.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    url: 'https://laarni.netlify.app/',
  },
  {
    id: 'librewry-bistro-pos',
    title: 'Librewry Bistro POS',
    type: 'Supplemental project work',
    categories: ['SaaS', 'Full Stack'],
    description: 'Café POS for order management, inventory tracking, sales analytics, and role-aware access.',
    stack: ['PHP', 'MySQL', 'JavaScript'],
    status: 'Private',
  },
]

export const labItems = [
  { id: 'dungeon', emoji: '⚔', title: 'Dungeon Crawler', tagline: "Explore Charlie's dungeon. Defeat bugs. Unlock the portfolio.", accent: 'from-cyan-500 to-blue-600' },
  { id: 'blaster', emoji: '🚀', title: 'Bug Blaster', tagline: 'Shoot the bugs. Collect skills. Survive the wave.', accent: 'from-fuchsia-500 to-purple-600' },
  { id: 'racer', emoji: '⌨', title: 'Code Racer', tagline: "Type real code from Charlie's projects. Race the clock.", accent: 'from-emerald-500 to-teal-600' },
  { id: 'blockblast', emoji: '🟦', title: 'Block Blast', tagline: "Clear the grid. Unlock Charlie's projects.", accent: 'from-amber-500 to-orange-600', bestKey: 'blockblast_best', bestKind: 'score' },
  { id: 'racing', emoji: '🏎', title: 'Pixel Racer', tagline: 'Race the track. Collect skills. Beat the clock.', accent: 'from-red-500 to-rose-600', bestKey: 'arcade_best_racing', bestKind: 'lapMs' },
  { id: 'flappy', emoji: '🐦', title: 'Flappy Dev', tagline: 'Dodge the brackets. Keep coding.', accent: 'from-sky-500 to-indigo-600', bestKey: 'arcade_best_flappy', bestKind: 'score' },
  { id: 'snake', emoji: '🐍', title: 'Code Snake', tagline: "Eat the skills. Don't crash.", accent: 'from-lime-500 to-green-600', bestKey: 'arcade_best_snake', bestKind: 'score' },
  { id: 'whack', emoji: '🔨', title: 'Whack-A-Bug', tagline: 'Squash the bugs. Ship the code.', accent: 'from-yellow-500 to-amber-600', bestKey: 'arcade_best_whack', bestKind: 'score' },
  { id: 'neon', emoji: '🏁', title: 'Neon Circuit', tagline: 'A true 3D racer — chase camera, real shadows, instanced geometry.', accent: 'from-cyan-500 to-blue-600', bestKey: 'arcade_best_neon', bestKind: 'score' },
]

export const musicPlaylists = [
  { key: 'focus', label: 'Focus', emoji: '💻', id: 'PLOzDu-MXXLliO9fBNZOQTBDddoA3FzZUo' },
  { key: 'game', label: 'Game Mode', emoji: '🎮', id: 'PLAka7Y5pBdHfNAGNKa7GNnKBFrNNbSSVT' },
  { key: 'chill', label: 'Chill', emoji: '🌙', id: 'PLMIbmfP_9vb8BCxRoraJpoo4q1yMFg4CE' },
]

// Compatibility aliases for shell modules that are migrated in later tasks.
export const professionalTitles = [profile.role]
export const interactiveGames = labItems
export const fitHighlights = capabilityGroups.slice(0, 4).map(({ title, description }) => ({ title, description }))
export const experiences = experienceTimeline
export const featuredProjects = supplementalProjects.slice(0, 6)
export const projectArchive = supplementalProjects.slice(6)
export const projectCategories = ['All', ...new Set(supplementalProjects.flatMap((item) => item.categories || []))]
export const skillGroups = capabilityGroups
export const certifications = credentials
