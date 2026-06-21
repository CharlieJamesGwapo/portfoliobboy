// ============================================================================
// HUD — overlaid game UI.
//   Top-left:    HP bar (red) + XP bar (blue)
//   Top-right:   Room name + FPS (optional) + score/time + settings gear
//   Bottom-left: collected skill badges
//   Bottom-right: mini-map (6 rooms, current highlighted)
// ============================================================================
import { Settings, Heart, Star, Clock, Trophy } from 'lucide-react'
import { MINIMAP_LAYOUT, ROOMS } from '../../data/gameData'

function fmtTime(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function HUD({ state, displaySettings, onOpenSettings }) {
  const {
    hp = 100,
    maxHp = 100,
    xp = 0,
    level = 1,
    roomName = '',
    roomId = 'start',
    collectedSkills = [],
    score = 0,
    seconds = 0,
    fps = 0,
    boss = null,
  } = state || {}

  const hpFrac = Math.max(0, Math.min(1, hp / maxHp))

  return (
    <div className="pointer-events-none absolute inset-0 z-20 select-none">
      {/* Top-left: HP + XP */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-44 sm:w-56 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Heart size={14} className="text-red-500 shrink-0" />
          <div className="flex-1 h-3 sm:h-4 rounded-full bg-black/60 border border-white/15 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-200"
              style={{ width: `${hpFrac * 100}%` }}
            />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-white tabular-nums w-12 text-right">
            {hp}/{maxHp}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Star size={14} className="text-blue-400 shrink-0" />
          <div className="flex-1 h-2 sm:h-2.5 rounded-full bg-black/60 border border-white/15 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-200"
              style={{ width: `${xp}%` }}
            />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-blue-300 tabular-nums w-12 text-right">
            Lv {level}
          </span>
        </div>
      </div>

      {/* Top-right: room name, stats, settings */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-lg bg-black/60 border border-white/15 text-white text-xs sm:text-sm font-bold tracking-wide">
            {roomName}
          </div>
          <button
            onClick={onOpenSettings}
            className="pointer-events-auto p-1.5 sm:p-2 rounded-lg bg-black/60 border border-white/15 text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Open settings"
          >
            <Settings size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2 text-[10px] sm:text-xs">
          <span className="px-2 py-0.5 rounded bg-black/50 border border-white/10 text-amber-300 flex items-center gap-1">
            <Trophy size={11} /> {score.toLocaleString()}
          </span>
          <span className="px-2 py-0.5 rounded bg-black/50 border border-white/10 text-gray-200 flex items-center gap-1">
            <Clock size={11} /> {fmtTime(seconds)}
          </span>
          {displaySettings?.fpsCounter && (
            <span className="px-2 py-0.5 rounded bg-black/50 border border-white/10 text-green-300 tabular-nums">
              {fps} FPS
            </span>
          )}
        </div>

        {/* Boss HP bar */}
        {boss && (
          <div className="mt-1 w-48 sm:w-64">
            <div className="text-[10px] sm:text-xs text-red-300 font-bold text-center mb-0.5">
              The Bug King {boss.phase === 2 ? '· PHASE 2' : ''}
            </div>
            <div className="h-3 rounded-full bg-black/60 border border-red-500/40 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-200"
                style={{ width: `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom-left: collected skills */}
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 max-w-[55%]">
        <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">
          Skills ({collectedSkills.length})
        </div>
        <div className="flex flex-wrap gap-1">
          {collectedSkills.map((s) => (
            <span
              key={s}
              className="px-1.5 py-0.5 rounded text-[9px] sm:text-[11px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom-right: mini-map */}
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
        <div className="p-1.5 rounded-lg bg-black/60 border border-white/15">
          {MINIMAP_LAYOUT.map((row, ri) => (
            <div key={ri} className="flex gap-1 mb-1 last:mb-0">
              {row.map((cellId) => {
                const isCurrent = cellId === roomId
                return (
                  <div
                    key={cellId}
                    title={ROOMS[cellId]?.name}
                    className={`w-9 h-7 sm:w-12 sm:h-9 rounded flex items-center justify-center text-center leading-tight transition-all ${
                      isCurrent
                        ? 'bg-cyan-500/30 border border-cyan-400 ring-1 ring-cyan-400'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <span className={`text-[7px] sm:text-[8px] font-semibold ${isCurrent ? 'text-cyan-200' : 'text-gray-400'}`}>
                      {ROOMS[cellId]?.name?.split(' ')[0]}
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
