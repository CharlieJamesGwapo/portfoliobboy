import test from 'node:test'
import assert from 'node:assert/strict'
import { sendContactEnquiry } from '../src/lib/contactSubmission.js'

const draft = { name: 'Visitor', email: 'visitor@example.com', subject: 'Enquiry', message: 'Keep my private enquiry.' }
test('a stalled challenge cannot leave the contact form sending forever', async () => {
  const started = Date.now()
  await assert.rejects(sendContactEnquiry(draft, { fetchRequest: () => new Promise(() => {}), timeoutMs: 15 }), /deadline/i)
  assert.ok(Date.now() - started < 1000)
})
test('verification rejection is an error and leaves the callers draft intact', async () => {
  await assert.rejects(sendContactEnquiry(draft, { fetchRequest: async () => ({ ok: false, status: 403, json: async () => ({ code: 'BOT_VERIFICATION_FAILED' }) }) }), error => error.code === 'BOT_VERIFICATION_FAILED')
  assert.equal(draft.message, 'Keep my private enquiry.')
})
test('a successful HTTP response without confirmed delivery is never accepted', async () => {
  await assert.rejects(sendContactEnquiry(draft, { fetchRequest: async () => ({ ok: true, json: async () => ({}) }) }))
})
