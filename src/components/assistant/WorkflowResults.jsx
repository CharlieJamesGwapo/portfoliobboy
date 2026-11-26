import { trackPortfolioEvent } from '../../lib/portfolioAnalytics'
import { buildRecruiterSummary, roleStatusLabels } from '../../lib/recruiterSummary'
import DocumentActions from './DocumentActions'

const statusLabels = roleStatusLabels

export default function WorkflowResults({ result, onEnquiry, onNavigate }) {
  if (result.projects) {
    return (
      <div className="alex-workflow-results">
        {result.projects.map(project => (
          <article className="alex-project-card" key={project.href}>
            <h3>{project.title}</h3>
            <span className="alex-evidence-label">{project.reason}</span>
            <p>{project.contribution}</p>
            <span className="alex-evidence-label">{project.status}</span>
            <a href={project.href} onClick={event => {
              const projectId = project.href.match(/^\/projects\/([a-z0-9-]+)$/)?.[1]
              if (projectId) trackPortfolioEvent('portfolio_project_opened', { surface: 'text_guide', project_id: projectId })
              onNavigate?.(event)
            }}>Read case study <span className="sr-only">for {project.title}</span></a>
          </article>
        ))}
        <button className="alex-workflow-cta" type="button" onClick={() => onEnquiry(result.enquiry)}>
          Start a project enquiry
        </button>
      </div>
    )
  }
  if (result.requirements) {
    return (
      <div className="alex-workflow-results">
        {result.truncated && <p role="status">Showing up to 30 requirements from the first 4,000 characters. Split a longer role into smaller sections.</p>}
        <ul className="alex-requirements" aria-label="Requirement comparison">
          {result.requirements.map(row => (
            <li key={row.requirement}>
              <strong>{row.requirement}</strong>
              <span className={`alex-evidence-status is-${row.status}`}>{statusLabels[row.status]}</span>
              <p>{row.text}</p>
              {row.evidence.map((item, index) => <a key={`${item.href}-${index}`} href={item.href} onClick={onNavigate}>{item.text}</a>)}
            </li>
          ))}
        </ul>
        {result.requirements.length > 0 && <section className="alex-recruiter-export" aria-label="Recruiter summary">
          <h3>Keep this comparison</h3>
          <p>Save the requirements, evidence, gaps and résumé link. This summary makes no hiring verdict.</p>
          <DocumentActions document={buildRecruiterSummary(result)} noun="summary" />
        </section>}
      </div>
    )
  }
  return null
}
