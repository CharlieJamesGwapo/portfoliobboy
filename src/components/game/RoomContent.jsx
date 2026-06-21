// ============================================================================
// RoomContent — populates rooms with real-data entities, draws interactables
// (chests, pedestals, NPC, scroll), and renders the popup cards.
// ============================================================================
import { v4 as uuidv4 } from 'uuid'
import { ExternalLink, X, ScrollText, Sparkles, Award, Briefcase, FolderGit2 } from 'lucide-react'
import { ROOM_W, ROOM_H } from './DungeonMap'
import { createEnemy, createBoss } from './Enemy'
import {
  EXPERIENCE,
  SKILLS,
  PROJECTS,
  CERTIFICATES,
  BOSS,
  BIO_SCROLL,
  OWNER,
} from '../../data/gameData'

const CHEST_COLOR = '#f5c542'
const PEDESTAL_COLOR = '#a78bfa'

// Spread item positions across a room's interior on a spaced sub-grid.
function spreadPositions(count) {
  const candidates = []
  for (let r = 2; r <= ROOM_H - 3; r += 2) {
    for (let c = 2; c <= ROOM_W - 3; c += 2) {
      candidates.push({ col: c, row: r })
    }
  }
  const centerCol = Math.floor(ROOM_W / 2)
  const centerRow = Math.floor(ROOM_H / 2)
  return candidates
    .filter((p) => !(p.col === centerCol && p.row === centerRow))
    .slice(0, count)
}

/**
 * Build all interactable/enemy content for a given room id.
 * Returns { enemies, chests, pedestals, interactables, boss }.
 */
export function populateRoom(roomId) {
  const result = { enemies: [], chests: [], pedestals: [], interactables: [], boss: null }

  if (roomId === 'experience') {
    const pos = spreadPositions(EXPERIENCE.length)
    EXPERIENCE.forEach((exp, i) => {
      result.enemies.push(
        createEnemy({
          col: pos[i].col,
          row: pos[i].row,
          hp: exp.hp,
          label: 'BUG', // no spoilers — the experience is revealed only on defeat
          kind: 'enemy',
          meta: { type: 'experience', data: exp },
        })
      )
    })
  } else if (roomId === 'skills') {
    const pos = spreadPositions(SKILLS.length)
    SKILLS.forEach((skill, i) => {
      result.enemies.push(
        createEnemy({
          col: pos[i].col,
          row: pos[i].row,
          hp: 50,
          label: 'BUG', // no spoilers — the skill is revealed in the HUD on defeat
          kind: 'skill',
          meta: { type: 'skill', data: skill },
        })
      )
    })
  } else if (roomId === 'projects') {
    const pos = spreadPositions(PROJECTS.length)
    PROJECTS.forEach((project, i) => {
      result.chests.push({
        id: uuidv4(),
        col: pos[i].col,
        row: pos[i].row,
        opened: false,
        project,
      })
    })
  } else if (roomId === 'certs') {
    const pos = spreadPositions(CERTIFICATES.length)
    CERTIFICATES.forEach((cert, i) => {
      result.pedestals.push({
        id: uuidv4(),
        col: pos[i].col,
        row: pos[i].row,
        inspected: false,
        cert,
      })
    })
  } else if (roomId === 'boss') {
    result.boss = createBoss({
      col: Math.floor(ROOM_W / 2),
      row: 3,
      hp: BOSS.hp,
      name: BOSS.name,
    })
  } else if (roomId === 'start') {
    // No wizard tutorial / spoilers — controls are shown as a brief HUD tooltip.
    // A single discoverable bio scroll remains (revealed only when the player
    // chooses to inspect it).
    const cc = Math.floor(ROOM_W / 2)
    result.interactables.push({
      id: uuidv4(),
      type: 'scroll',
      col: cc,
      row: 3,
      title: 'Bio Scroll',
      lines: BIO_SCROLL,
    })
  }

  return result
}

// ---------------------------------------------------------------------------
// Drawing interactables
// ---------------------------------------------------------------------------
export function drawChest(ctx, chest, cam, tile, time) {
  const x = chest.col * tile - cam.x
  const y = chest.row * tile - cam.y
  const cx = x + tile / 2
  const pulse = 0.5 + 0.5 * Math.sin(time / 300 + chest.col)

  if (!chest.opened) {
    ctx.save()
    ctx.shadowColor = CHEST_COLOR
    ctx.shadowBlur = tile * 0.4 * pulse + 4
    ctx.fillStyle = CHEST_COLOR
    ctx.fillRect(x + tile * 0.2, y + tile * 0.35, tile * 0.6, tile * 0.45)
    ctx.fillStyle = '#7a5a12'
    ctx.fillRect(x + tile * 0.2, y + tile * 0.25, tile * 0.6, tile * 0.18)
    ctx.restore()
    // lock
    ctx.fillStyle = '#3a2a06'
    ctx.fillRect(cx - tile * 0.05, y + tile * 0.42, tile * 0.1, tile * 0.12)
  } else {
    ctx.fillStyle = '#5a4310'
    ctx.fillRect(x + tile * 0.2, y + tile * 0.4, tile * 0.6, tile * 0.4)
    ctx.fillStyle = '#2a1f08'
    ctx.fillRect(x + tile * 0.2, y + tile * 0.3, tile * 0.6, tile * 0.16)
  }
}

export function drawPedestal(ctx, ped, cam, tile, time) {
  const x = ped.col * tile - cam.x
  const y = ped.row * tile - cam.y
  const cx = x + tile / 2
  const pulse = 0.5 + 0.5 * Math.sin(time / 320 + ped.row)

  // base
  ctx.fillStyle = '#2a2a44'
  ctx.fillRect(x + tile * 0.3, y + tile * 0.55, tile * 0.4, tile * 0.3)

  // orb
  ctx.save()
  ctx.shadowColor = PEDESTAL_COLOR
  ctx.shadowBlur = tile * (ped.inspected ? 0.15 : 0.45 * pulse + 0.2)
  ctx.fillStyle = ped.inspected ? '#5b4b86' : PEDESTAL_COLOR
  ctx.beginPath()
  ctx.arc(cx, y + tile * 0.4, tile * 0.18, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export function drawInteractable(ctx, obj, cam, tile, time) {
  const x = obj.col * tile - cam.x
  const y = obj.row * tile - cam.y
  const cx = x + tile / 2
  const cy = y + tile / 2
  const bob = Math.sin(time / 400) * tile * 0.05

  if (obj.type === 'npc') {
    // wizard
    ctx.save()
    ctx.shadowColor = '#34d399'
    ctx.shadowBlur = tile * 0.3
    ctx.fillStyle = '#34d399'
    // robe (triangle)
    ctx.beginPath()
    ctx.moveTo(cx, cy - tile * 0.3 + bob)
    ctx.lineTo(cx - tile * 0.25, cy + tile * 0.32 + bob)
    ctx.lineTo(cx + tile * 0.25, cy + tile * 0.32 + bob)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
    // hat
    ctx.fillStyle = '#10b981'
    ctx.beginPath()
    ctx.moveTo(cx, cy - tile * 0.42 + bob)
    ctx.lineTo(cx - tile * 0.16, cy - tile * 0.2 + bob)
    ctx.lineTo(cx + tile * 0.16, cy - tile * 0.2 + bob)
    ctx.closePath()
    ctx.fill()
  } else if (obj.type === 'scroll') {
    ctx.save()
    ctx.shadowColor = '#fbbf24'
    ctx.shadowBlur = tile * 0.3
    ctx.fillStyle = '#fde68a'
    ctx.fillRect(cx - tile * 0.18, cy - tile * 0.22 + bob, tile * 0.36, tile * 0.44)
    ctx.restore()
    ctx.strokeStyle = '#b45309'
    ctx.lineWidth = 2
    ctx.strokeRect(cx - tile * 0.18, cy - tile * 0.22 + bob, tile * 0.36, tile * 0.44)
  }

  // "E" prompt hint floats above
  ctx.font = 'bold 11px ui-sans-serif, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.fillText('E', cx, y - 4 + bob)
  ctx.textAlign = 'start'
}

// ===========================================================================
// Popups (React)
// ===========================================================================
function PopupShell({ children, onClose, accent = 'cyan' }) {
  const ring = {
    cyan: 'ring-cyan-500/40',
    gold: 'ring-amber-500/40',
    purple: 'ring-purple-500/40',
    red: 'ring-red-500/40',
  }[accent]
  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-950 border border-white/10 rounded-2xl shadow-2xl ring-2 ${ring} p-6 animate-[fadeIn_0.2s_ease-out]`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  )
}

export function ExperiencePopup({ exp, onClose }) {
  return (
    <PopupShell onClose={onClose} accent="cyan">
      <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
        <Briefcase size={14} /> Experience Unlocked
      </div>
      <h3 className="text-xl font-bold text-white">{exp.role}</h3>
      <p className="text-cyan-300 font-medium">{exp.company}</p>
      <p className="text-xs text-gray-400 mb-3">
        {exp.period} · {exp.location} · {exp.type}
      </p>
      <p className="text-sm text-gray-300 mb-3 leading-relaxed">{exp.description}</p>
      <ul className="space-y-1.5 mb-4">
        {exp.achievements.map((a, i) => (
          <li key={i} className="flex gap-2 text-xs text-gray-300">
            <span className="text-cyan-400">▸</span>
            <span>{a}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-1.5">
        {exp.technologies.map((t, i) => (
          <span key={i} className="px-2 py-0.5 text-[11px] rounded bg-white/5 text-gray-300 border border-white/10">
            {t}
          </span>
        ))}
      </div>
    </PopupShell>
  )
}

export function ProjectPopup({ project, onClose }) {
  return (
    <PopupShell onClose={onClose} accent="gold">
      <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
        <FolderGit2 size={14} /> Treasure Found
      </div>
      <h3 className="text-xl font-bold text-white">{project.title}</h3>
      <p className="text-amber-300 text-sm mb-3">{project.type}</p>
      <p className="text-sm text-gray-300 mb-4 leading-relaxed">{project.description}</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.technologies.map((t, i) => (
          <span key={i} className="px-2 py-0.5 text-[11px] rounded bg-white/5 text-gray-300 border border-white/10">
            {t}
          </span>
        ))}
      </div>
      {project.liveUrl ? (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all"
        >
          <ExternalLink size={15} /> Visit Project
        </a>
      ) : (
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 text-sm border border-white/10">
          Private / NDA
        </span>
      )}
    </PopupShell>
  )
}

export function CertPopup({ cert, onClose }) {
  return (
    <PopupShell onClose={onClose} accent="purple">
      <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
        <Award size={14} /> Certificate Inspected
      </div>
      <h3 className="text-lg font-bold text-white leading-snug">{cert.title}</h3>
      <p className="text-purple-300 font-medium mt-1">{cert.issuer}</p>
      <span className="inline-block mt-3 px-2.5 py-0.5 text-xs rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
        {cert.type}
      </span>
    </PopupShell>
  )
}

export function DialoguePopup({ title, lines, onClose, accent = 'cyan' }) {
  const Icon = title?.toLowerCase().includes('scroll') ? ScrollText : Sparkles
  return (
    <PopupShell onClose={onClose} accent={accent}>
      <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
        <Icon size={14} /> {title}
      </div>
      <div className="space-y-2.5">
        {lines.map((l, i) => (
          <p key={i} className="text-sm text-gray-200 leading-relaxed">
            {l}
          </p>
        ))}
      </div>
      <button
        onClick={onClose}
        className="mt-5 w-full px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-colors"
      >
        Continue
      </button>
    </PopupShell>
  )
}

/** Dispatcher: render the right popup for a given popup descriptor. */
export function RoomPopup({ popup, onClose }) {
  if (!popup) return null
  switch (popup.type) {
    case 'experience':
      return <ExperiencePopup exp={popup.data} onClose={onClose} />
    case 'project':
      return <ProjectPopup project={popup.data} onClose={onClose} />
    case 'cert':
      return <CertPopup cert={popup.data} onClose={onClose} />
    case 'dialogue':
      return <DialoguePopup title={popup.title} lines={popup.lines} onClose={onClose} />
    default:
      return null
  }
}

export { OWNER }
