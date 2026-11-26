import { useId, useState } from 'react'
import { CalendarClock, ArrowUpRight } from 'lucide-react'
import { bookingOptions } from '../../data/portfolioData'
import { buildBookingRequest, getBookingUrl } from '../../lib/booking'
import './brief-actions.css'
import { trackBookingClick } from '../../lib/portfolioAnalytics'

export default function AlexBooking({ brief, onRequest, onSchedule, initiallyOpen = false, surface = 'text_guide' }) {
  const id = useId()
  const [selected, setSelected] = useState('intro')
  const option = bookingOptions.find(item => item.id === selected) || bookingOptions[0]
  const url = getBookingUrl(option.url)
  const followLink = event => { onSchedule?.(); trackBookingClick(event, surface, option.id) }
  return <details className="alex-booking" open={initiallyOpen || undefined} onToggle={event => {
    // End voice before exposing an external anchor: middle-click and the
    // browser's Open Link in New Tab action need the same microphone cleanup.
    if (event.currentTarget.open) onSchedule?.()
  }}>
    <summary><CalendarClock size={17} aria-hidden="true" /><span>Book a call</span><small>15–60 min</small></summary>
    <div className="alex-booking-body">
      <label htmlFor={`${id}-call`}>Choose your conversation</label>
      <select id={`${id}-call`} value={selected} onChange={event => setSelected(event.target.value)}>
        {bookingOptions.map(item => <option key={item.id} value={item.id}>{item.minutes} min · {item.title} · {item.price}</option>)}
      </select>
      <p>{option.description}</p>
      {url ? <>
        <a href={url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" onClick={followLink} onAuxClick={followLink}>Choose a time<ArrowUpRight size={16} aria-hidden="true" /></a>
        <p>Opens the scheduling page in a new tab and ends any voice call. Your brief is not sent to the scheduler. Complete booking there to reserve a time.</p>
      </> : <>
        <button type="button" onClick={() => onRequest?.(buildBookingRequest(option, brief))}>Request this call</button>
        <p>Choose a preferred time in the contact form. This is a request; Charlie will confirm availability. Nothing is sent automatically.</p>
      </>}
    </div>
  </details>
}
