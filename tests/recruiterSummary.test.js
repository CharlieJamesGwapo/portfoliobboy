import test from 'node:test'
import assert from 'node:assert/strict'
import { assessRole } from '../src/lib/assistantWorkflows.js'
import { buildRecruiterSummary } from '../src/lib/recruiterSummary.js'
import { buildDocumentPrintHtml } from '../src/lib/documentExport.js'

test('recruiter report preserves displayed matches, qualifications and unknown requirements', () => {
  const result = assessRole('React\n5 years of Python\nKubernetes\nNo React Native')
  const document = buildRecruiterSummary(result)
  for (const row of result.requirements) {
    assert.ok(document.message.includes(row.requirement))
    assert.ok(document.message.includes(row.text))
    for (const evidence of row.evidence) assert.ok(document.message.includes(`https://portfoliobboy.vercel.app${evidence.href}`))
  }
  assert.match(document.message, /Documented/)
  assert.match(document.message, /Partly documented/)
  assert.match(document.message, /Needs confirmation/)
  assert.match(document.message, /not a hiring verdict/)
  assert.match(document.message, /https:\/\/portfoliobboy.vercel.app\/charlie-james-abejo-resume.pdf/)
})

test('truncation and Unicode remain visible and printable content stays harmless', () => {
  const result = assessRole('招聘 José <img src=x>\n' + 'React\n'.repeat(40) + 'x'.repeat(4100))
  const document = buildRecruiterSummary(result)
  assert.match(document.message, /first 4,000 characters/)
  assert.match(document.message, /30 requirements/)
  const html = buildDocumentPrintHtml(document)
  assert.match(html, /招聘 José &lt;img/)
  assert.doesNotMatch(html, /<img|<script|<iframe/i)
})

test('Unicode qualifications and negation never become an unqualified documented match', () => {
  for (const requirement of ['React (母语级中文)', 'React 和中文流利']) {
    const result = assessRole(requirement)
    assert.equal(result.requirements[0].status, 'partial')
    assert.match(buildRecruiterSummary(result).message, /Partly documented/)
  }
  const result = assessRole('不要 React')
  assert.equal(result.requirements[0].status, 'unverified')
  assert.deepEqual(result.requirements[0].evidence, [])
})

test('reaching the native role field cap retains a coverage notice', () => {
  for (const input of ['React\n' + 'x'.repeat(3994), 'React\n' + 'x'.repeat(3993) + ' ']) {
    const result = assessRole(input)
    assert.equal(result.truncated, true)
    assert.match(buildRecruiterSummary(result).message, /first 4,000 characters/)
  }
})
