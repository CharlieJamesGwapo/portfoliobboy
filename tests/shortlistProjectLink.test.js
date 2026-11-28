import test from 'node:test'
import assert from 'node:assert/strict'
import { shortlistSlugFromHref } from '../src/lib/shortlistProjectLink.js'

test('only canonical published project routes can become shortlist controls', () => {
  assert.equal(shortlistSlugFromHref('/projects/zalio-crm'), 'zalio-crm')
  for (const href of [null, {}, '/projects/not-published', '/projects/toString', '/projects/constructor', '/projects/zalio-crm/', '/projects/zalio-crm?private=notes', '/projects/zalio-crm#details', '/projects/%7Aalio-crm', '//foreign.example/projects/zalio-crm', 'https://foreign.example/projects/zalio-crm', '/projects/../zalio-crm', '/lab']) {
    assert.equal(shortlistSlugFromHref(href), null, String(href))
  }
})
