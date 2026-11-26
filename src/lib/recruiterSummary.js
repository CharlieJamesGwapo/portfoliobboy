import { resumeUrl } from '../data/portfolioData.js'

export const roleStatusLabels = Object.freeze({ documented: 'Documented', partial: 'Partly documented', unverified: 'Needs confirmation' })
const origin = 'https://portfoliobboy.vercel.app'

export function buildRecruiterSummary(result) {
  const requirements = result.requirements || []
  const sections = requirements.map((row, index) => [
    `${index + 1}. ${row.requirement}`,
    `Assessment: ${roleStatusLabels[row.status] || roleStatusLabels.unverified}`,
    row.text,
    ...row.evidence.map(item => `Evidence: ${item.text}\n${origin}${item.href}`),
  ].join('\n'))
  return {
    kind: 'Recruiter summary', eyebrow: 'RECRUITER SUMMARY', subject: 'Charlie Abejo · Role evidence',
    filename: 'charlie-abejo-recruiter-summary.txt',
    disclaimer: 'Public portfolio comparison, not a hiring verdict. Confirm experience, depth, eligibility and availability directly.',
    message: [
      result.text,
      ...(result.truncated ? ['Coverage: up to 30 requirements from the first 4,000 characters. Compare additional requirements separately.'] : []),
      ...sections,
      `Résumé PDF\n${origin}${resumeUrl}`,
      `Contact\n${origin}/#contact`,
    ].filter(Boolean).join('\n\n'),
  }
}
