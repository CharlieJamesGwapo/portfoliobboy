import { createClient } from '@supabase/supabase-js'
import { MAX_LOCAL_SCORE_BYTES, normalizeLeaderboardRows, rankedLeaderboardRows, retainedLeaderboardRows } from './leaderboardData.js'

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

// Set after the first failed remote operation. The
// remote board is then treated as down for the rest of the session, so every
// leaderboard tab and score submission stops firing a request that cannot
// succeed. A reload tries again.
let remoteUnavailable = false

/** True when the remote board is configured and has not failed this session. */
export function isRemoteLeaderboardAvailable() {
  return isSupabaseConfigured && !remoteUnavailable
}

// Errors from reachable servers also use local mode for this session.
function noteRemoteFailure() {
  remoteUnavailable = true
}

const LEADERBOARD_TABLE = 'leaderboard'
const SAVES_TABLE = 'game_saves'

async function boundedRemoteQuery(query) {
  const controller = new AbortController()
  let timeout
  try {
    return await Promise.race([
      Promise.resolve(query.abortSignal(controller.signal)),
      new Promise((_, reject) => {
        timeout = setTimeout(() => {
          controller.abort()
          reject(new Error('Leaderboard request timed out'))
        }, 8000)
      }),
    ])
  } finally {
    clearTimeout(timeout)
  }
}

// Local fallback so the Win screen still shows a leaderboard offline.
const LOCAL_LEADERBOARD_KEY = 'dungeon_local_leaderboard'
let sessionRows = []
let storageUnavailable = false

function readLocalLeaderboard() {
  if (storageUnavailable) return [...sessionRows]
  try {
    const raw = localStorage.getItem(LOCAL_LEADERBOARD_KEY)
    sessionRows = raw && raw.length <= MAX_LOCAL_SCORE_BYTES ? retainedLeaderboardRows(JSON.parse(raw)) : []
  } catch {
    // Blocked storage and invalid JSON both leave the in-memory board usable.
  }
  return [...sessionRows]
}

function writeLocalLeaderboard(rows) {
  sessionRows = retainedLeaderboardRows(rows)
  try {
    const serialized = JSON.stringify(sessionRows)
    if (serialized.length > MAX_LOCAL_SCORE_BYTES) throw new Error('Local score storage limit')
    localStorage.setItem(LOCAL_LEADERBOARD_KEY, serialized)
  } catch {
    storageUnavailable = true
  }
}

/**
 * Submit a leaderboard entry. Falls back to localStorage when Supabase is not
 * configured or the request fails. Always resolves (never throws).
 */
export async function submitScore({ player_name, score, boss_defeated, time_seconds, game = 'dungeon' }) {
  const [entry] = normalizeLeaderboardRows([{
    player_name, score: Math.round(score), boss_defeated: Boolean(boss_defeated), time_seconds, game,
  }])
  if (!entry) return { ok: false, source: 'none' }

  if (isRemoteLeaderboardAvailable()) {
    try {
      const { error } = await boundedRemoteQuery(supabase.from(LEADERBOARD_TABLE).insert(entry))
      if (error) throw error
      return { ok: true, source: 'supabase' }
    } catch (err) {
      noteRemoteFailure()
      console.warn('[supabase] submitScore failed, using local fallback:', err?.message)
    }
  }

  const rows = readLocalLeaderboard()
  rows.push({ ...entry, created_at: new Date().toISOString(), id: `local-${rows.length}-${entry.score}` })
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
        .order('score', { ascending: game === 'racing' })
        .limit(limit)
        // supabase-js retries failed GETs three times by default; the session
        // flag below already stops repeat attempts, so one failure = one request.
        .retry(false)
      if (game) query = query.eq('game', game)
      if (game === 'racing') query = query.gt('score', 0)
      const { data, error } = await boundedRemoteQuery(query)
      if (error) throw error
      if (Array.isArray(data)) return rankedLeaderboardRows(data, limit, game)
      throw new Error('Invalid leaderboard response')
    } catch (err) {
      noteRemoteFailure()
      console.warn('[supabase] fetchLeaderboard failed, using local fallback:', err?.message)
    }
  }

  return rankedLeaderboardRows(readLocalLeaderboard(), limit, game)
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
      noteRemoteFailure()
      throw error
    }
    return { ok: true, source: 'supabase' }
  } catch (err) {
    console.warn('[supabase] saveGameCloud failed:', err?.message)
    return { ok: false, source: 'error' }
  }
}
