// ============================================================================
// avatar.js — shared pixel-avatar system (no image files).
// Single source of truth for: customization options, persistence, unlocks,
// share-link encoding, and a canvas renderer used by every game to draw the
// player sprite. The AvatarCustomizer renders its live preview with the SAME
// renderer (into a <canvas>) so the preview always matches in-game.
// ============================================================================

export const SKIN_TONES = ['#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#5c3836']
export const HAIR_COLORS = ['#1b1b1b', '#3b2417', '#6b4226', '#a55728', '#c9a227', '#e8e8e8', '#9b1c9b', '#2b6bff']
export const OUTFIT_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ec4899', '#ef4444', '#1f2937']

export const HAIR_STYLES = ['none', 'short', 'long', 'spiky', 'cap', 'beanie']
export const OUTFITS = ['hoodie', 'suit', 'casual', 'dev', 'barong', 'astronaut']
export const ACCESSORIES = ['none', 'glasses', 'crown', 'headphones', 'halo']
export const HAND_ITEMS = ['sword', 'laptop', 'coffee', 'controller', 'none']

export const BACKGROUNDS = [
  { id: 'space', label: 'Space', css: 'linear-gradient(135deg,#0f172a,#1e293b)', c1: '#0f172a', c2: '#1e293b' },
  { id: 'sunset', label: 'Sunset', css: 'linear-gradient(135deg,#f59e0b,#ec4899)', c1: '#f59e0b', c2: '#ec4899' },
  { id: 'ocean', label: 'Ocean', css: 'linear-gradient(135deg,#06b6d4,#3b82f6)', c1: '#06b6d4', c2: '#3b82f6' },
  { id: 'forest', label: 'Forest', css: 'linear-gradient(135deg,#22c55e,#065f46)', c1: '#22c55e', c2: '#065f46' },
  { id: 'grape', label: 'Grape', css: 'linear-gradient(135deg,#8b5cf6,#4c1d95)', c1: '#8b5cf6', c2: '#4c1d95' },
  { id: 'ember', label: 'Ember', css: 'linear-gradient(135deg,#ef4444,#7f1d1d)', c1: '#ef4444', c2: '#7f1d1d' },
  { id: 'mint', label: 'Mint', css: 'linear-gradient(135deg,#2dd4bf,#0e7490)', c1: '#2dd4bf', c2: '#0e7490' },
  { id: 'mono', label: 'Mono', css: 'linear-gradient(135deg,#475569,#0f172a)', c1: '#475569', c2: '#0f172a' },
]

export const DEFAULT_AVATAR = {
  skin: '#f1c27d',
  hairStyle: 'short',
  hairColor: '#3b2417',
  outfit: 'hoodie',
  outfitColor: '#3b82f6',
  accessory: 'glasses',
  handItem: 'laptop',
  bg: 'space',
}

// Items that must be earned. category+value -> unlock key.
export const LOCKED_ITEMS = [
  { category: 'accessory', value: 'crown', unlock: 'crown', how: 'Beat the Dungeon boss' },
  { category: 'outfit', value: 'astronaut', unlock: 'astronaut', how: 'Reach wave 7 in Bug Blaster' },
  { category: 'accessory', value: 'halo', unlock: 'halo', how: 'Finish all 6 Code Racer rounds' },
]

const AVATAR_KEY = 'dungeon_avatar'
const UNLOCKS_KEY = 'dungeon_unlocks'
const NAME_KEY = 'dungeon_player_name'

// --- persistence ----------------------------------------------------------
export function getAvatar() {
  try {
    const raw = localStorage.getItem(AVATAR_KEY)
    if (!raw) return { ...DEFAULT_AVATAR }
    return { ...DEFAULT_AVATAR, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_AVATAR }
  }
}
export function saveAvatar(cfg) {
  try { localStorage.setItem(AVATAR_KEY, JSON.stringify(cfg)) } catch { /* noop */ }
}

export const DEFAULT_UNLOCKS = { crown: false, astronaut: false, halo: false }
export function getUnlocks() {
  try {
    const raw = localStorage.getItem(UNLOCKS_KEY)
    return { ...DEFAULT_UNLOCKS, ...(raw ? JSON.parse(raw) : {}) }
  } catch {
    return { ...DEFAULT_UNLOCKS }
  }
}
export function setUnlock(key) {
  try {
    const u = getUnlocks()
    if (u[key]) return u
    u[key] = true
    localStorage.setItem(UNLOCKS_KEY, JSON.stringify(u))
    return u
  } catch {
    return getUnlocks()
  }
}

export function isLocked(category, value, unlocks) {
  const match = LOCKED_ITEMS.find((l) => l.category === category && l.value === value)
  if (!match) return false
  return !unlocks?.[match.unlock]
}

export function getPlayerName() {
  try { return localStorage.getItem(NAME_KEY) || '' } catch { return '' }
}
export function setPlayerName(name) {
  try { localStorage.setItem(NAME_KEY, name) } catch { /* noop */ }
}

// --- share link encoding --------------------------------------------------
export function encodeAvatar(cfg) {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(cfg)))) } catch { return '' }
}
export function decodeAvatar(str) {
  try { return { ...DEFAULT_AVATAR, ...JSON.parse(decodeURIComponent(escape(atob(str)))) } } catch { return null }
}

export function bgById(id) {
  return BACKGROUNDS.find((b) => b.id === id) || BACKGROUNDS[0]
}

// --- canvas renderer ------------------------------------------------------
// Draws the avatar into a `size`x`size` box with its top-left at (x,y).
export function drawAvatar(ctx, cfg, x, y, size, opts = {}) {
  if (!ctx) return
  const u = size / 16
  const px = (gx, gy, gw, gh, color) => {
    ctx.fillStyle = color
    ctx.fillRect(x + gx * u, y + gy * u, gw * u, gh * u)
  }
  const a = { ...DEFAULT_AVATAR, ...cfg }

  ctx.save()
  // background bubble
  if (opts.bubble !== false) {
    const bg = bgById(a.bg)
    const grad = ctx.createLinearGradient(x, y, x + size, y + size)
    grad.addColorStop(0, bg.c1)
    grad.addColorStop(1, bg.c2)
    roundRect(ctx, x, y, size, size, size * 0.22)
    ctx.fillStyle = grad
    ctx.globalAlpha = opts.bubbleAlpha ?? 0.9
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // body / outfit
  drawOutfit(px, a)

  // head
  px(4.5, 2.5, 7, 6, a.skin)

  // eyes
  px(6, 5, 1, 1.2, '#1b1b1b')
  px(9, 5, 1, 1.2, '#1b1b1b')

  // hair
  drawHair(px, a)

  // accessory
  drawAccessory(px, ctx, x, y, u, a)

  // hand item
  drawHandItem(px, a)

  ctx.restore()
}

function drawOutfit(px, a) {
  const c = a.outfitColor
  switch (a.outfit) {
    case 'suit':
      px(4, 8.5, 8, 6.5, '#1f2937')
      px(7, 8.5, 2, 6.5, '#ffffff') // shirt
      px(7.5, 8.5, 1, 3, c) // tie
      break
    case 'casual':
      px(4, 8.5, 8, 6.5, c)
      px(4, 8.5, 8, 1, '#00000022')
      break
    case 'dev':
      px(4, 8.5, 8, 6.5, '#111827')
      // </> mark
      px(6, 11, 0.8, 0.8, c)
      px(5.5, 11.8, 0.8, 0.8, c)
      px(6, 12.6, 0.8, 0.8, c)
      px(9, 11, 0.8, 0.8, c)
      px(9.5, 11.8, 0.8, 0.8, c)
      px(9, 12.6, 0.8, 0.8, c)
      break
    case 'barong':
      px(4, 8.5, 8, 6.5, '#f5f5dc')
      px(7.7, 8.5, 0.6, 6.5, '#e3e0c0')
      px(6, 9.5, 0.4, 4, '#d8d4ad')
      px(9.4, 9.5, 0.4, 4, '#d8d4ad')
      break
    case 'astronaut':
      px(3.7, 8.2, 8.6, 6.8, '#e8edf2')
      px(6.5, 10.5, 3, 2, '#3b82f6') // chest panel
      px(4, 8.2, 8, 0.8, '#cbd5e1')
      break
    case 'hoodie':
    default:
      px(4, 8.5, 8, 6.5, c)
      px(4, 8.2, 8, 1.4, shade(c, -0.18)) // hood collar
      px(7.7, 9, 0.6, 3, shade(c, -0.3)) // zipper
  }
}

function drawHair(px, a) {
  const c = a.hairColor
  switch (a.hairStyle) {
    case 'none':
      break
    case 'long':
      px(4, 1.8, 8, 2.2, c)
      px(4, 1.8, 1.2, 7, c)
      px(10.8, 1.8, 1.2, 7, c)
      break
    case 'spiky':
      px(4.5, 2, 7, 1.2, c)
      px(5, 1, 1, 1.3, c)
      px(7.5, 0.6, 1, 1.6, c)
      px(10, 1, 1, 1.3, c)
      break
    case 'cap':
      px(4, 2, 8, 1.6, c)
      px(3.5, 3.2, 5, 0.8, shade(c, -0.2)) // brim
      break
    case 'beanie':
      px(3.8, 1.4, 8.4, 2.6, c)
      px(3.8, 3.4, 8.4, 0.8, shade(c, 0.2))
      break
    case 'short':
    default:
      px(4.3, 1.9, 7.4, 1.8, c)
      px(4.3, 1.9, 1, 2.6, c)
      px(10.7, 1.9, 1, 2.6, c)
  }
}

function drawAccessory(px, ctx, x, y, u, a) {
  switch (a.accessory) {
    case 'glasses':
      px(5.6, 4.8, 1.8, 1.6, '#0f172a')
      px(8.6, 4.8, 1.8, 1.6, '#0f172a')
      px(7.4, 5.3, 1.2, 0.5, '#0f172a')
      // lens shine
      px(5.9, 5.0, 0.6, 0.6, '#38bdf8')
      px(8.9, 5.0, 0.6, 0.6, '#38bdf8')
      break
    case 'crown':
      px(4.5, 0.6, 7, 1.6, '#facc15')
      px(5, 0, 0.9, 1, '#fde047')
      px(7.55, -0.3, 0.9, 1.3, '#fde047')
      px(10.1, 0, 0.9, 1, '#fde047')
      break
    case 'headphones':
      px(3.6, 2, 0.9, 4, '#111827') // left
      px(11.5, 2, 0.9, 4, '#111827') // right
      px(4, 1.4, 8, 1, '#111827') // band
      break
    case 'halo':
      ctx.save()
      ctx.strokeStyle = '#fde047'
      ctx.lineWidth = Math.max(1.5, u * 0.5)
      ctx.beginPath()
      ctx.ellipse(x + 8 * u, y + 1.1 * u, 3.2 * u, 1 * u, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
      break
    default:
      break
  }
}

function drawHandItem(px, a) {
  switch (a.handItem) {
    case 'sword':
      px(11.8, 7, 0.7, 6, '#cbd5e1') // blade
      px(11.3, 12.4, 1.7, 0.8, '#7c3a12') // guard
      break
    case 'laptop':
      px(11.4, 10.5, 3, 2, '#334155')
      px(11.6, 10.7, 2.6, 1.4, '#60a5fa') // screen
      break
    case 'coffee':
      px(11.8, 10.5, 2, 2.2, '#7c3a12')
      px(13.8, 11, 0.6, 1, '#7c3a12') // handle
      px(11.8, 10.2, 2, 0.4, '#e7d8c4') // foam
      break
    case 'controller':
      px(11.3, 10.8, 3.2, 1.8, '#1f2937')
      px(11.7, 11.2, 0.6, 0.6, '#22d3ee')
      px(13.6, 11.2, 0.6, 0.6, '#ef4444')
      break
    case 'none':
    default:
      break
  }
}

// --- offscreen sprite cache ----------------------------------------------
const spriteCache = new Map()
export function makeSprite(cfg, size = 64, opts = {}) {
  try {
    const key = JSON.stringify(cfg) + '|' + size + '|' + JSON.stringify(opts)
    if (spriteCache.has(key)) return spriteCache.get(key)
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    drawAvatar(ctx, cfg, 0, 0, size, opts)
    spriteCache.set(key, canvas)
    return canvas
  } catch {
    return null
  }
}

// --- small color/shape utils ---------------------------------------------
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function shade(hex, amt) {
  try {
    const c = hex.replace('#', '')
    const n = parseInt(c.length === 3 ? c.split('').map((x) => x + x).join('') : c, 16)
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
    r = Math.max(0, Math.min(255, Math.round(r + 255 * amt)))
    g = Math.max(0, Math.min(255, Math.round(g + 255 * amt)))
    b = Math.max(0, Math.min(255, Math.round(b + 255 * amt)))
    return `rgb(${r},${g},${b})`
  } catch {
    return hex
  }
}
