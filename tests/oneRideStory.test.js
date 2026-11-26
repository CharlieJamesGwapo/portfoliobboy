import test from 'node:test'
import assert from 'node:assert/strict'
import { getCaseStudyBySlug } from '../src/data/caseStudies.js'
import { oneRidePreview } from '../src/data/productPreviewData.js'

test('OneRide walkthrough uses official assets and identifies its empty orders state', () => {
  const study = getCaseStudyBySlug('oneride')
  assert.equal(study.story.walkthrough.length, 3)
  assert.deepEqual(study.story.walkthrough.map(screen => screen.src), oneRidePreview.screenshots.map(screen => screen.src))
  assert.match(study.story.walkthrough.at(-1).detail, /empty state/)
  assert.match(study.workflows.join(' '), /Pasundo motorcycle ride booking/)
  assert.match(study.workflows.join(' '), /Pasabay ride sharing/)
  assert.equal(study.responsibilities.length, 3)
  assert.equal(getCaseStudyBySlug('zalio-crm').story, undefined)
})
