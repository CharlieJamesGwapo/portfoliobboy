import { useState, useEffect } from 'react'
import { Github, Linkedin, Mail, Phone, MapPin, ExternalLink, Award, Code, ChevronDown, Briefcase } from 'lucide-react'

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const roles = ['Full Stack Developer', 'Backend Engineer', 'Go & .NET Developer', 'Cloud & Serverless']
  const [currentRole, setCurrentRole] = useState(0)
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    const roleTimer = setInterval(() => {
      setIsTyping(false)
      setTimeout(() => {
        setCurrentRole((prev) => (prev + 1) % roles.length)
        setIsTyping(true)
      }, 300)
    }, 3000)
    return () => clearInterval(roleTimer)
  }, [])

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-48 sm:w-72 h-48 sm:h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full mb-4 sm:mb-6 border border-green-500/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs sm:text-sm font-semibold">Open to Remote Opportunities</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                Hi, I'm{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">
                  Charlie James
                </span>
              </h1>

              <div className="h-10 sm:h-12 mb-4 sm:mb-6 flex items-center justify-center lg:justify-start">
                <p className={`text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-300 ${isTyping ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                  {roles[currentRole]}
                </p>
              </div>

              <p className="text-sm sm:text-base lg:text-lg text-gray-300 mb-6 sm:mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Full Stack Developer with professional experience building fintech platforms,
                serverless APIs, and scalable web applications using Go, .NET, Node.js, and React.
                Currently working with international teams delivering production-grade software.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10 hover:border-blue-500/50 transition-all duration-300">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-400 mb-1">12+</div>
                  <div className="text-xxs sm:text-xs text-gray-400">Projects Built</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-400 mb-1">2+</div>
                  <div className="text-xxs sm:text-xs text-gray-400">Years Experience</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10 hover:border-cyan-500/50 transition-all duration-300">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-cyan-400 mb-1">10+</div>
                  <div className="text-xxs sm:text-xs text-gray-400">Certifications</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col xs:flex-row flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 mb-6 sm:mb-8">
                <a
                  href="#contact"
                  className="group px-5 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold hover:shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Mail size={18} />
                  <span>Hire Me</span>
                  <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#projects"
                  className="px-5 sm:px-8 py-3 sm:py-4 bg-white/10 text-white border border-white/20 rounded-full font-semibold hover:bg-white/20 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Briefcase size={18} />
                  <span>View Projects</span>
                </a>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 text-xs sm:text-sm">
                <a href="tel:09856122843" className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
                  <Phone size={14} />
                  <span>0985-612-2843</span>
                </a>
                <a href="mailto:capstonee2@gmail.com" className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors">
                  <Mail size={14} />
                  <span>capstonee2@gmail.com</span>
                </a>
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin size={14} />
                  <span>Philippines</span>
                </div>
              </div>
            </div>

            {/* Right Column - Profile Image */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative group">
                {/* Decorative ring */}
                <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full opacity-50 group-hover:opacity-75 blur-xl transition-all duration-500 animate-pulse-slow"></div>

                {/* Profile Image Container */}
                <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-full animate-spin-slow"></div>
                  <div className="absolute inset-1.5 sm:inset-2 bg-gray-900 rounded-full overflow-hidden">
                    <img
                      src="/profile.png"
                      alt="Charlie James Z. Abejo"
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Floating Badges */}
                  <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-2 sm:p-3 shadow-xl animate-bounce">
                    <Award className="text-white" size={20} />
                  </div>
                  <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full p-2 sm:p-3 shadow-xl animate-bounce animation-delay-1000">
                    <Code className="text-white" size={20} />
                  </div>
                </div>

                {/* Social Links */}
                <div className="absolute -bottom-8 sm:-bottom-10 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3">
                  <a href="https://github.com/CharlieJamesGwapo" target="_blank" rel="noopener noreferrer" className="p-2 sm:p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 text-white">
                    <Github size={18} />
                  </a>
                  <a href="https://www.linkedin.com/in/charlie-james-abejo-26362638a/" target="_blank" rel="noopener noreferrer" className="p-2 sm:p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 text-white">
                    <Linkedin size={18} />
                  </a>
                  <a href="mailto:capstonee2@gmail.com" className="p-2 sm:p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 text-white">
                    <Mail size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="flex justify-center mt-12 sm:mt-16 lg:mt-20">
            <a href="#about" className="flex flex-col items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors animate-bounce">
              <span className="text-xs sm:text-sm font-medium">Scroll to explore</span>
              <ChevronDown size={20} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
