// ============================================================================
// Leaderboard — fetches + renders the top N scores (Supabase, local fallback).
// Refetches whenever `refreshSignal` changes.
// ============================================================================
import { useEffect, useState } from 'react'
import { Trophy, Crown, Loader2 } from 'lucide-react'
import { fetchLeaderboard, isSupabaseConfigured } from '../../lib/supabase'

function fmtTime(s) {
  if (!s && s !== 0) return '—'
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function Leaderboard({ limit = 10, refreshSignal = 0, highlightName = '', game = null, metric = 'score' }) {
  const [rows, setRows] = useState(null)

  useEffect(() => {
    let active = true
    setRows(null)
    fetchLeaderboard(limit, game).then((data) => {
      if (active) setRows(data || [])
    })
    return () => { active = false }
  }, [limit, refreshSignal, game])

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Trophy size={18} className="text-amber-400" />
        <h4 className="text-lg font-bold text-white">Top {limit}</h4>
      </div>

      {!isSupabaseConfigured && (
        <p className="text-center text-[11px] text-gray-500 mb-2">
          Supabase not configured — showing local scores. Add VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY to .env.local.
        </p>
      )}

      {rows === null ? (
        <div className="flex items-center justify-center py-6 text-gray-400 gap-2 text-sm">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      ) : rows.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-6">No scores yet — be the first!</p>
      ) : (
        <ol className="space-y-1">
          {rows.map((r, i) => {
            const isYou = highlightName && r.player_name === highlightName
            return (
              <li
                key={r.id || i}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                  isYou ? 'bg-cyan-500/15 border border-cyan-500/40' : i % 2 ? 'bg-white/[0.03]' : 'bg-white/[0.06]'
                }`}
              >
                <span className="w-6 text-center font-bold text-gray-400">
                  {i === 0 ? <Crown size={15} className="inline text-amber-400" /> : i + 1}
                </span>
                <span className="flex-1 truncate font-semibold text-white">
                  {r.player_name}
                  {r.boss_defeated && <span className="ml-1.5 text-[10px] text-red-300">👑</span>}
                </span>
                <span className="text-gray-400 tabular-nums text-xs">{fmtTime(r.time_seconds)}</span>
                <span className="w-16 text-right font-bold text-amber-300 tabular-nums">
                  {Number(r.score).toLocaleString()}
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
