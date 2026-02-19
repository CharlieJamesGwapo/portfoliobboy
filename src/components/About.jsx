import { Code, Server, Cloud, Smartphone, Download } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

const About = () => {
  const highlights = [
    {
      icon: <Code size={24} />,
      title: 'Frontend',
      description: 'React, Next.js, Vue.js, Tailwind CSS',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Server size={24} />,
      title: 'Backend',
      description: 'Go, .NET/C#, Node.js, PHP, Python',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Cloud size={24} />,
      title: 'Cloud & DevOps',
      description: 'AWS Lambda, Docker, CI/CD, Supabase',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: <Smartphone size={24} />,
      title: 'Mobile',
      description: 'React Native, Android Studio',
      color: 'from-green-500 to-teal-500'
    }
  ]

  return (
    <section id="about" className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              About Me
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start mb-12 sm:mb-16">
          {/* Left - Bio */}
          <ScrollReveal animation="fade-right" className="lg:col-span-3">
            <div className="space-y-4 sm:space-y-6">
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                Full Stack Developer with hands-on professional experience building production applications
                for international clients. I specialize in <span className="font-semibold text-blue-600">Go (Golang)</span>,{' '}
                <span className="font-semibold text-purple-600">.NET (C#)</span>,{' '}
                <span className="font-semibold text-green-600">Node.js</span>, and{' '}
                <span className="font-semibold text-cyan-600">React</span> — from fintech platforms to
                POS systems and mobile apps.
              </p>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                At <span className="font-semibold">Robustech IT / SocietyOne (Australia)</span>, I rewrote
                legacy Go services into .NET, built AWS Lambda functions, and optimized APIs for a personal
                loan platform. Currently at <span className="font-semibold">Rooche Digital</span>, I develop
                web apps and client dashboards with secure authentication and CI/CD pipelines.
              </p>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                Dean's Lister (Ranked 2) in BSIT, with 12+ completed projects and a track record of
                delivering clean, scalable code. Ready to contribute to remote development teams.
              </p>

              <div className="pt-2">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 text-sm sm:text-base"
                >
                  <Download size={18} />
                  Request Resume
                </a>
              </div>
            </div>
          </ScrollReveal>

          {/* Right - Quick Facts */}
          <ScrollReveal animation="fade-left" delay={200} className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 sm:p-8 rounded-2xl shadow-xl text-white">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Quick Facts</h3>
              <ul className="space-y-3 sm:space-y-4">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0"></span>
                  <span className="text-gray-300 text-sm sm:text-base">Professional experience at international companies</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0"></span>
                  <span className="text-gray-300 text-sm sm:text-base">Dean's Lister - Ranked 2 (2nd & 3rd Year)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0"></span>
                  <span className="text-gray-300 text-sm sm:text-base">12+ projects including fintech, POS, mobile apps</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0"></span>
                  <span className="text-gray-300 text-sm sm:text-base">Go, .NET, Node.js, React, AWS Lambda, Docker</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0"></span>
                  <span className="text-gray-300 text-sm sm:text-base">10+ professional certifications</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-pink-400 mt-2 flex-shrink-0"></span>
                  <span className="text-gray-300 text-sm sm:text-base">Open to remote work opportunities</span>
                </li>
              </ul>
            </div>
          </ScrollReveal>
        </div>

        {/* Tech Highlights Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {highlights.map((item, index) => (
            <ScrollReveal key={index} animation="scale-up" delay={index * 100}>
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100 group">
                <div className={`inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r ${item.color} text-white mb-3 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-xs sm:text-sm text-gray-500">{item.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About
