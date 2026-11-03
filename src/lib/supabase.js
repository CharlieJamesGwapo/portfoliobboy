import { createClient } from '@supabase/supabase-js'

// Credentials come from .env.local (Vite exposes VITE_* vars to the client).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// The game must work even without Supabase configured (local-only leaderboard
// fallback).
//
// A non-empty check is not enough. `createClient` throws on a malformed URL,
// and it runs at module scope — so an environment variable set to a
// placeholder, a bare hostname, or a value with stray quotes took down the
// entire arcade chunk on evaluation, long before any leaderboard was opened.
// That is exactly what was happening in production: the lobby mounted, the
// import threw, and the game overlay rendered nothing at all.
//
// Parse the URL first, and treat construction failure as "not configured"
// rather than as fatal. A missing leaderboard is a degraded feature; a broken
// arcade is a broken page.
function parseHttpUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}

const resolvedUrl = parseHttpUrl(supabaseUrl)
const resolvedKey = typeof supabaseAnonKey === 'string' && supabaseAnonKey.trim() ? supabaseAnonKey.trim() : null

let client = null
if (resolvedUrl && resolvedKey) {
  try {
    client = createClient(resolvedUrl, resolvedKey)
  } catch (error) {
    console.warn('[supabase] client disabled, falling back to the local leaderboard:', error?.message)
  }
} else if (supabaseUrl || supabaseAnonKey) {
  // Half-configured is almost always a deployment mistake worth surfacing.
  console.warn('[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set but not usable; using the local leaderboard.')
}

export const supabase = client
export const isSupabaseConfigured = Boolean(client)

// Set after the first network-level failure (DNS, offline, blocked host). The
// remote board is then treated as down for the rest of the session, so every
// leaderboard tab and score submission stops firing a request that cannot
// succeed. A reload tries again.
let remoteUnavailable = false

/** True when the remote board is configured and has not failed this session. */
export function isRemoteLeaderboardAvailable() {
  return isSupabaseConfigured && !remoteUnavailable
}

// supabase-js reports a failed fetch as an error result with status 0, as
// opposed to a reachable server answering with an error (RLS, bad query).
function noteNetworkFailure(status) {
  if (status === 0) remoteUnavailable = true
}

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

  if (isRemoteLeaderboardAvailable()) {
    try {
      const { error, status } = await supabase.from(LEADERBOARD_TABLE).insert(entry)
      if (error) {
        noteNetworkFailure(status)
        throw error
      }
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
  if (isRemoteLeaderboardAvailable()) {
    try {
      let query = supabase
        .from(LEADERBOARD_TABLE)
        .select('id, player_name, score, boss_defeated, time_seconds, created_at, game')
        .order('score', { ascending: false })
        .limit(limit)
        // supabase-js retries failed GETs three times by default; the session
        // flag below already stops repeat attempts, so one failure = one request.
        .retry(false)
      if (game) query = query.eq('game', game)
      const { data, error, status } = await query
      if (error) {
        noteNetworkFailure(status)
        throw error
      }
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
  if (!isRemoteLeaderboardAvailable()) return { ok: false, source: 'none' }
  try {
    const { error, status } = await supabase
      .from(SAVES_TABLE)
      .insert({ player_name: player_name || 'Anonymous', save_data, updated_at: new Date().toISOString() })
    if (error) {
      noteNetworkFailure(status)
      throw error
    }
    return { ok: true, source: 'supabase' }
  } catch (err) {
    console.warn('[supabase] saveGameCloud failed:', err?.message)
    return { ok: false, source: 'error' }
  }
}
