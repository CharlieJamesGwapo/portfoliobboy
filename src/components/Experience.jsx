import { useState } from 'react'
import { Briefcase, Calendar, MapPin, ChevronRight, Layers, ArrowUpRight } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

const Experience = () => {
  const [expandedCard, setExpandedCard] = useState(0)

  const experiences = [
    {
      company: 'Rooche Digital Company',
      role: 'Full Stack Developer',
      period: '2024',
      location: 'Remote',
      type: 'Full-time',
      description: 'Developed web applications and client dashboards for multiple clients across different industries.',
      achievements: [
        'Built web apps and client dashboards using Node.js (backend) and React.js (frontend)',
        'Wrote RESTful APIs and integrated third-party services for payments, messaging, and analytics',
        'Implemented secure authentication systems and role-based access control',
        'Optimized frontend and backend performance for faster load times',
        'Participated in code reviews, Agile sprints, and CI/CD pipeline management using Buddy'
      ],
      technologies: ['Node.js', 'React.js', 'PostgreSQL', 'Firebase', 'Supabase', 'AWS Lambda', 'Buddy CI/CD']
    },
    {
      company: 'Robustech IT / SocietyOne',
      role: 'Full Stack Developer',
      period: '2023 — 2024',
      location: 'Australia (Remote)',
      type: 'Contract',
      description: 'Developed an online personal loan platform serving Australian clients and broker support systems.',
      achievements: [
        'Rewrote legacy Golang services into C# .NET for improved maintainability and scalability',
        'Migrated Node.js services to .NET to standardize backend architecture',
        'Developed AWS Lambda functions for event-driven serverless processes',
        'Optimized APIs for performance, security, and reliability',
        'Collaborated in Agile environment with international development teams'
      ],
      technologies: ['C# (.NET)', 'Go (Golang)', 'Node.js', 'AWS Lambda', 'PostgreSQL', 'REST APIs']
    }
  ]

  const totalYears = 2

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
              { value: '2+', label: 'Years Experience' },
              { value: '2', label: 'Companies' },
              { value: '7+', label: 'Technologies' },
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
