import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

let server, answerQuestion
before(async () => {
  server = await createServer({ envDir: 'tests', server: { middlewareMode: true, hmr: false, ws: false } })
  ;({ answerQuestion } = await server.ssrLoadModule('/src/lib/assistantAnswers.js'))
})
after(async () => { await server?.close() })

test('Alex explains how to shortlist and compare published projects', () => {
  for (const question of ['Show my project shortlist', 'Can I compare projects?', 'How do I share a project comparison?']) {
    const answer = answerQuestion(question)
    assert.ok(answer.actions?.some(action => action.href === '/projects#project-shortlist'))
    assert.match(answer.text, /three|3/)
    assert.match(answer.text, /draft|review|nothing is sent/i)
    assert.doesNotMatch(answer.text, /best candidate|guaranteed|I saved/i)
  }
})

test('shortlist wording cannot override commercial or delivery guards', () => {
  assert.match(answerQuestion('Can these shortlisted projects guarantee delivery tomorrow?').text, /not confirmed/i)
  assert.match(answerQuestion('How much does a project comparison cost?').text, /scope|confirm|quote|pricing/i)
})
