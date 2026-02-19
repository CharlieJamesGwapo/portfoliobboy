import { Code, Server, Database, Cloud, Smartphone, Wrench } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

const Skills = () => {
  const skillCategories = [
    {
      title: 'Frontend',
      icon: <Code size={24} />,
      color: 'from-blue-500 to-cyan-500',
      skills: ['React.js', 'Next.js', 'Vue.js / Nuxt.js', 'Angular', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'HTML5 / CSS3', 'JavaScript (ES6+)', 'TypeScript']
    },
    {
      title: 'Backend',
      icon: <Server size={24} />,
      color: 'from-purple-500 to-pink-500',
      skills: ['Go (Golang)', 'C# / .NET / ASP.NET Core', 'Node.js', 'PHP (Laravel, CodeIgniter)', 'Python (Flask, FastAPI, Django)', 'REST API Design', 'JWT / OAuth / 2FA', 'Microservices Architecture']
    },
    {
      title: 'Databases',
      icon: <Database size={24} />,
      color: 'from-green-500 to-teal-500',
      skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'NeonDB (Serverless)', 'Supabase', 'Firebase / Firestore', 'Database Design', 'Query Optimization']
    },
    {
      title: 'Cloud & DevOps',
      icon: <Cloud size={24} />,
      color: 'from-cyan-500 to-blue-600',
      skills: ['AWS Lambda (Serverless)', 'Docker', 'CI/CD (Buddy Pipeline)', 'Git & GitHub', 'Vercel / Netlify', 'IIS Deployment', 'Windows Server', 'Active Directory']
    },
    {
      title: 'Mobile',
      icon: <Smartphone size={24} />,
      color: 'from-orange-500 to-red-500',
      skills: ['React Native (iOS & Android)', 'Android Studio', 'Mobile UI/UX', 'State Management', 'API Integration']
    },
    {
      title: 'Tools & Practices',
      icon: <Wrench size={24} />,
      color: 'from-indigo-500 to-purple-500',
      skills: ['VS Code', 'Figma', 'Agile / Scrum', 'Code Refactoring', 'Clean Code', 'RBAC Implementation', 'Performance Optimization']
    }
  ]

  const coreStack = [
    { name: 'Go', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    { name: '.NET / C#', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { name: 'Node.js', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
    { name: 'React', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { name: 'Next.js', color: 'bg-white/10 text-white border-white/20' },
    { name: 'PHP', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    { name: 'Python', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    { name: 'AWS Lambda', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    { name: 'PostgreSQL', color: 'bg-blue-500/10 text-blue-300 border-blue-500/20' },
    { name: 'Docker', color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' },
    { name: 'React Native', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { name: 'Supabase', color: 'bg-green-500/10 text-green-300 border-green-500/20' },
    { name: 'Firebase', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { name: 'Tailwind CSS', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' }
  ]

  return (
    <section id="skills" className="py-16 sm:py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Skills & Tech Stack
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-4"></div>
            <p className="text-base sm:text-lg text-gray-400">
              Technologies I work with professionally
            </p>
          </div>
        </ScrollReveal>

        {/* Core Stack Tags */}
        <ScrollReveal animation="fade" delay={100}>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-16 max-w-4xl mx-auto">
            {coreStack.map((tech, index) => (
              <span
                key={index}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border ${tech.color} hover:scale-105 transition-transform duration-200`}
              >
                {tech.name}
              </span>
            ))}
          </div>
        </ScrollReveal>

        {/* Skill Categories Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {skillCategories.map((category, index) => (
            <ScrollReveal key={index} animation="scale-up" delay={index * 100}>
              <div className="bg-white/5 rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 group h-full">
                <div className="flex items-center gap-3 mb-4 sm:mb-5">
                  <div className={`bg-gradient-to-r ${category.color} p-2.5 rounded-lg text-white group-hover:scale-110 transition-transform`}>
                    {category.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">{category.title}</h3>
                </div>

                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {category.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 sm:px-3 py-1 bg-white/5 text-gray-300 rounded-lg text-xs sm:text-sm border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Soft Skills */}
        <ScrollReveal animation="fade-up" delay={200}>
          <div className="mt-10 sm:mt-16">
            <h3 className="text-xl sm:text-2xl font-bold text-center text-white mb-6 sm:mb-8">Professional Attributes</h3>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {['Problem Solving', 'Team Collaboration', 'Agile / Scrum', 'Quick Learner', 'Attention to Detail', 'Time Management', 'Communication', 'Adaptability', 'Remote Work'].map((skill, index) => (
                <span
                  key={index}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-white/5 text-gray-300 rounded-full font-medium border border-white/10 hover:border-blue-500/50 hover:text-blue-400 transition-all duration-300 text-xs sm:text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default Skills
