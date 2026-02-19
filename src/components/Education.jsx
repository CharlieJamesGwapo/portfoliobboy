import { GraduationCap, Award, Calendar, MapPin } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

const Education = () => {
  const education = [
    {
      institution: 'Misamis Oriental Institute of Science and Technology',
      degree: 'Bachelor of Science in Information Technology',
      location: 'Balingasag, Misamis Oriental',
      period: '2022 - 2025',
      awards: [
        "2nd Year - Dean's Lister, Ranked 2",
        "3rd Year - Dean's Lister, Ranked 2"
      ]
    },
    {
      institution: 'Baliwagan National High School',
      degree: 'Senior High School Graduate',
      location: 'Balingasag, Misamis Oriental',
      period: '2016 - 2020',
      awards: []
    },
    {
      institution: 'Waterfall Elementary School',
      degree: 'Elementary Graduate',
      location: 'Balingasag, Misamis Oriental',
      period: '2015 - 2016',
      awards: ['Consistent Fifth Honors (Grade 1 to Grade 6)']
    }
  ]

  return (
    <section id="education" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Education
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
          </div>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
          {education.map((edu, index) => (
            <ScrollReveal key={index} animation="fade-up" delay={index * 150}>
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 p-5 sm:p-6 md:p-8">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 sm:p-3 rounded-xl text-white flex-shrink-0">
                    <GraduationCap size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1">
                      {edu.institution}
                    </h3>
                    <p className="text-sm sm:text-base text-blue-600 font-semibold mb-2">
                      {edu.degree}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {edu.period}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {edu.location}
                      </span>
                    </div>

                    {edu.awards.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="text-yellow-500" size={16} />
                          <span className="text-xs sm:text-sm font-semibold text-gray-700">Awards</span>
                        </div>
                        <ul className="space-y-1">
                          {edu.awards.map((award, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-600 text-xs sm:text-sm">
                              <span className="text-blue-500 mt-0.5">-</span>
                              <span>{award}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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

export default Education
