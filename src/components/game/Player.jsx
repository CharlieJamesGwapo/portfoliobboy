// ============================================================================
// Player — factory + Canvas-2D drawing for the hero.
// Player state lives in the GameEngine world ref; these are pure helpers.
// ============================================================================
import { PLAYER_CONFIG } from '../../data/gameData'
import { getAvatar, makeSprite } from '../../lib/avatar'

export function createPlayer(col, row) {
  const avatar = getAvatar()
  return {
    col,
    row,
    // render position interpolates toward (col,row) for smooth movement
    px: col,
    py: row,
    hp: PLAYER_CONFIG.maxHp,
    maxHp: PLAYER_CONFIG.maxHp,
    xp: 0,
    level: 1,
    facing: 'down',
    attack: PLAYER_CONFIG.attack,
    lastAttackAt: -9999,
    lastHurtAt: -9999,
    attackAnimUntil: 0,
    hurtFlashUntil: 0,
    avatar,
    sprite: makeSprite(avatar, 64, { bubble: false }),
  }
}

export const PLAYER_COLOR = '#22d3ee' // cyan

/**
 * Draw the player. cam = world top-left px offset, tile = px size, time = ms.
 */
export function drawPlayer(ctx, player, cam, tile, time) {
  const x = player.px * tile - cam.x + tile / 2
  const y = player.py * tile - cam.y + tile / 2
  const radius = tile * 0.34
  const hurt = time < player.hurtFlashUntil

  // attack swing arc
  if (time < player.attackAnimUntil) {
    const prog = 1 - (player.attackAnimUntil - time) / 180
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(facingAngle(player.facing) + prog * Math.PI)
    ctx.strokeStyle = `rgba(255,255,255,${0.8 * (1 - prog)})`
    ctx.lineWidth = Math.max(2, tile * 0.08)
    ctx.beginPath()
    ctx.arc(0, 0, tile * 0.62, -0.6, 0.6)
    ctx.stroke()
    ctx.restore()
  }

  // Avatar sprite (preferred) — replaces the default cyan dot.
  if (player.sprite) {
    const s = tile * 1.05
    ctx.save()
    ctx.shadowColor = hurt ? '#ff5a5a' : PLAYER_COLOR
    ctx.shadowBlur = tile * 0.35
    try {
      ctx.drawImage(player.sprite, x - s / 2, y - s / 2, s, s)
    } catch { /* noop */ }
    ctx.restore()
    if (hurt) {
      ctx.save()
      ctx.globalAlpha = 0.4
      ctx.fillStyle = '#ff5a5a'
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
    return
  }

  // Fallback: glowing cyan dot
  ctx.save()
  ctx.shadowColor = PLAYER_COLOR
  ctx.shadowBlur = tile * 0.4
  ctx.fillStyle = hurt ? '#ff5a5a' : PLAYER_COLOR
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.fillStyle = hurt ? '#ffd0d0' : '#0e2a30'
  ctx.beginPath()
  ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2)
  ctx.fill()

  const dir = facingVector(player.facing)
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(x + dir.x * radius * 0.55, y + dir.y * radius * 0.55, radius * 0.18, 0, Math.PI * 2)
  ctx.fill()
}

export function facingVector(facing) {
  switch (facing) {
    case 'up': return { x: 0, y: -1 }
    case 'down': return { x: 0, y: 1 }
    case 'left': return { x: -1, y: 0 }
    case 'right': return { x: 1, y: 0 }
    default: return { x: 0, y: 1 }
  }
}

function facingAngle(facing) {
  switch (facing) {
    case 'up': return -Math.PI / 2
    case 'down': return Math.PI / 2
    case 'left': return Math.PI
    case 'right': return 0
    default: return Math.PI / 2
  }
}

/** Tiles considered "adjacent" for an attack (8-neighbourhood + facing reach). */
export function attackTiles(player) {
  const tiles = []
  for (let dc = -1; dc <= 1; dc++) {
    for (let dr = -1; dr <= 1; dr++) {
      if (dc === 0 && dr === 0) continue
      tiles.push({ col: player.col + dc, row: player.row + dr })
    }
  }
  return tiles
}
