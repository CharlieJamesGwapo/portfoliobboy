import { useEffect, useRef, useState } from 'react'
import { SkipBack, SkipForward, Play, Pause, Volume2, Music2, X } from 'lucide-react'

// Mood playlists (YouTube playlist IDs)
const PLAYLISTS = [
  { key: 'focus', label: 'Focus', emoji: '💻', id: 'PLOzDu-MXXLliO9fBNZOQTBDddoA3FzZUo' },
  { key: 'game', label: 'Game Mode', emoji: '🎮', id: 'PLAka7Y5pBdHfNAGNKa7GNnKBFrNNbSSVT' },
  { key: 'chill', label: 'Chill', emoji: '🌙', id: 'PLMIbmfP_9vb8BCxRoraJpoo4q1yMFg4CE' },
]

const PREFS_KEY = 'portfolio_music_prefs'
const TIP_KEY = 'music_tooltip_seen'

function loadPrefs() {
  try {
    return { volume: 60, muted: false, playlistKey: 'focus', ...(JSON.parse(localStorage.getItem(PREFS_KEY)) || {}) }
  } catch {
    return { volume: 60, muted: false, playlistKey: 'focus' }
  }
}

let apiLoading = false
function ensureYouTubeAPI() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) return resolve()
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === 'function') try { prev() } catch { /* noop */ }
      resolve()
    }
    if (!apiLoading && !document.getElementById('youtube-iframe-api')) {
      apiLoading = true
      const tag = document.createElement('script')
      tag.id = 'youtube-iframe-api'
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
    // Fallback poll in case the global callback was overwritten elsewhere
    const poll = setInterval(() => {
      if (window.YT && window.YT.Player) { clearInterval(poll); resolve() }
    }, 300)
    setTimeout(() => clearInterval(poll), 15000)
  })
}

export default function MusicPlayer() {
  const playerRef = useRef(null)
  const hostRef = useRef(null)
  const createdRef = useRef(false)

  const [prefs] = useState(loadPrefs)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playlistKey, setPlaylistKey] = useState(prefs.playlistKey)
  const [volume, setVolume] = useState(prefs.volume)
  const [muted, setMuted] = useState(prefs.muted)
  const [track, setTrack] = useState({ title: '', thumb: '' })
  const [expanded, setExpanded] = useState(false)
  const [gameOpen, setGameOpen] = useState(false)
  const [showTip, setShowTip] = useState(false)

  // Hide while the arcade is open (ArcadeLobby toggles body.game-open)
  useEffect(() => {
    const sync = () => setGameOpen(document.body.classList.contains('game-open'))
    sync()
    const obs = new MutationObserver(sync)
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  // First-render tooltip (once ever)
  useEffect(() => {
    let seen = false
    try { seen = localStorage.getItem(TIP_KEY) === '1' } catch { /* noop */ }
    if (seen) return
    setShowTip(true)
    try { localStorage.setItem(TIP_KEY, '1') } catch { /* noop */ }
    const t = setTimeout(() => setShowTip(false), 4000)
    return () => clearTimeout(t)
  }, [])

  // Boot the YouTube player (autoplay OFF -> cuePlaylist)
  useEffect(() => {
    let cancelled = false
    ensureYouTubeAPI().then(() => {
      if (cancelled || createdRef.current || !hostRef.current || !window.YT) return
      createdRef.current = true
      const initial = PLAYLISTS.find((p) => p.key === playlistKey) || PLAYLISTS[0]
      playerRef.current = new window.YT.Player(hostRef.current, {
        height: '1',
        width: '1',
        playerVars: { listType: 'playlist', list: initial.id, autoplay: 0, controls: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: (e) => {
            setIsReady(true)
            try {
              e.target.setVolume(muted ? 0 : volume)
              if (muted) e.target.mute()
            } catch { /* noop */ }
          },
          onStateChange: (e) => {
            // 1 = playing, 2 = paused, 0 = ended
            if (e.data === 1) setIsPlaying(true)
            else if (e.data === 2 || e.data === 0) setIsPlaying(false)
          },
        },
      })
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Poll current track name + thumbnail
  useEffect(() => {
    if (!isReady) return
    const id = setInterval(() => {
      try {
        const data = playerRef.current?.getVideoData?.()
        if (data && data.title) {
          const thumb = data.thumbnail_url || (data.video_id ? `https://img.youtube.com/vi/${data.video_id}/default.jpg` : '')
          setTrack({ title: data.title, thumb })
        }
      } catch { /* noop */ }
    }, 2000)
    return () => clearInterval(id)
  }, [isReady])

  // Persist prefs
  useEffect(() => {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify({ volume, muted, playlistKey })) } catch { /* noop */ }
  }, [volume, muted, playlistKey])

  const togglePlay = () => {
    const p = playerRef.current
    if (!p) return
    try { isPlaying ? p.pauseVideo() : p.playVideo() } catch { /* noop */ }
  }
  const prev = () => { try { playerRef.current?.previousVideo() } catch { /* noop */ } }
  const next = () => { try { playerRef.current?.nextVideo() } catch { /* noop */ } }
  const changeVolume = (v) => {
    setVolume(v)
    setMuted(v === 0)
    try {
      playerRef.current?.setVolume(v)
      if (v === 0) playerRef.current?.mute()
      else playerRef.current?.unMute()
    } catch { /* noop */ }
  }
  const pickPlaylist = (pl) => {
    setPlaylistKey(pl.key)
    try {
      playerRef.current?.loadPlaylist({ list: pl.id, listType: 'playlist' })
    } catch { /* noop */ }
  }

  if (gameOpen) return null

  const marquee = track.title && track.title.length > 18

  return (
    <>
      {/* hidden 1x1 player */}
      <div className="fixed bottom-0 left-0 w-px h-px opacity-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div ref={hostRef} />
      </div>

      {/* first-render tooltip */}
      {showTip && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-lg bg-black/70 border border-white/15 text-xs text-gray-200 transition-opacity duration-500">
          🎵 Music available
        </div>
      )}

      {/* playlist panel (slides up above the pill) */}
      {expanded && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 w-72 max-w-[92vw] bg-black/80 backdrop-blur rounded-2xl p-4 mb-2 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Mood</span>
            <button onClick={() => setExpanded(false)} className="p-1 rounded text-gray-400 hover:text-white" aria-label="Close playlist">
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {PLAYLISTS.map((pl) => (
              <button
                key={pl.key}
                onClick={() => pickPlaylist(pl)}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  playlistKey === pl.key
                    ? 'bg-blue-500/20 border-blue-400 text-blue-200'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                <span className="text-lg">{pl.emoji}</span>
                {pl.label}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-400 mb-2 truncate">{track.title || (isReady ? 'Press play to start' : 'Loading…')}</div>
          <div className="flex items-center justify-center gap-4">
            <button onClick={prev} className="text-gray-300 hover:text-blue-400" aria-label="Previous"><SkipBack size={18} /></button>
            <button onClick={togglePlay} className="text-white hover:text-blue-400" aria-label="Play/Pause">
              {isPlaying ? <Pause size={22} /> : <Play size={22} />}
            </button>
            <button onClick={next} className="text-gray-300 hover:text-blue-400" aria-label="Next"><SkipForward size={18} /></button>
          </div>
        </div>
      )}

      {/* pill */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 shadow-xl">
        {/* thumbnail */}
        {track.thumb ? (
          <img src={track.thumb} alt="" width="32" height="32" loading="lazy" decoding="async" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Music2 size={15} className="text-white" />
          </div>
        )}

        {/* track name (marquee if long) — tap to expand on mobile */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="max-w-[120px] overflow-hidden text-left"
          aria-label="Toggle player"
        >
          <span className={`block whitespace-nowrap text-xs text-gray-200 ${marquee ? 'animate-[marquee_8s_linear_infinite]' : 'truncate'}`}>
            {track.title || (isReady ? 'Music' : 'Loading…')}
          </span>
        </button>

        {/* prev/next — hidden on mobile unless expanded */}
        <button onClick={prev} className={`${expanded ? 'flex' : 'hidden'} sm:flex text-gray-300 hover:text-blue-400`} aria-label="Previous"><SkipBack size={16} /></button>
        <button onClick={togglePlay} className="flex text-white hover:text-blue-400" aria-label="Play/Pause">
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button onClick={next} className={`${expanded ? 'flex' : 'hidden'} sm:flex text-gray-300 hover:text-blue-400`} aria-label="Next"><SkipForward size={16} /></button>

        {/* volume — md+ only */}
        <div className="hidden md:flex items-center gap-1">
          <Volume2 size={16} className="text-gray-300" />
          <input
            type="range" min="0" max="100" value={muted ? 0 : volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            className="w-16 accent-blue-400"
            aria-label="Volume"
          />
        </div>

        {/* expand playlist */}
        <button onClick={() => setExpanded((v) => !v)} className="text-gray-300 hover:text-blue-400" aria-label="Playlist">
          <Music2 size={16} />
        </button>
      </div>
    </>
  )
}
