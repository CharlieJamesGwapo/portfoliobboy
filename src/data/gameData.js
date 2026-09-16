import {
  capabilityGroups,
  credentials,
  experienceTimeline,
  profile,
  supplementalProjects,
} from './portfolioData.js'

const enemyConfig = {
  rooche: { hp: 100, type: 'Professional role' },
  societyone: { hp: 150, type: 'Professional role' },
}

export const EXPERIENCE = experienceTimeline
  .filter((item) => enemyConfig[item.id])
  .map((item) => ({
    id: item.id,
    hp: enemyConfig[item.id].hp,
    type: enemyConfig[item.id].type,
    company: item.company,
    role: item.role,
    period: item.period,
    location: item.location,
    description: item.summary,
    achievements: item.achievements,
    technologies: item.stack,
  }))

export const SKILL_CATEGORIES = capabilityGroups.map(({ title, skills }) => ({ title, skills }))
export const SKILLS = [...new Set(capabilityGroups.flatMap((group) => group.skills))].slice(0, 14)
export const PROJECTS = supplementalProjects.slice(0, 6).map((item) => ({
  title: item.title,
  type: item.type,
  description: item.description,
  technologies: item.stack,
  liveUrl: item.url || null,
}))
export const CERTIFICATES = credentials.map((item) => ({
  title: item.title,
  issuer: item.issuer,
  type: 'Resume credential',
}))

// --- BOSS -----------------------------------------------------------------
export const BOSS = {
  name: 'The Bug King',
  hp: 500,
  phaseTwoAt: 0.5, // phase 2 triggers at 50% HP
  projectileIntervalMs: 3000,
}

// --- CONTACT / OWNER ------------------------------------------------------
export const OWNER = {
  name: profile.shortName,
  email: profile.email,
  github: profile.github,
  linkedin: profile.linkedin,
  portfolioContactHref: '#contact',
}

export const BIO_SCROLL = [
  `Welcome, traveler. You stand in the lab of ${profile.shortName} — ${profile.role}.`,
  `${profile.experience}, specializing in ${profile.specialty}.`,
  'Explore the optional games, then return to the professional portfolio at any time.',
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
