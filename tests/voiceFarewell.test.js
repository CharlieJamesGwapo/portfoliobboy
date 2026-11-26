import test from 'node:test'
import assert from 'node:assert/strict'
import { isVoiceFarewell } from '../src/lib/voiceFarewell.js'

test('recognises a visitor ending a voice conversation', () => {
  for (const message of ['Goodbye.', 'good bye', 'Bye!', 'Bye bye', 'Okay, thank you. Goodbye Alex!', 'Thanks, bye for now.', 'See you later', 'End this call']) {
    assert.equal(isVoiceFarewell(message), true, message)
  }
})

test('keeps the call open for questions, negations and quoted farewells', () => {
  for (const message of [null, '', 'Do not say goodbye yet', "Don't end this call", 'Can you say goodbye in French?', 'The goodbye button is hidden', 'I said goodbye to my old job', 'Bye the way, show me your projects', 'Please explain how an end call tool works']) {
    assert.equal(isVoiceFarewell(message), false, String(message))
  }
})
