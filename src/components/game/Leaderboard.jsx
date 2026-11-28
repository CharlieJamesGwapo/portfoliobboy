// ============================================================================
// Leaderboard — fetches + renders the top N scores (Supabase, local fallback).
// Refetches whenever `refreshSignal` changes.
// ============================================================================
import { useEffect, useState } from 'react'
import { Trophy, Crown, Loader2 } from 'lucide-react'
import { fetchLeaderboard, isRemoteLeaderboardAvailable } from '../../lib/supabase'
import { formatLeaderboardScore } from '../../lib/leaderboardData.js'

function fmtTime(s) {
  if (!s && s !== 0) return '—'
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function Leaderboard({ limit = 10, refreshSignal = 0, highlightName = '', game = null }) {
  const [rows, setRows] = useState(null)
  const [isLocal, setIsLocal] = useState(!isRemoteLeaderboardAvailable())

  useEffect(() => {
    let active = true
    setRows(null)
    fetchLeaderboard(limit, game).then((data) => {
      if (!active) return
      // Read after the fetch: a network failure inside it is what flips this.
      setIsLocal(!isRemoteLeaderboardAvailable())
      setRows(data || [])
    }).catch(() => {
      if (!active) return
      setIsLocal(true)
      setRows([])
    })
    return () => { active = false }
  }, [limit, refreshSignal, game])

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Trophy size={18} className="text-amber-400" />
        <h4 className="text-lg font-bold text-white">Top {limit}{game === 'racing' ? ' · Best laps' : ''}</h4>
      </div>

      {isLocal && (
        <p className="text-center text-xs text-gray-400 mb-2" role="status">Scores stay on this device. If browser storage is unavailable, they last for this session.</p>
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
                {game !== 'racing' && <span className="text-gray-400 tabular-nums text-xs">{fmtTime(r.time_seconds)}</span>}
                <span className="w-16 text-right font-bold text-amber-300 tabular-nums">
                  {formatLeaderboardScore(r.score, game)}
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
