// Public portfolio evidence only. These helpers do not make model/API calls.
import { skillGroups } from '../data/portfolioData.js'
import { caseStudies } from '../data/caseStudies.js'
import { selectedCaseStudies } from '../data/selectedCaseStudies.js'

const clean = (value, limit = 4000) => String(value ?? '').trim().slice(0, limit)
const escapePattern = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const termPattern = value => new RegExp(`(?<![a-z0-9])${escapePattern(value)}(?![a-z0-9])`, 'gi')
const contributionFor = study => selectedCaseStudies.find(item => item.id === study.slug)?.contribution
  || (Array.isArray(study.responsibilities) ? study.responsibilities.join(' ') : study.responsibilities)
const isPlannedStudy = study => /planned|in development/i.test(study.status)

const topics = [
  { label: 'CRM', pattern: /\b(crm|leads?|customer management|member management|inbox)\b/i },
  { label: 'automation', pattern: /\b(automat\w*|follow[ -]?ups?|workflows?|n8n|zapier|retention|reactivation)\b/i },
  { label: 'voice', pattern: /\b(voice|calls?|calling|receptionist|telephony|twilio|livekit)\b/i },
  { label: 'mobile', pattern: /\b(mobile|android|ios|expo|react native|riders?|rides?|delivery)\b/i },
  { label: 'live tracking', pattern: /\b(tracking|maps?|gps|websockets?|real[ -]?time)\b/i },
  { label: 'payments', pattern: /\b(payments?|billing|invoices?|reconciliation|fintech)\b/i },
  { label: 'booking', pattern: /\b(bookings?|appointments?|calendar|scheduling)\b/i },
  { label: 'web applications', pattern: /\b(websites?|web apps?|dashboards?|saas|portals?)\b/i },
  { label: 'backend', pattern: /\b(backends?|apis?|databases?|servers?)\b/i },
  { label: 'security', pattern: /\b(security|authentication|rbac|audit|otp|rfid)\b/i },
  { label: 'AI', pattern: /\b(ai|agents?|llm|mcp|chatbots?)\b/i },
  { label: 'desktop', pattern: /\b(desktop|macos|electron|appkit|swift)\b/i },
  { label: 'developer tools', pattern: /\b(cli|developer tools?|coding|terminal)\b/i },
]

const projectIndex = caseStudies.map(study => ({
  study,
  summary: `${study.title} ${study.overview} ${study.categories.join(' ')}`,
  detail: [study.problem, contributionFor(study), study.outcome, ...study.architecture, ...study.workflows, ...study.stack].join(' '),
}))

const extraAliases = {
  'node.js': ['nodejs', 'node js'],
  'next.js': ['nextjs', 'next js'],
  'vue.js': ['vue', 'vuejs'],
  postgresql: ['postgres'],
  'c#': ['csharp'],
  '.net': ['dotnet'],
}
const catalog = new Map()
for (const group of skillGroups) {
  for (const entry of group.skills) {
    for (const skill of entry.split(/\s*\/\s*/)) {
      const label = skill.replace(/\s+\d+(?:\.\d+)*$/, '').trim()
      const key = label.toLowerCase()
      const item = catalog.get(key) || { label, group: group.title, href: '/#skills', aliases: new Set() }
      for (const alias of [skill, label, ...(extraAliases[key] || [])]) item.aliases.add(alias)
      catalog.set(key, item)
    }
  }
}
// A project's explicitly listed stack is also evidence, even if the skill
// section uses a more compact label (for example JavaScript).
for (const { study } of projectIndex) {
  for (const skill of study.stack.flatMap(entry => entry.split(/\s*\/\s*/))) {
    const key = skill.toLowerCase()
    const existing = catalog.get(key)
    if (!existing || (existing.plannedOnly && !isPlannedStudy(study))) {
      catalog.set(key, { label: skill, group: 'Project stack', href: `/projects/${study.slug}`, plannedOnly: isPlannedStudy(study), aliases: new Set([skill]) })
    }
  }
}

function matchSkills(input) {
  const candidates = []
  for (const item of catalog.values()) {
    for (const alias of item.aliases) {
      for (const match of input.matchAll(termPattern(alias))) {
        candidates.push({ item, start: match.index, end: match.index + match[0].length })
      }
    }
  }
  const occupied = new Set()
  const matches = []
  for (const candidate of candidates.sort((a, b) => (b.end - b.start) - (a.end - a.start))) {
    const positions = Array.from({ length: candidate.end - candidate.start }, (_, index) => index + candidate.start)
    if (positions.some(position => occupied.has(position))) continue
    positions.forEach(position => occupied.add(position))
    matches.push(candidate)
  }
  return {
    items: [...new Set(matches.map(match => match.item))],
    remainder: [...input].map((character, index) => occupied.has(index) ? ' ' : character).join(''),
  }
}

// Compare complete stack labels, so a React Native-only stack is not used as
// proof of web React just because both contain the word React.
const studySkills = new Map(projectIndex.map(({ study }) => [study.slug, new Set(matchSkills(study.stack.join(', ')).items.map(item => item.label))]))

export function recommendProjects(input) {
  const query = clean(input, 1000)
  const requestedTopics = topics.filter(topic => topic.pattern.test(query))
  const requestedSkills = matchSkills(query).items
  const specificTerms = [...new Set(query.toLowerCase().match(/[a-z]{3,}/g) || [])]
    .filter(term => !['need', 'want', 'with', 'have', 'that', 'this', 'would', 'like', 'could', 'please', 'build', 'project', 'app', 'the', 'for', 'and'].includes(term))
  const ranked = projectIndex.map(({ study, summary, detail }) => {
    const matchingTopics = requestedTopics.filter(topic => topic.pattern.test(`${summary} ${detail}`))
    const matchingSkills = requestedSkills.filter(item => studySkills.get(study.slug).has(item.label))
    const score = matchingTopics.reduce((total, topic) => total + (topic.pattern.test(summary) ? 4 : 1), 0)
      + matchingSkills.length * 3
      + specificTerms.filter(term => termPattern(term).test(study.title)).length * 2
      + (matchingTopics.length || matchingSkills.length ? specificTerms.filter(term => termPattern(term).test(`${summary} ${detail}`)).length * 2 : 0)
      + (matchingTopics.length && selectedCaseStudies.some(item => item.id === study.slug) ? 3 : 0)
    return { study, score, matchingTopics, matchingSkills }
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 3)
  const projects = ranked.map(({ study, matchingTopics, matchingSkills }) => ({
    title: study.title,
    href: `/projects/${study.slug}`,
    contribution: contributionFor(study),
    reason: matchingTopics.length || matchingSkills.length
      ? `Relevant to: ${[...matchingTopics.map(topic => topic.label), ...matchingSkills.map(item => item.label)].join(', ')}.`
      : `${study.title} matches the project name in your request.`,
    status: study.status,
  }))
  return {
    text: projects.length ? 'These case studies relate to your request. Open each one to review the scope and Charlie’s contribution.'
      : 'I could not find a clear project match in the public portfolio. Describe the main workflow, or ask Charlie to discuss the idea directly.',
    projects,
    enquiry: {
      subject: 'Project enquiry from the portfolio',
      message: `I would like to discuss this project:\n${query}\n\n${projects.length ? `Relevant portfolio examples:\n${projects.map(project => `- ${project.title}`).join('\n')}` : 'Scope and feasibility: to discuss.'}`,
    },
  }
}

function evidenceFor(item) {
  if (item.plannedOnly) return [{ text: `${item.label} appears only in a planned or in-development project stack; delivered experience is not established.`, href: item.href }]
  const evidence = [{ text: `${item.label} — listed in ${item.group}.`, href: item.href }]
  for (const { study } of projectIndex) {
    if (evidence.length >= 3) break
    if (isPlannedStudy(study)) continue
    if (studySkills.get(study.slug).has(item.label)) {
      evidence.push({ text: `${study.title}: ${contributionFor(study)}`, href: `/projects/${study.slug}` })
    }
  }
  return evidence
}

export function assessRole(input) {
  const original = String(input ?? '').trim()
  // Keep shared qualifiers/negation attached to every technology in a line:
  // “5 years of React and Python” must not certify Python on its own.
  const clauses = clean(input).split(/\n|;/)
    .map(line => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim()).filter(Boolean)
  const requirements = [...new Set(clauses)].slice(0, 30).map(requirement => {
    const { items, remainder } = matchSkills(requirement)
    // A skill mention cannot establish seniority, years, certifications,
    // eligibility, or the other words a visitor includes in a requirement.
    const unexplained = remainder.toLowerCase()
      .replace(/\b(experience|experienced|with|in|using|knowledge|of|skills?|proficiency|proficient|required|requirements?|preferred|development|developer|engineering|engineer|strong|the|a|an|to|and)\b/g, ' ')
      .replace(/[^a-z0-9]/g, '').trim()
    const negated = /\b(no|not|without|excluding|except)\b/i.test(requirement)
    const establishedItems = items.filter(item => !item.plannedOnly)
    const status = negated || establishedItems.length === 0 ? 'unverified'
      : unexplained || establishedItems.length !== items.length ? 'partial' : 'documented'
    return {
      requirement,
      status,
      text: status === 'documented' ? 'Mentioned in the public portfolio; confirm depth and suitability directly.'
        : status === 'partial' ? 'Related skills are documented; the full requirement is not established. Confirm directly.'
          : 'This requirement is not established by this comparison. Confirm directly with Charlie.',
      evidence: negated ? [] : items.flatMap(evidenceFor).slice(0, 6),
    }
  })
  return {
    text: requirements.length ? 'This is a comparison with public portfolio evidence, not a hiring verdict. Unverified does not mean Charlie lacks the skill.'
      : 'Paste the role’s requirements, preferably one per line, to compare them with the public portfolio.',
    requirements,
    truncated: original.length > 4000 || clauses.length > 30,
  }
}

export const briefQuestions = [
  { key: 'idea', question: 'What would you like to build or improve? A sentence or two is enough.' },
  { key: 'users', question: 'Who will use it, and what problem should it solve for them?' },
  { key: 'features', question: 'What are the must-have features or integrations? You can list a few.' },
  { key: 'delivery', question: 'What is your preferred timeline and budget range? “To discuss” is fine.' },
]

export function buildProjectBrief(answers) {
  const value = key => clean(answers?.[key], 1000) || 'To discuss'
  return {
    subject: `Project enquiry: ${value('idea').replace(/\s+/g, ' ').slice(0, 90)}`,
    message: `Project idea\n${value('idea')}\n\nUsers and problem\n${value('users')}\n\nMust-have features and integrations\n${value('features')}\n\nTimeline and budget\n${value('delivery')}\n\nPlease review the scope and let me know the next steps.`,
  }
}
