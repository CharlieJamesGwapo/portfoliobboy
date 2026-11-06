import { useEffect, useRef, useState } from 'react'
import { Languages, Mic2 } from 'lucide-react'
import AccentGallery from './AccentGallery'
import MultilingualConversations from './MultilingualConversations'
import { voiceAccents } from '../../data/voiceAccents'
import { voiceConversations } from '../../data/voiceConversations'

const readyCount = voiceConversations.filter((item) => item.status === 'ready' && item.src).length
const pendingCount = voiceConversations.length - readyCount

// The hash that opens the multilingual tab directly, e.g. from Alex or a share.
export const MULTILINGUAL_HASH = '#voice-multilingual'

const TABS = [
  {
    id: 'accents',
    label: 'English Accents',
    icon: Mic2,
    // Only recordings that exist are counted.
    meta: `${voiceAccents.length} recordings`,
  },
  {
    id: 'multilingual',
    label: 'Multilingual Conversations',
    shortLabel: 'Multilingual',
    icon: Languages,
    meta: pendingCount > 0 ? `${readyCount} recorded · ${pendingCount} planned` : `${readyCount} recorded`,
  },
]

const initialTab = () => {
  if (typeof window === 'undefined') return 'accents'
  return window.location.hash === MULTILINGUAL_HASH ? 'multilingual' : 'accents'
}

// English Accents | Multilingual Conversations, as an ARIA tablist with
// roving focus and arrow-key support. Both panels stay in the document (the
// inactive one is `hidden`) so prerendered HTML, search engines, and the
// transcripts keep every recording, and switching never re-downloads audio.
export default function VoiceStudioTabs() {
  const [active, setActive] = useState(initialTab)
  const tabRefs = useRef([])
  const panelRefs = useRef({})

  useEffect(() => {
    const onHash = () => { if (window.location.hash === MULTILINGUAL_HASH) setActive('multilingual') }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const select = (id) => {
    if (id === active) return
    // A hidden panel must never keep talking.
    panelRefs.current[active]?.querySelectorAll('audio').forEach((audio) => audio.pause())
    setActive(id)
  }

  const onKeyDown = (event, index) => {
    const keys = { ArrowRight: 1, ArrowLeft: -1, Home: 'first', End: 'last' }
    if (!(event.key in keys)) return
    event.preventDefault()
    const step = keys[event.key]
    const next = step === 'first' ? 0 : step === 'last' ? TABS.length - 1 : (index + step + TABS.length) % TABS.length
    select(TABS[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <div id="voice-multilingual" className="vs-tabs-shell">
      <div className="vs-tabs" role="tablist" aria-label="Voice Studio demos">
        {TABS.map((tab, index) => {
          const selected = tab.id === active
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              ref={(node) => { tabRefs.current[index] = node }}
              id={`vs-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`vs-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              className={`vs-tab ${selected ? 'is-active' : ''}`}
              onClick={() => select(tab.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              <Icon size={16} aria-hidden="true" />
              <span className="vs-tab-text">
                <span className="vs-tab-label">
                  {tab.shortLabel ? <><span className="vs-tab-long">{tab.label}</span><span className="vs-tab-short" aria-hidden="true">{tab.shortLabel}</span></> : tab.label}
                </span>
                <span className="vs-tab-meta">{tab.meta}</span>
              </span>
            </button>
          )
        })}
      </div>

      {TABS.map((tab) => (
        <div
          key={tab.id}
          ref={(node) => { panelRefs.current[tab.id] = node }}
          id={`vs-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`vs-tab-${tab.id}`}
          hidden={tab.id !== active}
          tabIndex={0}
          className="vs-tab-panel"
        >
          {tab.id === 'accents' ? <AccentGallery /> : <MultilingualConversations />}
        </div>
      ))}
    </div>
  )
}
