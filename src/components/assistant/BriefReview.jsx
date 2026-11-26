export default function BriefReview({ value, onChange, onUse, onRestart }) {
  return (
    <div className="alex-brief-review">
      <label htmlFor="alex-brief">Review your project brief</label>
      <p>Edit anything before continuing. Opening the contact form does not send the enquiry.</p>
      <textarea id="alex-brief" value={value} onChange={event => onChange(event.target.value)} maxLength={4500} rows={9} />
      <button type="button" className="alex-workflow-cta" disabled={value.trim().length < 10} onClick={onUse}>Review in contact form</button>
      <button type="button" className="alex-workflow-reset" onClick={onRestart}>Start brief over</button>
    </div>
  )
}
