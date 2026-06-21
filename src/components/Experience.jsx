import { useState } from 'react'
import { Briefcase, Calendar, MapPin, ChevronRight, Layers, ArrowUpRight } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

const Experience = () => {
  const [expandedCard, setExpandedCard] = useState(0)

  const experiences = [
    {
      company: 'Rooche Digital Company',
      role: 'Full Stack Developer',
      period: 'Jan 2026 — Mar 2026',
      location: 'Remote',
      type: 'Full-time',
      description: 'Built Python microservices and full-stack tooling powering internal systems and customer dashboards.',
      achievements: [
        'Built Python FastAPI microservices with Pydantic validation and OpenAPI docs',
        'Shipped REST and GraphQL APIs for internal tooling and customer dashboards',
        'Integrated Firebase and Supabase for auth and real-time sync',
        'Maintained CI/CD on GitLab, Buddy, Bitbucket with pytest gates',
        'Built WebSocket and webhook integrations for live dashboard updates'
      ],
      technologies: ['Python (FastAPI, Pydantic, pytest)', 'Node.js', 'React.js', 'Next.js', 'Angular', 'PostgreSQL', 'Firebase', 'Supabase', 'Docker', 'GitLab CI']
    },
    {
      company: 'Robustech IT / SocietyOne',
      role: 'Full Stack Developer',
      period: 'Jan 2024 — Dec 2025',
      location: 'Australia (Remote)',
      type: 'Contract',
      description: 'Modernized fintech backend services and serverless workflows for an Australian personal-loan platform.',
      achievements: [
        'Re-platformed Golang services to .NET (C#) for maintainability',
        'Migrated Node.js microservices to .NET standardizing logging and deployment',
        'Built AWS Lambda serverless functions (Python and .NET) for event-driven workflows',
        'Wrote Python automation scripts (Pandas, httpx) for reconciliation and reporting',
        'Owned JSON-RPC, WebSocket, and webhook integrations with partner banking systems'
      ],
      technologies: ['C# / ASP.NET Core', 'Go', 'Node.js', 'Python', 'AWS Lambda', 'REST', 'GraphQL', 'PostgreSQL', 'Buddy CI/CD']
    },
    {
      company: 'Filtra Coffee POS System',
      role: 'Full Stack Developer',
      period: 'Jun 2023 — Dec 2023',
      location: 'Freelance',
      type: 'Freelance',
      description: 'Delivered a production point-of-sale platform used daily by store staff.',
      achievements: [
        'Built production POS platform with Go backend and Next.js/Vue.js frontends',
        'Shipped sales, inventory, and reporting modules used daily by store staff',
        'Containerized with Docker and deployed via Render'
      ],
      technologies: ['Go', 'Next.js', 'Vue.js', 'PostgreSQL', 'Docker', 'Render']
    },
    {
      company: 'MOIST Alumni Online Tracking System',
      role: 'Full Stack Developer',
      period: 'Jan 2023 — May 2023',
      location: 'Freelance',
      type: 'Freelance',
      description: 'Built a secure alumni management platform with role-based access and analytics.',
      achievements: [
        'Developed secure alumni management platform with role-based access and audit trails',
        'Implemented OTP and 2FA over SMS and Email',
        'Built admin dashboard with reports and analytics views'
      ],
      technologies: ['PHP (Laravel, CodeIgniter)', 'MySQL', 'HTML', 'CSS', 'JavaScript', 'REST APIs']
    },
    {
      company: 'Librewry Bistro POS System',
      role: 'Full Stack Developer',
      period: 'Aug 2022 — Dec 2022',
      location: 'Freelance',
      type: 'Freelance',
      description: 'Built order, inventory, and authentication modules for a bistro POS end-to-end.',
      achievements: [
        'Delivered order, inventory, and role-based authentication modules for a bistro POS',
        'Developed backend APIs and frontend interfaces end-to-end',
        'Deployed on Netlify and Railway with automatic build previews'
      ],
      technologies: ['PHP', 'MySQL', 'HTML', 'CSS', 'JavaScript']
    },
    {
      company: 'E-Cycle Hub',
      role: 'Full Stack Developer',
      period: 'Mar 2022 — Jul 2022',
      location: 'Freelance',
      type: 'Freelance',
      description: 'Built a waste-pickup scheduling platform with real-time integrations.',
      achievements: [
        'Built waste-pickup scheduling platform with Go backend and Next.js/Vue.js frontends',
        'Implemented WebSocket and webhook integrations for real-time scheduling',
        'Designed RESTful APIs over NeonDB serverless PostgreSQL'
      ],
      technologies: ['Go', 'Next.js', 'Vue.js', 'PostgreSQL (NeonDB)', 'Vercel', 'Railway']
    },
    {
      company: 'Jolly Ride App',
      role: 'Mobile Developer',
      period: 'Oct 2021 — Feb 2022',
      location: 'Freelance',
      type: 'Freelance',
      description: 'Built a cross-platform ride-booking mobile app with real-time features.',
      achievements: [
        'Built ride-booking mobile app for iOS and Android with React Native',
        'Integrated Supabase and Firebase for real-time data, auth, and in-app messaging'
      ],
      technologies: ['React Native', 'Supabase', 'Firebase', 'JavaScript']
    },
    {
      company: 'Massage Booking App',
      role: 'Mobile Developer',
      period: 'May 2021 — Sep 2021',
      location: 'Freelance',
      type: 'Freelance',
      description: 'Developed an Android booking app with real-time scheduling and notifications.',
      achievements: [
        'Developed Android booking app in Android Studio',
        'Integrated Firebase for real-time scheduling and push notifications'
      ],
      technologies: ['Android Studio', 'Firebase', 'Java/Kotlin']
    },
    {
      company: 'Personal Portfolio Website',
      role: 'Full Stack Developer',
      period: 'Jan 2021 — Apr 2021',
      location: 'Personal',
      type: 'Personal',
      description: 'Built a responsive, SEO-friendly portfolio with continuous deployment.',
      achievements: [
        'Built responsive SEO-friendly portfolio with React.js, Next.js, Tailwind CSS',
        'Deployed on Vercel with continuous deployment from GitHub'
      ],
      technologies: ['React.js', 'Next.js', 'Tailwind CSS', 'Vercel']
    }
  ]

  const totalYears = 5

  return (
    <section id="experience" className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-14 sm:mb-20">
            <div className="inline-flex items-center gap-2 text-blue-400 text-xs sm:text-sm font-medium tracking-widest uppercase mb-4">
              <Briefcase size={14} />
              Professional Background
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5">
              Work Experience
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6 rounded-full" />
            <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              {totalYears}+ years building production-grade applications for international clients — from fintech platforms to SaaS dashboards.
            </p>
          </div>
        </ScrollReveal>

        {/* Experience Cards */}
        <div className="space-y-5 sm:space-y-6">
          {experiences.map((exp, index) => {
            const isExpanded = expandedCard === index
            return (
              <ScrollReveal key={index} animation="fade-up" delay={index * 150}>
                <div
                  className={`group relative rounded-2xl border transition-all duration-500 cursor-pointer ${
                    isExpanded
                      ? 'bg-white/[0.04] border-blue-500/30 shadow-lg shadow-blue-500/5'
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.03]'
                  }`}
                  onClick={() => setExpandedCard(isExpanded ? -1 : index)}
                >
                  {/* Card Header — always visible */}
                  <div className="p-5 sm:p-7">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      {/* Left: Role & Company */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                            {exp.role}
                          </h3>
                          <span className="shrink-0 text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {exp.type}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-gray-400 text-xs sm:text-sm">
                          <span className="flex items-center gap-1.5">
                            <Layers size={13} className="text-gray-500" />
                            {exp.company}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-gray-500" />
                            {exp.location}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-gray-500" />
                            {exp.period}
                          </span>
                        </div>
                      </div>

                      {/* Right: Expand indicator */}
                      <div className={`hidden sm:flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-300 ${
                        isExpanded
                          ? 'bg-blue-500/10 border-blue-500/30 rotate-45'
                          : 'bg-white/5 border-white/10 group-hover:border-white/20'
                      }`}>
                        <ArrowUpRight size={16} className={isExpanded ? 'text-blue-400' : 'text-gray-500'} />
                      </div>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="px-5 sm:px-7 pb-6 sm:pb-7 border-t border-white/[0.06]">
                      <p className="text-gray-400 text-sm sm:text-base mt-5 mb-5 leading-relaxed">
                        {exp.description}
                      </p>

                      {/* Achievements */}
                      <div className="mb-5">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                          Key Contributions
                        </h4>
                        <ul className="space-y-2.5">
                          {exp.achievements.map((achievement, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-gray-300 text-xs sm:text-sm leading-relaxed">
                              <ChevronRight size={14} className="text-blue-400 mt-0.5 shrink-0" />
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Tech Stack */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                          Tech Stack
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {exp.technologies.map((tech, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 text-[11px] sm:text-xs font-medium rounded-lg bg-white/[0.05] text-gray-300 border border-white/[0.08] hover:border-blue-500/30 hover:text-blue-300 transition-colors duration-200"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>

        {/* Summary Stats Bar */}
        <ScrollReveal animation="fade-up" delay={400}>
          <div className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { value: '5+', label: 'Years Experience' },
              { value: '9', label: 'Roles' },
              { value: '20+', label: 'Technologies' },
              { value: '100%', label: 'Remote' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="text-center py-4 sm:py-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors duration-300"
              >
                <div className="text-xl sm:text-2xl font-bold text-white mb-0.5">{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-gray-500 font-medium tracking-wide uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default Experience
