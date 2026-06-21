// ============================================================================
// AvatarCustomizer — modal over the Arcade lobby. Live pixel-avatar preview
// (rendered with the shared canvas renderer so it matches in-game exactly),
// full customization, name edit, save to localStorage, share link, and an
// unlock system for earned items.
// ============================================================================
import { useEffect, useMemo, useRef, useState } from 'react'
import { X, Save, Copy, Check, Lock, Shuffle } from 'lucide-react'
import {
  SKIN_TONES, HAIR_COLORS, OUTFIT_COLORS, HAIR_STYLES, OUTFITS, ACCESSORIES,
  HAND_ITEMS, BACKGROUNDS, DEFAULT_AVATAR, LOCKED_ITEMS,
  getAvatar, saveAvatar, getUnlocks, isLocked, getPlayerName, setPlayerName,
  encodeAvatar, decodeAvatar, drawAvatar, bgById,
} from '../../lib/avatar'

const HAND_LABELS = { sword: '⚔ Sword', laptop: '💻 Laptop', coffee: '☕ Coffee', controller: '🎮 Controller', none: 'None' }
const ACC_LABELS = { none: 'None', glasses: '👓 Glasses', crown: '👑 Crown', headphones: '🎧 Headphones', halo: '😇 Halo' }
const HAIR_LABELS = { none: 'Bald', short: 'Short', long: 'Long', spiky: 'Spiky', cap: 'Cap', beanie: 'Beanie' }
const OUTFIT_LABELS = { hoodie: 'Hoodie', suit: 'Suit', casual: 'Casual', dev: 'Dev </>', barong: 'Barong', astronaut: 'Astronaut' }

function lockReason(category, value) {
  return LOCKED_ITEMS.find((l) => l.category === category && l.value === value)?.how || ''
}

export default function AvatarCustomizer({ onClose }) {
  const unlocks = useMemo(() => getUnlocks(), [])

  // initial config: shared ?avatar= link wins, else saved avatar
  const [cfg, setCfg] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const shared = params.get('avatar')
      if (shared) {
        const dec = decodeAvatar(shared)
        if (dec) return dec
      }
    } catch { /* noop */ }
    return getAvatar()
  })
  const [name, setName] = useState(() => getPlayerName() || '')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  const canvasRef = useRef(null)
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    ctx.clearRect(0, 0, c.width, c.height)
    drawAvatar(ctx, cfg, 0, 0, c.width, { bubble: true })
  }, [cfg])

  const set = (key, value) => setCfg((prev) => ({ ...prev, [key]: value }))

  const handleSave = () => {
    saveAvatar(cfg)
    if (name.trim()) setPlayerName(name.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const handleCopy = async () => {
    try {
      const url = `${window.location.origin}${window.location.pathname}?avatar=${encodeAvatar(cfg)}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* noop */ }
  }

  const randomize = () => {
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
    const safeOutfit = OUTFITS.filter((o) => !isLocked('outfit', o, unlocks))
    const safeAcc = ACCESSORIES.filter((a) => !isLocked('accessory', a, unlocks))
    setCfg({
      skin: pick(SKIN_TONES),
      hairStyle: pick(HAIR_STYLES),
      hairColor: pick(HAIR_COLORS),
      outfit: pick(safeOutfit),
      outfitColor: pick(OUTFIT_COLORS),
      accessory: pick(safeAcc),
      handItem: pick(HAND_ITEMS),
      bg: pick(BACKGROUNDS).id,
    })
  }

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col bg-gradient-to-br from-gray-900 to-gray-950 border border-cyan-500/30 rounded-2xl shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">🧑‍💻 My Avatar</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto grid md:grid-cols-2 gap-5 p-5">
          {/* preview */}
          <div className="flex flex-col items-center">
            <div
              className="rounded-2xl p-3 border border-white/10"
              style={{ background: bgById(cfg.bg).css }}
            >
              <canvas ref={canvasRef} width={192} height={192} className="rounded-xl" style={{ imageRendering: 'pixelated' }} />
            </div>

            {/* name tag */}
            <div className="mt-3 w-full max-w-xs">
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1 font-semibold text-center">Hero Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={24}
                placeholder="Your name"
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-center text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              <button onClick={handleSave} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                {saved ? <Check size={15} /> : <Save size={15} />} {saved ? 'Saved!' : 'Save Avatar'}
              </button>
              <button onClick={handleCopy} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm font-semibold hover:bg-white/20 transition-all">
                {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button onClick={randomize} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm font-semibold hover:bg-white/20 transition-all">
                <Shuffle size={15} /> Random
              </button>
            </div>
          </div>

          {/* options */}
          <div className="space-y-4">
            <SwatchRow label="Skin" colors={SKIN_TONES} value={cfg.skin} onPick={(v) => set('skin', v)} />
            <ButtonRow label="Hair" options={HAIR_STYLES} labels={HAIR_LABELS} value={cfg.hairStyle} onPick={(v) => set('hairStyle', v)} />
            <SwatchRow label="Hair Color" colors={HAIR_COLORS} value={cfg.hairColor} onPick={(v) => set('hairColor', v)} />
            <ButtonRow label="Outfit" options={OUTFITS} labels={OUTFIT_LABELS} value={cfg.outfit} onPick={(v) => set('outfit', v)} lockCat="outfit" unlocks={unlocks} />
            <SwatchRow label="Outfit Color" colors={OUTFIT_COLORS} value={cfg.outfitColor} onPick={(v) => set('outfitColor', v)} />
            <ButtonRow label="Accessory" options={ACCESSORIES} labels={ACC_LABELS} value={cfg.accessory} onPick={(v) => set('accessory', v)} lockCat="accessory" unlocks={unlocks} />
            <ButtonRow label="Hand Item" options={HAND_ITEMS} labels={HAND_LABELS} value={cfg.handItem} onPick={(v) => set('handItem', v)} />
            <GradientRow label="Background" options={BACKGROUNDS} value={cfg.bg} onPick={(v) => set('bg', v)} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function SwatchRow({ label, colors, value, onPick }) {
  return (
    <Row label={label}>
      {colors.map((c) => (
        <button
          key={c}
          onClick={() => onPick(c)}
          className={`w-7 h-7 rounded-md border-2 transition-transform hover:scale-110 ${value === c ? 'border-white ring-2 ring-cyan-400' : 'border-white/20'}`}
          style={{ background: c }}
          aria-label={c}
        />
      ))}
    </Row>
  )
}

function ButtonRow({ label, options, labels, value, onPick, lockCat = null, unlocks = {} }) {
  return (
    <Row label={label}>
      {options.map((o) => {
        const locked = lockCat ? isLocked(lockCat, o, unlocks) : false
        return (
          <button
            key={o}
            onClick={() => !locked && onPick(o)}
            disabled={locked}
            title={locked ? `🔒 ${lockReason(lockCat, o)}` : ''}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors inline-flex items-center gap-1 ${
              locked
                ? 'bg-black/30 border-white/10 text-gray-600 cursor-not-allowed'
                : value === o
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                : 'bg-white/5 border-white/15 text-white hover:bg-white/10'
            }`}
          >
            {locked && <Lock size={11} />}
            {labels?.[o] || o}
          </button>
        )
      })}
    </Row>
  )
}

function GradientRow({ label, options, value, onPick }) {
  return (
    <Row label={label}>
      {options.map((b) => (
        <button
          key={b.id}
          onClick={() => onPick(b.id)}
          className={`w-9 h-7 rounded-md border-2 transition-transform hover:scale-110 ${value === b.id ? 'border-white ring-2 ring-cyan-400' : 'border-white/20'}`}
          style={{ background: b.css }}
          aria-label={b.label}
          title={b.label}
        />
      ))}
    </Row>
  )
}
