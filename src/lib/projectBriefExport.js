import { buildDocumentPrintHtml, downloadDocument, formatDocument, openDocumentPrintView } from './documentExport.js'

export function projectBriefDocument({ subject = 'Project brief', message = '' } = {}) {
  return { subject, message, kind: 'Project brief', eyebrow: 'PROJECT BRIEF', filename: 'charlie-abejo-project-brief.txt', disclaimer: 'Draft for discussion. Scope, availability, pricing and timing need confirmation.' }
}

export const formatProjectBrief = brief => formatDocument(projectBriefDocument(brief))
export const buildBriefPrintHtml = brief => buildDocumentPrintHtml(projectBriefDocument(brief))
export const downloadProjectBrief = brief => downloadDocument(projectBriefDocument(brief))
export const openBriefPrintView = brief => openDocumentPrintView(projectBriefDocument(brief))
