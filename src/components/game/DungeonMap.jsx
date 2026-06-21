// ============================================================================
// DungeonMap — room grid generation, door wiring, and Canvas-2D tile drawing.
// Rooms are tile grids. Doors sit on edge midpoints and connect rooms per the
// adjacency in gameData.js.
// ============================================================================
import { ROOMS, ROOM_ADJACENCY } from '../../data/gameData'

export const ROOM_W = 15 // tiles wide
export const ROOM_H = 11 // tiles tall

// Tile types
export const TILE = {
  FLOOR: 0,
  WALL: 1,
  DOOR: 2,
}

// Colors (per spec)
export const COLORS = {
  floor: '#1a1a2e',
  floorAlt: '#181830',
  wall: '#0d0d1a',
  wallTop: '#15152a',
  door: '#1e90ff',
  grid: 'rgba(255,255,255,0.03)',
}

const CENTER_COL = Math.floor(ROOM_W / 2)
const CENTER_ROW = Math.floor(ROOM_H / 2)

const DOOR_POS = {
  up: { col: CENTER_COL, row: 0 },
  down: { col: CENTER_COL, row: ROOM_H - 1 },
  left: { col: 0, row: CENTER_ROW },
  right: { col: ROOM_W - 1, row: CENTER_ROW },
}

const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' }

/**
 * Build one room: a bordered grid with doors carved where adjacency exists.
 */
export function buildRoom(roomId) {
  const meta = ROOMS[roomId]
  const adjacency = ROOM_ADJACENCY[roomId] || {}

  const grid = []
  for (let r = 0; r < ROOM_H; r++) {
    const row = []
    for (let c = 0; c < ROOM_W; c++) {
      const isBorder = r === 0 || c === 0 || r === ROOM_H - 1 || c === ROOM_W - 1
      row.push(isBorder ? TILE.WALL : TILE.FLOOR)
    }
    grid.push(row)
  }

  const doors = {}
  for (const dir of Object.keys(adjacency)) {
    const pos = DOOR_POS[dir]
    if (!pos) continue
    grid[pos.row][pos.col] = TILE.DOOR
    doors[dir] = { ...pos, to: adjacency[dir], dir }
  }

  return {
    id: roomId,
    name: meta?.name || roomId,
    grid,
    doors,
  }
}

export function buildAllRooms() {
  const rooms = {}
  for (const id of Object.keys(ROOMS)) rooms[id] = buildRoom(id)
  return rooms
}

/** Is a tile walkable (floor or door)? */
export function isWalkable(room, col, row) {
  if (!room) return false
  if (row < 0 || row >= ROOM_H || col < 0 || col >= ROOM_W) return false
  return room.grid[row][col] !== TILE.WALL
}

/** Door object at a tile, or null. */
export function doorAt(room, col, row) {
  for (const dir of Object.keys(room.doors)) {
    const d = room.doors[dir]
    if (d.col === col && d.row === row) return d
  }
  return null
}

/** Where the player appears when entering a room having travelled `dir`. */
export function entryTile(room, dir) {
  const cameFrom = OPPOSITE[dir]
  const door = room.doors[cameFrom]
  if (door) {
    // step one tile inward from that door
    if (cameFrom === 'left') return { col: 1, row: door.row }
    if (cameFrom === 'right') return { col: ROOM_W - 2, row: door.row }
    if (cameFrom === 'up') return { col: door.col, row: 1 }
    if (cameFrom === 'down') return { col: door.col, row: ROOM_H - 2 }
  }
  return { col: CENTER_COL, row: CENTER_ROW }
}

export function centerTile() {
  return { col: CENTER_COL, row: CENTER_ROW }
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------
/**
 * Draw the room tiles. `cam` is the top-left world pixel offset, `tile` the px size.
 * `time` (ms) drives the door glow pulse.
 */
export function drawRoom(ctx, room, cam, tile, time, bossRoom = false) {
  for (let r = 0; r < ROOM_H; r++) {
    for (let c = 0; c < ROOM_W; c++) {
      const x = c * tile - cam.x
      const y = r * tile - cam.y
      if (x + tile < 0 || y + tile < 0 || x > ctx.canvas.width || y > ctx.canvas.height) continue

      const t = room.grid[r][c]
      if (t === TILE.WALL) {
        ctx.fillStyle = COLORS.wall
        ctx.fillRect(x, y, tile, tile)
        // subtle top bevel
        ctx.fillStyle = COLORS.wallTop
        ctx.fillRect(x, y, tile, Math.max(2, tile * 0.12))
      } else if (t === TILE.DOOR) {
        drawDoor(ctx, x, y, tile, time, bossRoom)
      } else {
        // floor with faint checker
        ctx.fillStyle = (c + r) % 2 === 0 ? COLORS.floor : COLORS.floorAlt
        ctx.fillRect(x, y, tile, tile)
        ctx.strokeStyle = COLORS.grid
        ctx.lineWidth = 1
        ctx.strokeRect(x + 0.5, y + 0.5, tile, tile)
      }
    }
  }
}

function drawDoor(ctx, x, y, tile, time, bossRoom) {
  const pulse = 0.55 + 0.45 * Math.sin(time / 350)
  ctx.fillStyle = COLORS.floor
  ctx.fillRect(x, y, tile, tile)

  const glow = bossRoom ? `rgba(255,60,60,${0.35 + 0.4 * pulse})` : `rgba(30,144,255,${0.35 + 0.4 * pulse})`
  const core = bossRoom ? '#ff3b3b' : COLORS.door

  ctx.save()
  ctx.shadowColor = glow
  ctx.shadowBlur = tile * 0.6 * pulse + 6
  ctx.fillStyle = glow
  ctx.fillRect(x + tile * 0.12, y + tile * 0.12, tile * 0.76, tile * 0.76)
  ctx.restore()

  ctx.fillStyle = core
  ctx.globalAlpha = 0.5 + 0.5 * pulse
  ctx.fillRect(x + tile * 0.28, y + tile * 0.18, tile * 0.44, tile * 0.64)
  ctx.globalAlpha = 1
}
