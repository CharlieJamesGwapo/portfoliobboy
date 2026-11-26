import test from 'node:test'
import assert from 'node:assert/strict'
import { buildBookingRequest, getBookingUrl, resolveBookingConfiguration } from '../src/lib/booking.js'

test('booking accepts only public HTTPS URLs without embedded credentials', () => {
  assert.equal(getBookingUrl(' https://calendar.google.com/calendar/appointments/schedules/public-id '), 'https://calendar.google.com/calendar/appointments/schedules/public-id')
  for (const value of ['', undefined, 'javascript:alert(1)', '//evil.test', 'http://example.com', 'https://user:pass@example.com', 'https://localhost/a', 'https://127.0.0.1/a', 'https://[::1]/a', 'https://localhost./a', 'https://device.localhost./a', 'https://calendar.local/a']) assert.equal(getBookingUrl(value), '')
})

test('invalid scheduling configuration fails before it can enter a browser bundle', () => {
  assert.equal(resolveBookingConfiguration(''), '')
  assert.equal(resolveBookingConfiguration('https://scheduler.example/intro'), 'https://scheduler.example/intro')
  assert.throws(() => resolveBookingConfiguration('https://sensitive-user:private-password@example.com'), error => !error.message.includes('sensitive-user') && !error.message.includes('private-password'))
})

test('call requests preserve reviewed notes without promising a reserved slot', () => {
  const option = { minutes: 15, title: 'Intro call' }
  const request = buildBookingRequest(option, { message: 'José’s CRM\nKeep my edits <script>.' })
  assert.match(request.subject, /15-min intro call/)
  assert.match(request.message, /Preferred date and time \(with timezone\)/)
  assert.ok(request.message.endsWith('José’s CRM\nKeep my edits <script>.'))
  assert.doesNotMatch(request.message, /confirmed|reserved/)
  assert.ok(buildBookingRequest(option, { message: 'x'.repeat(4500) }).message.length <= 4500)
  assert.match(buildBookingRequest(option).message, /What I’d like to discuss/)
})
