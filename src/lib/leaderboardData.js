const games = new Set(['dungeon', 'blaster', 'racer', 'blockblast', 'racing', 'flappy', 'snake', 'whack', 'neon'])
export const MAX_LOCAL_SCORE_BYTES = 128_000

// Browser storage is untrusted: stale values and malformed rows must not stop a game.
export function normalizeLeaderboardRows(value) {
  if (!Array.isArray(value)) return []
  return value.slice(0, 500).flatMap(row => {
    if (!row || typeof row !== 'object' || typeof row.score !== 'number' || !Number.isSafeInteger(row.score) || row.score < 0) return []
    const game = row.game || 'dungeon'
    if (!games.has(game) || (game === 'racing' && row.score === 0)) return []
    return [{
      id: typeof row.id === 'string' ? row.id.slice(0, 128) : undefined,
      player_name: typeof row.player_name === 'string' ? row.player_name.trim().slice(0, 80) || 'Anonymous' : 'Anonymous',
      score: row.score,
      game,
      boss_defeated: row.boss_defeated === true,
      time_seconds: Number.isFinite(row.time_seconds) && row.time_seconds >= 0 ? Math.min(604800, Math.round(row.time_seconds)) : 0,
      created_at: typeof row.created_at === 'string' ? row.created_at.slice(0, 64) : undefined,
    }]
  })
}

export function rankedLeaderboardRows(rows, limit = 10, game = null) {
  const count = Number.isInteger(limit) ? Math.max(0, Math.min(50, limit)) : 10
  return normalizeLeaderboardRows(rows)
    .filter(row => !game || row.game === game)
    .sort((a, b) => game === 'racing' ? a.score - b.score : b.score - a.score)
    .slice(0, count)
}

// Retain each game's best results independently; large point scores from one
// game must not evict the fastest laps from another.
export function retainedLeaderboardRows(rows) {
  return [...games].flatMap(game => rankedLeaderboardRows(rows, 50, game))
}

export function formatLeaderboardScore(score, game) {
  if (!Number.isFinite(score)) return '—'
  if (game !== 'racing') return score.toLocaleString()
  if (score <= 0) return '—'
  const milliseconds = Math.round(score)
  const minutes = Math.floor(milliseconds / 60000)
  const seconds = Math.floor(milliseconds / 1000) % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(milliseconds % 1000).padStart(3, '0')}`
}
