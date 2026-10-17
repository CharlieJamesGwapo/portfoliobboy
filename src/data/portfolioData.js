export const profile = {
  name: 'Charlie James Z. Abejo',
  shortName: 'Charlie Abejo',
  role: 'AI Developer & Full-Stack Engineer',
  location: 'Misamis Oriental, Philippines',
  email: 'capstonee2@gmail.com',
  phoneDisplay: '+63 985 612 2843',
  phoneHref: 'tel:+639856122843',
  github: 'https://github.com/CharlieJamesGwapo',
  linkedin: 'https://www.linkedin.com/in/charlie-james-abejo-26362638a/',
  portfolio: 'https://portfoliobboy.vercel.app',
}

export const resumeUrl = '/charlie-james-abejo-resume.pdf'

export const professionalTitles = [
  'AI Developer',
  'Full-Stack Developer',
  'Python and Go Developer',
  'Backend Engineer',
  'AI Integration Engineer',
  'SaaS Developer',
  '.NET Developer',
  'Mobile Application Developer',
]

export const navigation = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Live', href: '#live-projects' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Credentials', href: '#education' },
  { label: 'Interactive Lab', href: '#lab' },
  { label: 'Contact', href: '#contact' },
]

export const proofPoints = [
  { value: '17+', label: 'Genuine products and client builds', numericValue: 17, suffix: '+' },
  { value: 'Hands-on', label: 'Development' },
  { value: '25', label: 'Verified credentials and recognitions', numericValue: 25, suffix: '' },
  { value: '9', label: 'Playable creative-code experiments', numericValue: 9, suffix: '' },
]

export const interactiveGames = [
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

export const fitHighlights = [
  {
    title: 'AI product development',
    description:
      'Builds LLM-integrated features with tool calling, streaming, structured output, prompt design, and reliable product workflows.',
  },
  {
    title: 'CRM and API integrations',
    description:
      'Builds bidirectional REST and webhook sync with idempotency, retries, reconciliation, durable queues, and clear failure recovery.',
  },
  {
    title: 'Secure, real-time systems',
    description:
      'Experienced with RBAC, audit trails, OTP/2FA, row-level security, WebSockets, Firebase, and compliance-sensitive data.',
  },
  {
    title: 'Production delivery',
    description:
      'Owns architecture, data modeling, polished interfaces, deployment, documentation, and maintenance with AI-assisted engineering workflows.',
  },
]

export const aiCapabilityRibbon = [
  'Custom AI agents',
  'Voice agents',
  'Workflow automation',
  'Custom CRM',
  'n8n',
  'GoHighLevel',
]

export const aiSystemCapabilities = [
  {
    number: '01',
    title: 'Custom AI agents',
    description:
      'Designs goal-aware agents that use tools, structured output, durable context, and explicit guardrails instead of stopping at a chat interface.',
    outcomes: ['Tool calling', 'Multi-agent orchestration', 'Human approval paths'],
    stack: ['OpenAI', 'Anthropic', 'MCP', 'Agent skills'],
  },
  {
    number: '02',
    title: 'Voice agents & reception',
    description:
      'Builds voice workflows for first response, enquiry capture, qualification, booking, live call state, and safe human handoff.',
    outcomes: ['Inbound & outbound calls', 'Calendar booking', 'Call lifecycle evidence'],
    stack: ['Twilio', 'LiveKit', 'GPT Live', 'WebSockets'],
  },
  {
    number: '03',
    title: 'Automation & integrations',
    description:
      'Connects business systems through n8n, signed webhooks, queues, retries, idempotency, reconciliation, and GoHighLevel imports or connectors.',
    outcomes: ['n8n workflows', 'Durable delivery', 'GoHighLevel data flows'],
    stack: ['n8n', 'REST', 'Webhooks', 'PostgreSQL'],
  },
  {
    number: '04',
    title: 'Custom CRM & operations',
    description:
      'Engineers multi-tenant CRM, CRM AI agents, member, retention, campaign, analytics, and operations products around the way a team actually works.',
    outcomes: ['Lead & member lifecycle', 'CRM AI agent workflows', 'Audit-ready operations'],
    stack: ['Next.js', 'React', 'Python', 'Supabase'],
  },
  {
    number: '05',
    title: 'AI modeling & workflow design',
    description: 'Models business context, agent instructions, tool contracts, structured responses, and evaluation scenarios so AI behavior fits a real operational workflow.',
    outcomes: ['Prompt & context modeling', 'Structured response schemas', 'Scenario-based evaluation'],
    stack: ['LLM integration', 'Tool schemas', 'Agent context', 'Evaluations'],
  },
  {
    number: '06',
    title: 'GoHighLevel & n8n workflows',
    description: 'Designs connected CRM workflows and n8n automations, with GoHighLevel contact imports, field mapping, reconciliation, and reliable handoffs between systems.',
    outcomes: ['CRM workflow automation', 'GoHighLevel imports', 'Webhook-driven handoffs'],
    stack: ['GoHighLevel', 'n8n', 'CRM connectors', 'Data mapping'],
  },
]

export const momentumSystems = [
  {
    id: 'alex',
    title: 'Alex — AI Voice Agent',
    type: 'Outbound & inbound AI voice agent',
    categories: ['AI Agents', 'Voice', 'Automation'],
    status: 'Live AI demo',
    statusTone: 'live',
    summary:
      'An AI voice agent that makes evidence-grounded outbound research calls, answers inbound enquiries and books appointments, and powers the live callback demo on hasti.com.au.',
    contribution:
      'Built the self-hosted voice runtime on LiveKit Agents and GPT-Live over Twilio SIP: pre-call website research with grounded opening questions, conservative voicemail detection, a restart-safe five-slot call queue with pause and resume, transfer and recording handling, AI call review where every claim cites the transcript, and follow-up email with reply tracking.',
    stack: ['LiveKit Agents', 'OpenAI GPT-Live', 'Twilio SIP', 'TypeScript', 'PostgreSQL', 'n8n'],
    url: 'https://hasti.com.au/',
    linkLabel: 'Talk to Alex',
    visualLabel: 'Research · Call · Review',
  },
  {
    id: 'hasti',
    title: 'Hasti',
    type: 'AI reception & speed-to-lead',
    categories: ['AI Agents', 'Voice', 'Automation', 'CRM'],
    status: 'Live AI demo',
    statusTone: 'live',
    summary:
      'A lead-response experience combining a live AI receptionist demonstration with enquiry capture, call progress, qualification, routing, and follow-up workflows.',
    contribution:
      'Built the live Alex callback demo — request verification, live call status and captions, hang-up, consent capture, and per-IP rate limits — plus a durable CRM enquiry outbox, consent-gated lead tracking, and first-party visit analytics.',
    stack: ['AI voice', 'LiveKit', 'Python', 'SQLite outbox', 'n8n', 'Stripe'],
    url: 'https://hasti.com.au/',
    linkLabel: 'Try the AI receptionist',
    image: '/projects/hasti.png',
    imageAlt: 'Hasti website showing its AI receptionist experience',
  },
  {
    id: 'zalio',
    title: 'Zalio',
    type: 'Custom CRM & member retention',
    categories: ['CRM', 'Automation', 'Platforms'],
    status: 'Live product site',
    statusTone: 'live',
    summary:
      'A modular gym operations platform spanning CRM, member retention, campaigns, membership workflows, analytics, and connected business tools.',
    contribution:
      'Work across the connected-module platform — Hasti service diagnostics, WhatsApp and Twilio enquiry lanes, an access-isolated internal Control app, marketing alerts, and migration and CI hardening — plus employee status, device sessions, and availability in the Expo mobile app.',
    stack: ['TanStack Start', 'React 19', 'Encore.ts', 'PostgreSQL', 'Expo', 'LiveKit'],
    url: 'https://zalio.ai/',
    image: '/projects/zalio.png',
    imageAlt: 'Zalio product website',
  },
  {
    id: 'zalio-crm',
    title: 'Zalio CRM',
    type: 'Lead inbox, forms & retention module',
    categories: ['CRM', 'Automation', 'Voice'],
    status: 'Private product module',
    statusTone: 'private',
    summary:
      'The CRM module of Zalio: an omnichannel lead inbox, form builder, campaigns, retention hub, browser calling, and calendar bookings for gym teams.',
    contribution:
      'Lead engineer with 2,000+ commits: SMS, WhatsApp, and email inbox with response-time SLA alerts and realtime streams, lead dedupe and merge, replay-safe form webhooks and Meta conversions, retention and reactivation workflows, Twilio browser calling, Google Calendar bookings, and consent-safe intake of Alex voice enquiries.',
    stack: ['Next.js 16', 'React 19', 'PostgreSQL', 'Twilio', 'Google Calendar', 'Playwright'],
    visualLabel: 'Inbox · Forms · Retention',
  },
  {
    id: 'gtm-engine',
    title: 'GTM Engine',
    type: 'Revenue operations & outbound platform',
    categories: ['Automation', 'CRM', 'Voice', 'Analytics'],
    status: 'Private engineering case study',
    statusTone: 'private',
    summary:
      'A multi-instance revenue-operations platform for prospect discovery, ranked worklists, pipelines, email follow-up, and AI-assisted outbound calling.',
    contribution:
      'Built the Alex calling workflow for Hasti: a prospect call drawer, bulk call queues that continue past one page with pause and resume, call review with transcript evidence and recordings, operator-approved follow-up drafts, reply triage, and follow-up status.',
    stack: ['Next.js 16', 'React 19', 'PostgreSQL', 'Better Auth', 'Twilio', 'Anthropic'],
    visualLabel: 'Prospects · Calls · Follow-up',
  },
  {
    id: 'n8n-automation',
    title: 'n8n Automation Layer',
    type: 'Workflow orchestration & integrations',
    categories: ['Automation', 'AI Agents'],
    status: 'Private engineering case study',
    statusTone: 'private',
    summary:
      'n8n workflows connecting the voice backend, CRM, GTM engine, calendar, and email — from research-call dispatch to follow-up delivery and reply tracking.',
    contribution:
      'Research-call workflow with LLM review and citation checks against the transcript, callback-request intake, Gmail follow-up dispatch and reply matching, and calendar booking commands — kept safe with receipt-before-acknowledge, idempotency keys, no automatic retry on writes, lease fencing, and reconciliation.',
    stack: ['n8n', 'Webhooks', 'PostgreSQL', 'Gmail API', 'Google Calendar', 'LLM evaluation'],
    visualLabel: 'Trigger · Verify · Deliver',
  },
  {
    id: 'hasti-client',
    title: 'Hasti Client App',
    type: 'Native iOS & Android client app',
    categories: ['Platforms', 'CRM'],
    status: 'Private client app',
    statusTone: 'private',
    summary:
      'A native app where Hasti customers follow their leads, conversations, appointments, and weekly results, with role-controlled screens for staff.',
    contribution:
      'Shipped 46 pull requests in nine days through release v1.4.0: an Expo Router app, Fastify and PostgreSQL API, push notifications with a weekly results digest, staff sign-in through Zalio CRM, per-service connection diagnostics, and accessibility and brand audits.',
    stack: ['Expo', 'React Native', 'TypeScript', 'Fastify', 'PostgreSQL'],
    visualLabel: 'Leads · Appointments · Results',
  },
  {
    id: 'zalio-ui',
    title: 'Zalio Design System',
    type: 'Component library & docs',
    categories: ['Platforms'],
    status: 'Private engineering case study',
    statusTone: 'private',
    summary:
      "Zalio's shared design system: a component library with a living docs site, theming, motion tokens, and an icon registry used across the web app and CRM.",
    contribution:
      'Built from scratch in two weeks: 120+ primitives and product components on Base UI and Tailwind 4, light, dark, and system theming, token-driven brand color and motion, an accessible docs gallery, and agent-readable UI guidelines.',
    stack: ['TanStack Start', 'Tailwind 4', 'Base UI', 'Vitest'],
    visualLabel: 'Tokens · Components · Docs',
  },
  {
    id: 'gymfactories',
    title: 'GymFactories',
    type: 'Research, planning & RFQ platform',
    categories: ['Platforms', 'Automation'],
    status: 'Live product',
    statusTone: 'live',
    summary:
      'An evidence-led directory and gym-planning product for equipment research, manufacturer discovery, space planning, and supplier enquiries.',
    contribution:
      'Search-oriented product architecture, evidence tiers, enquiry workflows, media delivery, and scalable supplier content.',
    stack: ['TanStack Start', 'React 19', 'PostgreSQL', 'Better Auth'],
    url: 'https://gymfactories.com/',
    image: '/projects/gymfactories.png',
    imageAlt: 'GymFactories equipment research and gym planning website',
  },
  {
    id: 'momentum-strength',
    title: 'Momentum Strength',
    type: 'Commerce & 3D product experience',
    categories: ['Platforms'],
    status: 'Live product demo',
    statusTone: 'live',
    summary:
      'A commercial gym-equipment experience that combines product discovery with an interactive 3D configuration direction.',
    contribution:
      'Responsive product presentation, modern commerce UX, and visualization-oriented frontend architecture.',
    stack: ['React', 'TypeScript', '3D product UX', 'Vercel'],
    url: 'https://momentum-strength.vercel.app/',
    image: '/projects/momentum-strength.png',
    imageAlt: 'Momentum Strength commercial gym equipment website',
  },
  {
    id: 'hsie-site-scoring',
    title: 'HSIE Site Scoring',
    type: 'Property intelligence prototype',
    categories: ['Analytics', 'Platforms'],
    status: 'Live prototype',
    statusTone: 'prototype',
    summary:
      'A structured property and acquisition scoring workspace covering site quality, red flags, location context, and evidence-backed review.',
    contribution:
      'Decision-support modeling, external map and place data, scoring workflows, and operator-friendly review interfaces.',
    stack: ['React', 'TypeScript', 'Maps', 'Spatial data'],
    url: 'https://health-dev-three.vercel.app/',
    image: '/projects/hsie.png',
    imageAlt: 'HSIE manual property site scoring prototype',
  },
  {
    id: 'gym-analytics',
    title: 'Gym Analytics & Retention',
    type: 'Data platform & decision support',
    categories: ['Analytics', 'CRM', 'Automation'],
    status: 'Private product system',
    statusTone: 'private',
    summary:
      'A first-party analytics layer for member, revenue, attendance, product, class, and retention-risk workflows.',
    contribution:
      'Source synchronization, KPI fact modeling, durable jobs, reconciliation, risk views, and actionable dashboards.',
    stack: ['Next.js 16', 'React 19', 'Supabase', 'Python', 'Recharts'],
    visualLabel: 'Sync · Model · Insights',
  },
  {
    id: 'agent-operations',
    title: 'Agent & Platform Operations',
    type: 'AI orchestration & control plane',
    categories: ['AI Agents', 'Platforms'],
    status: 'Private engineering case study',
    statusTone: 'private',
    summary:
      'Operational tooling for governed agent teams, persistent engineering sessions, signed fleet observations, incidents, and service health.',
    contribution:
      'Agent goals and budgets, durable sessions, evidence timelines, alert grouping, access controls, and platform observability.',
    stack: ['AI agents', 'Node.js', 'PostgreSQL', 'WebSockets', 'Linux'],
    visualLabel: 'Agents · Sessions · Evidence',
  },
]

export const momentumEngineeringGroups = [
  {
    title: 'AI & voice systems',
    description: 'Inbound and outbound voice runtimes, agent orchestration, command-centre tooling, and agent operations dashboards.',
  },
  {
    title: 'Revenue & customer operations',
    description: 'Lead response, GTM workflows, signup handoff, campaigns, CRM forms, marketing modules, and consent-aware follow-up.',
  },
  {
    title: 'Gym products & data',
    description: 'CRM, members, training, project management, retention analytics, reporting, and connected operational modules.',
  },
  {
    title: 'Platform & delivery',
    description: 'Control-plane monitoring, persistent sessions, uptime, shared UI systems, websites, prototypes, and delivery templates.',
  },
]

export const experiences = [
  {
    role: 'AI Full-Stack Engineer',
    company: 'Zalio · Momentum',
    location: 'Australia · Remote',
    period: 'Jun 2026 – Present',
    featured: true,
    summary:
      "Building Zalio's gym CRM and operations platform, the Alex AI voice agent, and Hasti's AI reception and lead-response products across web, mobile, voice, and automation.",
    achievements: [
      'Lead engineer on the Zalio CRM module with 2,000+ commits: omnichannel lead inbox with SLA alerts, forms, campaigns, retention workflows, and Twilio browser calling.',
      'Built Alex, a self-hosted AI voice agent on LiveKit and GPT-Live over Twilio SIP, with evidence-grounded research calls, voicemail detection, a restart-safe call queue, and cited AI call reviews.',
      'Designed n8n integrations with durable receipts, idempotency keys, and reconciliation linking the voice backend, CRM, GTM engine, calendar, and email.',
      'Shipped the Hasti Client iOS and Android app (Expo, Fastify, PostgreSQL) in 46 pull requests over nine days, and the live Alex demo on hasti.com.au.',
      "Built the bulk Alex calling workflow in the GTM engine, Zalio's design system, and employee features in the Expo mobile app.",
      'Delivered revenue, retention, profiling, and win-back dashboards with Next.js 16, React 19, TypeScript, and TanStack Query.',
      'Designed bidirectional Python CRM synchronization using Celery, Redis, durable Postgres jobs, leases, idempotency keys, bounded retries, and recovery workflows.',
      'Led member, contract, visit, and payment-history migration with automated reconciliation against source-of-truth financial reports.',
      'Ship daily with Claude Code using repo-level instructions, custom agents, skills, and GitHub, Linear, and Supabase MCP integrations.',
    ],
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'Encore.ts', 'PostgreSQL', 'LiveKit', 'Twilio', 'n8n', 'Expo', 'Python'],
    links: [
      { label: 'zalio.ai', url: 'https://zalio.ai/' },
      { label: 'hasti.com.au — live Alex demo', url: 'https://hasti.com.au/' },
    ],
  },
  {
    role: 'Full-Stack Developer',
    company: 'Rooche Digital Company',
    location: 'Remote',
    period: 'Jan 2026 – Mar 2026',
    summary:
      'Delivered client dashboards, web applications, and documented backend services across modern JavaScript and Python stacks.',
    achievements: [
      'Built FastAPI microservices with Pydantic validation and OpenAPI-documented REST contracts, plus GraphQL endpoints.',
      'Integrated Firebase and Supabase for authentication, row-level security, and real-time multi-user sync.',
      'Maintained GitLab, Buddy, and Bitbucket CI/CD with preview deploys and pytest quality gates.',
    ],
    stack: ['Python', 'FastAPI', 'Node.js', 'React', 'Next.js', 'Angular', 'PostgreSQL', 'Docker'],
  },
  {
    role: 'Full-Stack Developer',
    company: 'Australian Fintech · Lending Platform',
    location: 'Australia · Remote',
    period: 'Jan 2024 – Dec 2025',
    summary:
      'Modernized services and integrations for a regulated Australian personal-loan platform.',
    achievements: [
      'Re-platformed Golang and Node.js microservices to .NET, standardizing logging, error handling, and deployment.',
      'Built Python and .NET AWS Lambda functions for event-driven partner banking and lending workflows.',
      'Owned JSON-RPC, WebSocket, and webhook integrations plus Python reconciliation and reporting automation.',
    ],
    stack: ['C# / .NET', 'Python', 'Go', 'Node.js', 'AWS Lambda', 'PostgreSQL', 'Buddy CI/CD'],
  },
  {
    role: 'Full-Stack Developer',
    company: 'MOIST Alumni Online Tracking System',
    location: 'Balingasag, Philippines',
    period: 'Jan 2025 - Aug 2025',
    summary: 'Created a secure records platform for alumni registration, profile management, and administrative reporting.',
    achievements: [
      'Implemented role-based access control and auditable administrative workflows.',
      'Added OTP/2FA verification over SMS and email for sensitive account actions.',
      'Centralized alumni records and reporting in a maintainable relational data model.',
    ],
    stack: ['PHP', 'Laravel', 'MySQL', 'JavaScript', 'RBAC', 'OTP / 2FA'],
  },
  {
    role: 'Full-Stack Developer',
    company: 'Filtra Coffee POS System',
    location: 'Project engagement',
    period: 'Jun 2023 — Dec 2023',
    summary: 'Built a production point-of-sale workflow used by store staff for daily sales, payments, stock control, and reporting.',
    achievements: [
      'Delivered sales, payment, inventory, and reporting modules around one operational workflow.',
      'Built the backend in Go with web interfaces across Next.js and Vue.',
      'Containerized the application for repeatable deployment and maintenance.',
    ],
    stack: ['Go', 'Next.js', 'Vue.js', 'PostgreSQL', 'Docker'],
  },
  {
    role: 'Full-Stack Developer',
    company: 'Librewry Bistro POS System',
    location: 'Project engagement',
    period: 'Aug 2022 — Dec 2022',
    summary: 'Developed a role-aware café POS for orders, inventory, and sales reporting.',
    achievements: [
      'Designed order and inventory workflows for day-to-day café operations.',
      'Added sales analytics and role-based access for staff and administrators.',
      'Built the application with a straightforward PHP and MySQL deployment model.',
    ],
    stack: ['PHP', 'MySQL', 'JavaScript', 'HTML', 'CSS'],
  },
  {
    role: 'Full-Stack Developer',
    company: 'E-Cycle Hub',
    location: 'Project engagement',
    period: 'Mar 2022 — Jul 2022',
    summary: 'Built a waste-pickup scheduling platform connecting user requests, collection workflows, and live status updates.',
    achievements: [
      'Implemented waste categorization, pickup scheduling, and account workflows.',
      'Used WebSockets and webhooks to keep collection status current across clients.',
      'Deployed a Go API backed by Neon serverless Postgres.',
    ],
    stack: ['Go', 'Next.js', 'Vue.js', 'WebSockets', 'Webhooks', 'Neon Postgres'],
    links: [{ label: 'ecyclehub.vercel.app', url: 'https://ecyclehub.vercel.app/' }],
  },
  {
    role: 'Mobile Developer',
    company: 'Jolly Ride App',
    location: 'Cross-platform project',
    period: 'Oct 2021 — Feb 2022',
    summary: 'Shipped a cross-platform ride-booking experience with live data, booking, and communication workflows.',
    achievements: [
      'Built booking and real-time interaction flows for iOS and Android.',
      'Connected authentication and live application data through Supabase.',
      'Designed mobile-first states for active trips, scheduling, and messaging.',
    ],
    stack: ['React Native', 'Supabase', 'JavaScript', 'iOS', 'Android'],
  },
  {
    role: 'Mobile Developer',
    company: 'Massage Booking App',
    location: 'Android project',
    period: 'May 2021 — Sep 2021',
    summary: 'Developed a native Android scheduling app for discovering and booking massage services.',
    achievements: [
      'Created service scheduling and booking flows for mobile users.',
      'Integrated Firebase authentication, messaging, and real-time data.',
      'Built native Android interfaces with Java and Kotlin tooling.',
    ],
    stack: ['Android', 'Java', 'Kotlin', 'Firebase'],
  },
  {
    role: 'Full-Stack Developer',
    company: 'Personal Portfolio Website',
    location: 'Independent project',
    period: 'Jan 2021 — Apr 2021',
    summary: 'Designed and shipped an early responsive portfolio with SEO foundations and continuous deployment.',
    achievements: [
      'Built responsive project and profile views with React and Next.js.',
      'Added metadata and page structure for search visibility.',
      'Connected GitHub-based continuous deployment on Vercel.',
    ],
    stack: ['React', 'Next.js', 'Tailwind CSS', 'Vercel'],
  },
]

export const featuredProjects = [
  {
    id: 'one-ride-balingasag',
    categories: ['Mobile', 'Full Stack', 'Backend', 'API'],
    title: 'One Ride Balingasag (OMJI)',
    eyebrow: 'Started Apr 2026 · Live on Google Play · Balingasag',
    overview: 'A unified ride-hailing, delivery, pickup, and local-store platform built for everyday transport and errands in Balingasag.',
    context: 'Passengers, riders, families, and local stores need one service for transport, parcel delivery, scheduled pickup, and local shopping.',
    implementation: 'React Native mobile delivery backed by a Go and Gin API, PostgreSQL data, real-time WebSocket tracking, maps, plus React web and admin clients.',
    architecture: ['React Native + Expo', 'React + TypeScript web', 'Go + Gin API', 'PostgreSQL + GORM', 'JWT authentication', 'Maps + WebSockets'],
    features: ['Pasugo delivery', 'Pasabay motorcycle rides', 'Pasundo scheduled pickup', 'Local store delivery', 'Live tracking and fare estimates', 'Rider, store, and admin operations'],
    engineering: 'OTP and JWT authentication, distance-based fares, scheduled and recurring bookings, real-time rider tracking, multiple payment methods, ratings, SOS, and operational dashboards.',
    delivered: 'A live Google Play customer app supported by rider, store, web, and administrative workflows for the Balingasag service area.',
    stack: ['React Native', 'Expo', 'TypeScript', 'Go', 'Gin', 'PostgreSQL', 'GORM', 'WebSockets'],
    url: 'https://play.google.com/store/apps/details?id=com.oneridebalingasag.app&hl=en',
    private: true,
  },
  {
    id: 'omji-billing',
    categories: ['SaaS', 'Backend', 'Full Stack', 'API'],
    title: 'OMJI Internet Access & Billing System',
    eyebrow: 'Apr–Jun 2026 · Internet access and billing',
    overview: 'A web-based operations system for internet cafés, hotspots, and small ISPs combining prepaid access, billing, network control, and reporting.',
    context: 'Small internet operators need a practical way to manage timed access, vouchers, customer sessions, connected stations, and daily revenue.',
    implementation: 'TypeScript and Go services with web, mobile, and endpoint-agent clients, MikroTik RouterOS integration, and Docker-based deployment.',
    architecture: ['TypeScript services', 'Go services', 'Web + mobile clients', 'Endpoint agent', 'MikroTik RouterOS', 'Docker Compose'],
    features: ['Time-based prepaid billing', 'Voucher generation', 'Multi-station management', 'Revenue reports and analytics', 'MikroTik access control', 'Tablet-ready administration'],
    engineering: 'Usage-ledger billing, plan changes, voucher workflows, per-account permissions, network integration, database migrations, and repeatable container deployment.',
    delivered: 'A private operational platform covering access control, billing, reporting, administration, and multi-branch network support.',
    stack: ['TypeScript', 'Go', 'React', 'Docker', 'MikroTik RouterOS', 'Web + mobile'],
    private: true,
  },
  {
    id: 'fitness-crm',
    categories: ['AI', 'SaaS', 'Backend', 'Full Stack', 'API', 'CRM'],
    title: 'Enterprise CRM Platform',
    eyebrow: '2026 – Present · Australian client · Enterprise CRM platform',
    overview: 'An enterprise CRM platform for an Australian client, unifying member data, subscriptions, payments, visits, retention, and browser-based calling.',
    context: 'An Australian client needed one dependable workflow for member operations, outreach, and financial history.',
    implementation: 'Next.js dashboards backed by bidirectional CRM synchronization, durable jobs, retries, and reconciliation.',
    architecture: ['Next.js dashboards', 'Supabase Postgres', 'Python sync workers', 'Celery + Redis', 'CRM REST + webhooks', 'Twilio Voice'],
    features: ['Revenue and retention dashboards', 'Member profiling', 'Win-back workflows', 'Embedded browser calling'],
    engineering: 'Idempotent sync, bounded retries, leases, zombie-run recovery, and source-of-truth financial reconciliation.',
    delivered: 'One system for member records, subscriptions, payments, visits, outreach, and retention workflows.',
    stack: ['Next.js', 'TypeScript', 'Python', 'Celery', 'Postgres', 'Twilio'],
    private: true,
  },
  {
    id: 'fintech-lending',
    categories: ['Backend', 'API', 'Fintech'],
    title: 'Fintech Lending Platform Modernization',
    eyebrow: 'Jan 2024 – Dec 2025 · Regulated fintech · Australia',
    overview: 'Regulated platform migration spanning Go and Node.js services, .NET standardization, AWS Lambda workflows, and partner-system integrations.',
    context: 'A major data and platform migration for a regulated Australian fintech product.',
    implementation: 'Re-platformed Go and Node.js services to .NET and built AWS Lambda workflows for third-party integrations.',
    architecture: ['.NET services', 'AWS Lambda', 'Partner APIs', 'JSON-RPC', 'WebSockets', 'PostgreSQL'],
    features: ['Partner feed processing', 'Reconciliation automation', 'Event-driven workflows', 'Staged CI/CD'],
    engineering: 'JSON-RPC, WebSocket, webhook, partner-feed, email-parsing, reconciliation, and reporting workflows.',
    delivered: 'Standardized logging, error handling, automated testing, staged deployments, and rollback support.',
    stack: ['.NET', 'Go', 'Node.js', 'AWS Lambda', 'PostgreSQL'],
    private: true,
  },
  {
    id: 'moist-alumni',
    categories: ['SaaS', 'Full Stack'],
    title: 'MOIST Alumni Tracking System',
    eyebrow: 'Jan-Aug 2025 · Secure records platform',
    overview: 'A secure alumni registration, profile, records, and administrative reporting platform.',
    context: 'The institution needed one maintainable system for verified alumni records and administrative reporting.',
    implementation: 'Laravel and MySQL application with role-aware administrative workflows and SMS/email account verification.',
    architecture: ['Laravel application', 'MySQL', 'RBAC', 'Audit trail', 'SMS + email OTP'],
    features: ['Alumni profiles', 'Administrative dashboard', 'Reporting and analytics', 'OTP/2FA'],
    engineering: 'Role-based access, audit trails, relational data modeling, analytics, and OTP/2FA over SMS and email.',
    delivered: 'A centralized system for alumni records, secure account actions, and administrative reporting.',
    stack: ['Laravel', 'MySQL', 'JavaScript', 'RBAC', 'OTP / 2FA'],
    private: true,
  },
  {
    id: 'filtra-pos',
    categories: ['SaaS', 'Backend', 'Full Stack'],
    title: 'Filtra Coffee POS',
    eyebrow: 'Production point of sale',
    overview: 'A daily-use POS covering sales, payments, inventory, and reporting with containerized deployment.',
    context: 'A production point-of-sale platform used daily by store staff.',
    implementation: 'Go backend with Next.js and Vue interfaces, PostgreSQL data, and Dockerized deployment.',
    architecture: ['Next.js / Vue clients', 'Go API', 'PostgreSQL', 'Docker deployment'],
    features: ['Checkout flow', 'Payments', 'Inventory tracking', 'Sales reporting'],
    engineering: 'Sales, payments, inventory, reporting, and repeatable deployment.',
    delivered: 'The operating workflow used by store staff for day-to-day point-of-sale work.',
    stack: ['Go', 'Next.js', 'Vue', 'PostgreSQL', 'Docker'],
    private: true,
  },
  {
    id: 'ecycle-hub',
    categories: ['Backend', 'Full Stack', 'API'],
    title: 'E-Cycle Hub',
    eyebrow: 'Waste-pickup scheduling platform',
    overview: 'Waste-pickup scheduling with real-time updates, webhook integrations, and a Go API on serverless Postgres.',
    context: 'A waste-pickup scheduling product with user registration and waste categorization.',
    implementation: 'Go backend on Neon serverless Postgres with responsive web clients and real-time updates.',
    architecture: ['Responsive web client', 'Go API', 'WebSockets', 'Webhooks', 'Neon Postgres'],
    features: ['Waste categorization', 'Pickup scheduling', 'Live collection status', 'Account management'],
    engineering: 'Pickup scheduling, REST APIs, WebSockets, webhooks, and collection status updates.',
    delivered: 'A working responsive web application for scheduling and tracking waste collection.',
    stack: ['Go', 'Next.js', 'Vue', 'WebSockets', 'Neon'],
    url: 'https://ecyclehub.vercel.app/',
  },
  {
    id: 'mobile-booking',
    categories: ['Mobile', 'Full Stack'],
    title: 'Jolly Ride & Massage Booking Apps',
    eyebrow: 'Cross-platform mobile products',
    overview: 'React Native and native Android booking experiences with Firebase authentication, real-time data, and push notifications.',
    context: 'Two scheduling and booking applications for ride and massage services.',
    implementation: 'React Native for cross-platform delivery and native Android development with Java and Kotlin.',
    architecture: ['React Native app', 'Native Android app', 'Firebase / Supabase', 'Real-time data', 'Push notifications'],
    features: ['Booking and scheduling', 'Authentication', 'Messaging', 'Live status updates'],
    engineering: 'Firebase and Supabase authentication, real-time data, messaging, and push notifications.',
    delivered: 'Ride booking across iOS and Android plus a native Android massage booking application.',
    stack: ['React Native', 'Android', 'Java / Kotlin', 'Firebase'],
    private: true,
  },
]

export const projectArchive = [
  { title: 'Luxury Construction Utah', type: 'Client website', categories: ['Full Stack'], description: 'Responsive construction company website with service showcases and contact integration.', stack: ['React', 'Tailwind CSS'], status: 'Archived site' },
  { title: 'G2 POS System', type: 'Full-stack product', categories: ['SaaS', 'Backend', 'Full Stack'], description: 'Point-of-sale dashboard for order processing, sales tracking, inventory, and operational reporting.', stack: ['Go', 'Next.js', 'PostgreSQL', 'Docker'], url: 'https://g2possystem.vercel.app/landing' },
  { title: 'ReflectiCSS', type: 'Developer tool', categories: ['Full Stack'], description: 'Interactive interface for exploring and generating CSS styles.', stack: ['React', 'CSS', 'JavaScript'], url: 'https://reflecticss.vercel.app/' },
  { title: 'Study Pulse', type: 'Learning product', categories: ['Full Stack'], description: 'Study planning and progress-tracking experience for organizing sessions and reviewing performance.', stack: ['React', 'Tailwind CSS', 'JavaScript'], url: 'https://study-pulse-ten.vercel.app/' },
  { title: 'Shayne & DR', type: 'Client website', categories: ['Full Stack'], description: 'Custom client website with responsive layout and modern UI presentation.', stack: ['HTML', 'CSS', 'JavaScript'], url: 'https://shayneanddr.netlify.app/' },
  { title: 'Vince Lloyd Portfolio', type: 'Client portfolio', categories: ['Full Stack'], description: 'Professional portfolio designed to present a client’s work and profile across device sizes.', stack: ['HTML', 'CSS', 'JavaScript'], url: 'https://vincelloyd.netlify.app/' },
  { title: 'Laarni Portfolio', type: 'Client portfolio', categories: ['Full Stack'], description: 'Clean, responsive personal portfolio centered on readable content and accessible navigation.', stack: ['HTML', 'CSS', 'JavaScript'], url: 'https://laarni.netlify.app/' },
  { title: 'Librewry Bistro POS', type: 'Operations product', categories: ['SaaS', 'Full Stack'], description: 'Café POS for order management, inventory tracking, sales analytics, and role-aware access.', stack: ['PHP', 'MySQL', 'JavaScript'], private: true },
  { title: 'Advanced E-commerce Traffic Filtering System', type: 'Security prototype', categories: ['Security', 'Backend'], description: 'Layered traffic-filtering prototype to identify suspicious automated requests using Cloudflare WAF rules, IP/ASN analysis, bot detection, and managed challenges, reducing false positives while preserving legitimate traffic and conversions.', stack: ['Cloudflare WAF', 'Bot detection', 'IP / ASN analysis', 'Managed challenges'], period: 'May–Jul 2026', personal: true, status: 'Personal project · May–Jul 2026' },
  { title: 'AI-Powered Bot Traffic Detection', type: 'AI / ML security', categories: ['AI', 'Security'], description: 'Python anomaly-detection analysis of web traffic logs covering request frequency, user-agent patterns, and unusual browsing behaviour, with generated detection reports.', stack: ['Python', 'Anomaly detection', 'Traffic log analysis'], period: 'May–Jul 2026', personal: true, status: 'Personal project · May–Jul 2026' },
  { title: 'Web Security Monitoring Dashboard', type: 'Security tooling', categories: ['Security', 'Full Stack'], description: 'Monitors suspicious requests, IP addresses, and traffic patterns with alerting workflows and documented test scenarios to measure detection accuracy.', stack: ['Monitoring', 'Alerting', 'Traffic analysis'], period: 'May–Jul 2026', personal: true, status: 'Personal project · May–Jul 2026' },
  { title: 'Shopify & Cloudflare anti-bot development', type: 'E-commerce security', categories: ['Security', 'Full Stack'], description: 'Custom Shopify solutions and Cloudflare-based anti-bot protections for e-commerce storefronts.', stack: ['Shopify', 'Cloudflare', 'Anti-bot'], period: 'May–Jul 2026', personal: true, status: 'Personal project · May–Jul 2026' },
]

export const projectCategories = ['All', 'AI', 'SaaS', 'Backend', 'Full Stack', 'Mobile', 'API', 'Fintech', 'CRM', 'Security']

export const skillGroups = [
  {
    title: 'AI & automation',
    skills: ['Claude Code', 'OpenAI API', 'Claude API', 'LLM tool calling', 'Streaming', 'Structured output', 'Prompt & agent instruction design', 'Custom agents', 'Skills', 'MCP servers'],
  },
  {
    title: 'Backend & APIs',
    skills: ['Python', 'FastAPI', 'Django', 'Flask', 'Celery', 'Node.js / Express', 'C# / .NET', 'Go', 'PHP / Laravel', 'REST', 'GraphQL', 'JSON-RPC', 'OpenAPI', 'WebSockets', 'Webhooks'],
  },
  {
    title: 'Frontend',
    skills: ['React 19', 'Next.js 16', 'TypeScript', 'TanStack Query', 'Zustand', 'Tailwind CSS', 'shadcn/ui', 'Vue.js', 'Angular'],
  },
  {
    title: 'Mobile & real time',
    skills: ['React Native', 'Android', 'Java', 'Kotlin', 'Firebase Auth', 'Firebase real-time data', 'Push notifications', 'Offline-tolerant sync'],
  },
  {
    title: 'Data & infrastructure',
    skills: ['PostgreSQL', 'Supabase', 'Neon', 'MySQL', 'Firebase', 'Redis', 'Docker', 'Linux VPS', 'AWS Lambda', 'GitLab CI', 'Buddy CI/CD', 'Jenkins', 'Vercel'],
  },
  {
    title: 'Systems & integrations',
    skills: ['CRM REST APIs', 'CRM webhook sync', 'Twilio Voice', 'Bidirectional sync', 'Durable job queues', 'Payment reconciliation', 'RBAC', 'Audit trails', 'OTP / 2FA', 'Row-level security'],
  },
]

export const education = {
  institution: 'Misamis Oriental Institute of Science and Technology',
  degree: 'Bachelor of Science in Information Technology',
  period: '2022 — 2026',
  details: "Dean's Lister, 2nd and 3rd Year (Ranked 2) · TOPCIT participant (2024–2025)",
}

export const certifications = [
  {
    title: 'Model Context Protocol: Advanced Topics',
    issuer: 'Anthropic',
    kind: 'Certificate of completion',
    issued: 'Jul 2026',
    credentialId: 'azpzwuk5gowu',
    category: 'AI & Anthropic',
  },
  {
    title: 'Introduction to Agent Skills',
    issuer: 'Anthropic',
    kind: 'Certificate of completion',
    issued: 'Jul 2026',
    credentialId: 'b5ozvc7uj6zp',
    category: 'AI & Anthropic',
  },
  {
    title: 'AI Fluency for Builders',
    issuer: 'Anthropic',
    kind: 'Certificate of completion',
    issued: 'Jul 2026',
    credentialId: 't3ezfyy5es9o',
    category: 'AI & Anthropic',
  },
  {
    title: 'Introduction to Model Context Protocol',
    issuer: 'Anthropic',
    kind: 'Certificate of completion',
    issued: 'Jul 2026',
    credentialId: 'xy5k5u4b47qi',
    category: 'AI & Anthropic',
    image: '/certificates/introduction-model-context-protocol.webp',
    thumb: '/certificates/introduction-model-context-protocol-thumb.webp',
  },
  {
    title: 'AI Capabilities and Limitations',
    issuer: 'Anthropic',
    kind: 'Certificate of completion',
    issued: 'Jul 2026',
    credentialId: 'sghsdrqu8hzj',
    category: 'AI & Anthropic',
  },
  {
    title: 'Claude Code in Action',
    issuer: 'Anthropic',
    kind: 'Certificate of completion',
    issued: 'Jul 2026',
    credentialId: '7jbexrv7sqo8',
    category: 'AI & Anthropic',
  },
  {
    title: 'Introduction to Subagents',
    issuer: 'Anthropic',
    kind: 'Certificate of completion',
    issued: 'Jul 2026',
    credentialId: 'bwdbd3vvajkh',
    category: 'AI & Anthropic',
  },
  {
    title: 'Teaching the AI Fluency Framework',
    issuer: 'Anthropic',
    kind: 'Certificate of completion',
    issued: 'Jul 2026',
    credentialId: 'fbvhx43hfmj4',
    category: 'AI & Anthropic',
    image: '/certificates/teaching-ai-fluency-framework.webp',
    thumb: '/certificates/teaching-ai-fluency-framework-thumb.webp',
  },
  {
    title: 'Claude 101',
    issuer: 'Anthropic',
    kind: 'Certificate of completion',
    issued: 'Jul 2026',
    credentialId: '8smsowpqtnzg',
    category: 'AI & Anthropic',
    image: '/certificates/claude-101.webp',
    thumb: '/certificates/claude-101-thumb.webp',
  },
  {
    title: 'Building with the Claude API',
    issuer: 'Anthropic',
    kind: 'Certificate of completion',
    issued: 'Jul 2026',
    credentialId: 'kwaq247cry7d',
    category: 'AI & Anthropic',
    image: '/certificates/claude-anthropic-api.webp',
    thumb: '/certificates/claude-anthropic-api-thumb.webp',
  },
  {
    title: 'AI Fluency: Framework & Foundations',
    issuer: 'Anthropic',
    kind: 'Certificate of completion',
    issued: 'Jul 2026',
    credentialId: 'uzgqztbht6ax',
    category: 'AI & Anthropic',
    image: '/certificates/ai-fluency-framework-foundations.webp',
    thumb: '/certificates/ai-fluency-framework-foundations-thumb.webp',
  },
  {
    title: 'Java SE 8 Programmer I',
    issuer: 'Java Developer',
    kind: 'Professional credential',
    issued: 'Jul 2024',
    expires: 'Dec 2035',
    category: 'Technical & professional',
  },
  {
    title: 'Go Programming',
    issuer: 'CS50',
    kind: 'Programming credential',
    issued: 'Jul 2024',
    expires: 'Feb 2034',
    category: 'Technical & professional',
  },
  {
    title: 'Programming in HTML5 with JavaScript and CSS3',
    issuer: 'Codemy',
    kind: 'Programming credential',
    issued: 'May 2025',
    expires: 'Dec 2032',
    category: 'Technical & professional',
  },
  {
    title: 'Full-Stack Web Development Certification',
    issuer: 'Codemy',
    kind: 'Professional credential',
    issued: 'Apr 2025',
    expired: 'Jul 2025',
    category: 'Technical & professional',
  },
  { title: 'Databases with SQL', issuer: 'Harvard CS50', kind: 'Certificate' },
  { title: 'Manage AD DS Domain Controllers & FSMO Roles', issuer: 'Microsoft', kind: 'Certificate' },
  { title: 'Windows Server 2012 Training', issuer: 'ITFreeTraining', kind: 'Technical training' },
  { title: 'Active Directory', issuer: 'ITFreeTraining', kind: 'Technical training' },
  { title: 'MongoDB Database Training', issuer: 'MongoDB', kind: 'Technical training' },
  { title: 'PHP for Web Development', issuer: 'CodeMy', kind: 'Technical training' },
  { title: 'JavaScript Programming', issuer: 'Bro Code', kind: 'Technical training' },
  { title: 'HTML and CSS', issuer: 'Telugu', kind: 'Technical training' },
]

export const recognitions = [
  { title: "Dean's Lister — 2nd and 3rd Year, Ranked 2", issuer: 'MOIST', kind: 'Academic recognition' },
  { title: 'TOPCIT — Test of Practical Competency in IT', issuer: 'TOPCIT', kind: '2024–2025 participant' },
]

export const liveLinks = [
  { id: 'alex-demo', title: 'Alex — AI Voice Agent demo', url: 'https://hasti.com.au/', label: 'Talk to Alex', kind: 'AI voice demo', description: 'Request a callback and talk to the live AI voice agent (LiveKit + GPT-Live over Twilio SIP).' },
  { id: 'hasti', title: 'Hasti — AI reception & speed-to-lead', url: 'https://hasti.com.au/', label: 'Visit hasti.com.au', kind: 'Product', description: 'A lead-response experience combining a live AI receptionist demonstration with enquiry capture, qualification, routing, and follow-up workflows.' },
  { id: 'zalio', title: 'Zalio — gym CRM & operations platform', url: 'https://zalio.ai/', label: 'Visit zalio.ai', kind: 'Product', description: 'A modular gym operations platform spanning CRM, member retention, campaigns, membership workflows, and analytics.' },
  { id: 'gymfactories', title: 'Gym Factories', url: 'https://gymfactories.com/', label: 'Visit gymfactories.com', kind: 'Product', description: 'An evidence-led directory and gym-planning product for equipment research, manufacturer discovery, space planning, and supplier enquiries.' },
  { id: 'momentum-strength', title: 'Momentum Strength', url: 'https://momentum-strength.vercel.app/', label: 'Open Momentum Strength', kind: 'Web app', description: 'A commercial gym-equipment experience that combines product discovery with an interactive 3D configuration direction.' },
  { id: 'hsie', title: 'HSIE Site Scoring', url: 'https://health-dev-three.vercel.app/', label: 'Open HSIE Site Scoring', kind: 'Web app', description: 'A structured property and acquisition scoring workspace covering site quality, red flags, and evidence-backed review.' },
  { id: 'omji', title: 'One Ride Balingasag (OMJI)', url: 'https://play.google.com/store/apps/details?id=com.oneridebalingasag.app&hl=en', label: 'Get it on Google Play', kind: 'Mobile app', description: 'A unified ride-hailing, delivery, pickup, and local-store platform built for everyday transport and errands in Balingasag.' },
  { id: 'ecycle', title: 'E-Cycle Hub', url: 'https://ecyclehub.vercel.app/', label: 'Open E-Cycle Hub', kind: 'Web app', description: 'Waste-pickup scheduling with real-time updates, webhook integrations, and a Go API on serverless Postgres.' },
  { id: 'g2-pos', title: 'G2 POS System', url: 'https://g2possystem.vercel.app/landing', label: 'Open G2 POS', kind: 'Web app', description: 'Point-of-sale dashboard for order processing, sales tracking, inventory, and operational reporting.' },
  { id: 'reflecticss', title: 'ReflectiCSS', url: 'https://reflecticss.vercel.app/', label: 'Open ReflectiCSS', kind: 'Web app', description: 'Interactive interface for exploring and generating CSS styles.' },
  { id: 'study-pulse', title: 'Study Pulse', url: 'https://study-pulse-ten.vercel.app/', label: 'Open Study Pulse', kind: 'Web app', description: 'Study planning and progress-tracking experience for organizing sessions and reviewing performance.' },
  { id: 'shayne-dr', title: 'Shayne & DR', url: 'https://shayneanddr.netlify.app/', label: 'Visit site', kind: 'Client site', description: 'Custom client website with responsive layout and modern UI presentation.' },
  { id: 'vince-lloyd', title: 'Vince Lloyd Portfolio', url: 'https://vincelloyd.netlify.app/', label: 'Visit site', kind: 'Client site', description: 'Professional portfolio presenting a client’s work and profile across device sizes.' },
  { id: 'laarni', title: 'Laarni Portfolio', url: 'https://laarni.netlify.app/', label: 'Visit site', kind: 'Client site', description: 'Clean, responsive personal portfolio centered on readable content and accessible navigation.' },
]

export const voiceCallFlow = {
  title: 'Anatomy of a real Alex call',
  note: 'Signalling timeline from a real outbound test call, with phone numbers, IP addresses and credentials removed.',
  parties: ['Alex (LiveKit SIP)', 'Twilio SIP trunk', 'Phone network'],
  steps: [
    { t: '0.0 s', from: 0, to: 1, label: 'INVITE', detail: 'Alex offers G.722 HD, PCMU and PCMA audio' },
    { t: '0.0 s', from: 1, to: 0, label: '100 Trying', detail: 'Twilio accepts the call for routing' },
    { t: '5.3 s', from: 1, to: 0, label: '180 Ringing', detail: 'The callee’s phone is ringing' },
    { t: '15.3 s', from: 1, to: 0, label: '200 OK', detail: 'Answered — PCMU (G.711) negotiated' },
    { t: '15.7 s', from: 0, to: 1, label: 'ACK', detail: 'Media starts; Alex opens with a researched question' },
    { t: '15.7–100 s', from: 0, to: 2, label: 'Conversation', detail: '~84 s live AI conversation, transcribed and reviewed after the call' },
    { t: '100.0 s', from: 2, to: 0, label: 'BYE', detail: 'Callee hangs up; Alex closes its leg and logs the outcome' },
  ],
  stats: [
    { value: '15.3 s', label: 'ring to answer' },
    { value: '~84 s', label: 'AI conversation' },
    { value: 'G.722 → G.711', label: 'codec negotiation' },
  ],
}
