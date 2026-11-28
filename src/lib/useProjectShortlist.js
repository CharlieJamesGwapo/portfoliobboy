import { useSyncExternalStore } from 'react'
import { normalizeShortlist, readSharedShortlist, toggleShortlist } from './projectShortlistSelection.js'

const STORAGE_KEY = 'portfolio-project-shortlist'
const listeners = new Set()
const empty = Object.freeze({ slugs: [], status: '' })
let snapshot = empty
let initialized = false

function persist() {
  try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot.slugs)) } catch { /* Memory remains usable when storage is blocked. */ }
}

function replaceSharedQuery() {
  if (typeof window === 'undefined' || !/^\/projects\/?$/.test(window.location.pathname)) return
  const url = new URL(window.location.href)
  if (!url.searchParams.has('compare')) return
  url.searchParams.set('compare', snapshot.slugs.join(','))
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
}

function publish(slugs, status = '', updateQuery = true) {
  snapshot = { slugs, status }
  persist()
  if (updateQuery) replaceSharedQuery()
  for (const listener of listeners) listener()
}

function readLocation() {
  if (!/^\/projects\/?$/.test(window.location.pathname)) return
  const shared = readSharedShortlist(window.location.search)
  if (shared !== null) {
    if (shared.join(',') !== snapshot.slugs.join(',')) publish(shared, '', false)
    replaceSharedQuery()
  }
}

function initialize() {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    snapshot = { slugs: stored && stored.length <= 1024 ? normalizeShortlist(JSON.parse(stored)) : [], status: '' }
  } catch { snapshot = empty }
  readLocation()
  window.addEventListener('popstate', readLocation)
}

function subscribe(listener) {
  initialize()
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() { initialize(); return snapshot }
const getServerSnapshot = () => empty

function toggle(slug) {
  initialize()
  const result = toggleShortlist(snapshot.slugs, slug)
  publish(result.slugs, result.status)
  return result.status
}

function remove(slug) {
  initialize()
  if (!snapshot.slugs.includes(slug)) return false
  publish(snapshot.slugs.filter(selected => selected !== slug), 'removed')
  return true
}

function clear() {
  initialize()
  if (!snapshot.slugs.length) return false
  publish([], 'cleared')
  return true
}

export function useProjectShortlist() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return { ...current, toggle, remove, clear }
}
