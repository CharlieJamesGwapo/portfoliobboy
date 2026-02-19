import { useState } from 'react'
import { ExternalLink, Github, Globe, Smartphone, Server, ShoppingCart, Users, BookOpen, Recycle, Car, Coffee, Layout, Monitor } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('all')

  const projects = [
    {
      title: 'Luxury Construction Utah',
      category: 'web',
      type: 'Client Project',
      description: 'Professional construction company website built for a Utah-based client. Features responsive design, service showcases, and contact integration.',
      technologies: ['React', 'Tailwind CSS', 'Responsive Design'],
      liveUrl: 'https://luxuryconstructionutah.com/',
      icon: <Monitor size={24} />,
      color: 'from-amber-500 to-orange-600',
      featured: true
    },
    {
      title: 'G2 POS System',
      category: 'web',
      type: 'Full Stack App',
      description: 'Complete point-of-sale system with sales tracking, inventory management, order processing, and reporting dashboard.',
      technologies: ['Go (Golang)', 'Next.js', 'PostgreSQL', 'Docker'],
      liveUrl: 'https://g2possystem.vercel.app/landing',
      icon: <ShoppingCart size={24} />,
      color: 'from-blue-500 to-indigo-600',
      featured: true
    },
    {
      title: 'E-Cycle Hub',
      category: 'web',
      type: 'Full Stack App',
      description: 'Waste management and recycling platform with user registration, waste categorization, collection scheduling, and RESTful APIs.',
      technologies: ['Go (Golang)', 'Next.js', 'NeonDB (PostgreSQL)'],
      liveUrl: 'https://ecyclehub.vercel.app/',
      icon: <Recycle size={24} />,
      color: 'from-green-500 to-emerald-600',
      featured: true
    },
    {
      title: 'ReflectiCSS',
      category: 'web',
      type: 'Developer Tool',
      description: 'CSS utility and reflection tool for developers. Interactive interface for exploring and generating CSS styles efficiently.',
      technologies: ['React', 'CSS3', 'JavaScript'],
      liveUrl: 'https://reflecticss.vercel.app/',
      icon: <Layout size={24} />,
      color: 'from-purple-500 to-violet-600'
    },
    {
      title: 'Study Pulse',
      category: 'web',
      type: 'Web App',
      description: 'Study management application helping students track their learning progress, organize study sessions, and monitor performance.',
      technologies: ['React', 'Tailwind CSS', 'JavaScript'],
      liveUrl: 'https://study-pulse-ten.vercel.app/',
      icon: <BookOpen size={24} />,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      title: 'Shayne & DR',
      category: 'web',
      type: 'Client Website',
      description: 'Custom-designed website for a client, featuring modern UI/UX design, responsive layout, and optimized performance.',
      technologies: ['HTML', 'CSS', 'JavaScript'],
      liveUrl: 'https://shayneanddr.netlify.app/',
      icon: <Globe size={24} />,
      color: 'from-pink-500 to-rose-600'
    },
    {
      title: 'Vince Lloyd Portfolio',
      category: 'web',
      type: 'Client Portfolio',
      description: 'Professional portfolio website designed and developed for a client with modern aesthetics and smooth interactions.',
      technologies: ['HTML', 'CSS', 'JavaScript'],
      liveUrl: 'https://vincelloyd.netlify.app/',
      icon: <Users size={24} />,
      color: 'from-indigo-500 to-purple-600'
    },
    {
      title: 'Laarni Portfolio',
      category: 'web',
      type: 'Client Portfolio',
      description: 'Clean, responsive portfolio website built for a client showcasing their professional work and skills.',
      technologies: ['HTML', 'CSS', 'JavaScript'],
      liveUrl: 'https://laarni.netlify.app/',
      icon: <Users size={24} />,
      color: 'from-teal-500 to-cyan-600'
    },
    {
      title: 'SocietyOne Loan Platform',
      category: 'backend',
      type: 'Professional / Fintech',
      description: 'Online personal loan platform for Australian clients. Rewrote legacy Go services into C# .NET, built AWS Lambda functions, and optimized APIs.',
      technologies: ['C# (.NET)', 'Go', 'Node.js', 'AWS Lambda', 'PostgreSQL'],
      icon: <Server size={24} />,
      color: 'from-gray-700 to-gray-900',
      featured: true
    },
    {
      title: 'Filtra Coffee POS',
      category: 'backend',
      type: 'Full Stack App',
      description: 'Complete POS system for a coffee shop with modules for sales, inventory, and reporting. Deployed using Docker for portability.',
      technologies: ['Go (Golang)', 'Next.js', 'PostgreSQL', 'Docker'],
      icon: <Coffee size={24} />,
      color: 'from-amber-700 to-amber-900'
    },
    {
      title: 'MOIST Alumni Tracking System',
      category: 'backend',
      type: 'Full Stack App',
      description: 'Secure alumni management system with registration, profiles, OTP/2FA authentication, and admin dashboard with analytics.',
      technologies: ['PHP', 'MySQL', 'JavaScript', 'HTML/CSS'],
      icon: <Users size={24} />,
      color: 'from-blue-700 to-blue-900'
    },
    {
      title: 'Librewry Bistro POS',
      category: 'backend',
      type: 'Full Stack App',
      description: 'Modern POS system for cafe operations with order management, inventory tracking, sales analytics, and role-based authentication.',
      technologies: ['PHP', 'MySQL', 'JavaScript', 'HTML/CSS'],
      icon: <ShoppingCart size={24} />,
      color: 'from-purple-700 to-purple-900'
    },
    {
      title: 'Jolly Ride App',
      category: 'mobile',
      type: 'Mobile App (iOS & Android)',
      description: 'Ride-booking mobile app with real-time tracking, booking system, in-app messaging, and Supabase backend integration.',
      technologies: ['React Native', 'Supabase', 'JavaScript'],
      icon: <Car size={24} />,
      color: 'from-green-600 to-emerald-700'
    },
    {
      title: 'Massage App',
      category: 'mobile',
      type: 'Mobile App (Android)',
      description: 'Android app for booking massage services with scheduling, messaging, and real-time Firebase integration.',
      technologies: ['Android Studio', 'Firebase', 'Java/Kotlin'],
      icon: <Smartphone size={24} />,
      color: 'from-violet-600 to-purple-700'
    }
  ]

  const filters = [
    { key: 'all', label: 'All Projects', count: projects.length },
    { key: 'web', label: 'Web', count: projects.filter(p => p.category === 'web').length },
    { key: 'backend', label: 'Backend', count: projects.filter(p => p.category === 'backend').length },
    { key: 'mobile', label: 'Mobile', count: projects.filter(p => p.category === 'mobile').length }
  ]

  const filteredProjects = activeFilter === 'all'
    ? projects
    : projects.filter(p => p.category === activeFilter)

  return (
    <section id="projects" className="py-16 sm:py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Featured Projects
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-4"></div>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
              A collection of {projects.length} projects spanning web applications, backend systems, and mobile apps
            </p>
          </div>
        </ScrollReveal>

        {/* Filter Tabs */}
        <ScrollReveal animation="fade-up" delay={100}>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                  activeFilter === filter.key
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                }`}
              >
                {filter.label}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  activeFilter === filter.key ? 'bg-white/20' : 'bg-white/5'
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Projects Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProjects.map((project, index) => (
            <ScrollReveal key={`${activeFilter}-${index}`} animation="scale-up" delay={index * 80} duration={500}>
              <div
                className={`group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 hover:bg-white/10 transition-all duration-500 hover:-translate-y-1 h-full ${
                  project.featured ? 'ring-1 ring-blue-500/20' : ''
                }`}
              >
                {/* Card Header */}
                <div className={`bg-gradient-to-r ${project.color} p-4 sm:p-5 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                      {project.liveUrl && (
                        <div className="ml-2 px-2 py-0.5 bg-white/10 rounded text-white/70 text-xxs truncate max-w-[180px]">
                          {project.liveUrl.replace('https://', '').replace('http://', '').replace(/\/$/, '')}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                        {project.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-white truncate">{project.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-white/80 text-xs">{project.type}</span>
                          {project.featured && (
                            <span className="px-1.5 py-0.5 bg-yellow-400/20 text-yellow-300 text-xxs rounded font-semibold">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5">
                  <p className="text-gray-400 text-xs sm:text-sm mb-4 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-white/5 text-gray-300 rounded text-xxs sm:text-xs border border-white/10"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {project.liveUrl ? (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 group/btn"
                      >
                        <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                        <span>Live Demo</span>
                      </a>
                    ) : (
                      <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 text-gray-500 rounded-lg text-xs sm:text-sm font-medium border border-white/10">
                        <Server size={14} />
                        <span>Private / NDA</span>
                      </div>
                    )}
                    <a
                      href="https://github.com/CharlieJamesGwapo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 text-gray-300 rounded-lg text-xs sm:text-sm font-medium border border-white/10 hover:bg-white/10 transition-all duration-300"
                    >
                      <Github size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Stats Banner */}
        <div className="mt-10 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { number: '14', label: 'Total Projects', color: 'text-blue-400' },
            { number: '8', label: 'Live Websites', color: 'text-green-400' },
            { number: '2', label: 'Mobile Apps', color: 'text-purple-400' },
            { number: '4', label: 'POS / Backend Systems', color: 'text-cyan-400' }
          ].map((stat, index) => (
            <ScrollReveal key={index} animation="fade-up" delay={index * 100}>
              <div className="text-center bg-white/5 rounded-xl p-4 sm:p-5 border border-white/10">
                <div className={`text-2xl sm:text-3xl font-bold ${stat.color} mb-1`}>{stat.number}</div>
                <div className="text-xs sm:text-sm text-gray-400">{stat.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects
