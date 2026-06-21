// ============================================================================
// WinScreen — confetti + timer + score, name entry, Supabase submit, top-10
// leaderboard, and "Contact Charlie" / "View Portfolio" buttons.
// ============================================================================
import { useEffect, useMemo, useState } from 'react'
import { Trophy, Clock, Send, Mail, Home, Loader2, CheckCircle } from 'lucide-react'
import { submitScore } from '../../lib/supabase'
import Leaderboard from './Leaderboard'

function fmtTime(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

function Confetti() {
  // Lightweight DOM confetti — no extra deps.
  const pieces = useMemo(
    () =>
      Array.from({ length: 80 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2.5,
        duration: 2.5 + Math.random() * 2.5,
        color: ['#22d3ee', '#f5c542', '#a78bfa', '#ef4444', '#34d399', '#ffffff'][i % 6],
        size: 6 + Math.random() * 8,
        rotate: Math.random() * 360,
      })),
    []
  )
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: '-20px',
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.5,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

export default function WinScreen({ result, playerName, onContact, onViewPortfolio }) {
  const { score = 0, timeSeconds = 0, bossDefeated = true } = result || {}
  const [name, setName] = useState(playerName || '')
  const [status, setStatus] = useState('idle') // idle | submitting | done
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    // Inject confetti keyframes once.
    const id = 'dungeon-confetti-style'
    if (!document.getElementById(id)) {
      const style = document.createElement('style')
      style.id = id
      style.textContent = `@keyframes confetti-fall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(105vh) rotate(720deg); opacity: 0.9; }
      }`
      document.head.appendChild(style)
    }
  }, [])

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    if (status === 'submitting') return
    setStatus('submitting')
    await submitScore({
      player_name: name.trim() || 'Anonymous',
      score,
      boss_defeated: bossDefeated,
      time_seconds: timeSeconds,
      game: 'dungeon',
    })
    setStatus('done')
    setRefresh((r) => r + 1)
  }

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <Confetti />
      <div className="relative w-full max-w-md my-8 bg-gradient-to-br from-gray-900 to-gray-950 border border-amber-500/30 rounded-2xl shadow-2xl ring-2 ring-amber-500/20 p-6">
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 mb-3 shadow-lg">
            <Trophy size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Victory!</h2>
          <p className="text-amber-300 text-sm">The Bug King has been vanquished.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-300 text-xs mb-1">
              <Trophy size={13} /> Score
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">{score.toLocaleString()}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-cyan-300 text-xs mb-1">
              <Clock size={13} /> Time
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">{fmtTime(timeSeconds)}</div>
          </div>
        </div>

        {status !== 'done' ? (
          <form onSubmit={handleSubmit} className="mb-5">
            <label className="block text-xs text-gray-400 mb-1.5 font-semibold uppercase tracking-wider">
              Enter your name for the leaderboard
            </label>
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={24}
                placeholder="Hero name"
                className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-60"
              >
                {status === 'submitting' ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                Submit
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-2 text-green-400 text-sm font-semibold mb-4">
            <CheckCircle size={16} /> Score submitted!
          </div>
        )}

        {/* Leaderboard (shows after submit; also viewable before) */}
        <div className="mb-5 bg-black/30 border border-white/10 rounded-xl p-3">
          <Leaderboard limit={10} refreshSignal={refresh} highlightName={name.trim()} game="dungeon" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onContact}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            <Mail size={16} /> Contact Charlie
          </button>
          <button
            onClick={onViewPortfolio}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-all"
          >
            <Home size={16} /> View Portfolio
          </button>
        </div>
      </div>
    </div>
  )
}
