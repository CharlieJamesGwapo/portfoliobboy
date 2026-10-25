import { featuredProjects, profile } from './portfolioData.js'

export const siteOrigin = 'https://portfoliobboy.vercel.app'
export const caseStudySlug = projectId => ({ 'one-ride-balingasag': 'oneride', 'bboy-assistant': 'bboy' }[projectId] || projectId)
const caseEntries = featuredProjects.map(project => ({
  pathname: `/projects/${caseStudySlug(project.id)}`,
  title: `${project.title} — Engineering case study | Charlie Abejo`,
  description: project.overview,
  projectTitle: project.title,
}))
export const routeMetadata = [
  { pathname: '/', title: 'Charlie James Abejo | Lead Full-Stack Developer — AI, Web & Mobile', description: 'Lead full-stack developer in Cebu City building AI voice agents, CRM platforms, reliable APIs, and web, mobile, and desktop products.' },
  { pathname: '/projects', title: 'Projects & engineering case studies | Charlie Abejo', description: 'Explore Charlie Abejo’s client platforms, independent products, and engineering case studies across AI, mobile, desktop, web, and backend systems.' },
  { pathname: '/lab', title: 'Charlie’s Arcade — Interactive engineering lab', description: 'Nine playable canvas, keyboard, touch, and WebGL experiments, loaded separately from Charlie Abejo’s professional portfolio.' },
  { pathname: '/projects/alex-hasti', title: 'Alex / Hasti — AI voice engineering | Charlie Abejo', description: 'Voice runtime, callback experience, LiveKit Agents, Twilio SIP, consent-aware intake, and durable CRM handoff.', projectTitle: 'Alex / Hasti' },
  { pathname: '/projects/zalio-crm', title: 'Zalio CRM — Engineering case study | Charlie Abejo', description: 'Lead inbox, forms, omnichannel conversations, retention workflows, calling, and calendar booking in the Zalio CRM module.', projectTitle: 'Zalio CRM' },
  ...caseEntries,
]
export function getRouteMetadata(pathname) {
  return routeMetadata.find(route => route.pathname === pathname) || {
    pathname, title: 'Page not found | Charlie Abejo', description: 'Explore the portfolio and its engineering case studies.', noindex: true,
  }
}
export function routeStructuredData(metadata) {
  if (!metadata.projectTitle) return null
  return { '@context': 'https://schema.org', '@type': 'CreativeWork', name: metadata.projectTitle, description: metadata.description, url: siteOrigin + metadata.pathname, author: { '@type': 'Person', name: profile.name, url: siteOrigin } }
}
