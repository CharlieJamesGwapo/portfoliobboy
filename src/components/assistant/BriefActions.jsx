import { useEffect, useRef, useState } from 'react'
import { Copy, Download, Printer } from 'lucide-react'
import { downloadProjectBrief, formatProjectBrief, openBriefPrintView } from '../../lib/projectBriefExport'
import './brief-actions.css'

export default function BriefActions({ subject = 'Project brief', message = '', onSave }) {
  const [status, setStatus] = useState('')
  const [copying, setCopying] = useState(false)
  const revision = useRef(0)
  useEffect(() => { revision.current++; setStatus(''); setCopying(false) }, [subject, message])
  useEffect(() => () => { revision.current++ }, [])
  const brief = { subject, message }
  const valid = message.trim().length > 0
  const copy = async () => {
    onSave?.()
    const current = revision.current
    setCopying(true)
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard-unavailable')
      await navigator.clipboard.writeText(formatProjectBrief(brief))
      if (current === revision.current) setStatus('Brief copied. Nothing has been sent.')
    } catch {
      if (current === revision.current) setStatus('Copy is unavailable. Download the text file, or select and copy your draft above.')
    } finally { if (current === revision.current) setCopying(false) }
  }
  return <div className="brief-tools">
    <div className="brief-tools-actions" role="group" aria-label="Save your project brief">
      <button type="button" disabled={!valid || copying} onClick={copy}><Copy size={16} aria-hidden="true" />{copying ? 'Copying…' : 'Copy brief'}</button>
      <button type="button" disabled={!valid} onClick={() => {
        try { onSave?.(); downloadProjectBrief(brief); setStatus('Text download requested. Check your browser’s downloads.') }
        catch { setStatus('Download could not start. Select and copy your draft above, or try Save as PDF.') }
      }}><Download size={16} aria-hidden="true" />Download text</button>
      <button type="button" disabled={!valid} onClick={() => {
        try { onSave?.(); openBriefPrintView(brief); setStatus('Print view opened in a new tab. Choose Save as PDF as the destination.') }
        catch { setStatus('Print view was blocked. Allow pop-ups for this site, or download the text file instead.') }
      }}><Printer size={16} aria-hidden="true" />Save as PDF</button>
    </div>
    <p className="brief-tools-note">Save as PDF opens print preview in a new tab. Your saved brief includes your current edits.</p>
    <p className="brief-tools-status" role="status" aria-live="polite">{status}</p>
  </div>
}
