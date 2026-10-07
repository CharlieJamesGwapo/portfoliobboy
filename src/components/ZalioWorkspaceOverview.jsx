const workspaceModules = ['CRM', 'Agents', 'Operations', 'Roster', 'Library', 'Team chat']

export default function ZalioWorkspaceOverview() {
  return (
    <figure className="zalio-architecture-overview">
      <figcaption>Architecture overview · Private authenticated workspace.</figcaption>
      <div className="zalio-architecture-network">
        <ul className="zalio-architecture-nodes" aria-label="Architecture modules">
          {workspaceModules.map((module) => (
            <li key={module}>
              <span>{module}</span>
            </li>
          ))}
        </ul>
        <ul className="zalio-architecture-connections" aria-hidden="true">
          {workspaceModules.slice(1).map((module) => <li key={module} />)}
        </ul>
      </div>
    </figure>
  )
}
