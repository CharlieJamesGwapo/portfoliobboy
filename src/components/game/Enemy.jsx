// ============================================================================
// Enemy — factories + Canvas-2D drawing for regular enemies, skill enemies,
// the boss, and boss projectiles. Pure helpers; state lives in GameEngine.
// ============================================================================
import { v4 as uuidv4 } from 'uuid'

export const ENEMY_COLOR = '#ef4444' // red
const SKILL_ENEMY_COLOR = '#f97316' // orange-ish, still "red family"
const BOSS_COLOR = '#b91c1c'

export function createEnemy({ col, row, hp, label = '', kind = 'enemy', meta = null }) {
  return {
    id: uuidv4(),
    col,
    row,
    px: col,
    py: row,
    hp,
    maxHp: hp,
    label,
    kind, // 'enemy' | 'skill' | 'boss'
    meta, // attached real data (experience entry, skill name, etc.)
    lastMoveAt: 0,
    hurtFlashUntil: 0,
    dead: false,
  }
}

export function createBoss({ col, row, hp, name }) {
  return {
    ...createEnemy({ col, row, hp, label: name, kind: 'boss' }),
    phase: 1,
    lastShotAt: 0,
  }
}

export function createProjectile({ x, y, vx, vy, dmg }) {
  return { id: uuidv4(), x, y, vx, vy, dmg, life: 4000 }
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------
export function drawEnemy(ctx, enemy, cam, tile, time) {
  const x = enemy.px * tile - cam.x + tile / 2
  const y = enemy.py * tile - cam.y + tile / 2
  const hurt = time < enemy.hurtFlashUntil
  const isBoss = enemy.kind === 'boss'
  const radius = isBoss ? tile * 0.6 : tile * 0.32

  // off-screen cull
  if (x + tile < 0 || y + tile < 0 || x - tile > ctx.canvas.width || y - tile > ctx.canvas.height) return

  const baseColor = isBoss
    ? (enemy.phase === 2 ? '#7f1d1d' : BOSS_COLOR)
    : enemy.kind === 'skill' ? SKILL_ENEMY_COLOR : ENEMY_COLOR

  ctx.save()
  ctx.shadowColor = baseColor
  ctx.shadowBlur = isBoss ? tile * 0.9 : tile * 0.3
  ctx.fillStyle = hurt ? '#ffffff' : baseColor

  if (isBoss) {
    // jagged crown-ish body
    ctx.beginPath()
    const spikes = 8
    for (let i = 0; i < spikes * 2; i++) {
      const ang = (Math.PI * i) / spikes
      const rr = i % 2 === 0 ? radius : radius * 0.7
      const wobble = 1 + 0.06 * Math.sin(time / 120 + i)
      const pxp = x + Math.cos(ang) * rr * wobble
      const pyp = y + Math.sin(ang) * rr * wobble
      if (i === 0) ctx.moveTo(pxp, pyp)
      else ctx.lineTo(pxp, pyp)
    }
    ctx.closePath()
    ctx.fill()
  } else {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  // eyes
  ctx.fillStyle = '#fff7a0'
  const eo = radius * 0.32
  ctx.beginPath(); ctx.arc(x - eo, y - radius * 0.1, radius * 0.16, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(x + eo, y - radius * 0.1, radius * 0.16, 0, Math.PI * 2); ctx.fill()

  // HP bar
  drawHpBar(ctx, x, y - radius - (isBoss ? 14 : 9), enemy.hp / enemy.maxHp, isBoss ? tile * 1.4 : tile * 0.8, isBoss ? 6 : 4)

  // label
  if (enemy.label) {
    ctx.font = `${isBoss ? 'bold 14px' : '10px'} ui-sans-serif, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.strokeStyle = 'rgba(0,0,0,0.7)'
    ctx.lineWidth = 3
    const ly = y + radius + (isBoss ? 22 : 14)
    ctx.strokeText(enemy.label, x, ly)
    ctx.fillText(enemy.label, x, ly)
    ctx.textAlign = 'start'
  }
}

export function drawProjectile(ctx, p, cam, tile) {
  const x = p.x * tile - cam.x + tile / 2
  const y = p.y * tile - cam.y + tile / 2
  ctx.save()
  ctx.shadowColor = '#ff4d4d'
  ctx.shadowBlur = tile * 0.4
  ctx.fillStyle = '#ff6b6b'
  ctx.beginPath()
  ctx.arc(x, y, tile * 0.16, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawHpBar(ctx, cx, cy, frac, w, h) {
  const f = Math.max(0, Math.min(1, frac))
  ctx.fillStyle = 'rgba(0,0,0,0.6)'
  ctx.fillRect(cx - w / 2, cy, w, h)
  ctx.fillStyle = f > 0.5 ? '#22c55e' : f > 0.25 ? '#eab308' : '#ef4444'
  ctx.fillRect(cx - w / 2, cy, w * f, h)
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'
  ctx.lineWidth = 1
  ctx.strokeRect(cx - w / 2 + 0.5, cy + 0.5, w, h)
}

/**
 * Simple step-AI: move one tile toward the player if cooldown elapsed and the
 * target tile is walkable & unoccupied. Returns true if moved.
 */
export function stepEnemyToward(enemy, player, isWalkableFn, occupiedFn, time, intervalMs) {
  if (time - enemy.lastMoveAt < intervalMs) return false
  const dc = Math.sign(player.col - enemy.col)
  const dr = Math.sign(player.row - enemy.row)

  // Prefer the axis with greater distance
  const tryOrder =
    Math.abs(player.col - enemy.col) >= Math.abs(player.row - enemy.row)
      ? [{ c: dc, r: 0 }, { c: 0, r: dr }]
      : [{ c: 0, r: dr }, { c: dc, r: 0 }]

  for (const mv of tryOrder) {
    if (mv.c === 0 && mv.r === 0) continue
    const nc = enemy.col + mv.c
    const nr = enemy.row + mv.r
    if (isWalkableFn(nc, nr) && !occupiedFn(nc, nr)) {
      enemy.col = nc
      enemy.row = nr
      enemy.lastMoveAt = time
      return true
    }
  }
  enemy.lastMoveAt = time
  return false
}
