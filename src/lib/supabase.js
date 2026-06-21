import { createClient } from '@supabase/supabase-js'

// Credentials come from .env.local (Vite exposes VITE_* vars to the client).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// The game must work even without Supabase configured (local-only leaderboard
// fallback). Only create a real client when both vars are present.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

const LEADERBOARD_TABLE = 'leaderboard'
const SAVES_TABLE = 'game_saves'

// Local fallback so the Win screen still shows a leaderboard offline.
const LOCAL_LEADERBOARD_KEY = 'dungeon_local_leaderboard'

function readLocalLeaderboard() {
  try {
    const raw = localStorage.getItem(LOCAL_LEADERBOARD_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeLocalLeaderboard(rows) {
  try {
    localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(rows.slice(0, 50)))
  } catch {
    /* ignore quota / serialization errors */
  }
}

/**
 * Submit a leaderboard entry. Falls back to localStorage when Supabase is not
 * configured or the request fails. Always resolves (never throws).
 */
export async function submitScore({ player_name, score, boss_defeated, time_seconds, game = 'dungeon' }) {
  const entry = {
    player_name: player_name || 'Anonymous',
    score: Math.round(score) || 0,
    boss_defeated: Boolean(boss_defeated),
    time_seconds: Math.round(time_seconds) || 0,
    game,
  }

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from(LEADERBOARD_TABLE).insert(entry)
      if (error) throw error
      return { ok: true, source: 'supabase' }
    } catch (err) {
      console.warn('[supabase] submitScore failed, using local fallback:', err?.message)
    }
  }

  const rows = readLocalLeaderboard()
  rows.push({ ...entry, created_at: new Date().toISOString(), id: `local-${rows.length}-${entry.score}` })
  rows.sort((a, b) => b.score - a.score)
  writeLocalLeaderboard(rows)
  return { ok: true, source: 'local' }
}

/**
 * Fetch top N leaderboard entries (default 10), optionally filtered by `game`
 * ('dungeon' | 'blaster' | 'racer' | 'blockblast'). Falls back to localStorage.
 * Always resolves with an array.
 */
export async function fetchLeaderboard(limit = 10, game = null) {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from(LEADERBOARD_TABLE)
        .select('id, player_name, score, boss_defeated, time_seconds, created_at, game')
        .order('score', { ascending: false })
        .limit(limit)
      if (game) query = query.eq('game', game)
      const { data, error } = await query
      if (error) throw error
      if (data) return data
    } catch (err) {
      console.warn('[supabase] fetchLeaderboard failed, using local fallback:', err?.message)
    }
  }

  return readLocalLeaderboard()
    .filter((r) => (game ? (r.game || 'dungeon') === game : true))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * Persist a cloud game save (best-effort). Local saves are handled separately
 * in gameStorage.js. Never throws.
 */
export async function saveGameCloud(player_name, save_data) {
  if (!isSupabaseConfigured) return { ok: false, source: 'none' }
  try {
    const { error } = await supabase
      .from(SAVES_TABLE)
      .insert({ player_name: player_name || 'Anonymous', save_data, updated_at: new Date().toISOString() })
    if (error) throw error
    return { ok: true, source: 'supabase' }
  } catch (err) {
    console.warn('[supabase] saveGameCloud failed:', err?.message)
    return { ok: false, source: 'error' }
  }
}
