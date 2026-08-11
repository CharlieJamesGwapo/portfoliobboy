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
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Credentials', href: '#education' },
  { label: 'Interactive Lab', href: '#lab' },
  { label: 'Contact', href: '#contact' },
]

export const proofPoints = [
  { value: '15+', label: 'Genuine products and client builds', numericValue: 15, suffix: '+' },
  { value: '2+', label: 'Years shipping production software', numericValue: 2, suffix: '+' },
  { value: '25', label: 'Verified credentials and recognitions', numericValue: 25, suffix: '' },
  { value: '8', label: 'Playable creative-code experiments', numericValue: 8, suffix: '' },
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

export const experiences = [
  {
    role: 'AI Full-Stack Developer',
    company: 'Multi-Club Fitness Group',
    location: 'Australia · Contract · Remote',
    period: '2026',
    featured: true,
    summary:
      'Building a production CRM and management platform that unifies member records, subscriptions, payments, visit history, and team outreach.',
    achievements: [
      'Delivered revenue, retention, profiling, and win-back dashboards with Next.js 16, React 19, TypeScript, and TanStack Query.',
      'Designed a bidirectional Python sync worker against the PerfectGym CRM API using Celery, Redis, durable Postgres jobs, leases, idempotency keys, bounded retries, and zombie-run recovery.',
      'Embedded Twilio Voice browser calling inside CRM member panels for outreach workflows.',
      'Led member, contract, visit, and payment-history migration with automated reconciliation against source-of-truth financial reports.',
      'Ship daily with Claude Code using repo-level instructions, custom agents, skills, and GitHub, Linear, and Supabase MCP integrations.',
      'Translate plain-language requirements from a non-technical business owner into specifications and production architecture.',
    ],
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'Python', 'Celery', 'Redis', 'Supabase', 'Docker', 'Twilio'],
  },
  {
    role: 'Full-Stack Developer',
    company: 'Rooche Digital Company',
    location: 'Remote',
    period: 'Jan 2026 — Mar 2026',
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
    company: 'Robustech IT / SocietyOne',
    location: 'Australia · Remote',
    period: 'Jan 2024 — Dec 2025',
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
    title: 'Fitness CRM Platform',
    eyebrow: 'Multi-club fitness operations · Australia',
    overview: 'A unified operating system for member data, subscriptions, payments, visits, retention, and browser-based calling across multiple fitness clubs.',
    context: 'Member operations, outreach, and financial history were spread across separate tools and data sources.',
    implementation: 'Next.js dashboards backed by bidirectional CRM synchronization, durable jobs, retries, and reconciliation.',
    architecture: ['Next.js dashboards', 'Supabase Postgres', 'Python sync workers', 'Celery + Redis', 'PerfectGym REST + webhooks', 'Twilio Voice'],
    features: ['Revenue and retention dashboards', 'Member profiling', 'Win-back workflows', 'Embedded browser calling'],
    engineering: 'Idempotent sync, bounded retries, leases, zombie-run recovery, and source-of-truth financial reconciliation.',
    delivered: 'One system for member records, subscriptions, payments, visits, outreach, and retention workflows.',
    stack: ['Next.js', 'TypeScript', 'Python', 'Celery', 'Postgres', 'Twilio'],
    private: true,
  },
  {
    id: 'societyone',
    categories: ['Backend', 'API', 'Fintech'],
    title: 'SocietyOne Platform Modernization',
    eyebrow: 'Regulated fintech · Australia',
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
]

export const projectCategories = ['All', 'AI', 'SaaS', 'Backend', 'Full Stack', 'Mobile', 'API', 'Fintech', 'CRM']

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
    skills: ['CRM REST APIs', 'PerfectGym', 'Twilio Voice', 'Bidirectional sync', 'Durable job queues', 'Payment reconciliation', 'RBAC', 'Audit trails', 'OTP / 2FA', 'Row-level security'],
  },
]

export const education = {
  institution: 'Misamis Oriental Institute of Science and Technology',
  degree: 'Bachelor of Science in Information Technology',
  period: '2022 — 2025',
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
