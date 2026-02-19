import { Award, CheckCircle } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

const Certificates = () => {
  const certificates = [
    {
      title: 'Databases with SQL',
      issuer: 'CS50 (Harvard)',
      type: 'Completion'
    },
    {
      title: 'Windows Server 2012 Training',
      issuer: 'ITFreeTraining',
      type: 'Completion'
    },
    {
      title: 'Active Directory',
      issuer: 'ITFreeTraining',
      type: 'Completion'
    },
    {
      title: 'Microsoft: Manage AD DS Domain Controllers & FSMO Roles',
      issuer: 'Microsoft',
      type: 'Completion'
    },
    {
      title: "Dean's Lister (2nd & 3rd Year) - Ranked 2",
      issuer: 'MOIST',
      type: 'Recognition'
    },
    {
      title: 'TOPCIT (Test of Practical Competency in IT)',
      issuer: 'TOPCIT',
      type: 'Participation'
    },
    {
      title: 'MongoDB Database Training',
      issuer: 'MongoDB',
      type: 'Completion'
    },
    {
      title: 'PHP for Web Development',
      issuer: 'CodeMy',
      type: 'Completion'
    },
    {
      title: 'JavaScript Programming',
      issuer: 'Bro Code',
      type: 'Completion'
    },
    {
      title: 'HTML and CSS',
      issuer: 'Telugu',
      type: 'Completion'
    }
  ]

  const getTypeColor = (type) => {
    switch (type) {
      case 'Recognition':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Participation':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <section id="certificates" className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Certifications
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-4"></div>
            <p className="text-base sm:text-lg text-gray-600">
              Professional certifications and academic recognitions
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {certificates.map((cert, index) => (
            <ScrollReveal key={index} animation="scale-up" delay={index * 60}>
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 h-full">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg text-white flex-shrink-0">
                    <Award size={18} />
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xxs sm:text-xs font-semibold border ${getTypeColor(cert.type)}`}>
                    {cert.type}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5 line-clamp-2">
                  {cert.title}
                </h3>

                <p className="text-blue-600 font-medium text-xs sm:text-sm mb-3">
                  {cert.issuer}
                </p>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-green-600 text-xs font-semibold">
                    <CheckCircle size={14} />
                    <span>Certified</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Certificates
