// ============================================================================
// GameEngine — owns the world, the rAF game loop, Canvas-2D rendering, input,
// combat, room transitions, and progression. Exposes imperative controls for
// MobileControls via ref. Pushes throttled HUD snapshots via onState.
// ============================================================================
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import {
  buildAllRooms,
  isWalkable,
  doorAt,
  entryTile,
  centerTile,
  drawRoom,
} from './DungeonMap'
import { createPlayer, drawPlayer, attackTiles, facingVector } from './Player'
import {
  drawEnemy,
  drawProjectile,
  stepEnemyToward,
  createProjectile,
} from './Enemy'
import {
  populateRoom,
  drawChest,
  drawPedestal,
  drawInteractable,
} from './RoomContent'
import { PLAYER_CONFIG, BOSS, computeScore } from '../../data/gameData'
import AudioManager from './AudioManager'

const MOVE_STEP_MS = 130
const ENEMY_MOVE_MS = 520
const STATE_PUSH_MS = 100
const FOOTSTEP_MS = 260

const GameEngine = forwardRef(function GameEngine(
  {
    keybindings,
    displaySettings,
    paused,
    onState,
    onPopup,
    onRoomEnter,
    onWin,
    onToggleMap,
    onToggleSettings,
  },
  ref
) {
  const canvasRef = useRef(null)
  const worldRef = useRef(null)
  const rafRef = useRef(0)
  const sizeRef = useRef({ w: 0, h: 0, tile: 48, dpr: 1 })

  // Keep latest props in refs so the loop closure always sees fresh values.
  const propsRef = useRef({})
  propsRef.current = {
    keybindings,
    displaySettings,
    paused,
    onState,
    onPopup,
    onRoomEnter,
    onWin,
    onToggleMap,
    onToggleSettings,
  }

  // --- world bootstrap ----------------------------------------------------
  function initWorld() {
    const rooms = buildAllRooms()
    const contents = {}
    for (const id of Object.keys(rooms)) contents[id] = populateRoom(id)
    const spawn = centerTile()
    const player = createPlayer(spawn.col, spawn.row)
    return {
      rooms,
      contents,
      current: 'start',
      player,
      projectiles: [],
      particles: [],
      collectedSkills: [],
      kills: 0,
      chestsOpened: 0,
      certsInspected: 0,
      startTime: performance.now(),
      dirs: new Set(),
      moveCooldownUntil: 0,
      cam: { x: 0, y: 0 },
      shakeUntil: 0,
      shakeMag: 0,
      bossDefeated: false,
      won: false,
      popupOpen: false,
      lastFootstepAt: 0,
      lastStatePush: 0,
      fps: 0,
      _frames: 0,
      _fpsLast: performance.now(),
      _last: performance.now(),
      pendingRoomBanner: null,
    }
  }

  // --- imperative controls (mobile) --------------------------------------
  useImperativeHandle(ref, () => ({
    pressDir(dir, isDown) {
      const w = worldRef.current
      if (!w) return
      if (isDown) w.dirs.add(dir)
      else w.dirs.delete(dir)
    },
    pressAttack() {
      doAttack()
    },
    pressInteract() {
      doInteract()
    },
    clearPopup() {
      const w = worldRef.current
      if (w) w.popupOpen = false
    },
    restart() {
      worldRef.current = initWorld()
      announceRoom('start', true)
    },
  }))

  // --- helpers ------------------------------------------------------------
  function currentContent() {
    const w = worldRef.current
    return w.contents[w.current]
  }

  function announceRoom(roomId, force = false) {
    const w = worldRef.current
    const room = w.rooms[roomId]
    if (propsRef.current.onRoomEnter) propsRef.current.onRoomEnter(roomId, room.name)
    try {
      AudioManager.playMusic(roomId === 'boss' ? 'boss' : 'dungeon')
    } catch { /* noop */ }
    try { if (!force) AudioManager.playSFX('door') } catch { /* noop */ }
  }

  function transitionRoom(dir) {
    const w = worldRef.current
    const door = w.rooms[w.current].doors[dir]
    if (!door) return
    const targetId = door.to
    w.current = targetId
    const entry = entryTile(w.rooms[targetId], dir)
    w.player.col = entry.col
    w.player.row = entry.row
    w.player.px = entry.col
    w.player.py = entry.row
    w.dirs.clear()
    w.projectiles = []
    announceRoom(targetId)
  }

  function spawnParticles(col, row, color, count = 10) {
    const w = worldRef.current
    if (!propsRef.current.displaySettings?.particles) return
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2
      const spd = 0.02 + Math.random() * 0.05
      w.particles.push({
        x: col + 0.5,
        y: row + 0.5,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 400 + Math.random() * 300,
        maxLife: 700,
        color,
      })
    }
  }

  function shake(mag, ms) {
    const w = worldRef.current
    if (!propsRef.current.displaySettings?.screenShake) return
    w.shakeMag = mag
    w.shakeUntil = performance.now() + ms
  }

  function damagePlayer(amount) {
    const w = worldRef.current
    const now = performance.now()
    const p = w.player
    if (now - p.lastHurtAt < PLAYER_CONFIG.contactDamageCooldownMs) return
    p.hp -= amount
    p.lastHurtAt = now
    p.hurtFlashUntil = now + 200
    try { AudioManager.playSFX('hit') } catch { /* noop */ }
    shake(6, 180)
    if (p.hp <= 0) respawn()
  }

  function respawn() {
    const w = worldRef.current
    const p = w.player
    p.hp = Math.max(1, Math.round(p.maxHp * PLAYER_CONFIG.respawnHpFactor))
    const spawn = centerTile()
    w.current = 'start'
    p.col = spawn.col
    p.row = spawn.row
    p.px = spawn.col
    p.py = spawn.row
    w.dirs.clear()
    w.projectiles = []
    announceRoom('start')
  }

  function addKillRewards() {
    const w = worldRef.current
    w.kills += 1
    w.player.xp += 20
    w.player.level = Math.floor(w.player.xp / 100) + 1
  }

  function killEnemy(enemy) {
    const w = worldRef.current
    enemy.dead = true
    addKillRewards()
    spawnParticles(enemy.col, enemy.row, '#ff7676', 14)
    try { AudioManager.playSFX('enemyDeath') } catch { /* noop */ }

    if (enemy.kind === 'skill') {
      const name = enemy.meta?.data
      if (name && !w.collectedSkills.includes(name)) w.collectedSkills.push(name)
    } else if (enemy.meta?.type === 'experience') {
      openPopup({ type: 'experience', data: enemy.meta.data })
    }
  }

  function openPopup(descriptor) {
    const w = worldRef.current
    w.popupOpen = true
    if (propsRef.current.onPopup) propsRef.current.onPopup(descriptor)
  }

  function isBlockedForGame() {
    const w = worldRef.current
    return propsRef.current.paused || w.popupOpen || w.won
  }

  // --- combat -------------------------------------------------------------
  function doAttack() {
    const w = worldRef.current
    if (!w || isBlockedForGame()) return
    const now = performance.now()
    const p = w.player
    if (now - p.lastAttackAt < PLAYER_CONFIG.attackCooldownMs) return
    p.lastAttackAt = now
    p.attackAnimUntil = now + 180
    try { AudioManager.playSFX('sword') } catch { /* noop */ }

    const tiles = attackTiles(p)
    const content = currentContent()

    // regular / skill enemies
    if (content.enemies?.length) {
      for (const e of content.enemies) {
        if (e.dead) continue
        if (tiles.some((t) => t.col === e.col && t.row === e.row)) {
          e.hp -= p.attack
          e.hurtFlashUntil = now + 120
          spawnParticles(e.col, e.row, '#ffd0d0', 4)
          if (e.hp <= 0) killEnemy(e)
        }
      }
      content.enemies = content.enemies.filter((e) => !e.dead)
    }

    // boss
    if (content.boss && !content.boss.dead) {
      const b = content.boss
      // boss occupies a 1-tile logical cell but is large; allow hit if within 1.5 tiles
      const near = tiles.some((t) => Math.abs(t.col - b.col) <= 1 && Math.abs(t.row - b.row) <= 1)
      if (near) {
        b.hp -= p.attack
        b.hurtFlashUntil = now + 120
        spawnParticles(b.col, b.row, '#ffd0d0', 6)
        if (b.hp <= b.maxHp * BOSS.phaseTwoAt && b.phase === 1) {
          b.phase = 2
          shake(10, 300)
        }
        if (b.hp <= 0) defeatBoss()
      }
    }
  }

  function defeatBoss() {
    const w = worldRef.current
    const content = currentContent()
    if (content.boss) content.boss.dead = true
    w.bossDefeated = true
    w.won = true
    addKillRewards()
    spawnParticles(w.player.col, w.player.row, '#ffe08a', 30)
    const seconds = (performance.now() - w.startTime) / 1000
    const score = computeScore({
      kills: w.kills,
      chests: w.chestsOpened,
      certs: w.certsInspected,
      seconds,
    })
    try { AudioManager.playMusic('victory') } catch { /* noop */ }
    if (propsRef.current.onWin) {
      propsRef.current.onWin({ score, timeSeconds: Math.round(seconds), bossDefeated: true })
    }
  }

  function doInteract() {
    const w = worldRef.current
    if (!w || isBlockedForGame()) return
    const p = w.player
    const content = currentContent()
    const near = (o) => Math.abs(o.col - p.col) <= 1 && Math.abs(o.row - p.row) <= 1

    // chests
    if (content.chests?.length) {
      const chest = content.chests.find((c) => !c.opened && near(c))
      if (chest) {
        chest.opened = true
        w.chestsOpened += 1
        try { AudioManager.playSFX('chest') } catch { /* noop */ }
        spawnParticles(chest.col, chest.row, '#ffd95e', 12)
        openPopup({ type: 'project', data: chest.project })
        return
      }
    }
    // pedestals
    if (content.pedestals?.length) {
      const ped = content.pedestals.find((c) => !c.inspected && near(c))
      if (ped) {
        ped.inspected = true
        w.certsInspected += 1
        spawnParticles(ped.col, ped.row, '#c4b5fd', 10)
        openPopup({ type: 'cert', data: ped.cert })
        return
      }
    }
    // npc / scrolls
    if (content.interactables?.length) {
      const obj = content.interactables.find((c) => near(c))
      if (obj) {
        openPopup({ type: 'dialogue', title: obj.title, lines: obj.lines })
        return
      }
    }
    // nothing to interact with -> E acts as an attack (spec: SPACE/E attack)
    doAttack()
  }

  // --- movement -----------------------------------------------------------
  function tryMove() {
    const w = worldRef.current
    const now = performance.now()
    if (now < w.moveCooldownUntil) return
    if (w.dirs.size === 0) return

    let dc = 0
    let dr = 0
    let facing = w.player.facing
    if (w.dirs.has('up')) { dr = -1; facing = 'up' }
    else if (w.dirs.has('down')) { dr = 1; facing = 'down' }
    else if (w.dirs.has('left')) { dc = -1; facing = 'left' }
    else if (w.dirs.has('right')) { dc = 1; facing = 'right' }
    if (dc === 0 && dr === 0) return

    w.player.facing = facing
    const room = w.rooms[w.current]
    const nc = w.player.col + dc
    const nr = w.player.row + dr
    if (!isWalkable(room, nc, nr)) return

    w.player.col = nc
    w.player.row = nr
    w.moveCooldownUntil = now + MOVE_STEP_MS

    if (now - w.lastFootstepAt > FOOTSTEP_MS) {
      w.lastFootstepAt = now
      try { AudioManager.playSFX('footstep') } catch { /* noop */ }
    }

    const door = doorAt(room, nc, nr)
    if (door) transitionRoom(door.dir)
  }

  // --- per-frame updates --------------------------------------------------
  function updateEnemies(now) {
    const w = worldRef.current
    const content = currentContent()
    const p = w.player

    const occupied = (col, row, selfId) => {
      if (p.col === col && p.row === row) return true
      return (content.enemies || []).some((e) => !e.dead && e.id !== selfId && e.col === col && e.row === row)
    }
    const walk = (col, row) => isWalkable(w.rooms[w.current], col, row) && doorAt(w.rooms[w.current], col, row) === null

    if (content.enemies?.length) {
      for (const e of content.enemies) {
        if (e.dead) continue
        stepEnemyToward(e, p, walk, (c, r) => occupied(c, r, e.id), now, ENEMY_MOVE_MS)
        if (Math.abs(e.col - p.col) <= 1 && Math.abs(e.row - p.row) <= 1) {
          damagePlayer(PLAYER_CONFIG.contactDamage)
        }
      }
    }
  }

  function updateBoss(now) {
    const w = worldRef.current
    const content = currentContent()
    if (!content.boss || content.boss.dead) return
    const b = content.boss
    const p = w.player

    // slow chase
    const walk = (col, row) => isWalkable(w.rooms[w.current], col, row) && doorAt(w.rooms[w.current], col, row) === null
    stepEnemyToward(b, p, walk, () => false, now, b.phase === 2 ? 420 : 620)

    // contact damage (boss hits harder)
    if (Math.abs(b.col - p.col) <= 1 && Math.abs(b.row - p.row) <= 1) {
      damagePlayer(PLAYER_CONFIG.contactDamage * 2)
    }

    // shooting
    const interval = b.phase === 2 ? BOSS.projectileIntervalMs * 0.66 : BOSS.projectileIntervalMs
    if (now - b.lastShotAt >= interval) {
      b.lastShotAt = now
      const ang = Math.atan2(p.py - b.py, p.px - b.px)
      const speed = 0.006 // tiles per ms (~6 tiles/sec) — dodgeable
      const shots = b.phase === 2 ? [-0.25, 0, 0.25] : [0]
      for (const off of shots) {
        const a = ang + off
        w.projectiles.push(
          createProjectile({
            x: b.px + 0.5 * 0, // store in tile coords (center handled at draw)
            y: b.py,
            vx: Math.cos(a) * speed,
            vy: Math.sin(a) * speed,
            dmg: 15,
          })
        )
        // start projectile at boss center
        const proj = w.projectiles[w.projectiles.length - 1]
        proj.x = b.px
        proj.y = b.py
      }
    }
  }

  function updateProjectiles(dt) {
    const w = worldRef.current
    const p = w.player
    const next = []
    for (const proj of w.projectiles) {
      proj.x += proj.vx * dt
      proj.y += proj.vy * dt
      proj.life -= dt
      // hit player?
      const dx = proj.x - p.px
      const dy = proj.y - p.py
      if (Math.hypot(dx, dy) < 0.55) {
        damagePlayer(proj.dmg)
        spawnParticles(Math.round(proj.x), Math.round(proj.y), '#ff9a9a', 6)
        continue
      }
      // out of room / dead?
      const room = w.rooms[w.current]
      if (
        proj.life > 0 &&
        proj.x > 0 && proj.x < room.grid[0].length - 0.5 &&
        proj.y > 0 && proj.y < room.grid.length - 0.5
      ) {
        next.push(proj)
      }
    }
    w.projectiles = next
  }

  function updateParticles(dt) {
    const w = worldRef.current
    const next = []
    for (const pt of w.particles) {
      pt.x += pt.vx * dt
      pt.y += pt.vy * dt
      pt.life -= dt
      if (pt.life > 0) next.push(pt)
    }
    w.particles = next
  }

  function lerpRender(dt) {
    const w = worldRef.current
    const k = Math.min(1, dt * 0.018)
    const ease = (o, key, target) => { o[key] += (target - o[key]) * k }
    ease(w.player, 'px', w.player.col)
    ease(w.player, 'py', w.player.row)
    const content = currentContent()
    for (const e of content.enemies || []) { ease(e, 'px', e.col); ease(e, 'py', e.row) }
    if (content.boss && !content.boss.dead) { ease(content.boss, 'px', content.boss.col); ease(content.boss, 'py', content.boss.row) }
  }

  function updateCamera() {
    const w = worldRef.current
    const { tile, w: cw, h: ch } = sizeRef.current
    let camX = w.player.px * tile + tile / 2 - cw / 2
    let camY = w.player.py * tile + tile / 2 - ch / 2
    if (performance.now() < w.shakeUntil) {
      camX += (Math.random() - 0.5) * w.shakeMag
      camY += (Math.random() - 0.5) * w.shakeMag
    }
    w.cam.x = camX
    w.cam.y = camY
  }

  // --- render -------------------------------------------------------------
  function render(now) {
    const w = worldRef.current
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { tile, w: cw, h: ch } = sizeRef.current
    ctx.clearRect(0, 0, cw, ch)

    const room = w.rooms[w.current]
    const bossRoom = w.current === 'boss'
    drawRoom(ctx, room, w.cam, tile, now, bossRoom)

    const content = currentContent()
    for (const ch2 of content.chests || []) drawChest(ctx, ch2, w.cam, tile, now)
    for (const ped of content.pedestals || []) drawPedestal(ctx, ped, w.cam, tile, now)
    for (const obj of content.interactables || []) drawInteractable(ctx, obj, w.cam, tile, now)
    for (const e of content.enemies || []) drawEnemy(ctx, e, w.cam, tile, now)
    if (content.boss && !content.boss.dead) drawEnemy(ctx, content.boss, w.cam, tile, now)
    for (const proj of w.projectiles) drawProjectile(ctx, proj, w.cam, tile)

    // particles
    for (const pt of w.particles) {
      const x = pt.x * tile - w.cam.x
      const y = pt.y * tile - w.cam.y
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife)
      ctx.fillStyle = pt.color
      ctx.fillRect(x - 2, y - 2, 4, 4)
    }
    ctx.globalAlpha = 1

    drawPlayer(ctx, w.player, w.cam, tile, now)
  }

  // --- snapshot for HUD ---------------------------------------------------
  function pushState(now) {
    const w = worldRef.current
    if (now - w.lastStatePush < STATE_PUSH_MS) return
    w.lastStatePush = now
    const content = currentContent()
    const seconds = (now - w.startTime) / 1000
    const snapshot = {
      hp: Math.max(0, Math.round(w.player.hp)),
      maxHp: w.player.maxHp,
      xp: w.player.xp % 100,
      level: w.player.level,
      roomId: w.current,
      roomName: w.rooms[w.current].name,
      collectedSkills: [...w.collectedSkills],
      kills: w.kills,
      chests: w.chestsOpened,
      certs: w.certsInspected,
      score: computeScore({ kills: w.kills, chests: w.chestsOpened, certs: w.certsInspected, seconds }),
      seconds: Math.round(seconds),
      fps: w.fps,
      boss: content.boss && !content.boss.dead
        ? { hp: Math.max(0, Math.round(content.boss.hp)), maxHp: content.boss.maxHp, phase: content.boss.phase }
        : null,
    }
    if (propsRef.current.onState) propsRef.current.onState(snapshot)
  }

  // --- main loop ----------------------------------------------------------
  function loop() {
    const w = worldRef.current
    if (!w) return
    const now = performance.now()
    const dt = Math.min(50, now - w._last)
    w._last = now

    // fps
    w._frames += 1
    if (now - w._fpsLast >= 500) {
      w.fps = Math.round((w._frames * 1000) / (now - w._fpsLast))
      w._frames = 0
      w._fpsLast = now
    }

    if (!isBlockedForGame()) {
      tryMove()
      updateEnemies(now)
      updateBoss(now)
      updateProjectiles(dt)
    }
    updateParticles(dt)
    lerpRender(dt)
    updateCamera()
    render(now)
    pushState(now)

    rafRef.current = requestAnimationFrame(loop)
  }

  // --- sizing -------------------------------------------------------------
  function resize() {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const w = window.innerWidth
    const h = window.innerHeight
    const isMobile = w < 768
    const tile = isMobile ? 32 : 48
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    sizeRef.current = { w, h, tile, dpr }
  }

  // --- keyboard input -----------------------------------------------------
  useEffect(() => {
    function codeToAction(code) {
      const kb = propsRef.current.keybindings || {}
      for (const action of Object.keys(kb)) {
        if (kb[action]?.includes(code)) return action
      }
      return null
    }
    const dirForAction = { moveUp: 'up', moveDown: 'down', moveLeft: 'left', moveRight: 'right' }

    function onKeyDown(e) {
      const action = codeToAction(e.code)
      if (!action) return
      // prevent page scroll for game keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault()

      // settings / map work even when paused (to toggle closed)
      if (action === 'settings') { propsRef.current.onToggleSettings?.(); return }
      if (action === 'map') { propsRef.current.onToggleMap?.(); return }

      if (isBlockedForGame()) return
      const w = worldRef.current
      if (dirForAction[action]) { w.dirs.add(dirForAction[action]); return }
      if (action === 'attack') { doAttack(); return }
      if (action === 'interact') { doInteract(); return }
    }
    function onKeyUp(e) {
      const action = codeToAction(e.code)
      if (!action) return
      const dir = dirForAction[action]
      if (dir) worldRef.current?.dirs.delete(dir)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- mount --------------------------------------------------------------
  useEffect(() => {
    worldRef.current = initWorld()
    resize()
    window.addEventListener('resize', resize)
    announceRoom('start', true)
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10"
      style={{ touchAction: 'none' }}
    />
  )
})

export default GameEngine
