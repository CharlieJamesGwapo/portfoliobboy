import test from 'node:test'
import assert from 'node:assert/strict'
import { createVoiceSessionStarter } from '../src/lib/voiceSessionStart.js'

test('closing during a pending microphone prompt never starts a later voice connection', async () => {
  let grant
  const permission = new Promise(resolve => { grant = resolve })
  const starter = createVoiceSessionStarter(() => permission)
  let starts = 0
  const attempt = starter.start(() => { starts++ })
  starter.cancel()
  grant('')
  assert.equal((await attempt).status, 'cancelled')
  assert.equal(starts, 0)
})

test('only the latest explicit start may continue, and a denied microphone never connects', async () => {
  const requests = []
  const starter = createVoiceSessionStarter(() => new Promise(resolve => requests.push(resolve)))
  let starts = 0
  const first = starter.start(() => { starts++ })
  const second = starter.start(() => { starts++ })
  requests[0]('')
  requests[1]('Microphone access was blocked.')
  assert.equal((await first).status, 'cancelled')
  assert.equal((await second).status, 'denied')
  assert.equal(starts, 0)
  const third = starter.start(() => { starts++ })
  requests[2]('')
  assert.equal((await third).status, 'started')
  assert.equal(starts, 1)
})
