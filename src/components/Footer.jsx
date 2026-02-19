import { Github, Linkedin, Mail, ArrowUpRight } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-950 text-white">
      {/* CTA Banner */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <ScrollReveal animation="fade-up">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-2">Let's work together</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Available for remote full-time roles and freelance projects.
              </p>
            </div>
            <a
              href="mailto:capstonee2@gmail.com"
              className="group flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 text-sm sm:text-base flex-shrink-0"
            >
              capstonee2@gmail.com
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-3">Charlie James Abejo</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md mb-4">
              Full Stack Developer with professional experience building fintech platforms,
              serverless APIs, and scalable web applications for international clients using
              Go, .NET, Node.js, and React.
            </p>
            <div className="flex gap-2">
              <a href="https://github.com/CharlieJamesGwapo" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300" title="GitHub">
                <Github size={16} />
              </a>
              <a href="https://www.linkedin.com/in/charlie-james-abejo-26362638a/" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300" title="LinkedIn">
                <Linkedin size={16} />
              </a>
              <a href="mailto:capstonee2@gmail.com" className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300" title="Email">
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2">
              {[
                { name: 'About', href: '#about' },
                { name: 'Experience', href: '#experience' },
                { name: 'Projects', href: '#projects' },
                { name: 'Skills', href: '#skills' },
                { name: 'Contact', href: '#contact' }
              ].map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-500 hover:text-white transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:capstonee2@gmail.com" className="text-gray-500 hover:text-white transition-colors break-all">
                  capstonee2@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:09856122843" className="text-gray-500 hover:text-white transition-colors">
                  0985-612-2843
                </a>
              </li>
              <li className="text-gray-500">Misamis Oriental, Philippines</li>
              <li className="pt-1">
                <span className="inline-flex items-center gap-1.5 text-green-500 text-xs">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                  Available for work
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800/50 pt-6">
          <p className="text-gray-600 text-xs text-center">
            &copy; {currentYear} Charlie James Z. Abejo
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
