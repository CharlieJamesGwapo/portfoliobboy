import { experiences, featuredProjects, momentumSystems } from './portfolioData.js'
import { independentProducts } from './independentProducts.js'
import { liveProjectLinks, oneRidePreview } from './productPreviewData.js'
import { selectedCaseStudies } from './selectedCaseStudies.js'

const byId = (items, id) => items.find((item) => item.id === id)
const projectById = new Map(featuredProjects.map((project) => [project.id, project]))
const independentById = new Map(independentProducts.map((project) => [project.id, project]))

const routeDefinitions = [
  {
    slug: 'alex-hasti',
    projectId: 'alex-hasti',
    selectedId: 'alex-hasti',
    systemId: 'alex',
    title: 'Alex / Hasti',
    role: 'Voice runtime & callback experience',
    overview: 'A self-hosted AI voice workflow for first response, callback requests, call operations, and CRM handoff.',
    architecture: [
      'LiveKit Agents voice runtime',
      'OpenAI GPT-Live',
      'Twilio SIP telephony',
      'Restart-safe call queue',
      'Transcript-cited review and follow-up',
      'Hasti callback experience and CRM enquiry outbox',
    ],
    architectureFlows: [
      { label: 'Voice session', stages: ['Twilio SIP', 'LiveKit Agents', 'GPT-Live'] },
      { label: 'Call operations', stages: ['Restart-safe queue', 'Transcript-cited review', 'CRM follow-up'] },
    ],
    implementationDecision: 'LiveKit Agents and GPT-Live connect through Twilio SIP. Call review cites transcript evidence, while the Hasti callback experience verifies requests and captures consent before the CRM handoff.',
    workflows: [
      'Inbound enquiries and public callback requests',
      'Outbound research calls with grounded opening questions',
      'Operator review of transcript-backed call summaries',
      'Follow-up email with reply tracking',
    ],
    engineeringChallenges: 'The call queue needs to survive process restarts and support pause and resume. Voicemail detection stays conservative; transfer and recording handling are part of the call lifecycle.',
    securityReliability: 'Callback requests use verification, consent capture, and per-IP rate limits. A durable enquiry outbox connects Hasti submissions with the CRM workflow.',
    outcome: 'A public callback demo at hasti.com.au, backed by the self-hosted voice runtime and call operations workflow.',
    status: 'Public callback demo · Runtime and CRM integrations are private',
    links: [
      { label: 'Try the Hasti callback demo', href: 'https://hasti.com.au/' },
    ],
    image: '/projects/hasti.png',
    imageAlt: 'Hasti public website showing its AI receptionist experience',
    mediaCaption: 'Public Hasti website · callback experience, not a private operations dashboard',
  },
  {
    slug: 'zalio-crm',
    projectId: 'zalio-crm',
    selectedId: 'zalio-crm',
    systemId: 'zalio-crm',
    role: 'Lead engineer · CRM module',
    architecture: [
      'Next.js 16 + React 19 CRM',
      'PostgreSQL data',
      'SMS, WhatsApp, and email inbox streams',
      'Replay-safe form webhooks and Meta conversions',
      'Twilio browser calling',
      'Google Calendar bookings',
    ],
    architectureFlows: [
      { label: 'Lead operations', stages: ['Form or voice enquiry', 'Omnichannel inbox', 'Call or book', 'Retention follow-up'] },
    ],
    implementationDecision: 'The CRM module joins lead intake, conversations, bookings, and retention workflows. Realtime inbox streams, replay-safe webhooks, and consent-aware voice intake keep connected channels tied to the same lead record.',
    workflows: [
      'SMS, WhatsApp, and email conversations in one inbox',
      'Lead deduplication, merge, and response-time SLA alerts',
      'Form capture with replay-safe webhook handling',
      'Retention and reactivation campaigns',
      'Twilio browser calls, Google Calendar bookings, and Alex voice enquiries',
    ],
    engineeringChallenges: 'The CRM connects multiple channels while keeping duplicate and replayed submissions manageable. Realtime updates, lead merge, and response-time alerts need to stay consistent across the team workflow.',
    securityReliability: 'Form webhooks are replay-safe. Voice enquiries enter through consent-aware intake, and Meta conversion events are connected to form submissions.',
    outcome: 'An integrated CRM module spanning lead intake, conversations, follow-up, calling, booking, and retention.',
    status: 'Private product module · Public Zalio product tour available',
    links: [{ label: 'Explore the Zalio product tour', href: 'https://zalio.ai/' }],
    image: '/projects/zalio.png',
    imageAlt: 'Zalio public product website, not the private CRM interface',
    mediaCaption: 'Public product website · private CRM interface not shown',
  },
  {
    slug: 'oneride',
    projectId: 'one-ride-balingasag',
    selectedId: 'oneride',
    role: 'Full-stack & mobile development',
    architecture: [
      'React Native + Expo customer app',
      'React + TypeScript web and admin clients',
      'Go + Gin API',
      'PostgreSQL + GORM',
      'JWT authentication and OTP',
      'Maps + WebSocket rider tracking',
    ],
    architectureFlows: [
      { label: 'Customer request and live trip', stages: ['Customer / rider apps', 'Go + Gin API', 'PostgreSQL + WebSockets'] },
    ],
    implementationDecision: 'React Native and Expo cover customer and rider workflows, with React web and admin tools alongside a Go/Gin API and PostgreSQL. WebSockets carry live rider tracking.',
    workflows: [
      'Pasugo parcel delivery',
      'Pasabay motorcycle rides',
      'Pasundo scheduled pickup',
      'Local-store orders',
      'Fare estimates, maps, live tracking, and recurring bookings',
    ],
    engineeringChallenges: 'One service combines rides, delivery, scheduled pickup, and local-store orders across customer, rider, store, and administration workflows. Live tracking and distance-based fares need to stay connected to the trip lifecycle.',
    securityReliability: 'The platform uses OTP and JWT authentication. The documented customer and rider workflows include payment methods, ratings, SOS, and operational dashboards.',
    outcome: 'A live Google Play customer app supported by rider, store, web, and administrative workflows for the Balingasag service area.',
    status: 'Live on Google Play · Client source code private',
    links: liveProjectLinks.filter((link) => ['oneride-app', 'oneride-site'].includes(link.id)),
    screenshots: oneRidePreview.screenshots,
    screenshotSource: { label: 'Official Google Play screenshots', href: oneRidePreview.sourceUrl },
    mediaCaption: 'Official Google Play screenshots · customer app',
  },
  {
    slug: 'autoflow-ai-pro',
    projectId: 'autoflow-ai-pro',
    independentId: 'autoflow-ai-pro',
    role: 'Independent product · Product design and engineering',
    implementationDecision: 'The planned client uses React Native and Expo with a TypeScript workflow engine. SQLite is intended for local data, with optional Supabase sync and a multi-provider AI layer.',
    architectureFlows: [
      { label: 'Planned automation model', stages: ['Trigger', 'Condition', 'Action', 'Execution log'] },
    ],
    engineeringChallenges: 'The design keeps workflow logic separate from provider adapters and treats local data as the offline-first baseline. Cloud sync and AI provider integrations remain planned.',
    securityReliability: 'Offline-first use is a core design goal. Supabase sync and provider integrations are planned; no deployed sync or provider controls are claimed.',
    status: 'In development · Planned integrations',
  },
  {
    slug: 'easyappy',
    projectId: 'easyappy',
    independentId: 'easyappy',
    role: 'Independent product · Desktop application',
    implementationDecision: 'An Electron renderer communicates with a Node.js main process through guarded IPC. Local persistence holds the tracking workspace; Gmail capture is optional and read-only.',
    architectureFlows: [
      { label: 'Desktop boundary', stages: ['Electron renderer', 'Guarded IPC', 'Node.js main process', 'Local persistence'] },
      { label: 'Optional email capture', stages: ['Google OAuth 2.0', 'Gmail API · read-only'] },
    ],
    engineeringChallenges: 'The app needs to keep an approachable application tracker while placing privileged desktop operations behind IPC guards. Gmail capture is optional and read-only.',
    securityReliability: 'Guarded IPC isolates sensitive desktop operations. Electron safeStorage protects credentials where available, and Gmail access is read-only.',
    status: 'Independent product · Local-first macOS',
  },
  {
    slug: 'bboy',
    projectId: 'bboy-assistant',
    independentId: 'bboy-assistant',
    role: 'Personal native macOS AI assistant',
    architectureFlows: [
      { label: 'Agent handoff', stages: ['Coordinator', 'Developer', 'Reviewer'] },
    ],
    implementationDecision: 'A Swift/AppKit host runs the WebKit interface and a local Node.js runtime. The coordinator, developer, and reviewer agents hand work through a local HTTP API.',
    workflows: [
      'Plan and route software tasks through specialist agent roles',
      'Review proposed actions before they run',
      'Use local speech recognition and speech output',
      'Connect GitHub CLI and Codex CLI to local workflows',
    ],
    engineeringChallenges: 'The native shell, WebKit interface, and Node runtime need a clear local boundary. Voice input combines whisper.cpp, Apple Speech, and Silero VAD; speech output uses Kokoro and macOS speech.',
    securityReliability: 'OAuth credentials are stored in Keychain, and action approval controls stay in the execution flow. Application state and exports are local to the Mac.',
    status: 'Version 0.7.0 · macOS 14+ · Apple Silicon · Private personal source',
  },
  {
    slug: 'agentforge',
    projectId: 'agentforge',
    independentId: 'agentforge',
    role: 'Independent product · Personal CLI toolkit',
    architectureFlows: [
      { label: 'Bounded CLI workflow', stages: ['Project discovery', 'Planner', 'Worker execution', 'Verification'] },
    ],
    implementationDecision: 'Strict TypeScript separates commands, planning, and execution for Node.js 22.13+ or 24+. OpenAI, Anthropic, and Ollama adapters are optional.',
    workflows: [
      'Explore codebases with local search, import graphs, and Git inspection',
      'Plan bounded workflows with verification loops',
      'Choose an optional OpenAI, Anthropic, or Ollama adapter',
      'Load portable skills as project guidance',
      'Review permission-sensitive terminal actions',
    ],
    engineeringChallenges: 'The CLI bounds agent work and validates structured input. Local diagnostics can run offline; provider inference requires configuration and network approval. File application currently fails closed on the Node.js backend.',
    securityReliability: 'Permission-sensitive terminal actions require explicit approval. Provider inference requires network approval. File application currently fails closed on the Node.js backend.',
    status: 'v0.1.0-dev.0 · In development · MIT',
  },
  {
    slug: 'contextpilot',
    projectId: 'contextpilot',
    independentId: 'contextpilot',
    role: 'Independent product · Local-first coding context companion',
    implementationDecision: 'A Next.js, React, and TypeScript interface uses a Rust core with WebAssembly for browser processing. Browser data can live in IndexedDB; native persistence uses SQLite behind an authenticated local HTTP API. OpenAI and Anthropic integrations are optional.',
    architecture: [
      'Next.js + React + TypeScript interface',
      'Rust core with WebAssembly browser processing',
      'Authenticated local HTTP API for native use',
      'IndexedDB in the browser · SQLite in native use',
      'Optional OpenAI and Anthropic integrations',
      'Cloudflare Pages static browser experience',
    ],
    workflows: [
      'Search the current project for code context relevant to the task',
      'Estimate token usage, then compact the prompt before model use',
      'Export a session checkpoint when work pauses',
      'Import the checkpoint during the next coding session',
    ],
    engineeringChallenges: 'The product needs to prepare useful context across sessions while keeping browser and native persistence boundaries clear. Retrieval, token estimation, and prompt compaction run as local tooling; external model connections stay optional.',
    securityReliability: 'Workspace processing and persistence use local storage boundaries. Credentials are protected at the native boundary. OpenAI and Anthropic are optional; local tools require no account or API key.',
    outcome: 'A local-first coding context toolkit for search, prompt preparation, and reusable session checkpoints. Voice AI Agents are a proposed experience, not a current feature.',
    status: 'Local-first toolkit · Voice experience proposed · MIT',
    proposedFeatures: [
      'Whisper or whisper.cpp transcription',
      'Kokoro or Piper speech output',
      'Silero VAD for voice activity detection',
      'Ollama-backed local model option',
      'Custom Rust/TypeScript orchestration with streaming HTTP or WebSocket',
      'Explicit approval before tool actions',
    ],
  },
  {
    slug: 'omji-billing',
    projectId: 'omji-billing',
    experienceCompany: 'OMJI',
    implementationDecision: 'TypeScript and Go services support web, mobile, and endpoint-agent clients, with MikroTik RouterOS integration and Docker-based deployment.',
    workflows: [
      'Time-based prepaid billing and voucher generation',
      'Station, account, and branch administration',
      'MikroTik access control',
      'Revenue reports and operational analytics',
    ],
    engineeringChallenges: 'Usage-ledger billing needs to account for plan changes and voucher workflows while reflecting network activity. Database migrations and repeatable deployment support ongoing operations.',
    securityReliability: 'The documented controls include per-account permissions, an explicit usage ledger, database migrations, and repeatable container deployment.',
    status: 'Private operational platform · Source link not provided',
  },
  {
    slug: 'fitness-crm',
    projectId: 'fitness-crm',
    experienceCompany: 'Zalio · Momentum',
    role: 'Lead Full-Stack Developer · CRM and operations',
    implementationDecision: 'Next.js dashboards use bidirectional CRM synchronization, durable background jobs, retries, leases, and reconciliation against the financial source of truth.',
    workflows: ['Member and subscription sync', 'Payments and visit history', 'Retention and win-back workflows', 'Embedded browser calling'],
    engineeringChallenges: 'Sync jobs must recover from abandoned runs and avoid duplicating changes. Bounded retries, leases, and source-of-truth reconciliation support recovery.',
    securityReliability: 'The integration uses idempotent sync, bounded retries, leases, zombie-run recovery, and financial-record reconciliation.',
    status: 'Private client platform · Source code private',
  },
  {
    slug: 'fintech-lending',
    projectId: 'fintech-lending',
    experienceCompany: 'Super Deal · Australian Fintech',
    role: 'Full-Stack Developer · Lending platform modernization',
    implementationDecision: 'Go and Node.js services were standardized with .NET services, with AWS Lambda workflows for third-party integrations and partner-system data exchange.',
    workflows: ['Partner feed processing', 'Banking and loan webhooks', 'Reconciliation and reporting automation', 'Event-driven integrations'],
    engineeringChallenges: 'The modernization crossed service boundaries and partner interfaces, including JSON-RPC, WebSocket, webhook, partner-feed, and email-parsing workflows.',
    securityReliability: 'The delivery included standardized logging and error handling, automated tests, staged deployments, and rollback support.',
    status: 'Australian client project · Source code private',
  },
  {
    slug: 'moist-alumni',
    projectId: 'moist-alumni',
    experienceCompany: 'MOIST Alumni Online Tracking System',
    implementationDecision: 'Laravel and MySQL provide the application and relational records model, with role-aware administration and SMS/email account verification.',
    workflows: ['Alumni registration and profile updates', 'Administrative records and reporting', 'OTP/2FA verification for sensitive account actions'],
    engineeringChallenges: 'The system brings verified alumni records and administrative reporting into one maintainable platform with auditable account actions.',
    securityReliability: 'Role-based access, audit trails, and OTP/2FA over SMS and email are part of the documented account and administration workflows.',
    status: 'Client project · Source code private',
  },
  {
    slug: 'filtra-pos',
    projectId: 'filtra-pos',
    experienceCompany: 'Filtra Coffee POS System',
    implementationDecision: 'A Go backend supports Next.js and Vue interfaces, with PostgreSQL data and Docker-based deployment.',
    workflows: ['Daily checkout and payment workflows', 'Inventory tracking', 'Sales reporting'],
    engineeringChallenges: 'Sales, payments, stock control, and reporting need to work as one daily workflow for store staff. Containerized deployment makes the setup repeatable.',
    securityReliability: 'Repeatable Docker deployment is documented. The project record does not describe additional security controls.',
    status: 'Production point-of-sale workflow · Client source private',
  },
  {
    slug: 'ecycle-hub',
    projectId: 'ecycle-hub',
    experienceCompany: 'E-Cycle Hub',
    implementationDecision: 'A Go API backed by Neon Postgres serves responsive web clients. WebSockets and webhooks carry collection status updates.',
    workflows: ['Waste categorization and pickup requests', 'Pickup scheduling', 'Live collection status across clients'],
    engineeringChallenges: 'User requests, collection workflows, and live status updates need to stay aligned across clients.',
    securityReliability: 'The project record describes REST APIs, WebSockets, and webhooks for collection updates, with no separate operational controls specified.',
    status: 'Live web application',
  },
  {
    slug: 'mobile-booking',
    projectId: 'mobile-booking',
    role: 'Mobile Developer · Ride and massage booking apps',
    implementationDecision: 'React Native supports ride booking across iOS and Android, alongside a separate native Android massage-booking application using Java and Kotlin.',
    workflows: ['Ride booking and trip updates', 'Massage-service discovery and scheduling', 'Authentication, messaging, and push notifications'],
    engineeringChallenges: 'The two booking products needed mobile-first states for scheduling and active bookings, with live application data and notifications.',
    securityReliability: 'Authentication and live data use Supabase or Firebase, with messaging and push notifications. No additional operational controls are specified in the project record.',
    status: 'Completed mobile project engagements · Source link not provided',
  },
]

const experienceByCompany = new Map(experiences.map((item) => [item.company, item]))

function createCaseStudy(definition) {
  const project = projectById.get(definition.projectId)
  const selected = byId(selectedCaseStudies, definition.selectedId)
  const system = byId(momentumSystems, definition.systemId)
  const independent = independentById.get(definition.independentId)
  const experience = experienceByCompany.get(definition.experienceCompany)
  const product = independent || project

  const title = definition.title || selected?.title || system?.title || project?.title || independent?.title
  const overview = definition.overview || selected?.overview || project?.overview || independent?.overview || system?.summary
  const problem = definition.problem || selected?.problem || project?.context || independent?.context || system?.summary
  const role = definition.role || selected?.role || independent?.role || experience?.role || 'Full-stack product development'
  const responsibilities = definition.responsibilities || selected?.contribution || system?.contribution || experience?.achievements || [project?.implementation || independent?.implementation].filter(Boolean)
  const implementationDecision = definition.implementationDecision || selected?.approach || project?.implementation || independent?.implementation || system?.contribution
  const architecture = definition.architecture || project?.architecture || independent?.architecture || selected?.stack || system?.stack || project?.stack || []
  const workflows = definition.workflows || selected?.scope || project?.features || independent?.features || []
  const engineeringChallenges = definition.engineeringChallenges || project?.engineering || independent?.engineering || 'The source project record does not document a separate engineering challenge.'
  const securityReliability = definition.securityReliability || 'The source project record does not document a separate security or reliability control.'
  const outcome = definition.outcome || selected?.delivered || project?.delivered || independent?.delivered || 'Delivered project details are not separately documented.'
  const status = definition.status || selected?.proof || project?.status || independent?.status || (project?.url ? 'Live product link available' : project?.private ? 'Private client project · Source code private' : 'Portfolio project · Status not specified')
  const links = definition.links || selected?.links || [
    ...(project?.url ? [{ label: 'Open the live project', href: project.url }] : []),
    ...(project?.repositoryUrl ? [{ label: 'View source repository', href: project.repositoryUrl }] : []),
    ...(independent?.url ? [{ label: 'Open the live product', href: independent.url }] : []),
    ...(independent?.repositoryUrl ? [{ label: 'View source repository', href: independent.repositoryUrl }] : []),
  ]

  return {
    ...definition,
    id: definition.slug,
    projectId: definition.projectId,
    title,
    overview,
    problem,
    role,
    responsibilities,
    implementationDecision,
    architecture,
    workflows,
    engineeringChallenges,
    securityReliability,
    outcome,
    status,
    links,
    stack: product?.stack || system?.stack || selected?.stack || [],
    categories: product?.categories || system?.categories || [],
    features: product?.features || [],
    mediaProduct: product?.media?.length || product?.visual ? product : null,
    image: definition.image || selected?.image || null,
    imageAlt: definition.imageAlt || selected?.imageAlt || null,
    mediaCaption: definition.mediaCaption || selected?.caption || product?.mediaCaption || null,
    proof: selected?.proof || null,
  }
}

export const caseStudies = routeDefinitions.map(createCaseStudy)

const caseStudyBySlug = new Map(caseStudies.map((study) => [study.slug, study]))

export function getCaseStudyBySlug(slug) {
  return caseStudyBySlug.get(slug) || null
}

export function getCaseStudyHrefForProject(projectId) {
  const study = caseStudies.find((item) => item.projectId === projectId)
  return study ? `/projects/${study.slug}` : null
}
