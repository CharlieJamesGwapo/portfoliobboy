import { useEffect, useMemo, useState } from 'react'
import { BookOpen, ArrowRight, ExternalLink } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const PLATFORM_BADGE = {
  'Dev.to': 'bg-orange-500 text-white',
  Medium: 'bg-black text-white border border-white/20',
  Hashnode: 'bg-blue-600 text-white',
}
const platformClass = (p) => PLATFORM_BADGE[p] || 'bg-gray-600 text-white'

// Reuse the skill-pill palette feel for tags
const TAG_COLORS = [
  'bg-blue-500/10 text-blue-300 border-blue-500/20',
  'bg-purple-500/10 text-purple-300 border-purple-500/20',
  'bg-green-500/10 text-green-300 border-green-500/20',
  'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  'bg-amber-500/10 text-amber-300 border-amber-500/20',
  'bg-pink-500/10 text-pink-300 border-pink-500/20',
]
const tagColor = (tag) => {
  let h = 0
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0
  return TAG_COLORS[h % TAG_COLORS.length]
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

function SkeletonCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 animate-pulse">
      <div className="h-5 w-20 bg-white/10 rounded-full mb-4" />
      <div className="h-5 w-3/4 bg-white/10 rounded mb-2" />
      <div className="h-4 w-full bg-white/10 rounded mb-1.5" />
      <div className="h-4 w-5/6 bg-white/10 rounded mb-1.5" />
      <div className="h-4 w-2/3 bg-white/10 rounded mb-4" />
      <div className="flex gap-1.5 mb-4">
        <div className="h-5 w-12 bg-white/10 rounded-full" />
        <div className="h-5 w-14 bg-white/10 rounded-full" />
      </div>
      <div className="h-4 w-24 bg-white/10 rounded" />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
        <BookOpen className="text-white" size={26} />
      </div>
      <p className="text-gray-300 text-base sm:text-lg mb-5 max-w-md mx-auto">
        Tutorials coming soon. I write on Dev.to — follow for updates.
      </p>
      <a
        href="https://dev.to"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
      >
        <ExternalLink size={16} /> Follow on Dev.to
      </a>
    </div>
  )
}

export default function Tutorials() {
  const [tutorials, setTutorials] = useState(null) // null = loading
  const [activeTag, setActiveTag] = useState('All')

  useEffect(() => {
    let active = true
    async function load() {
      if (!isSupabaseConfigured || !supabase) {
        if (active) setTutorials([])
        return
      }
      try {
        const { data, error } = await supabase
          .from('tutorials')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
        if (error) throw error
        if (active) setTutorials(data || [])
      } catch {
        // Error -> show empty state silently
        if (active) setTutorials([])
      }
    }
    load()
    return () => { active = false }
  }, [])

  const tags = useMemo(() => {
    if (!tutorials) return []
    const set = new Set()
    tutorials.forEach((t) => (t.tags || []).forEach((tag) => set.add(tag)))
    return ['All', ...Array.from(set)]
  }, [tutorials])

  const filtered = useMemo(() => {
    if (!tutorials) return []
    if (activeTag === 'All') return tutorials
    return tutorials.filter((t) => (t.tags || []).includes(activeTag))
  }, [tutorials, activeTag])

  const loading = tutorials === null
  const isEmpty = !loading && tutorials.length === 0

  return (
    <section id="tutorials" className="py-16 sm:py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">Tutorials &amp; Guides</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-4"></div>
            <p className="text-base sm:text-lg text-gray-400">Practical guides from real-world projects.</p>
          </div>
        </ScrollReveal>

        {/* Tag filter bar */}
        {!loading && !isEmpty && tags.length > 1 && (
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-10">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                    activeTag === tag
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </ScrollReveal>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : isEmpty ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((t) => (
              <ScrollReveal key={t.id} animation="scale-up">
                <div className="group flex flex-col h-full bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/25 hover:bg-white/[0.08] transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${platformClass(t.platform)}`}>
                      {t.platform}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(t.published_at)}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2 line-clamp-2">{t.title}</h3>
                  <p className="text-sm text-gray-300 mb-4 line-clamp-3 flex-1">{t.description}</p>
                  {(t.tags || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {t.tags.map((tag) => (
                        <span key={tag} className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${tagColor(tag)}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <a
                    href={t.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Read Tutorial <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
