import DocumentActions from './DocumentActions'
import { projectBriefDocument } from '../../lib/projectBriefExport'
import { trackPortfolioEvent } from '../../lib/portfolioAnalytics'

export default function BriefActions({ subject = 'Project brief', message = '', onSave, surface = 'text_guide' }) {
  return <DocumentActions document={projectBriefDocument({ subject, message })} noun="brief" onSave={onSave} onExport={format => {
    trackPortfolioEvent(format === 'text' ? 'portfolio_brief_downloaded' : 'portfolio_brief_print_opened', { surface })
  }} />
}
