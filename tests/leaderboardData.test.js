import test, { afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const originalStorage = globalThis.localStorage
let moduleId = 0
const row = (name, score, game = 'racing') => ({ id: name, player_name: name, score, game, time_seconds: 60, boss_defeated: false, created_at: '2026-11-28T00:00:00Z' })
function storage(value) {
  let raw = value
  globalThis.localStorage = { getItem: () => raw, setItem: (_key, value) => { raw = value } }
}
async function loadBoard(remote = null) {
  globalThis.__leaderboardTestClient = remote
  let source = await readFile(new URL('../src/lib/supabase.js', import.meta.url), 'utf8')
  source = source.replace("import { createClient } from '@supabase/supabase-js'", 'const createClient = () => globalThis.__leaderboardTestClient')
    .replace('import.meta.env.VITE_SUPABASE_URL', remote ? "'https://leaderboard.invalid'" : 'undefined')
    .replace('import.meta.env.VITE_SUPABASE_ANON_KEY', remote ? "'test-public-key'" : 'undefined')
    .replaceAll("'./leaderboardData.js'", JSON.stringify(new URL('../src/lib/leaderboardData.js', import.meta.url).href))
  return import(`data:text/javascript;base64,${Buffer.from(source + `\n// instance ${moduleId++}`).toString('base64')}`)
}
afterEach(() => { globalThis.localStorage = originalStorage; delete globalThis.__leaderboardTestClient })

test('racing ranks the fastest valid lap first while score games rank highest first', async () => {
  storage(JSON.stringify([row('Slow', 50000), row('Fast', 20000), row('No lap', 0), row('Low', 20, 'snake'), row('High', 50, 'snake')]))
  const board = await loadBoard()
  assert.deepEqual((await board.fetchLeaderboard(10, 'racing')).map(r => r.player_name), ['Fast', 'Slow'])
  assert.deepEqual((await board.fetchLeaderboard(10, 'snake')).map(r => r.player_name), ['High', 'Low'])
})

test('malformed local records recover to an empty usable board', async () => {
  for (const raw of ['null', '{}', '[null]', '[1,"bad",{}]', '{', 'x'.repeat(200001)]) {
    storage(raw)
    const board = await loadBoard()
    assert.deepEqual(await board.fetchLeaderboard(10, 'racing'), [])
    assert.equal((await board.submitScore({ player_name: 'Recovered', score: 25000, game: 'racing' })).ok, true)
    assert.equal((await board.fetchLeaderboard(10, 'racing'))[0].player_name, 'Recovered')
  }
})

test('denied storage keeps submitted scores available for this session', async () => {
  globalThis.localStorage = { getItem: () => { throw Error('denied') }, setItem: () => { throw Error('denied') } }
  const board = await loadBoard()
  assert.deepEqual(await board.fetchLeaderboard(10, 'snake'), [])
  await board.submitScore({ player_name: 'Session', score: 70, game: 'snake' })
  assert.equal((await board.fetchLeaderboard(10, 'snake'))[0]?.player_name, 'Session')
})

test('remote race queries rank fastest laps and exclude invalid laps before limiting', async () => {
  storage(null)
  const query = {
    select() { return this },
    order(_column, options) { this.ascending = options.ascending; return this },
    gt(column, value) { this.positive = column === 'score' && value === 0; return this },
    limit(value) { this.limitValue = value; return this },
    retry() { return this }, abortSignal() { return this }, eq() { return this },
    then(resolve) {
      const rows = [row('Slow', 50000), row('Fast', 20000), row('No lap', 0)]
        .filter(r => !this.positive || r.score > 0)
        .sort((a, b) => this.ascending ? a.score - b.score : b.score - a.score).slice(0, this.limitValue)
      return Promise.resolve({ data: rows, error: null, status: 200 }).then(resolve)
    },
  }
  const board = await loadBoard({ from: () => query })
  assert.deepEqual((await board.fetchLeaderboard(1, 'racing')).map(r => r.player_name), ['Fast'])
})

test('remote errors fall back safely and report local mode even for reachable errors', async context => {
  context.mock.method(console, 'warn', () => {})
  storage(JSON.stringify([row('Local', 20000)]))
  const query = { select() { return this }, order() { return this }, gt() { return this }, limit() { return this }, retry() { return this }, abortSignal() { return this }, eq() { return this }, then(resolve) { return Promise.resolve({ data: null, error: { message: 'Denied' }, status: 403 }).then(resolve) } }
  const board = await loadBoard({ from: () => query })
  assert.equal((await board.fetchLeaderboard(5, 'racing'))[0].player_name, 'Local')
  assert.equal(board.isRemoteLeaderboardAvailable(), false)
})

test('a stalled remote read returns local results within a bounded wait', async context => {
  context.mock.method(console, 'warn', () => {})
  storage(JSON.stringify([row('Offline lap', 25000)]))
  const query = { select() { return this }, order() { return this }, gt() { return this }, limit() { return this }, retry() { return this }, abortSignal() { return this }, eq() { return this }, abortSignal(signal) { this.signal = signal; return this }, then() {} }
  const board = await loadBoard({ from: () => query })
  context.mock.timers.enable({ apis: ['setTimeout'] })
  const pending = board.fetchLeaderboard(5, 'racing')
  context.mock.timers.tick(10_000)
  // Race the result against a manually flushed sentinel rather than waiting forever.
  const actual = await Promise.race([pending, Promise.resolve().then(() => Promise.resolve()).then(() => 'still waiting')])
  assert.notEqual(actual, 'still waiting')
  assert.equal(actual[0].player_name, 'Offline lap')
  assert.equal(query.signal.aborted, true)
})

test('storage limits preserve a new lap and the fastest existing laps across games', async () => {
  const rows = Array.from({ length: 499 }, (_, index) => row(`Points ${index}`, index + 100000, 'snake'))
  rows.push(row('Existing fastest', 18000))
  storage(JSON.stringify(rows))
  const board = await loadBoard()
  await board.submitScore({ player_name: 'New fastest', score: 17000, game: 'racing' })
  assert.deepEqual((await board.fetchLeaderboard(2, 'racing')).map(row => row.player_name), ['New fastest', 'Existing fastest'])
})

test('quota failure retains the newly submitted score without rereading stale storage', async () => {
  globalThis.localStorage = { getItem: () => JSON.stringify([row('Old', 20, 'snake')]), setItem: () => { throw Error('quota') } }
  const board = await loadBoard()
  await board.submitScore({ player_name: 'New', score: 30, game: 'snake' })
  assert.deepEqual((await board.fetchLeaderboard(2, 'snake')).map(row => row.player_name), ['New', 'Old'])
})

test('remote insert rejection recovers to the local board without losing the score', async context => {
  context.mock.method(console, 'warn', () => {})
  storage(null)
  const query = { abortSignal() { return this }, then(resolve) { return Promise.resolve({ error: { message: 'Denied' }, status: 403 }).then(resolve) } }
  const board = await loadBoard({ from: () => ({ insert: () => query }) })
  assert.deepEqual(await board.submitScore({ player_name: 'Local only', score: 10, game: 'snake' }), { ok: true, source: 'local' })
  assert.equal((await board.fetchLeaderboard(5, 'snake'))[0].player_name, 'Local only')
})
