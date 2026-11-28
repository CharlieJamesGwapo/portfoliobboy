import test from 'node:test'
import assert from 'node:assert/strict'
import { filterAutomationWorkflows } from '../src/data/automationsData.js'

// These searches exercise the actual catalogue boundary used by the UI: a
// missing platform constraint or narrower search index must change the result.
test('platform and search constraints must both match', () => {
  assert.deepEqual(filterAutomationWorkflows({ platform: 'Custom Bots', query: 'Telegram' }).map(item => item.id), ['bot-telegram-operations'])
  assert.deepEqual(filterAutomationWorkflows({ platform: 'AWS & DevOps', query: 'Telegram' }), [])
})

test('search normalises case and whitespace and requires every query term', () => {
  assert.deepEqual(filterAutomationWorkflows({ query: '  aWs   LAMBDA  ' }).map(item => item.id), ['aws-serverless-events'])
  assert.deepEqual(filterAutomationWorkflows({ query: 'Lambda Discord' }), [])
})

test('search includes implementation and safeguards, not only card titles', () => {
  assert.deepEqual(filterAutomationWorkflows({ query: 'least privilege' }).map(item => item.id), ['aws-serverless-events'])
  assert.deepEqual(filterAutomationWorkflows({ query: 'bot test server' }).map(item => item.id), ['bot-discord-community'])
})

test('unknown platforms and absent terms produce the empty state result', () => {
  assert.deepEqual(filterAutomationWorkflows({ platform: 'not-a-published-platform' }), [])
  assert.deepEqual(filterAutomationWorkflows({ query: 'no matching solution here' }), [])
})
