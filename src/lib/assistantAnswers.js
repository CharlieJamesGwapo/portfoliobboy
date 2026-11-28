// ============================================================================
// Alex's text answers: a local, deterministic answer engine.
//
// No model, no network, no credits. Every answer is assembled from the same
// public data the portfolio renders. Keyword matching is limited: it cannot
// verify a visitor's premise or confirm commercial commitments.
// ============================================================================
import {
  aiSystemCapabilities,
  bookingOptions,
  experiences,
  momentumSystems,
  profile,
  resumeUrl,
  skillGroups,
} from '../data/portfolioData.js'
import { caseStudies } from '../data/caseStudies.js'
import { automationToolbox, automationWorkflows } from '../data/automationsData.js'
import { voiceAccents } from '../data/voiceAccents.js'
import { voiceConversations } from '../data/voiceConversations.js'

// "Custom AI agents" -> "custom AI agents": lower only the first letter, so
// acronyms like AI, CRM, and n8n keep their casing.
const lowerFirst = (text) => (/^[A-Z][a-z]/.test(text) ? text[0].toLowerCase() + text.slice(1) : text)

const list = (items) => {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

const current = experiences.find((item) => item.featured) ?? experiences[0]
// A finished role must not be described as current ("Jun 2026 – Sep 2026").
const currentIsOngoing = /present/i.test(current.period)
const roleLine = `${current.role} at ${current.company} (${current.period})`
const ongoingRoles = experiences.filter(item => /present/i.test(item.period))
const ongoingNote = ongoingRoles.length ? ` The portfolio also lists ${list(ongoingRoles.map(item => `${item.role} at ${item.company} (${item.period})`))}.` : ''
const freeCalls = bookingOptions.filter((option) => option.price === 'Free')
const freeCallNote = freeCalls.length ? ` The published free call options include a ${freeCalls[0].minutes}-minute ${freeCalls[0].title.toLowerCase()}.` : ''
const voiceIdentity = `When voice is available, the portfolio's Talk to Alex connects to its live ElevenLabs portfolio guide. The separate Alex / Hasti project uses LiveKit Agents and GPT-Live over Twilio SIP for its callback experience on hasti.com.au.`
const liveSystems = momentumSystems.filter((system) => system.url && system.statusTone === 'live')
const flagship = momentumSystems.slice(0, 5)

// Suggested questions shown as chips. Each maps to an intent below.
export const suggestedQuestions = [
  { id: 'projects', label: 'What has Charlie built?' },
  { id: 'ai', label: 'Tell me about his AI work' },
  { id: 'services', label: 'What can he build for me?' },
  { id: 'skills', label: 'Which tech does he use?' },
  { id: 'contact', label: 'How do I contact him?' },
  { id: 'booking', label: 'Book a free call' },
]

// Only claim recordings that exist: languages still in preview are "coming".
const multilingualNote = () => {
  const ready = voiceConversations.filter((item) => item.status === 'ready').map((item) => item.name)
  const coming = voiceConversations.filter((item) => item.status !== 'ready').map((item) => item.name)
  if (ready.length === 0) return coming.length ? `Bilingual receptionist calls in ${list(coming)} are coming soon. ` : ''
  const readyNote = ready.length === 1
    ? `There's also a bilingual receptionist call that switches from English to ${list(ready)}. `
    : `There are also ${ready.length} bilingual receptionist calls that switch from English to ${list(ready)}. `
  return coming.length ? `${readyNote}${list(coming)} ${coming.length > 1 ? "are" : "is"} coming soon. ` : readyNote
}

const answers = {
  greeting: () => ({
    text: `Hi! I can walk you through Charlie's projects, AI and automation work, skills, experience, or how to reach him. What would you like to know?`,
  }),

  about: () => ({
    text: `${profile.name} is a ${profile.role} based in ${profile.location}. ${currentIsOngoing ? `He's currently ${roleLine}` : `Most recently he was ${roleLine}`}: ${current.summary}${ongoingNote}`,
    actions: [{ label: 'About Charlie', href: '/#about' }, { label: 'Experience', href: '/#experience' }],
  }),

  projects: () => ({
    text: `Some highlights: ${list(flagship.map((system) => system.title.replace(/\s+—.*$/, '')))}. ${liveSystems.length} of his systems have public live links you can try right from the portfolio.`,
    actions: [{ label: 'Selected work', href: '/#product-studio-preview' }, { label: 'Systems & demos', href: '/#momentum-work' }, { label: 'All projects', href: '/projects' }],
  }),

  ai: () => ({
    text: `Charlie builds ${list(aiSystemCapabilities.slice(0, 4).map((item) => lowerFirst(item.title)))}. ${voiceIdentity}`,
    actions: [{ label: 'AI systems', href: '/#ai-systems' }, { label: 'Voice Studio', href: '/#voice-demo' }],
  }),

  voice: () => ({
    text: `${voiceIdentity} The Voice Studio also has ${voiceAccents.length} short, pre-recorded accent previews with fictional AI-generated conversations. ${multilingualNote()}`,
    actions: [
      { label: 'Open the Voice Studio', href: '/#voice-demo' },
      ...(voiceConversations.some((item) => item.status === 'ready') ? [{ label: 'Hear the bilingual calls', href: '/#voice-multilingual' }] : []),
      { label: 'Talk to Alex on Hasti', href: 'https://hasti.com.au/', external: true },
    ],
  }),

  automations: () => ({
    text: `Explore ${automationWorkflows.length} automation solution patterns using ${list(automationToolbox.slice(0, 4))}, plus AI agents, custom bots and cloud workflows. Each example explains the trigger, process, integrations and safeguards. These are service examples to scope with Charlie, not a count of completed client deployments.`,
    actions: [{ label: 'Automation workflows', href: '/#automations' }],
  }),

  cloud: () => ({
    text: 'Published cloud and DevOps work includes AWS Lambda integrations in the fintech project, Docker and Docker Compose deployments, Linux VPS operations, and GitLab/Buddy CI/CD. This portfolio also uses GitHub Actions for checks and monitoring. These examples establish specific work, not an AWS certification or expertise in every AWS service. Confirm additional services, infrastructure scope and depth with Charlie.',
    actions: [{ label: 'AWS project evidence', href: '/projects/fintech-lending' }, { label: 'Container deployment', href: '/projects/omji-billing' }, { label: 'Cloud and delivery skills', href: '/#skills' }],
  }),

  bots: () => ({
    text: 'Charlie can discuss custom bots for website support, knowledge search, CRM operations and team notifications. Telegram, Discord and other channels are solution patterns to scope around the platform APIs, permissions and human handoff. The catalogue is not a list of completed bot deployments; confirm the integrations and project scope directly with Charlie.',
    actions: [{ label: 'Custom bot solution patterns', href: '/#automations' }, { label: 'Discuss a bot', href: '/#contact' }],
  }),

  services: () => ({
    text: `Charlie can help with ${list(aiSystemCapabilities.map((item) => lowerFirst(item.title)))}, as well as full-stack web and mobile apps. Confirm project scope and working-hour availability with Charlie.${freeCallNote}`,
    actions: [{ label: 'Book a call', href: '/#book-a-call' }, { label: 'Start a conversation', href: '/#contact' }, { label: 'AI systems', href: '/#ai-systems' }],
  }),

  pricing: () => ({
    text: `Project prices and hourly rates are not published here. Charlie quotes each one individually; confirm scope and a quote with Charlie directly.`,
    actions: [{ label: 'Book a discovery call', href: '/#book-a-call' }, { label: 'Contact Charlie', href: '/#contact' }],
  }),

  skills: () => ({
    text: [...skillGroups.slice(0, 4), ...skillGroups.filter(group => /AWS|DevOps/.test(group.title))].map((group) => `${group.title}: ${group.skills.slice(0, 5).join(', ')}`).join('. ') + '. Project links and toolkit notes explain the scope; confirm depth directly.',
    actions: [{ label: 'All skills', href: '/#skills' }],
  }),

  experience: () => ({
    text: `${currentIsOngoing ? 'Currently' : 'Most recently'}: ${current.role} at ${current.company}, ${current.period}. Other published roles include ${list(experiences.filter((item) => item !== current).slice(0, 2).map((item) => `${item.role} at ${item.company}`))}.${ongoingNote}`,
    actions: [{ label: 'Full experience', href: '/#experience' }],
  }),

  contact: () => ({
    text: `Email Charlie at ${profile.email} (or ${profile.altEmail}), call or text ${profile.phoneDisplay}, or message him on LinkedIn. You can also use the contact form, or book a Google Meet call.`,
    actions: [
      { label: 'Email Charlie', href: `mailto:${profile.email}`, external: true },
      { label: 'Call', href: profile.phoneHref, external: true },
      { label: 'LinkedIn', href: profile.linkedin, external: true },
      { label: 'Book a call', href: '/#book-a-call' },
    ],
  }),

  booking: () => ({
    text: `You can request a Google Meet call with Charlie: ${list(bookingOptions.map((option) => `a ${option.minutes}-minute ${option.title.toLowerCase()} (${option.price.toLowerCase()})`))}. A meeting request does not reserve a calendar event; Charlie must confirm the time and invite.`,
    actions: [{ label: 'Choose a call', href: '/#book-a-call' }],
  }),

  resume: () => ({
    text: `Here's Charlie's résumé as a PDF.`,
    actions: [{ label: 'Open résumé', href: resumeUrl, external: true }],
  }),

  credentials: () => ({
    text: `His education, certifications, and recognitions are in the Credentials section, including Anthropic courses on Claude and the Model Context Protocol.`,
    actions: [{ label: 'Credentials', href: '/#education' }],
  }),

  games: () => ({
    text: `There's an Interactive Lab with playable creative-code games: Dungeon Crawler, Code Racer, Neon Circuit and more.`,
    actions: [{ label: 'Interactive Lab', href: '/lab' }],
  }),

  identity: () => ({
    text: `I'm Alex, a portfolio guide. In local text mode I answer from the content on this site rather than a live AI model. My keyword matching is limited, so ask Charlie to confirm anything unclear. ${voiceIdentity}`,
  }),

  unconfirmed: () => ({
    text: `That detail is not confirmed by the published portfolio. Please confirm availability, delivery dates, proficiency, credentials, or promised results with Charlie directly.`,
    actions: [{ label: 'Confirm with Charlie', href: '/#contact' }],
  }),

  thanks: () => ({ text: `You're welcome! Anything else you'd like to explore?` }),

  fallback: () => ({
    text: `I don't have an answer for that one. I can tell you about Charlie's projects, AI and automation work, skills, experience, or how to contact him. For anything else, he's happy to answer directly.`,
    actions: [{ label: 'Contact Charlie', href: '/#contact' }],
  }),
}

// Keyword scoring. Order matters only for ties: earlier intents win.
const intents = [
  ['identity', ['who are you', 'are you a', 'are you an', 'are you ai', 'are you real', 'real ai', 'a bot', 'your name', 'chatgpt', 'are you human', 'what are you', 'who made you']],
  ['pricing', ['price', 'pricing', 'cost', 'charge', 'rate', 'rates', 'budget', 'quote', 'how much', 'fee', 'fees']],
  ['booking', ['book', 'booking', 'schedule', 'meeting', 'meet', 'gmeet', 'google meet', 'appointment', 'consult', 'consultation', 'free call', 'intro call', 'discovery call', 'calendar', 'zoom']],
  ['contact', ['contact', 'email', 'reach', 'hire', 'phone', 'call him', 'linkedin', 'github', 'touch', 'message him', 'get in touch']],
  ['resume', ['resume', 'résumé', 'cv', 'curriculum']],
  ['voice', ['voice', 'accent', 'elevenlabs', 'voices', 'audio', 'speak', 'listen', 'studio', 'talk to alex', 'multilingual', 'bilingual', 'spanish', 'español', 'tagalog', 'taglish']],
  ['bots', ['custom bot', 'telegram bot', 'discord bot', 'slack bot', 'chat bot']],
  ['automations', ['automation', 'automate', 'n8n', 'zapier', 'make.com', 'gohighlevel', 'ghl', 'workflow']],
  ['ai', ['ai', 'agent', 'llm', 'gpt', 'claude', 'openai', 'mcp', 'machine learning', 'chatbot', 'alex']],
  ['services', ['service', 'offer', 'build for me', 'help me', 'can he build', 'freelance', 'available', 'availability']],
  ['projects', ['project', 'built', 'build', 'work', 'portfolio', 'product', 'app', 'zalio', 'hasti', 'case study', 'demo']],
  ['skills', ['skill', 'stack', 'tech', 'language', 'framework', 'python', 'react', 'typescript', 'node', 'go ', 'tools']],
  ['experience', ['experience', 'job', 'career', 'company', 'role', 'worked', 'background', 'years']],
  ['credentials', ['certificate', 'certification', 'education', 'degree', 'school', 'credential', 'course']],
  ['games', ['game', 'play', 'arcade', 'lab']],
  ['about', ['about', 'who is charlie', 'charlie', 'location', 'where', 'based', 'timezone']],
  ['thanks', ['thanks', 'thank you', 'cheers', 'great', 'awesome', 'cool']],
  ['greeting', ['hello', 'hi', 'hey', 'help', 'start', 'yo']],
]

const normalize = (text) => ` ${String(text).toLowerCase().replace(/[^a-z0-9é.\s']/g, ' ').replace(/\s+/g, ' ').trim()} `

const allSkills = skillGroups.flatMap((group) => group.skills.map((skill) => ({ skill, group: group.title, offeredOnly: group.offeredSkills?.includes(skill) === true })))

// "Tell me about Zalio": a named system gets its own answer, from its own copy.
const findSystem = (text) => {
  const named = momentumSystems
    .map((system) => ({ system, name: system.title.split(/\s+—\s+/)[0].toLowerCase() }))
    .filter(({ name }) => name !== 'alex' && name.length > 2 && text.includes(` ${name}`))
    .sort((a, b) => b.name.length - a.name.length)[0]
  if (!named) return null
  const { system } = named
  const shortName = system.title.split(/\s+—\s+/)[0]
  // Alex the voice agent lives on Hasti; say so, so it isn't confused with me.
  const linkLabel = system.linkLabel === 'Talk to Alex' ? 'Talk to Alex on Hasti' : system.linkLabel ?? `Open ${shortName}`
  return {
    text: `${system.title}: ${system.summary}`,
    actions: [
      ...(system.url ? [{ label: linkLabel, href: system.url, external: true }] : []),
      { label: 'Systems & demos', href: '/#momentum-work' },
    ],
  }
}

// "Does he know Python?": answer from the skills list, never guess.
const findSkill = (text) => {
  const hit = allSkills
    .filter(({ skill }) => {
      const key = skill.toLowerCase().split(/[\s/(]/)[0]
      return key.length > 1 && text.includes(` ${key} `)
    })
    // Prefer a skill named in full, then the shortest match ("React 19" over "React Native").
    .sort((a, b) => Number(text.includes(` ${b.skill.toLowerCase()} `)) - Number(text.includes(` ${a.skill.toLowerCase()} `)) || a.skill.length - b.skill.length)[0]
  if (!hit) return null
  return {
    text: hit.offeredOnly
      ? `${hit.skill} is listed as part of Charlie's offered automation toolkit. The linked projects do not establish deployed workflows on this platform; confirm scope and experience directly with Charlie.`
      : `Yes: ${hit.skill} is part of Charlie's ${hit.group.toLowerCase()} toolkit. The Skills section lists the rest.`,
    actions: [{ label: 'All skills', href: '/#skills' }],
  }
}

export function answerQuestion(input) {
  const text = normalize(input)
  if (text.trim().length === 0) return answers.greeting()

  // Commercial commitments must be checked before named projects, skills, or
  // booking keywords; a free discovery call does not make a project free.
  if (/\b(price|pricing|cost|charge|rate|rates|budget|quote|fee|fees|how much|hourly)\b/.test(text)) return answers.pricing()
  if (/\b(available|availability|timeline|timeframe|turnaround|deadline|deliver|delivery|guarantee|guaranteed|expert|proficient|senior|seniority|years?|certified)\b|\bwhen\b.*\b(start|finish|launch|free)\b|\b(does|has|holds?|have)\b.*\b(certification|degree)\b/.test(text)
    || /\bhow (long|soon)\b|\b(can|could|will|would)\b.*\b(start|ship|finish|launch)\b|\b(tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b|\bnext (week|month)\b/.test(text)
    || (/\d/.test(text) && /\b(revenue|growth|conversion|metrics?|roi|percent)\b/.test(text))) return answers.unconfirmed()

  if (/\b(talk to alex|elevenlabs|portfolio alex)\b/.test(text)) return answers.voice()

  const asksAboutUs = /\b(are you|who are you|your name|you a bot)\b/.test(text)
  if (!asksAboutUs) {
    const study = caseStudies
      .filter(item => [item.title, item.slug].some(name => text.includes(normalize(name))))
      .sort((a, b) => b.title.length - a.title.length)[0]
    if (study) return {
      text: `${study.title}: ${study.overview} Role: ${study.role}. ${[].concat(study.responsibilities).join(' ')} Status: ${study.status}.`,
      actions: [{ label: 'Read the case study', href: `/projects/${study.slug}` }],
    }
    if (/\b(aws|devops|cloud|docker|ci cd|gitlab ci|jenkins|deployment pipelines?|continuous integration)\b/.test(text)) return answers.cloud()
    if (/\b(custom bots?|telegram bots?|discord bots?|slack bots?|chat bots?)\b/.test(text)) return answers.bots()
    const specific = findSystem(text) ?? (/(know|use|work with|experience with|familiar)/.test(text) ? findSkill(text) : null)
    if (specific) return specific
  }

  let best = null
  let bestScore = 0
  for (const [intent, keywords] of intents) {
    let score = 0
    for (const keyword of keywords) {
      // Short keywords must match whole words ("ai" must not match "said").
      const needle = keyword.length <= 3 ? ` ${keyword} ` : keyword
      if (text.includes(needle)) score += keyword.length <= 3 ? 1 : 2
    }
    if (score > bestScore) {
      best = intent
      bestScore = score
    }
  }
  return (answers[best] ?? answers.fallback)()
}

export function answerSuggestion(id) {
  return (answers[id] ?? answers.fallback)()
}
