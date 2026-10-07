export default function RotatingTitle({ role, titles = [] }) {
  return (
    <div className="rotating-title" aria-label="Professional role summary">
      <span className="sr-only">Professional roles: {titles.join(', ')}</span>
      <span className="rotating-title-label">Current role</span>
      <span className="rotating-title-value">{role || titles[0] || ''}</span>
      <details className="role-details">
        <summary>View all professional roles</summary>
        <ul>
          {titles.map((title) => <li key={title}>{title}</li>)}
        </ul>
      </details>
    </div>
  )
}
