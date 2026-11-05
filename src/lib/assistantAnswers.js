// ============================================================================
// Alex's text answers: a local, deterministic answer engine.
//
// No model, no network, no credits. Every answer is assembled from the same
// data the portfolio renders (src/data/portfolioData.js), so the assistant can
// never claim something the site itself does not say. Questions it cannot
// match get an honest fallback pointing to topics it does know and to contact.
// ============================================================================
import {
  aiSystemCapabilities,
  experiences,
  momentumSystems,
  profile,
  resumeUrl,
  skillGroups,
} from '../data/portfolioData'
import { automationToolbox } from '../data/automationsData'
import { voiceAccents } from '../data/voiceAccents'

// "Custom AI agents" -> "custom AI agents": lower only the first letter, so
// acronyms like AI, CRM, and n8n keep their casing.
const lowerFirst = (text) => (/^[A-Z][a-z]/.test(text) ? text[0].toLowerCase() + text.slice(1) : text)

const list = (items) => {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

const current = experiences.find((item) => item.featured) ?? experiences[0]
const liveSystems = momentumSystems.filter((system) => system.url && system.statusTone === 'live')
const flagship = momentumSystems.slice(0, 5)

// Suggested questions shown as chips. Each maps to an intent below.
export const suggestedQuestions = [
  { id: 'projects', label: 'What has Charlie built?' },
  { id: 'ai', label: 'Tell me about his AI work' },
  { id: 'services', label: 'What can he build for me?' },
  { id: 'skills', label: 'Which tech does he use?' },
  { id: 'contact', label: 'How do I contact him?' },
]

const answers = {
  greeting: () => ({
    text: `Hi! I can walk you through Charlie's projects, AI and automation work, skills, experience, or how to reach him. What would you like to know?`,
  }),

  about: () => ({
    text: `Charlie James Abejo is an ${profile.role} based in ${profile.location}. He's currently ${current.role} at ${current.company} (${current.period}): ${current.summary}`,
    actions: [{ label: 'About Charlie', href: '#about' }, { label: 'Experience', href: '#experience' }],
  }),

  projects: () => ({
    text: `Some highlights: ${list(flagship.map((system) => system.title.replace(/\s+—.*$/, '')))}. ${liveSystems.length} of his systems have public live links you can try right from the portfolio.`,
    actions: [{ label: 'Selected work', href: '#product-studio-preview' }, { label: 'Systems & demos', href: '#momentum-work' }, { label: 'Project archive', href: '#projects' }],
  }),

  ai: () => ({
    text: `Charlie builds ${list(aiSystemCapabilities.slice(0, 4).map((item) => lowerFirst(item.title)))}. A production example is Alex, his AI voice agent on LiveKit and GPT-Live over Twilio SIP, which powers the live callback demo on hasti.com.au.`,
    actions: [{ label: 'AI systems', href: '#ai-systems' }, { label: 'Voice Studio', href: '#voice-demo' }],
  }),

  voice: () => ({
    text: `The Voice Studio has ${voiceAccents.length} short sample conversations in different English accents, generated with ElevenLabs. They're pre-recorded previews. For a real live call, try Alex on hasti.com.au.`,
    actions: [{ label: 'Open the Voice Studio', href: '#voice-demo' }, { label: 'Talk to Alex on Hasti', href: 'https://hasti.com.au/', external: true }],
  }),

  automations: () => ({
    text: `He builds automations with ${list(automationToolbox.slice(0, 4))}, plus AI agents that qualify leads, book appointments, and follow up, with retries, logging, and a human handoff.`,
    actions: [{ label: 'Automation workflows', href: '#automations' }],
  }),

  services: () => ({
    text: `Charlie can help with ${list(aiSystemCapabilities.map((item) => lowerFirst(item.title)))}, as well as full-stack web and mobile apps. He works remotely and can overlap US business hours.`,
    actions: [{ label: 'Start a conversation', href: '#contact' }, { label: 'AI systems', href: '#ai-systems' }],
  }),

  pricing: () => ({
    text: `Pricing depends on the scope of the project, so Charlie quotes each one individually. Share a little about what you need and he'll get back to you.`,
    actions: [{ label: 'Contact Charlie', href: '#contact' }, { label: 'Email', href: `mailto:${profile.email}`, external: true }],
  }),

  skills: () => ({
    text: skillGroups.slice(0, 4).map((group) => `${group.title}: ${group.skills.slice(0, 5).join(', ')}`).join('. ') + '.',
    actions: [{ label: 'All skills', href: '#skills' }],
  }),

  experience: () => ({
    text: `Currently: ${current.role} at ${current.company}, ${current.period}. Before that, ${list(experiences.filter((item) => item !== current).slice(0, 2).map((item) => `${item.role} at ${item.company}`))}.`,
    actions: [{ label: 'Full experience', href: '#experience' }],
  }),

  contact: () => ({
    text: `You can email Charlie at ${profile.email}, or reach him on LinkedIn or GitHub. The contact form at the bottom of the page works too.`,
    actions: [
      { label: 'Email Charlie', href: `mailto:${profile.email}`, external: true },
      { label: 'LinkedIn', href: profile.linkedin, external: true },
      { label: 'Contact form', href: '#contact' },
    ],
  }),

  resume: () => ({
    text: `Here's Charlie's résumé as a PDF.`,
    actions: [{ label: 'Open résumé', href: resumeUrl, external: true }],
  }),

  credentials: () => ({
    text: `His education, certifications, and recognitions are in the Credentials section, including Anthropic courses on Claude and the Model Context Protocol.`,
    actions: [{ label: 'Credentials', href: '#education' }],
  }),

  games: () => ({
    text: `There's an Interactive Lab with playable creative-code games: Dungeon Crawler, Code Racer, Neon Circuit and more.`,
    actions: [{ label: 'Interactive Lab', href: '#lab' }],
  }),

  identity: () => ({
    text: `I'm Alex, a portfolio guide. Right now I answer from the content on this site rather than a live AI model, so my replies are instant and don't make anything up. A voice version will come later. I share my name with Alex, the production AI voice agent Charlie built for Hasti.`,
  }),

  thanks: () => ({ text: `You're welcome! Anything else you'd like to explore?` }),

  fallback: () => ({
    text: `I don't have an answer for that one. I can tell you about Charlie's projects, AI and automation work, skills, experience, or how to contact him. For anything else, he's happy to answer directly.`,
    actions: [{ label: 'Contact Charlie', href: '#contact' }],
  }),
}

// Keyword scoring. Order matters only for ties: earlier intents win.
const intents = [
  ['identity', ['who are you', 'are you a', 'are you an', 'are you ai', 'are you real', 'real ai', 'a bot', 'your name', 'chatgpt', 'are you human', 'what are you', 'who made you']],
  ['pricing', ['price', 'pricing', 'cost', 'charge', 'rate', 'rates', 'budget', 'quote', 'how much', 'fee', 'fees']],
  ['contact', ['contact', 'email', 'reach', 'hire', 'phone', 'call him', 'linkedin', 'github', 'touch', 'message him', 'get in touch']],
  ['resume', ['resume', 'résumé', 'cv', 'curriculum']],
  ['voice', ['voice', 'accent', 'elevenlabs', 'audio', 'speak', 'listen', 'studio', 'talk to alex']],
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

const allSkills = skillGroups.flatMap((group) => group.skills.map((skill) => ({ skill, group: group.title })))

// "Tell me about Zalio": a named system gets its own answer, from its own copy.
const findSystem = (text) => {
  const named = momentumSystems
    .map((system) => ({ system, name: system.title.split(/\s+—\s+/)[0].toLowerCase() }))
    .filter(({ name }) => name.length > 2 && text.includes(` ${name}`))
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
      { label: 'Systems & demos', href: '#momentum-work' },
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
    text: `Yes: ${hit.skill} is part of Charlie's ${hit.group.toLowerCase()} toolkit. The Skills section lists the rest.`,
    actions: [{ label: 'All skills', href: '#skills' }],
  }
}

export function answerQuestion(input) {
  const text = normalize(input)
  if (text.trim().length === 0) return answers.greeting()

  const asksAboutUs = /\b(are you|who are you|your name|you a bot)\b/.test(text)
  if (!asksAboutUs) {
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
