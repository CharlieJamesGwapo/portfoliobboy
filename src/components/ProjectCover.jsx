import './project-cover.css'

// Presentation metadata only. Product evidence and availability stay in the
// project records, and the existing media owner keeps image recovery state.
const covers = {
  'bboy-assistant': {
    name: 'BBOY', mark: 'B', category: 'Native macOS assistant',
    line: 'A local home for specialist agents.',
    status: 'Personal app · v0.7.0', note: 'Architecture illustration',
    detail: 'Private source · no app screenshot',
  },
  easyappy: {
    name: 'EasyAppy', mark: 'E', category: 'Local-first desktop',
    line: 'A little clarity for your next chapter.',
    status: 'macOS workspace', note: 'Promotional concept',
    detail: 'Applications · Interviews · Hiring email',
  },
  agentforge: {
    name: 'AgentForge', mark: '⌘', category: 'AI developer toolkit',
    line: 'Your tools. Your provider. Your terms.',
    status: 'v0.1.0-dev.0', note: 'Promotional concept',
    detail: 'CLI toolkit · In development',
  },
  'zalio-crm': {
    name: 'Zalio', mark: 'z', category: 'Connected gym operations',
    line: 'From first enquiry to the next visit.',
    status: 'CRM module', note: 'Public product website',
    detail: 'Private CRM interface not shown',
  },
}

export const hasProjectCover = (projectId) => Object.hasOwn(covers, projectId)

function LocalAgentArtwork() {
  return (
    <div
      className="project-cover-agent-map independent-agent-diagram"
      role="img"
      aria-label="BBOY architecture illustration: a local macOS runtime connects Coordinator, Developer and Reviewer agents, with voice tools and action approvals. No app screenshot is shown."
    >
      <div className="project-cover-agent-core" aria-hidden="true">
        <svg viewBox="0 0 320 156" fill="none">
          <ellipse cx="160" cy="77" rx="122" ry="42" />
          <ellipse cx="160" cy="77" rx="122" ry="42" transform="rotate(-28 160 77)" />
          <ellipse cx="160" cy="77" rx="122" ry="42" transform="rotate(28 160 77)" />
          <path d="M160 112v33M52 114v31M268 114v31" />
          <circle cx="160" cy="77" r="36" />
        </svg>
        <span>B<span>LOCAL RUNTIME</span></span>
      </div>
      <div className="project-cover-agent-roles" aria-hidden="true">
        {['Coordinator', 'Developer', 'Reviewer'].map((role, index) => (
          <div key={role}><small>0{index + 1}</small><strong>{role}</strong></div>
        ))}
      </div>
      <p aria-hidden="true">Voice tools <span>+</span> Action approvals <span>+</span> macOS</p>
    </div>
  )
}

export default function ProjectCover({ projectId, children, compact = false }) {
  const cover = covers[projectId]
  if (!cover) return children

  return (
    <div className={`project-cover project-cover--${projectId}${compact ? ' project-cover--compact' : ''}`} data-project-cover={projectId}>
      <div className="project-cover-heading">
        <div className="project-cover-identity">
          <span className="project-cover-mark" aria-hidden="true">{cover.mark}</span>
          <span><strong>{cover.name}</strong><small>{cover.category}</small></span>
        </div>
        <span className="project-cover-edition">{cover.status}</span>
        <p>{cover.line}</p>
      </div>
      <div className="project-cover-artwork">
        {projectId === 'bboy-assistant' ? <LocalAgentArtwork /> : children}
      </div>
      <div className="project-cover-footnote"><span>{cover.note}</span><small>{cover.detail}</small></div>
    </div>
  )
}
