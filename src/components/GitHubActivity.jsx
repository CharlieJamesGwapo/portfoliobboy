import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, Github, RotateCcw } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { buildCalendar, calendarTarget, dayDescription, validateActivity } from '../lib/githubCalendar'
import '../github-activity.css'

const PROFILE_URL = 'https://github.com/CharlieJamesGwapo'
const numberFormat = new Intl.NumberFormat('en-US')
const updatedFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'UTC', timeZoneName: 'short' })

function ContributionCalendar({ activity }) {
  const calendar = useMemo(() => buildCalendar(activity.days, activity.year), [activity.days, activity.year])
  const today = new Date().toISOString().slice(0, 10)
  const available = useMemo(() => calendar.cells.map(day => day && day.date <= today ? day : null), [calendar.cells, today])
  const firstDay = available.findIndex(Boolean)
  const [activeIndex, setActiveIndex] = useState(firstDay)
  const [hoveredDay, setHoveredDay] = useState(null)
  const buttons = useRef([])
  const selectedDay = available[activeIndex]
  const detail = hoveredDay || selectedDay

  function onKeyDown(event, index) {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const next = calendarTarget(available, index, event.key)
    if (next < 0) return
    setActiveIndex(next)
    buttons.current[next]?.focus({ preventScroll: true })
    buttons.current[next]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' })
  }

  return (
    <>
      <p id="github-calendar-help" className="github-calendar-help">Select a day for its contribution count. Use arrow keys to explore; Home / End jump to the first / last day.</p>
      <p id="github-scroll-help" className="github-scroll-hint">Scroll horizontally to explore the full year.</p>
      <div className="github-calendar-scroll" role="group" aria-label={`${activity.year} GitHub contribution calendar`} aria-describedby="github-calendar-help github-scroll-help">
        <div className="github-calendar" style={{ '--github-weeks': calendar.weeks }}>
          <div className="github-months" aria-hidden="true">
            {calendar.months.map(month => <span key={month.label} style={{ gridColumn: month.column }}>{month.label}</span>)}
          </div>
          <div className="github-weekdays" aria-hidden="true"><span>Mon</span><span>Wed</span><span>Fri</span></div>
          <div className="github-days" onPointerLeave={() => setHoveredDay(null)}>
            {calendar.cells.map((day, index) => day && day.date <= today ? (
              <button
                key={day.date}
                type="button"
                className={`github-day github-level-${day.level}`}
                ref={node => { buttons.current[index] = node }}
                tabIndex={index === activeIndex ? 0 : -1}
                aria-label={dayDescription(day)}
                title={dayDescription(day)}
                onFocus={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
                onPointerEnter={() => setHoveredDay(day)}
                onKeyDown={event => onKeyDown(event, index)}
              />
            ) : <span key={day?.date || `empty-${index}`} className={`github-day github-day-blank${day ? ' github-day-future' : ''}`} aria-hidden="true" />)}
          </div>
        </div>
      </div>
      <div className="github-day-inspector">
        <label htmlFor="github-inspect-day">Inspect a day</label>
        <input id="github-inspect-day" type="date" min={`${activity.year}-01-01`} max={activity.year === new Date().getUTCFullYear() ? today : `${activity.year}-12-31`} value={selectedDay?.date || ''} onChange={event => {
          const next = available.findIndex(day => day?.date === event.target.value)
          if (next >= 0) { setActiveIndex(next); setHoveredDay(null) }
        }} />
      </div>
      <div className="github-calendar-bottom">
        <p className="github-day-detail" aria-hidden="true">{detail ? dayDescription(detail) : 'No daily activity is available for this year.'}</p>
        <span className="github-sr-only" aria-live="polite" aria-atomic="true">{selectedDay ? dayDescription(selectedDay) : ''}</span>
        <div className="github-legend" aria-label="Contribution intensity from less to more"><span>Less</span>{[0, 1, 2, 3, 4].map(level => <i key={level} className={`github-level-${level}`} aria-hidden="true" />)}<span>More</span></div>
      </div>
    </>
  )
}

export default function GitHubActivity() {
  const currentYear = new Date().getUTCFullYear()
  const [year, setYear] = useState(currentYear)
  const [nearViewport, setNearViewport] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [request, setRequest] = useState({ state: 'idle', year: currentYear })
  const section = useRef(null)

  useEffect(() => {
    if (!('IntersectionObserver' in window)) { setNearViewport(true); return }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setNearViewport(true); observer.disconnect() }
    }, { rootMargin: '320px 0px', threshold: 0 })
    observer.observe(section.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!nearViewport) return
    const controller = new AbortController()
    let active = true
    const timeout = window.setTimeout(() => controller.abort(), 12_000)
    setRequest({ state: 'loading', year })
    async function loadActivity() {
      try {
        const response = await fetch(`/api/github-activity?year=${year}`, { signal: controller.signal, headers: { Accept: 'application/json' } })
        if (!response.ok) throw new Error('GitHub activity is temporarily unavailable.')
        const data = validateActivity(await response.json(), year)
        if (active) setRequest({ state: 'success', year, data })
      } catch {
        if (active) setRequest({ state: 'error', year })
      } finally {
        window.clearTimeout(timeout)
      }
    }
    loadActivity()
    return () => { active = false; controller.abort(); window.clearTimeout(timeout) }
  }, [nearViewport, year, attempt])

  const state = request.year === year ? request.state : 'loading'
  const activity = state === 'success' ? request.data : null

  return (
    <section id="github" ref={section} className="section github-section" aria-label="GitHub activity">
      <div className="page-container">
        <SectionHeading eyebrow="The work between launches" title="Building in public." description="Selected builds tell the story. Public GitHub activity shows the day-to-day work behind it — code, collaboration, and steady progress." light />
        <div className="github-panel">
          <div className="github-panel-top">
            <div className="github-identity"><Github size={24} aria-hidden="true" /><div><strong>CharlieJamesGwapo</strong><span>GitHub contribution activity</span></div></div>
            <div className="github-years" role="group" aria-label="Contribution year">
              {[currentYear, currentYear - 1].map(value => <button key={value} type="button" aria-pressed={year === value} onClick={() => setYear(value)}>{value}</button>)}
            </div>
          </div>
          <div className="github-content" aria-busy={state === 'loading'}>
            {activity ? (
              <>
                <div className="github-summary"><p><strong className="github-total">{numberFormat.format(activity.total)}</strong><span>contributions in {year}</span></p>{activity.publicRepositories !== null ? <span className="github-repositories">{numberFormat.format(activity.publicRepositories)} public repositories</span> : null}</div>
                <ContributionCalendar key={year} activity={activity} />
                {activity.stale ? <p className="github-stale">Showing the last available snapshot while GitHub refreshes.</p> : null}
                <p className="github-updated">Updated <time dateTime={activity.updatedAt}>{updatedFormat.format(new Date(activity.updatedAt))}</time>. Refreshes about hourly; GitHub activity may take time to appear.</p>
              </>
            ) : state === 'error' ? (
              <div className="github-fallback"><p role="status"><strong>Couldn’t load GitHub activity.</strong><span>The feed is temporarily unavailable. You can retry or view the contribution graph on GitHub.</span></p><button type="button" onClick={() => setAttempt(value => value + 1)}><RotateCcw size={16} aria-hidden="true" />Try again</button></div>
            ) : (
              <div className="github-loading" role="status"><span className="github-loading-mark" aria-hidden="true" /><p>{state === 'idle' ? 'Contribution calendar loads as you explore.' : `Loading ${year} contribution activity…`}</p></div>
            )}
          </div>
          <div className="github-panel-footer"><p>A public activity snapshot, alongside the selected projects above.</p><a href={PROFILE_URL} target="_blank" rel="noopener noreferrer">View GitHub profile <ArrowUpRight size={17} aria-hidden="true" /><span className="github-sr-only"> (opens in a new tab)</span></a></div>
        </div>
      </div>
    </section>
  )
}
