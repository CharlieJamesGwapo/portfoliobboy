// ============================================================================
// gameData.js
// Real portfolio data extracted from:
//   - src/components/Experience.jsx
//   - src/components/Projects.jsx
//   - src/components/Skills.jsx
//   - src/components/Certificates.jsx
// No placeholder content — everything below mirrors the live portfolio.
// ============================================================================

// --- EXPERIENCE DEN -------------------------------------------------------
// Two enemies per spec: Rooche Digital (100 HP) and Robustech (150 HP).
// Full real experience data kept for the "defeat shows experience card" popup.
export const EXPERIENCE = [
  {
    id: 'rooche',
    hp: 100,
    company: 'Rooche Digital Company',
    role: 'Full Stack Developer',
    period: 'Jan 2026 — Mar 2026',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Built Python microservices and full-stack tooling powering internal systems and customer dashboards.',
    achievements: [
      'Built Python FastAPI microservices with Pydantic validation and OpenAPI docs',
      'Shipped REST and GraphQL APIs for internal tooling and customer dashboards',
      'Integrated Firebase and Supabase for auth and real-time sync',
      'Maintained CI/CD on GitLab, Buddy, Bitbucket with pytest gates',
      'Built WebSocket and webhook integrations for live dashboard updates',
    ],
    technologies: [
      'Python (FastAPI, Pydantic, pytest)',
      'Node.js',
      'React.js',
      'Next.js',
      'Angular',
      'PostgreSQL',
      'Firebase',
      'Supabase',
      'Docker',
      'GitLab CI',
    ],
  },
  {
    id: 'robustech',
    hp: 150,
    company: 'Robustech IT / SocietyOne',
    role: 'Full Stack Developer',
    period: 'Jan 2024 — Dec 2025',
    location: 'Australia (Remote)',
    type: 'Contract',
    description:
      'Modernized fintech backend services and serverless workflows for an Australian personal-loan platform.',
    achievements: [
      'Re-platformed Golang services to .NET (C#) for maintainability',
      'Migrated Node.js microservices to .NET standardizing logging and deployment',
      'Built AWS Lambda serverless functions (Python and .NET) for event-driven workflows',
      'Wrote Python automation scripts (Pandas, httpx) for reconciliation and reporting',
      'Owned JSON-RPC, WebSocket, and webhook integrations with partner banking systems',
    ],
    technologies: [
      'C# / ASP.NET Core',
      'Go',
      'Node.js',
      'Python',
      'AWS Lambda',
      'REST',
      'GraphQL',
      'PostgreSQL',
      'Buddy CI/CD',
    ],
  },
]

// --- SKILLS FORGE ---------------------------------------------------------
// 14 enemies, each labelled with a real core-stack tech skill
// (the "coreStack" badges from Skills.jsx, trimmed to 14).
export const SKILLS = [
  'Python',
  'Go',
  '.NET / C#',
  'Node.js',
  'React',
  'Next.js',
  'PHP',
  'TypeScript',
  'FastAPI',
  'Django',
  'Vue.js',
  'AWS Lambda',
  'PostgreSQL',
  'Docker',
]

// Full categorized skill list (used by HUD detail / reference).
export const SKILL_CATEGORIES = [
  {
    title: 'Frontend',
    skills: ['React.js', 'Next.js', 'Vue.js', 'Nuxt.js', 'Angular', 'Ember.js', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'HTML5/CSS3', 'TypeScript'],
  },
  {
    title: 'Backend',
    skills: ['Python (FastAPI, Django, Flask)', 'Go (Golang)', 'C# / .NET / ASP.NET Core', 'Node.js / Express', 'PHP (Laravel, CodeIgniter, Symfony)', 'Java / Kotlin', 'SQLAlchemy', 'Alembic', 'Celery + Redis'],
  },
  {
    title: 'APIs & Integrations',
    skills: ['RESTful APIs', 'GraphQL', 'SOAP', 'WebSocket', 'Webhooks', 'JSON-RPC', 'OpenAPI / Swagger', 'Microservices', 'JWT / OTP / 2FA / RBAC'],
  },
  {
    title: 'Databases',
    skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'NeonDB', 'Supabase', 'Firebase / Firestore', 'Schema Design', 'Query Optimization'],
  },
  {
    title: 'Cloud & DevOps',
    skills: ['AWS Lambda', 'Docker', 'Vercel', 'Netlify', 'Render', 'Railway', 'Buddy CI/CD', 'GitLab CI', 'Jenkins', 'Git / GitHub / GitLab / Bitbucket', 'IIS', 'Apache', 'Windows Server', 'Active Directory'],
  },
  {
    title: 'Mobile',
    skills: ['React Native (iOS & Android)', 'Android Studio', 'Java / Kotlin', 'Firebase', 'Supabase'],
  },
  {
    title: 'Tools & Practices',
    skills: ['Figma', 'Agile/Scrum', 'pytest', 'Pandas/NumPy', 'Clean Code', 'RBAC', 'Performance Optimization'],
  },
]

// --- PROJECTS VAULT -------------------------------------------------------
// 6 gold chests. First 6 projects from Projects.jsx (the featured / flagship set).
export const PROJECTS = [
  {
    title: 'Luxury Construction Utah',
    type: 'Client Project',
    description:
      'Professional construction company website built for a Utah-based client. Features responsive design, service showcases, and contact integration.',
    technologies: ['React', 'Tailwind CSS', 'Responsive Design'],
    liveUrl: 'https://luxuryconstructionutah.com/',
  },
  {
    title: 'G2 POS System',
    type: 'Full Stack App',
    description:
      'Complete point-of-sale system with sales tracking, inventory management, order processing, and reporting dashboard.',
    technologies: ['Go (Golang)', 'Next.js', 'PostgreSQL', 'Docker'],
    liveUrl: 'https://g2possystem.vercel.app/landing',
  },
  {
    title: 'E-Cycle Hub',
    type: 'Full Stack App',
    description:
      'Waste management and recycling platform with user registration, waste categorization, collection scheduling, and RESTful APIs.',
    technologies: ['Go (Golang)', 'Next.js', 'NeonDB (PostgreSQL)'],
    liveUrl: 'https://ecyclehub.vercel.app/',
  },
  {
    title: 'ReflectiCSS',
    type: 'Developer Tool',
    description:
      'CSS utility and reflection tool for developers. Interactive interface for exploring and generating CSS styles efficiently.',
    technologies: ['React', 'CSS3', 'JavaScript'],
    liveUrl: 'https://reflecticss.vercel.app/',
  },
  {
    title: 'Study Pulse',
    type: 'Web App',
    description:
      'Study management application helping students track their learning progress, organize study sessions, and monitor performance.',
    technologies: ['React', 'Tailwind CSS', 'JavaScript'],
    liveUrl: 'https://study-pulse-ten.vercel.app/',
  },
  {
    title: 'SocietyOne Loan Platform',
    type: 'Professional / Fintech',
    description:
      'Online personal loan platform for Australian clients. Rewrote legacy Go services into C# .NET, built AWS Lambda functions, and optimized APIs.',
    technologies: ['C# (.NET)', 'Go', 'Node.js', 'AWS Lambda', 'PostgreSQL'],
    liveUrl: null,
  },
]

// --- CERTS HALL -----------------------------------------------------------
// 10 pedestals, each a real certificate (title + issuer) from Certificates.jsx.
export const CERTIFICATES = [
  { title: 'Databases with SQL', issuer: 'CS50 (Harvard)', type: 'Completion' },
  { title: 'Windows Server 2012 Training', issuer: 'ITFreeTraining', type: 'Completion' },
  { title: 'Active Directory', issuer: 'ITFreeTraining', type: 'Completion' },
  { title: 'Microsoft: Manage AD DS Domain Controllers & FSMO Roles', issuer: 'Microsoft', type: 'Completion' },
  { title: "Dean's Lister (2nd & 3rd Year) - Ranked 2", issuer: 'MOIST', type: 'Recognition' },
  { title: 'TOPCIT (Test of Practical Competency in IT)', issuer: 'TOPCIT', type: 'Participation' },
  { title: 'MongoDB Database Training', issuer: 'MongoDB', type: 'Completion' },
  { title: 'PHP for Web Development', issuer: 'CodeMy', type: 'Completion' },
  { title: 'JavaScript Programming', issuer: 'Bro Code', type: 'Completion' },
  { title: 'HTML and CSS', issuer: 'Telugu', type: 'Completion' },
]

// --- BOSS -----------------------------------------------------------------
export const BOSS = {
  name: 'The Bug King',
  hp: 500,
  phaseTwoAt: 0.5, // phase 2 triggers at 50% HP
  projectileIntervalMs: 3000,
}

// --- CONTACT / OWNER ------------------------------------------------------
export const OWNER = {
  name: 'Charlie James',
  email: 'capstonee2@gmail.com',
  github: 'https://github.com/CharlieJamesGwapo',
  linkedin: 'https://www.linkedin.com/in/charlie-james-abejo-26362638a/',
  portfolioContactHref: '#contact',
}

export const BIO_SCROLL = [
  "Welcome, traveler. You stand in the dungeon of Charlie James — Full Stack Developer & Backend Engineer.",
  "5+ years forging secure, scalable web, API, and mobile applications across Python, Go, .NET, Node.js, and PHP.",
  "Venture deeper: defeat the Skills, plunder the Projects Vault, study the Certs, and slay The Bug King to claim victory.",
]

// --- SCORING --------------------------------------------------------------
export const SCORING = {
  perKill: 100,
  perChest: 150,
  perCert: 50,
  timeBase: 10000,
  timePenaltyPerSecond: 10,
}

export function computeScore({ kills = 0, chests = 0, certs = 0, seconds = 0 }) {
  const { perKill, perChest, perCert, timeBase, timePenaltyPerSecond } = SCORING
  return (
    kills * perKill +
    chests * perChest +
    certs * perCert +
    Math.max(0, timeBase - Math.round(seconds) * timePenaltyPerSecond)
  )
}

// --- ROOM REGISTRY --------------------------------------------------------
// Room ids and the 6-room layout / adjacency:
//   [SKILLS FORGE] ↔ [PROJECTS VAULT] ↔ [CERTS HALL]
//         ↕                  ↕                 ↕
//   [START ROOM]   ↔  [EXPERIENCE DEN]  ↔  [BOSS ROOM]
export const ROOMS = {
  start: { id: 'start', name: 'Start Room', grid: { col: 0, row: 1 } },
  skills: { id: 'skills', name: 'Skills Forge', grid: { col: 0, row: 0 } },
  experience: { id: 'experience', name: 'Experience Den', grid: { col: 1, row: 1 } },
  projects: { id: 'projects', name: 'Projects Vault', grid: { col: 1, row: 0 } },
  boss: { id: 'boss', name: 'Boss Room', grid: { col: 2, row: 1 } },
  certs: { id: 'certs', name: 'Certs Hall', grid: { col: 2, row: 0 } },
}

// Mini-map order (2 rows x 3 cols) — top row then bottom row.
export const MINIMAP_LAYOUT = [
  ['skills', 'projects', 'certs'],
  ['start', 'experience', 'boss'],
]

// Adjacency for door connections (matches the diagram exactly).
export const ROOM_ADJACENCY = {
  start: { up: 'skills', right: 'experience' },
  skills: { down: 'start', right: 'projects' },
  experience: { left: 'start', up: 'projects', right: 'boss' },
  projects: { down: 'experience', left: 'skills', right: 'certs' },
  boss: { left: 'experience', up: 'certs' },
  certs: { down: 'boss', left: 'projects' },
}

export const PLAYER_CONFIG = {
  maxHp: 100,
  attack: 25,
  attackCooldownMs: 400,
  respawnHpFactor: 0.5,
  contactDamage: 10,
  contactDamageCooldownMs: 700,
}

// --- SKILL INFO -----------------------------------------------------------
// Short descriptions surfaced when a skill is "discovered" (Bug Blaster pop-ups,
// etc.). Keys cover every entry in SKILLS plus a few extras the shooter uses.
export const SKILL_INFO = {
  Python: 'Primary backend language — FastAPI, Django, Flask, automation.',
  Go: 'High-performance services & POS/recycling platforms.',
  '.NET / C#': 'ASP.NET Core fintech services at SocietyOne.',
  'Node.js': 'APIs, tooling, and real-time services with Express.',
  React: 'Component-driven UIs across client dashboards.',
  'Next.js': 'SSR/ISR frontends for POS & web apps.',
  PHP: 'Laravel, CodeIgniter & Symfony web platforms.',
  TypeScript: 'Type-safe frontends and Node services.',
  FastAPI: 'Typed Python APIs with Pydantic & OpenAPI docs.',
  Django: 'Batteries-included Python web framework.',
  'Vue.js': 'Reactive frontends for POS & recycling apps.',
  'AWS Lambda': 'Event-driven serverless workflows.',
  PostgreSQL: 'Relational data, query tuning, schema design.',
  Docker: 'Containerized builds & reproducible deploys.',
  Angular: 'Enterprise SPA frontends.',
  GraphQL: 'Typed query APIs for dashboards.',
  Supabase: 'Auth & realtime Postgres backend.',
  Firebase: 'Realtime data, auth & push for mobile apps.',
  'React Native': 'Cross-platform iOS & Android apps.',
  'Tailwind CSS': 'Utility-first styling system.',
}

// Tech names used as falling enemies in Bug Blaster (real stack).
export const BLASTER_SKILLS = [
  'Go', 'React', 'Python', '.NET / C#', 'PostgreSQL', 'Docker', 'AWS Lambda',
  'FastAPI', 'Vue.js', 'TypeScript', 'Node.js', 'Next.js', 'GraphQL', 'Supabase',
]
