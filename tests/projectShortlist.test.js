import test from 'node:test'
import assert from 'node:assert/strict'
import { caseStudies } from '../src/data/caseStudies.js'
import { buildDocumentPrintHtml, formatDocument } from '../src/lib/documentExport.js'
import * as shortlist from '../src/lib/projectShortlist.js'
import * as selection from '../src/lib/projectShortlistSelection.js'

test('lightweight selection catalog allowlists exactly the published case studies', () => {
  assert.deepEqual(Object.keys(selection.shortlistProjectTitles).sort(), caseStudies.map(study => study.slug).sort())
  assert.equal(selection.shortlistProjectTitles['oneride'], 'One Ride Balingasag (OMJI)')
  assert.equal(selection.normalizeShortlist, shortlist.normalizeShortlist)
})

test('normalization keeps up to three public slugs in selection order and excludes untrusted values', () => {
  const input = ['unknown', '<script>alert(1)</script>', 'oneride', 'ONERIDE', 'oneride', null, { slug: 'bboy' }, 'agentforge', 'easyappy', 'contextpilot']
  assert.deepEqual(shortlist.normalizeShortlist(input), ['oneride', 'agentforge', 'easyappy'])
  assert.equal(input.length, 10, 'normalization does not mutate caller state')
  for (const value of [null, undefined, {}, 'oneride', 3]) assert.deepEqual(shortlist.normalizeShortlist(value), [])
})

test('toggle validates additions, enforces the limit, and still removes selections at the limit', () => {
  assert.deepEqual(shortlist.toggleShortlist(['oneride'], 'bboy'), { slugs: ['oneride', 'bboy'], status: 'added' })
  const full = Object.freeze(['oneride', 'bboy', 'agentforge'])
  assert.deepEqual(shortlist.toggleShortlist(full, 'easyappy'), { slugs: ['oneride', 'bboy', 'agentforge'], status: 'limit' })
  assert.deepEqual(shortlist.toggleShortlist(full, 'bboy'), { slugs: ['oneride', 'agentforge'], status: 'removed' })
  for (const invalid of ['BBoy', ' https://evil.test', '__proto__', null, {}, '<script>']) {
    assert.deepEqual(shortlist.toggleShortlist(['oneride', 'unknown', 'oneride'], invalid), { slugs: ['oneride'], status: 'invalid' })
  }
})

test('shared query distinguishes absent and empty comparisons and normalizes decoded public slugs', () => {
  assert.equal(shortlist.readSharedShortlist('?utm_source=test'), null)
  assert.equal(shortlist.readSharedShortlist(''), null)
  assert.deepEqual(shortlist.readSharedShortlist('?compare='), [])
  assert.deepEqual(shortlist.readSharedShortlist('?compare=unknown,ONERIDE,oneride,oneride,bboy,agentforge,easyappy&email=private%40test.com'), ['oneride', 'bboy', 'agentforge'])
  assert.deepEqual(shortlist.readSharedShortlist('?compare=oneride%2Cbboy'), ['oneride', 'bboy'])
  for (const search of ['?compare=oneride&compare=bboy', '?compare=oneride&%63ompare=bboy', '?compare=%E0%A4%A', '?compare=oneride,' + 'x'.repeat(256), '?compare=oneride&note=' + 'x'.repeat(2048)]) {
    assert.deepEqual(shortlist.readSharedShortlist(search), [], search)
  }
})

test('share links contain only canonical project slugs and never arbitrary origins or visitor context', () => {
  const url = shortlist.shortlistShareUrl(['oneride', 'https://evil.test/path?email=private@test.com', 'bboy', '<script>', 'oneride', 'agentforge', 'easyappy'])
  assert.equal(url, 'https://portfoliobboy.vercel.app/projects?compare=oneride,bboy,agentforge#project-shortlist')
  assert.equal(shortlist.shortlistShareUrl([]), 'https://portfoliobboy.vercel.app/projects?compare=#project-shortlist')
  assert.equal(shortlist.shortlistShareUrl({ origin: 'https://evil.test', search: '?email=private@test.com' }), 'https://portfoliobboy.vercel.app/projects?compare=#project-shortlist')
})

test('selected study lookup returns published records in selection order', () => {
  const studies = shortlist.getShortlistStudies(['bboy', 'unknown', 'oneride', 'bboy'])
  assert.deepEqual(studies.map(study => study.slug), ['bboy', 'oneride'])
  assert.equal(studies[0], caseStudies.find(study => study.slug === 'bboy'))
  assert.equal(studies[1], caseStudies.find(study => study.slug === 'oneride'))
})

test('comparison document preserves actual project evidence, source caveats, and canonical links', () => {
  const document = shortlist.buildShortlistDocument(['oneride', 'autoflow-ai-pro', 'unknown', 'agentforge', 'bboy'])
  assert.equal(document.kind, 'Project comparison')
  assert.equal(document.eyebrow, 'PROJECT COMPARISON')
  assert.equal(document.subject, 'Charlie Abejo · Project comparison')
  assert.equal(document.filename, 'charlie-abejo-project-comparison.txt')
  for (const slug of ['oneride', 'autoflow-ai-pro', 'agentforge']) {
    const study = caseStudies.find(item => item.slug === slug)
    for (const evidence of [study.title, study.role, study.status, study.outcome, ...study.responsibilities, ...study.stack]) {
      assert.ok(document.message.includes(evidence), `Missing ${slug} evidence: ${evidence}`)
    }
    assert.ok(document.message.includes(`https://portfoliobboy.vercel.app/projects/${slug}`))
  }
  assert.match(document.message, /Live on Google Play · Client source code private/)
  assert.match(document.message, /In development · Planned integrations/)
  assert.ok(document.message.indexOf('projects/oneride') < document.message.indexOf('projects/autoflow-ai-pro'))
  assert.doesNotMatch(document.message, /projects\/bboy|unknown/)
  assert.match(document.disclaimer, /confirm/i)
})

test('enquiry is an editable discussion draft with complete selected evidence and no supplied visitor context', () => {
  const enquiry = shortlist.buildShortlistEnquiry(['oneride', 'autoflow-ai-pro', 'private@test.com', '<script>alert(1)</script>'])
  assert.match(enquiry.subject, /project/i)
  assert.match(enquiry.message, /discuss/i)
  for (const slug of ['oneride', 'autoflow-ai-pro']) {
    const study = caseStudies.find(item => item.slug === slug)
    for (const evidence of [study.title, study.role, study.status, study.outcome, ...study.responsibilities, ...study.stack]) {
      assert.ok(enquiry.message.includes(evidence), `Missing ${slug} enquiry evidence: ${evidence}`)
    }
    assert.ok(enquiry.message.includes(`https://portfoliobboy.vercel.app/projects/${slug}`))
  }
  assert.doesNotMatch(enquiry.message, /private@test|<script>|sent successfully/i)
  assert.ok(enquiry.message.length < 4500)
})

test('empty comparison exports explain the missing selection without inventing evidence', () => {
  const document = shortlist.buildShortlistDocument(['unknown'])
  assert.match(document.message, /no projects selected/i)
  assert.doesNotMatch(document.message, /Role:|Outcome:/)
  assert.match(shortlist.buildShortlistEnquiry([]).message, /no projects selected/i)
})

test('comparison text and print use existing exporter and safely escape published ampersands', () => {
  const document = shortlist.buildShortlistDocument(['oneride', '<img src=x onerror=bad()>'])
  const text = formatDocument(document)
  assert.ok(text.includes(document.message))
  assert.ok(text.includes(document.disclaimer))
  const html = buildDocumentPrintHtml(document)
  assert.match(html, /Full-stack &amp; mobile development/)
  assert.doesNotMatch(html, /<script|<img|<iframe|onerror=/i)
  assert.match(html, /Save as PDF/)
})

test('every published case study can be exported without dropping string or array responsibilities', () => {
  for (const study of caseStudies) {
    const responsibilities = Array.isArray(study.responsibilities) ? study.responsibilities : [study.responsibilities].filter(Boolean)
    const evidence = [study.title, study.role, study.status, study.outcome, ...responsibilities, ...study.stack]
    for (const result of [shortlist.buildShortlistDocument([study.slug]), shortlist.buildShortlistEnquiry([study.slug])]) {
      for (const value of evidence) assert.ok(result.message.includes(value), `Missing ${study.slug} evidence: ${value}`)
      assert.ok(result.message.includes(`https://portfoliobboy.vercel.app/projects/${study.slug}`))
    }
  }
})
