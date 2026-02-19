import { Briefcase, Calendar, MapPin, ChevronRight } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

const Experience = () => {
  const experiences = [
    {
      company: 'Rooche Digital Company',
      role: 'Full Stack Developer',
      period: 'Present',
      location: 'Remote',
      type: 'Full-time',
      current: true,
      description: 'Developing web applications and client dashboards for multiple clients across different industries.',
      achievements: [
        'Building web apps and client dashboards using Node.js (backend) and React.js (frontend)',
        'Writing RESTful APIs and integrating third-party services for payments, messaging, and analytics',
        'Implementing secure authentication systems and role-based access control',
        'Optimizing frontend and backend performance for faster load times',
        'Participating in code reviews, Agile sprints, and CI/CD pipeline management using Buddy'
      ],
      technologies: ['Node.js', 'React.js', 'PostgreSQL', 'Firebase', 'Supabase', 'AWS Lambda', 'Buddy CI/CD']
    },
    {
      company: 'Robustech IT / SocietyOne',
      role: 'Full Stack Developer',
      period: '2023 - 2024',
      location: 'Australia (Remote)',
      type: 'Contract',
      current: false,
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

  return (
    <section id="experience" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Work Experience
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-4"></div>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Professional experience building production-grade applications for international clients
            </p>
          </div>
        </ScrollReveal>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-cyan-500 hidden md:block"></div>

          <div className="space-y-8 sm:space-y-12">
            {experiences.map((exp, index) => (
              <div key={index} className="relative">
                {/* Timeline dot */}
                <div className="hidden md:flex absolute left-4 sm:left-8 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 border-4 border-white shadow-lg z-10 items-center justify-center">
                  {exp.current && (
                    <span className="absolute w-8 h-8 rounded-full bg-blue-500/20 animate-ping"></span>
                  )}
                </div>

                {/* Card */}
                <ScrollReveal animation="fade-left" delay={index * 200}>
                  <div className="md:ml-16 lg:ml-20">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{exp.role}</h3>
                              {exp.current && (
                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/30">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-300 text-xs sm:text-sm">
                              <span className="flex items-center gap-1">
                                <Briefcase size={14} />
                                {exp.company}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {exp.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {exp.period}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30 self-start">
                            {exp.type}
                          </span>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-4 sm:p-6">
                        <p className="text-gray-600 mb-4 text-sm sm:text-base">{exp.description}</p>

                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Key Contributions:</h4>
                          <ul className="space-y-2">
                            {exp.achievements.map((achievement, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-gray-600 text-xs sm:text-sm">
                                <ChevronRight size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Tech Stack:</h4>
                          <div className="flex flex-wrap gap-2">
                            {exp.technologies.map((tech, idx) => (
                              <span
                                key={idx}
                                className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium border border-gray-200"
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Experience
