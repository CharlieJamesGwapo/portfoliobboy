import { ArrowUpRight, LockKeyhole } from 'lucide-react'
import ZalioWorkspaceOverview from './ZalioWorkspaceOverview'

function getLiveAction(system) {
  if (system.id === 'hasti') return 'Try the AI receptionist'
  if (system.id === 'zalio') return 'Open the product site'
  if (system.statusTone === 'prototype') return 'Explore the prototype'
  if (system.status.toLocaleLowerCase('en').includes('demo')) return 'Explore the live demo'
  return 'Explore the live product'
}

export default function SystemDetail({ system }) {
  const publicUrl = system.url

  return (
    <div className="system-detail">
      <section className="system-detail-section">
        <h3>Problem</h3>
        <p>{system.summary}</p>
      </section>

      <section className="system-detail-section">
        <h3>Engineering scope</h3>
        <p>{system.contribution}</p>
      </section>

      <section className="system-detail-section">
        <h3>Architecture</h3>
        <ul className="system-detail-stack" aria-label={`${system.title} stack`}>
          {system.stack.map((item) => <li key={item}>{item}</li>)}
        </ul>
        {system.id === 'zalio' && <ZalioWorkspaceOverview />}
      </section>

      <section className="system-detail-section">
        <h3>Available experience</h3>
        <p className="system-detail-status">
          {system.statusTone === 'private' && <LockKeyhole size={15} aria-hidden="true" />}
          {system.status}
        </p>
        {publicUrl ? (
          <a className="system-detail-live-link" href={publicUrl} target="_blank" rel="noreferrer">
            {getLiveAction(system)}
            <ArrowUpRight size={16} aria-hidden="true" />
            <span className="sr-only"> — {system.title} (opens in a new tab)</span>
          </a>
        ) : (
          <p className="system-detail-private-note">
            <LockKeyhole size={15} aria-hidden="true" />
            No public experience supplied.
          </p>
        )}
      </section>
    </div>
  )
}
